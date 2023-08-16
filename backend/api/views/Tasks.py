#!/task/bin/env python3
from ..utils import requires_admin
import requests
from ..database import (
    Project,
    User,
)
from flask.views import MethodView
from flask import g, request
from flask_jwt_extended import (
    jwt_required,
)
from ..static_variables import SSO_BASE_URL


class TaskAPI(MethodView):
    @jwt_required()
    def post(self, path: str):
        if path == "get_task_manager_data":
            return self.get_task_manager_data()
        return {
            "message": path,  # noqa: E501
        }, 405

    def get_task_manager_data(self):
        # Check if user is authenticated
        if not g:
            return {"meesage": "User not found", "status": 304}

        json_data = request.json
        project_id = json_data["project_id"]

        payload = {}
        headers = {
            "Authorization": "",  # noqa: E501
            "Accept-Language": "en-US",
        }
        TM4url = (
            "https://tasks.kaart.com/api/v2/projects/%s/contributions/"  # noqa: E501
            % (project_id)
        )
        response = requests.request("GET", TM4url, headers=headers, data=payload)
        if response.ok:
            data = response.json()
            self.get_mapped_TM4_tasks(data, project_id)
            self.get_validated_TM4_tasks(data, project_id)
            self.get_invalidated_TM4_tasks(project_id, user)
            return {"message": "updated!"}


def get_mapped_TM4_tasks(self, data, projectID):
    newMappedTasks = []
    users = User.query.all()
    usernames = [x.osm_username for x in users]
    target_project = Project.query.filter_by(id=projectID).first()

    for contributor in data["userContributions"]:
        if contributor["username"] in usernames:
            mapper = User.query.filter_by(osm_username=contributor["username"]).first()
            for task in contributor["mappedTasks"]:
                task_exists = Task.query.filter_by(
                    task_id=task,
                    project_id=projectID,
                    mapped_by=mapper.osm_username,
                ).first()
                if task_exists is None:
                    newMappedTasks.append(task)
                    new_task = Task.create(
                        task_id=task,
                        org_id=g.user.org_id,
                        project_id=projectID,
                        mapping_rate=target_project.mapping_rate_per_task,
                        validation_rate=target_project.validation_rate_per_task,  # noqa: E501
                        paid_out=False,
                        mapped=True,
                        mapped_by=contributor["username"],
                        validated_by="",
                        validated=False,
                    )
                    UserTasks.create(user_id=mapper.id, task_id=new_task.id)
                    mapper.update(total_tasks_mapped=mapper.total_tasks_mapped + 1)
                    target_project.update(tasks_mapped=target_project.tasks_mapped + 1)
                else:
                    pass
    return {"message": "complete"}
