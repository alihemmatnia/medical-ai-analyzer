from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    reports = relationship("Report", back_populates="owner")
    chat_messages = relationship("ChatMessage", back_populates="user")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    file_path = Column(String)
    extracted_text = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="reports")
    analysis = relationship("Analysis", back_populates="report", uselist=False)
    lab_values = relationship("LabValue", back_populates="report")
    chat_messages = relationship("ChatMessage", back_populates="report")

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    summary = Column(Text)
    findings = Column(Text)
    urgency = Column(String) # Normal, Low, Medium, High
    health_score = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    report = relationship("Report", back_populates="analysis")

class LabValue(Base):
    __tablename__ = "lab_values"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    test_name = Column(String, index=True)
    value = Column(String)
    reference_range = Column(String, nullable=True)
    unit = Column(String, nullable=True)

    report = relationship("Report", back_populates="lab_values")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=True)
    role = Column(String) # user, assistant
    message = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="chat_messages")
    report = relationship("Report", back_populates="chat_messages")
