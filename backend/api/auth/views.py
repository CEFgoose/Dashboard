from flask import request, jsonify, Blueprint

# from flask.globals import current_app
from flask_jwt_extended import (
    jwt_required,
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
)
from flask_mail import Mail
from flask_restful import Api
import flask_cors
from api.models import User, Company, Integration, UserIntegration
from api.extensions import pwd_context, db
from .token import confirm_token, send_token_email, send_sequence_email
from api.commons.marshmallow_schemas import UserSchema
from sqlalchemy import func, exc
from api import config
import uuid
import datetime
import re

mail = Mail()

blueprint = Blueprint("auth", __name__, url_prefix="/api/auth")
api = Api(blueprint)


def password_check(pass_text):
    # https://riptutorial.com/regex/example/18996/a-password-containing-at-least-1-uppercase--1-lowercase--1-digit--1-special-character-and-have-a-length-of-at-least-of-10  # noqa: E501
    pattern = re.compile(
        "^(?=.{10,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$"  # noqa: E501 W605
    )
    return pattern.fullmatch(pass_text)


def _generate_jwt_claims(user):
    return {
        "id": user.id,
        "company_id": user.company_id,
        "company_name": user.company.name,
        "role": user.role,
        "integrations": [integration.id for integration in user.integrations],
    }


@blueprint.route("/send_reg_email", methods=["POST"])
@flask_cors.cross_origin(support_credentials=True)
def send_reg_email():
    token_payload = {"email": request.json.get("email")}
    app=request.json.get('app')
    link = config.CLIENT_BASE_URL + config.CLIENT_ACTIVATE_PRIME_USER_ENDPOINT
    if app == 'viewer':
        body="viewer_reg_email.html"
        subject="Activate your Viewer account"
    if app == "mikro":
        body="mikro_reg_email.html"
        subject="Activate your Mikro account"
    # msg = Message('Viewer registration link', recipients=[request.json["email"]], html= '<a href="{{ http://localhost:3001/register?method=user&integrations=viewer }}"></a>') # noqa: E501
    # mail.send(msg)
    send_token_email(
        request.json["email"],
        config.REGISTRATION_SALT,
        token_payload,
        link,
        body,
        subject,
    )

    return (
        jsonify(
            {
                "message": "%s activation email sent. Check your email for an activation link."%(app)  # noqa: E501
            }
        ),
        200,
    )


@blueprint.route("/send_missing_sequence_email", methods=["POST"])
@flask_cors.cross_origin(support_credentials=True)
def send_missing_sequence_email():

    send_sequence_email()

    return (
        jsonify(
            {
                "message": "Activation email sent. Check your email for an activation link."  # noqa: E501
            }
        ),
        200,
    )


@blueprint.route("/register_user", methods=["POST"])
@flask_cors.cross_origin(support_credentials=True)
def register_user():
    """
    this is a user that does not have an associated company,
    this will really only be for those utilizing geocash
    """
    # fields = ["first_name", "last_name", "email", "password"]

    firstName = (
        request.json["firstName"] if "firstName" in request.json else None
    )

    lastName = request.json["lastName"] if "lastName" in request.json else None

    email = request.json["email"] if "email" in request.json else None

    password = request.json["password"] if "password" in request.json else None

    org = request.json["org"] if "org" in request.json else None

    integration = request.json["int"] if "int" in request.json else None

    existing_user = User.query.filter(
        func.lower(User.email) == request.json["email"].lower()
    ).first()

    if existing_user:
        existing_user.update(
            email_confirmed_datetime=datetime.datetime.utcnow()
        )  # noqa: E501
        existing_user_integration = UserIntegration.query.filter_by(
            user_id=existing_user.id, integration_id=integration
        ).first()  # noqa: E501
        if not existing_user_integration:
            UserIntegration.create(
                user_id=existing_user.id, integration_id=integration
            )  # noqa: E501
            return (
                {
                    "message": "Account already exists, Viewer integration added to your account, you may log into Viewer any time",  # noqa: E501
                    "code": 0,
                },
                200,
            )  # noqa: E501
        else:
            return (
                {
                    "message": "Account already exists with viewer integration, you may log into Viewer any time",  # noqa: E501
                    "code": 1,
                },
                200,
            )  # noqa: E501

    else:
        company_exists = Company.query.filter_by(name=org).first()
        if not company_exists:
            company = Company.create(name=org)

        else:
            company = company_exists

        user = User.create(
            email=email,
            first_name=firstName,
            last_name=lastName,
            password=password,
            company_id=company.id,
            role="user",
            email_confirmed_datetime=datetime.datetime.utcnow(),
        )
        UserIntegration.create(user_id=user.id, integration_id=integration)
        return {
            "message": "Your account has been created, you may log in at any time",  # noqa: E501
            "code": 2,
        }  # noqa: E501


@blueprint.route("/invite-user", methods=["POST"])
@jwt_required()
def invite_user():
    """request body: {emails: [], role: <user|admin>, integrations: []}"""

    user = User.query.get(get_jwt_identity())
    # must be admin; can't use auth decorators because g.user isn't set at the start of the request  # noqa: E501
    if user.role != "admin":
        return (
            jsonify({"message": "You must be an admin to invite new users."}),
            400,
        )

    # company admins can only invite others as high as company admin
    if request.json["role"] not in ["admin", "user"]:
        return (
            jsonify(
                {"message": "You can only add other admins or general users."}
            ),
            400,
        )

    # Checks to make sure that the integrations are valid.
    valid_integrations = Integration.query.filter(
        Integration.id.in_(
            request.json.get("integrations", [])
        ),  # integrations must exist and proper names passed
    ).all()

    new_users = []

    for email in request.json["emails"]:
        # add this person to the database with email_confirmed_datetime = false; they'll show up as invited but not accepted  # noqa: E501
        # first/last/password need to be not null, but a user can't log in without confirming email anyway so this is safe  # noqa: E501
        try:
            # password gets overwritten by user when they confirm, UUID is just placeholder  # noqa: E501
            new_users.append(
                User.create(
                    email=email,
                    company_id=user.company_id,
                    role=request.json["role"],
                    first_name="",
                    last_name="",
                    password=str(uuid.uuid1()),
                    integrations=valid_integrations,
                )
            )
        except exc.IntegrityError:
            db.session.rollback()
            continue  # email already exists in database, so we're skipping it.

        token_payload = {"email": email}
        link = (
            config.CLIENT_BASE_URL + config.CLIENT_CONFIRM_INVITATION_ENDPOINT
        )

        send_token_email(
            email,
            config.INVITATION_SALT,
            token_payload,
            link,
            "invitation-email.html",
            "You've been invited to Kaart",
        )

    email_count = len(new_users)
    plural = "" if email_count == 1 else "s"

    # return the invited users to save time updating client-side
    schema = UserSchema(
        many=True,
        only=[
            "first_name",
            "last_name",
            "is_active",
            "company_id",
            "id",
            "email",
            "role",
            "email_confirmed_datetime",
            "invited_datetime",
        ],
    )
    fails = [
        email
        for email in request.json["emails"]
        if email not in [u.email for u in new_users]
    ]
    return (
        jsonify(
            {
                "message": f"{email_count} invitation email{plural} sent.",
                "result": schema.dump(new_users).data,
                "fails": fails,
            }
        ),
        200,
    )


@blueprint.route("/reinvite-user", methods=["POST"])
@jwt_required()
def reinvite_user():
    user = User.query.get(get_jwt_identity())
    if user.role != "admin":
        return (
            jsonify(
                {"message": "You must be an admin to resend invitations."}
            ),
            400,
        )
    email = request.json.get("email").lower()
    invitee = User.query.filter(
        func.lower(User.email) == email, User.company_id == user.company_id
    ).first()

    if invitee is None:
        return (
            jsonify(
                {
                    "message": "No user with that email exists yet; could not resend invite."  # noqa: E501
                }
            ),
            400,
        )
    if invitee.email_confirmed_datetime:
        return (
            jsonify(
                {"message": "This user has already accepted their invite."}
            ),
            400,
        )

    token_payload = {"email": email}
    link = config.CLIENT_BASE_URL + config.CLIENT_CONFIRM_INVITATION_ENDPOINT

    send_token_email(
        email,
        config.INVITATION_SALT,
        token_payload,
        link,
        "invitation-email.html",
        "You've been invited to Kaart",
    )

    return jsonify({"message": "Invitation email sent."}), 200


# This route is for invited users, `activate-prime-user` is for the user
@blueprint.route("/confirm-invitation/<token>", methods=["GET", "POST"])
def confirm_invitation(token):
    # GET return basic user info & company integration information
    # POST confirm & activate
    """request body should have marshmallow serializable user schema"""
    # get email address from the token
    payload = confirm_token(
        token, config.INVITATION_SALT, expiration=86400 * 3
    )  # token is only good for 3 days
    if not payload:
        return (
            jsonify(
                {
                    "message": "Token invalid; your administrator may have to resend it."  # noqa: E501
                }
            ),
            400,
        )

    # get the existing user and bounce if he can't be found
    user = User.query.filter(
        func.lower(User.email) == payload["email"].lower()
    ).first()
    if not user:
        return (
            jsonify(
                {
                    "message": "We couldn't find your account in the system; try clicking the activation link again."  # noqa: E501
                }
            ),
            400,
        )

    if user.email_confirmed_datetime:
        return (
            jsonify(
                {
                    "message": "Your account has already been activated successfully; try logging in."  # noqa: E501
                }
            ),
            400,
        )

    schema = UserSchema(
        only=["first_name", "last_name", "birthday", "gender", "phone"]
    )
    if request.method == "GET":
        return jsonify({"result": schema.dump(user).data})
    elif request.method == "POST":
        if not password_check(request.json.get("password", "")):
            return (
                jsonify(
                    {
                        "message": "Password must meet the following: uppercase letter, lowercase letter, number, symbol, and be at least 10 characters long."  # noqa: E501
                    }
                ),
                400,
            )

        # get the rest of the user data from the request body; validate it
        user, errors = schema.load(request.json, partial=True, instance=user)
        if errors:
            return jsonify(errors), 422

        # update existing user with as confirmed email and new password
        user.update(
            email_confirmed_datetime=datetime.datetime.utcnow(),
            password=pwd_context.hash(request.json["password"]),
        )

        return {"message": "Account activated. Welcome to Kaart!"}, 201


# Registering a company has a different salt than inviting a user
# this is for confirming the first company/user
@blueprint.route("/activate-prime-user/<token>", methods=["POST"])
def activate_prime_user(token):
    payload = confirm_token(
        token, config.REGISTRATION_SALT, expiration=86400 * 7
    )  # token is only good for 7 days
    if not payload:
        # this token was either expired or invalid
        payload = confirm_token(
            token, config.REGISTRATION_SALT, expiration=None
        )  # check with no expiration
        if payload and payload.get("email"):  # token was valid but expired
            token_payload = {"email": payload["email"]}
            link = (
                config.CLIENT_BASE_URL
                + config.CLIENT_ACTIVATE_PRIME_USER_ENDPOINT
            )
            send_token_email(
                payload["email"],
                config.REGISTRATION_SALT,
                token_payload,
                link,
                "registration-email.html",
                "Activate your Kaart account",
            )
            return (
                jsonify(
                    {
                        "message": "Token expired. Please check your email for a new activation link."  # noqa: E501
                    }
                ),
                400,
            )
        else:  # this token was invalid
            return (
                jsonify(
                    {
                        "message": "Token invalid. Try clicking the activation link again."  # noqa: E501
                    }
                ),
                400,
            )

    user = User.query.filter(
        func.lower(User.email) == payload["email"].lower()
    ).first()
    if not user:
        return (
            jsonify(
                {
                    "message": "We couldn't find your account in the system; try clicking the activation link again."  # noqa: E501
                }
            ),
            400,
        )

    if user.email_confirmed_datetime:
        return (
            jsonify(
                {
                    "message": "Your account has already been activated successfully; try logging in."  # noqa: E501
                }
            ),
            400,
        )

    user.update(email_confirmed_datetime=datetime.datetime.utcnow())

    return {"message": "Account activated. Welcome to Kaart!"}, 200


@flask_cors.cross_origin(support_credentials=True)
@blueprint.route("/login", methods=["POST"])
def login():
    """Authenticate account and return token"""

    email = request.json.get("email")
    password = request.json.get("password")
    if not email or not password:
        return jsonify({"message": "Missing email or password."}), 400

    user = User.query.filter(func.lower(User.email) == email.lower()).first()

    # unconfirmed emails take precedence, you need at a least a password to continue  # noqa: E501
    if user and not user.email_confirmed_datetime:
        return (
            jsonify(
                {
                    "message": "You must confirm your account before you can log in; check for your activation email."  # noqa: E501
                }
            ),
            400,
        )
    elif user is None or not pwd_context.verify(
        password, user.password
    ):  # if no user or password doesn't validate
        return jsonify({"message": "Bad credentials."}), 400
    elif not user.is_active:
        return (
            jsonify(
                {
                    "message": "Your account is inactive. Please contact your administrator if you think this is in error.",  # noqa: E501
                    "message_duration": 100000,  # stay up for 100k seconds bc we don't have an "until closed" option  # noqa: E501
                }
            ),
            403,
        )
    elif user.company and not user.company.is_active:
        return (
            jsonify(
                {
                    "message": "Your company's account has been deactivated. Please contact support if you think this in error.",  # noqa: E501
                    "message_duration": 100000,
                }
            ),
            403,
        )

    user.update(
        last_active_datetime=datetime.datetime.utcnow()
    )  # set last active datetime for billing purposes

    schema = UserSchema(
        only=[
            "first_name",
            "last_name",
            "is_active",
            "company",
            "id",
            "email",
            "role",
            "email_confirmed_datetime",
            "invited_datetime",
        ]
    )
    # additional_claims = _generate_jwt_claims(user)
    # Set the JWTs and the CSRF double submit protection cookies in this response  # noqa: E501
    resp = jsonify(
        {
            "result": schema.dump(user).data,
            "token": create_access_token(
                identity=user.id, additional_claims=_generate_jwt_claims(user)
            ),
        }
    )

    set_access_cookies(
        resp,
        create_access_token(
            identity=user.id, additional_claims=_generate_jwt_claims(user)
        ),
    )
    set_refresh_cookies(
        resp,
        create_refresh_token(
            identity=user.id, additional_claims=_generate_jwt_claims(user)
        ),
    )

    return resp, 200


@blueprint.route("/refresh", methods=["POST"])
@jwt_required()
def refresh():

    # make sure user's account is active
    user = User.query.get_or_404(get_jwt_identity())
    if not user.is_active:
        return (
            jsonify(
                {
                    "message": "Your account is inactive. Please contact your administrator if you think this is in error.",  # noqa: E501
                    "logout": True,
                }
            ),
            403,
        )
    elif user.company and not user.company.is_active:
        return (
            jsonify(
                {
                    "message": "Your company's account has been deactivated. Please contact Kaart support if you think this in error.",  # noqa: E501
                    "logout": True,
                }
            ),
            403,
        )

    user.update(
        last_active_datetime=datetime.datetime.utcnow()
    )  # set last active datetime for billing purposes

    # a refresh only gets access tokens, after some time, you will need to log in again  # noqa: E501
    resp = jsonify({"refresh": True})
    set_access_cookies(
        resp,
        create_access_token(
            identity=user.id, additional_claims=_generate_jwt_claims(user)
        ),
    )
    return resp, 200


# Because the JWTs are stored in an httponly cookie now, we can't log the user out by simply deleting the cookie in the frontend.  # noqa: E501
# We need the backend to send us a response to delete the cookies in order to logout. unset_jwt_cookies is a helper function to  # noqa: E501
# do just that.
@blueprint.route("/logout", methods=["POST"])
def logout():
    resp = jsonify({"logout": True})
    unset_jwt_cookies(resp)
    return resp, 200


@blueprint.route("/reset-password", methods=["POST"])
def reset_password_request():
    user = User.query.filter(
        func.lower(User.email)
        == request.json.get("email", "ascbvsfsr3").lower()
    ).first()
    if not user:
        return (
            jsonify(
                {
                    "message": "Email address couldn't be found in the system."
                }  # noqa: E501
            ),
            400,
        )
    if not user.is_active:
        return (
            jsonify(
                {
                    "message": "Your account is inactive. Please contact your administrator if you think this is in error."  # noqa: E501
                }
            ),
            403,
        )
    if user.company and not user.company.is_active:
        return (
            jsonify(
                {
                    "message": "Your company's account has been deactivated. Please contact Kaart support if you think this is in error."  # noqa: E501
                }
            ),
            403,
        )

    link = config.CLIENT_BASE_URL + config.CLIENT_PASSWORD_RESET_ENDPOINT
    send_token_email(
        user.email,
        config.PASSWORD_RESET_SALT,
        user.email,
        link,
        "password-reset.html",
        "Kaart Password Reset",
    )
    return jsonify({"message": "Check your email for a password reset link."})


@blueprint.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):
    email = confirm_token(token, config.PASSWORD_RESET_SALT)
    if not email:
        return (
            jsonify(
                {
                    "message": "Token invalid. Try resetting your password again."  # noqa: E501
                }
            ),
            400,
        )

    if not request.json.get("password") or not password_check(
        request.json["password"]
    ):
        return (
            jsonify(
                {
                    "message": "Password must meet the following: uppercase letter, lowercase letter, number, symbol, and be at least 10 characters long."  # noqa: E501
                }
            ),
            400,
        )

    user = User.query.filter(
        func.lower(User.email) == email.lower()
    ).first_or_404()
    user.update(password=pwd_context.hash(request.json["password"]))

    return jsonify({"message": "Your password has been successfully reset."})
