"""
    these decorators depend on the g.user object being set to a valid user model and assume that  # noqa: E501
    flask_restful will convert the json to a response for us.  might not work with raw blueprints?  # noqa: E501
"""

from functools import wraps
from flask import g


def requires_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user.role != "admin":
            return {
                "message": "You must be an admin to perform this action."
            }, 400
        return f(*args, **kwargs)

    return decorated_function
