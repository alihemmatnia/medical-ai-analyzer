from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LabValueResponse(BaseModel):
    id: int
    test_name: str
    value: str
    reference_range: Optional[str] = None
    unit: Optional[str] = None
    class Config:
        from_attributes = True

class AnalysisResponse(BaseModel):
    id: int
    summary: str
    findings: str
    urgency: str
    health_score: float
    created_at: datetime
    class Config:
        from_attributes = True

class ReportResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    uploaded_at: datetime
    analysis: Optional[AnalysisResponse] = None
    lab_values: List[LabValueResponse] = []
    class Config:
        from_attributes = True

class ChatMessageCreate(BaseModel):
    report_id: Optional[int] = None
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    user_id: int
    report_id: Optional[int]
    role: str
    message: str
    created_at: datetime
    class Config:
        from_attributes = True

class CompareRequest(BaseModel):
    report_id_1: int
    report_id_2: int

class CompareResponse(BaseModel):
    improved_metrics: List[str]
    worsened_metrics: List[str]
    stable_metrics: List[str]
    ai_summary: str
