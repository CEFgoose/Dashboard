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
from flask import (g)


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
    from api.views import (
        LoginAPI,
        UserAPI,
    )
except ImportError:
    from .api.database import db, User
    from .api.static_variables import (
        POSTGRES_DB,
        POSTGRES_ENDPOINT,
        POSTGRES_PASSWORD,
        POSTGRES_PORT,
        POSTGRES_USER,
    )
    from .api.views import (
        LoginAPI,
        UserAPI,
    )
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
JWT_COOKIE_DOMAIN = os.getenv("JWT_COOKIE_DOMAIN", "dev.localhost")
# JWT_COOKIE_DOMAIN = os.getenv("SSO_URL", "https://my.kaart.com/api")
app.secret_key = os.getenv("SECRET_KEY", os.urandom(64))
db.init_app(app)
migrate = Migrate(app, db)
app.add_url_rule("/api/<path>", view_func=LoginAPI.as_view("auth"))
app.add_url_rule("/api/user/<path>", view_func=UserAPI.as_view("user"))



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

        url = (
            SSO_BASE_URL + "auth/register_user?method=user&integrations=viewer"
        )
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




