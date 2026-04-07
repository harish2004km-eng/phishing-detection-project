from sqlalchemy import Column, Integer, String, DateTime
from database import Base
import datetime

# Database model for a Report
class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, index=True)
    type = Column(String, default="url")  # url, email, sms
    reporter_info = Column(String, default="Anonymous")
    status = Column(String, default="pending")  # pending or resolved
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# Database model for an Admin Account
class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)

# Database model for an Admin Account (PIN Based)
class PinAdmin(Base):
    __tablename__ = "pin_admins"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    pin_hash = Column(String)
