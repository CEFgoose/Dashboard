#!/usr/binenv change
# /env python
import os
from flask_cors import CORS
from flask_migrate import Migrate
from flask_mail import Mail
from flask_jwt_extended import JWTManager, get_jwt_identity, jwt_required
from flask import Flask, request
import requests
from dotenv import load_dotenv
from flask import g

########################################
#
# Imports for cs2csv functionality
#
#######################################
import pandas
from cachecontrol import CacheControl
from celery import Celery
import redis

r = redis.Redis(host="localhost", port=6380, db=0)
from time import sleep
from spellchecker import SpellChecker
from datetime import date, timedelta, datetime
import xml.etree.ElementTree as ET

# SSO_BASE_URL = "https://my.kaart.com/api/"

SSO_BASE_URL = "http://localhost:5001/api/"


DB_key = "cjyjs1zsq0ypexp"
DB_secret = "d4q5mgo3i0sy9y3"
DB_AUTH_URL = "https://www.dropbox.com/oauth2/authorize"
DB_TOKEN_URL = "https://api.dropboxapi.com/oauth2/token"

load_dotenv("tabula-rasa.env")

try:
    from api.database import db, User
    from api.static_variables import (
        POSTGRES_DB,
        POSTGRES_ENDPOINT,
        POSTGRES_PASSWORD,
        POSTGRES_PORT,
        POSTGRES_USER,
    )
    from api.views import LoginAPI, UserAPI, TaskAPI, ProjectAPI
except ImportError:
    from .api.database import db, User
    from .api.static_variables import (
        POSTGRES_DB,
        POSTGRES_ENDPOINT,
        POSTGRES_PASSWORD,
        POSTGRES_PORT,
        POSTGRES_USER,
    )
    from .api.views import LoginAPI, UserAPI, TaskAPI, ProjectAPI

app = Flask(__name__)
cors = CORS(app)
app.config["OPENAPI_VERSION"] = "3.0.2"
jwt = JWTManager(app)
mail = Mail(app)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql://"
    + POSTGRES_USER
    + ":"
    + POSTGRES_PASSWORD
    + "@"
    + POSTGRES_ENDPOINT
    + ":"
    + POSTGRES_PORT
    + "/"
    + POSTGRES_DB
)

app.config["REDIS_URL"] = "redis://localhost:6379"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SSO_URL"] = os.getenv("SSO_URL", "https://my.kaart.com/api")
# app.config["JWT_TOKEN_LOCATION"] = "headers"
app.config["JWT_TOKEN_LOCATION"] = "cookies"
app.config["JWT_COOKIE_CSRF_PROTECT"] = True
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET", None)

app.config["CELERY_BROKER_URL"] = "redis://localhost:6379"
# JWT_COOKIE_DOMAIN = os.getenv("SSO_URL", "https://my.kaart.com/api")

JWT_COOKIE_DOMAIN = os.getenv("JWT_COOKIE_DOMAIN", "dev.localhost")
app.secret_key = os.getenv("SECRET_KEY", os.urandom(64))

db.init_app(app)
migrate = Migrate(app, db)

app.add_url_rule("/api/<path>", view_func=LoginAPI.as_view("auth"))
app.add_url_rule("/api/user/<path>", view_func=UserAPI.as_view("user"))
app.add_url_rule("/api/task/<path>", view_func=TaskAPI.as_view("task"))
app.add_url_rule("/api/project/<path>", view_func=ProjectAPI.as_view("project"))


celery = Celery(app.name, broker=app.config["CELERY_BROKER_URL"])


#### Getting overpass data #####
@app.route("/api/overpass_data_celery", methods=["GET", "POST"])
def process_trip():
    """
    Endpoint to get the overpass data using a date range and OSM IDs.

    Args:
        - POST request with JSON data containing:
            * start_date (str): Starting date in MM-DD-YYYY format.
            * end_date (str): Ending date in MM-DD-YYYY format.
            * osm_id (list): List of OpenStreetMap IDs.

    Returns:
        - JSON response with changeSet, a summary of data changes for given osmIDs within the date range.s
    """

    # Extracting input data from request
    json_data = request.json
    startDate = json_data["start_date"]
    endDate = json_data["end_date"]
    osmIDs = json_data["osm_id"]

    # Convert date strings to datetime objects
    startDate = datetime.strptime(startDate, "%m-%d-%Y")
    endDate = datetime.strptime(endDate, "%m-%d-%Y")

    # Generate a list of dates based on provided range
    dateList = get_dates(startDate, endDate)

    # Query data and fetch change summary
    changeSet = get_overpass_data(osmIDs, dateList)

    return changeSet


@celery.task
def get_overpass_data(selectedUserIDs, dateList):
    spell = SpellChecker()
    accepted_words = []
    accepted_hashtags = []
    for i in selectedUserIDs:
        new_changesets = []
        total_count = 0
        total_changes = 0
        spell_count = 0
        misspelled_hashtags = 0
        missing_hashtags = 0
        additions_count = 0
        modification_count = 0
        deleted_count = 0
        for j in dateList:
            get_changeset_list = get_changesets(i, j[0], j[1])
            for k in get_changeset_list:
                new_changesets.append(k)
                additions_count += k["added"]
                modification_count += k["modified"]
                deleted_count += k["deleted"]
            total_count += len(get_changeset_list)
        for l in new_changesets:
            total_changes += l["set_changes"]
            misspelled = spell.unknown(l["comment"])
            spell_count += len(misspelled)
            for m in misspelled:
                if m in accepted_words:
                    spell_count -= 1
                else:
                    spell_count += 1
            for n in l["hashtags"]:
                if n not in accepted_hashtags:
                    misspelled_hashtags += 1
            if len(l["hashtags"]) < 2:
                diff = len(l["hashtags"])
                if diff == 0:
                    diff = 2
                missing_hashtags += diff
        changeset_info = {
            "osm_id": i,
            "new_changesets": new_changesets,
            "total_count": total_count,
            "misspelled_hashtags": misspelled_hashtags,
            "spell_count": spell_count,
            "total_changes": total_changes,
            "additions_count": additions_count,
            "modification_count": modification_count,
            "deleted_count": deleted_count,
        }
        return changeset_info


def get_changesets(user=None, start_time=None, end_time=None, bbox=None):
    query_params = {}
    if user:
        query_params["user"] = user
    if start_time and end_time:
        if type(start_time) is list and len(start_time) == 1:
            start_time = start_time[0].strftime("%Y-%m-%d")
        if type(end_time) is list and len(end_time) == 1:
            end_time = end_time[0].strftime("%Y-%m-%d")
        query_params["time"] = ",".join([start_time, end_time])

    if bbox:
        query_params["bbox"] = ",".join(bbox)
    changesets = []
    api_url = "https://api.openstreetmap.org/api/0.6/changesets"
    session = CacheControl(requests.session())
    result = session.get(api_url, params=query_params)
    entries = str(result.text)
    entries = entries.split("</changeset>")
    entries.pop(-1)
    if len(entries) > 0:
        entries[0] = str(
            entries[0].rsplit("""<?xml version="1.0" encoding="UTF-8"?>""", 2)[1]
        )
        entries[0] = str(entries[0].rsplit('/">', 1)[1])
        for i in entries:
            comment = ""
            source = ""
            hashtags = []
            i = i.strip()
            entry = i.split("<tag k=")
            info = entry[0]
            info = info.split(" ")
            set_id = info[1].split('id="')[1]
            set_id = set_id.split('"')[0]
            set_created = info[2].split('created_at="')[1]
            set_created = set_created.split('"')[0]
            set_changes = info[5].split('changes_count="')[1]
            set_changes = int(set_changes.split('"')[0])
            set_closed = info[6].split('closed_at="')[1]
            set_closed = set_closed.split('"')[0]
            count_new_modified_deleted(set_id)
            try:
                tags = entry[1]
                tags = tags.strip()
                tags = tags.split("<tag k=")
                source = tags[0].split('"/>')[0]
                if ";" in source:
                    source = source.split(";")[-1]
                comment = tags[-1].split('"comment" v="')[1]
                comment = comment.split('"/>')[0]
                comment = comment.split(" ")
                hashtags = []
                commentText = []
                for i in comment:
                    if "#" in i:
                        hashtags.append(i)
                    else:
                        if "." in i:
                            i = i.split(".")[0]
                        if "," in i:
                            i = i.split(",")[0]
                        if i != "":
                            commentText.append(i)
                comment = commentText
                AMD_info = count_new_modified_deleted(set_id)
                added = AMD_info["Added"]
                modified = AMD_info["Modified"]
                deleted = AMD_info["Deleted"]
                changeset = {
                    "set_id": set_id,
                    "set_created": set_created,
                    "set_changes": set_changes,
                    "set_closed": set_closed,
                    "hashtags": hashtags,
                    "source": source,
                    "comment": comment,
                    "added": added,
                    "modified": modified,
                    "deleted": deleted,
                }
                changesets.append(changeset)
            except:
                print("e")
                pass
    return changesets


def count_new_modified_deleted(changesetID):
    api_url = (
        "https://www.openstreetmap.org/api/0.6/changeset/{changesetID}/download".format(
            changesetID=changesetID
        )
    )
    session = CacheControl(requests.session())
    result = session.get(api_url).text
    root = ET.fromstring(result)
    newModifiedDeleted = {}
    newModifiedDeleted["Added"] = len(root.findall("create"))
    newModifiedDeleted["Modified"] = len(root.findall("modify"))
    newModifiedDeleted["Deleted"] = len(root.findall("delete"))
    return newModifiedDeleted


def get_dates(start, end):
    query_days_list = pandas.date_range(
        start, end - timedelta(days=1), freq="d"
    ).tolist()
    tempList = []
    tupList = []
    for i in query_days_list:
        i = str(i)
        i = i.split(" ")[0]
        tempList.append(i)
    tempList.append(str(end))
    for index, value in enumerate(tempList[:-1]):
        tup = (value, tempList[index + 1])
        tupList.append(tup)
    query_days_list = tupList
    return query_days_list


################################

#### Getting Task Manager data ####


@app.before_request
@jwt_required(optional=True)
def load_user():
    if "register_user" not in request.url:
        g.user = User.query.filter_by(id=get_jwt_identity()).one_or_none()
    else:
        email = request.json.get("email")
        firstName = request.json.get("firstName")
        lastName = request.json.get("lastName")
        password = request.json.get("password")
        org = request.json.get("org")
        body = {
            "firstName": firstName,
            "lastName": lastName,
            "email": email,
            "password": password,
            "org": org,
            "int": "viewer",
        }

        url = SSO_BASE_URL + "auth/register_user?method=user&integrations=viewer"
        response = requests.post(
            url,
            json=body,
        )  # noqa: E501 E228
        if response.status_code == 200:
            resp = response.json()
            if resp["code"] == 0:
                message = "Viewer integration added to your Kaart account, you may log into viewer any time."  # noqa: E501
            if resp["code"] == 1:
                message = "Account already exists with viewer integration, you may log into Viewer any time."  # noqa: E501
            if resp["code"] == 2:
                message = "Your Kaart account has been created with Viewer integration, press the button below to activate your account!"  # noqa: E501
            return {"message": message, "code": resp["code"]}
