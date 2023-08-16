from ..utils import requires_admin
import requests
import re
from ..database import (
    Project,
    User,
)

from flask.views import MethodView
from flask import g, request
from flask_jwt_extended import (
    jwt_required,
)


class ProjectAPI(MethodView):
    @jwt_required()
    def post(self, path: str):
        if path == "add_project":
            return self.add_project()
        return {
            "message": path,  # noqa: E501
        }, 405

    def add_project(project_url):
        json_data = request.json
        project_url = json_data.get("url")
        if project_url == None:
            return {"status": 400, "messgaqe": "project_id required!"}

        project_id = project_url.rsplit("/", 1)[1]
        new_project = Project.create(id=project_id, url=project_url)
        return {"messsage": "Success!"}
        # print("here")
