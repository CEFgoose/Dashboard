#!/usr/bin/env python3
from __future__ import annotations
from sqlalchemy import (
    BigInteger,
    Column,
    ForeignKey,
    String,
    DateTime,
    func,

    Boolean,

)

from .common import ModelWithSoftDeleteAndCRUD, SurrogatePK, CRUDMixin, db



class User(ModelWithSoftDeleteAndCRUD, SurrogatePK):
    __tablename__ = "users"
    email = Column(String, unique=True)
    org_id = Column(BigInteger,  nullable=True)
    first_name = Column(String)
    last_name = Column(String)
    create_time = Column(DateTime, default=func.now())
    role = Column(String, default="user")

    is_active = Column(Boolean, default=True)
    gender = Column(String)
    phone = Column(String)

    def __repr__(self) -> str:
        return "<User %s>" % self.email
