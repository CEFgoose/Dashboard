#!/usr/bin/env python3
from ..database import User
from flask.views import MethodView
from flask import (
    g,
    jsonify,
    request,
)
from flask_jwt_extended import jwt_required, get_jwt
import requests
from ..static_variables import SSO_BASE_URL


class LoginAPI(MethodView):
    # JWT protected login call, calls the actual login function if JWT present & valid & path is correct # noqa: E501
    @jwt_required()
    def post(self, path: str):
        if path == "login":
            return self.do_login()
        
        if path == "users":
            return self.fetch_users()

        return jsonify({"message": "Only auth/login is permitted!"}), 405

    def do_login(self):
        """This function performs the login process for the API."""
        # Initialize the return object
        return_obj = {}
        # Check if the user is already logged in
        if not g.user:
            # Get the JWT user information
            jwt_user = get_jwt()
            # Check if the "viewer" integration is missing
            if "viewer" not in jwt_user["integrations"]:
                return_obj["message"] = "Viewer Integration Missing"
                return_obj["status"] = 400
                return return_obj
            # Get the access token cookie
            at_cookie = request.cookies.get("access_token_cookie")
            print(at_cookie)
            # Use a session to access the user information from the SSO
            with requests.Session() as s:
                org_id = jwt_user["company_id"]
                # Get the user information from the SSO
                url = SSO_BASE_URL
                resp = s.get(
                    url + f"users/{jwt_user['id']}",
                    cookies={"access_token_cookie": at_cookie},
                )
                print('resp',resp)
                # If the request is successful, create or retrieve the user
                if resp.ok:
                    user_info = resp.json()["result"]
                    user = User.create(
                        id=jwt_user["id"],
                        role=jwt_user["role"],
                        org_id=org_id,
                        first_name=user_info["first_name"],
                        last_name=user_info["last_name"],
                        email=user_info["email"],
                    )
                    g.user = user
                else:
                    # Return an error if the request fails
                    return_obj[
                        "message"
                    ] = "An error occurred, please try again later"
                    return_obj["status"] = 400
                    return return_obj
        # Return the user information if the login was successful
        return_obj["email"] = g.user.email
        return_obj["role"] = g.user.role
        return_obj["id"] = g.user.id
        return_obj["status"] = 200
        return return_obj

    def fetch_users(self):
        # Initialize an empty dictionary for returning the response
        return_obj = {}
        # Check if the user is not found in the context
        if not g:
            return_obj["message"] = "User not found"
            return_obj["status"] = 304
            return return_obj
        # Get all the users from the database that belong to the same organization as the current user
        users_in_org = User.query.filter_by(org_id=g.user.org_id).all()
        # Initialize an empty list to store information about the users
        org_users = []
        # Loop over each user and extract relevant information
        for user in users_in_org:
            # Capitalize first and last name of the user
            first_name = user.first_name.title()
            last_name = user.last_name.title()
            full_name = first_name + " " + last_name
            # Append the user information to the org_users list
            org_users.append(
                {
                    "name": full_name,
                    "role": user.role,
                    "joined": user.create_time,
                }
            )
        # Add the list of users to the return_obj dictionary
        return_obj["users"] = org_users
        return_obj["status"] = 200
        # Return the final response
        return return_obj