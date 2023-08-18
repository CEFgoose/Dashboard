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
                company_id = jwt_user["company_id"]
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
                        company_id=company_id,
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
