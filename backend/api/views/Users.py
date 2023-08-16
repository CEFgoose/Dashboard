#!/usr/bin/env python3
from ..utils import requires_admin
import requests

from flask.views import MethodView
from flask import g, request
from flask_jwt_extended import (
    jwt_required,
)
from ..static_variables import SSO_BASE_URL


class UserAPI(MethodView):
    @jwt_required()
    def post(self, path: str):
        if path == "fetch_user_role":
            return self.fetch_user_role()
        elif path == "assign_user":
            return self.assign_user()
        elif path == "unassign_user":
            return self.unassign_user()
        elif path == "invite_user":
            return self.invite_user()
        return {
            "message": "Only /project/{fetch_users,fetch_user_projects} is permitted with GET",  # noqa: E501
        }, 405

    # FETCH USER ROLE ON LOGIN FOR UI RENDER
    def fetch_user_role(self):
        # initialize an empty dictionary to store the response
        response = {}
        # check if the user information is available in the global context
        if not g:
            response["message"] = "User not found"
            response["status"] = 304
            return response
        else:
            # extract the role, first name, and last name from the user information # noqa: E501
            role = g.user.role
            firstname = g.user.first_name.capitalize()
            lastname = g.user.last_name.capitalize()
            name = f"{firstname} {lastname}"
            # update the response dictionary with the extracted information
            response["role"] = role
            response["name"] = name
            response["status"] = 200
            return response

    # ADMIN ONLY ROUTE - SEND EMAIL INVITE TO USER FOR JOINING VIEWER UNDER THE ADMINS ORG # noqa: E501
    @requires_admin
    def invite_user(self):
        # Initialize an empty dictionary to store the response
        return_obj = {}
        # Get the target payload from the request
        target_payload = (
            request.json if request.json else None
        )
        # Check if the email address is not provided
        if not target_payload or target_payload["emails"] == []:
            return_obj["message"] = "email address required"
            return_obj["status"] = 400
            return return_obj
        # Construct the URL for sending the registration email
        url = SSO_BASE_URL + "auth/send_reg_email"
        # Send the request to the SSO API
        response = target_payload["emails"]
        for email in range(len(target_payload["emails"])):
            response[email] = requests.post(url, json={"email": target_payload["emails"][email]})
        # Update the return object with the response from the SSO API
        return_obj["message"] = "email sent"
        sso_response = response
        for email in range(len(response)):
            sso_response[email] = response[email].status_code
        return_obj["sso_response"] = sso_response
        return_obj["status"] = 200
        # Return the response
        return return_obj

    # ADMIN ONLY ROUTE - ASSIGN CURRENT SELECTED USER TO CURRENT SELECTED TEAM # noqa: E501
    @requires_admin
    def assign_user(self):
        # initialize an empty dictionary to store the response
        response = {}
        # extract the team_id from the request body
        team_id = request.json.get("team_id")
        if not team_id:
            response["message"] = "Team_id required"
            response["status"] = 400
            return response
        # extract the user_id from the request body
        user_id = request.json.get("user_id")
        if not user_id:
            response["message"] = "User_id required"
            response["status"] = 400
            return response
        # check if a relation between the user and team already exists
        relation = TeamMember.query.filter_by(
            team_id=team_id, user_id=user_id
        ).first()
        # if the relation exists, update its deleted field to False
        if relation:
            relation.update(deleted=False)
        # if the relation doesn't exist, create a new relation
        else:
            TeamMember.create(user_id=user_id, team_id=team_id, deleted=False)
        # update the response dictionary
        response["message"] = "User assigned"
        response["status"] = 200
        return response

    # ADMIN ONLY ROUTE - UNASSIGN CURRENT SELECTED USER FROM CURRENT SELECTED TEAM # noqa: E501
    @requires_admin
    def unassign_user(self):
        # initialize an empty dictionary to store the response
        response = {}
        # extract the team_id from the request body
        team_id = request.json.get("team_id")
        if not team_id:
            response["message"] = "Team_id required"
            response["status"] = 400
            return response
        # extract the user_id from the request body
        user_id = request.json.get("user_id")
        if not user_id:
            response["message"] = "User_id required"
            response["status"] = 400
            return response
        # check if a non-deleted relation between the user and team exists
        relation = TeamMember.query.filter_by(
            team_id=team_id, user_id=user_id, deleted=False
        ).first()
        # if the relation exists, update its deleted field to True
        if relation:
            relation.update(deleted=True)
        # update the response dictionary
        response["message"] = "User unassigned"
        response["status"] = 200
        return response
