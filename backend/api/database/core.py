#!/usr/bin/env python3
from __future__ import annotations
from sqlalchemy import (
    BigInteger,
    Column,
    ForeignKey,
    String,
    DateTime,
    func,
    Boolean
    )

from .common import ModelWithSoftDeleteAndCRUD, SurrogatePK, CRUDMixin, db



class User(ModelWithSoftDeleteAndCRUD, SurrogatePK):
    __tablename__ = "users"
    id = db.Column(db.BigInteger, primary_key=True, nullable=False)
    email = db.Column(db.String, unique=True)
    phone = db.Column(db.String, nullable=True)
    is_active = Column(Boolean, nullable=True, default=True)
    email_confirmed_datetime = db.Column(db.DateTime, default=None)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    birthday = db.Column(db.Date)
    gender = db.Column(db.String)    
    phone = db.Column(db.String)
    company_id = db.Column(db.BigInteger, nullable=True)
    create_time = db.Column(db.DateTime, default=func.now())
    role = db.Column(db.String, default="user")
    password = db.Column(db.String, nullable=True)
    integrations = db.relationship(
        "Integration", lazy="joined", secondary="user_integrations"
    )

    def __repr__(self) -> str:
        return "<User %s>" % self.email
        
class Company(ModelWithSoftDeleteAndCRUD, SurrogatePK):
    __tablename__ = "companies"
    name = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(120))
    address2 = db.Column(db.String(120))
    city = db.Column(db.String(120))
    state = db.Column(db.String(120))
    zip = db.Column(db.Integer)
    country = db.Column(db.String(120))
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    # employees = db.relationship("User", viewonly=True)
    joined_date = db.Column(db.Date, nullable=False, server_default=func.now())

class Integration(ModelWithSoftDeleteAndCRUD):
    __tablename__ = "integrations"
    # no SurrogatePK because this id is a string for simplicity
    id = db.Column(
        db.String(80), nullable=False, unique=True, primary_key=True
    )
    description = db.Column(db.Text)

class UserIntegration(CRUDMixin, SurrogatePK, db.Model):
    __tablename__ = "user_integrations"
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    integration_id = db.Column(
        db.String(80),
        db.ForeignKey("integrations.id", ondelete="CASCADE"),
        nullable=False,
    )
    # you may want to store data about each user's specific integration here later. you'd need to rework the User relate above.  # noqa: E501