from pydantic import BaseModel
from datetime import datetime

# Request/Response schemas for the Predict API
class PredictRequest(BaseModel):
    content: str
    type: str = "url"

class PredictResponse(BaseModel):
    result: str
    score: int

# Request/Response schemas for the Report API
class ReportRequest(BaseModel):
    content: str
    type: str = "url"
    reporter_info: str = "Anonymous"

class ReportResponse(BaseModel):
    id: int
    content: str
    type: str
    reporter_info: str
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True  # Pydantic v2 compatible
        orm_mode = True         # Pydantic v1 compatible

# Schema for the Stats API
class StatsResponse(BaseModel):
    total: int
    pending: int
    resolved: int

# Request schema for resolving reports
class ResolveRequest(BaseModel):
    id: int

# Request schema for forwarding reports to Cyber Crime
class ForwardRequest(BaseModel):
    id: int

# Admin Login schema
class LoginRequest(BaseModel):
    username: str
    password: str

# Admin Register schema
class RegisterRequest(BaseModel):
    username: str
    password: str

# Admin PIN schemas
class SendOTPRequest(BaseModel):
    email: str

class RegisterPINRequest(BaseModel):
    email: str
    pin: str

class LoginPINRequest(BaseModel):
    pin: str

class VerifyLoginOTPRequest(BaseModel):
    pin: str
    otp: str
