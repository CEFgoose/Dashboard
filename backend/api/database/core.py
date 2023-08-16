#!/usr/bin/env python3
from __future__ import annotations
from sqlalchemy import (
    BigInteger,
    Column,
    ForeignKey,
    String,
    DateTime,
    func,
)

from .common import ModelWithSoftDeleteAndCRUD, SurrogatePK, CRUDMixin, db


class User(ModelWithSoftDeleteAndCRUD, SurrogatePK):
    __tablename__ = "users"
    email = Column(String, unique=True)
    org_id = Column(BigInteger, nullable=True)
    first_name = Column(String)
    last_name = Column(String)
    create_time = Column(DateTime, default=func.now())
    role = Column(String, default="user")


class Project(ModelWithSoftDeleteAndCRUD, SurrogatePK):
    __tablename__ = "projects"
    id = db.Column(db.Integer, primary_key=True, autoincrement=False)
    name = db.Column(db.String, nullable=True)
    org_id = db.Column(db.Integer, nullable=True, default=0)
    total_tasks = db.Column(db.BigInteger, default=0)
    tasks_mapped = db.Column(db.BigInteger, default=0)
    tasks_validated = db.Column(db.BigInteger, default=0)
    tasks_invalidated = db.Column(db.BigInteger, default=0)
    url = db.Column(db.String, nullable=False)
    source = db.Column(db.String, nullable=True)

    def __repr__(self) -> str:
        return "<User %s>" % self.email
