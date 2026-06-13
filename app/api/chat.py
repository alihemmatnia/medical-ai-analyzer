from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas import schemas
from app.models import models
from app.api import deps
from app.services import openai_analyzer

router = APIRouter()

@router.post("/", response_model=schemas.ChatMessageResponse)
def chat_with_ai(
    req: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
    accept_language: str = Header("en")
):
    # Retrieve chat history
    history = db.query(models.ChatMessage).filter(
        models.ChatMessage.user_id == current_user.id
    )
    if req.report_id:
        history = history.filter(models.ChatMessage.report_id == req.report_id)
    history = history.order_by(models.ChatMessage.created_at.asc()).all()
    
    report_text = None
    if req.report_id:
        report = db.query(models.Report).filter(
            models.Report.id == req.report_id,
            models.Report.user_id == current_user.id
        ).first()
        if report:
            report_text = report.extracted_text
            
    # Save user message
    user_msg = models.ChatMessage(
        user_id=current_user.id,
        report_id=req.report_id,
        role="user",
        message=req.message
    )
    db.add(user_msg)
    db.commit()
    
    # Get AI response
    ai_response_text = openai_analyzer.chat_with_assistant(history, req.message, report_text, language=accept_language)
    
    # Save AI response
    ai_msg = models.ChatMessage(
        user_id=current_user.id,
        report_id=req.report_id,
        role="assistant",
        message=ai_response_text
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    
    return ai_msg

@router.get("/", response_model=list[schemas.ChatMessageResponse])
def get_chat_history(
    report_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    query = db.query(models.ChatMessage).filter(models.ChatMessage.user_id == current_user.id)
    if report_id:
        query = query.filter(models.ChatMessage.report_id == report_id)
    return query.order_by(models.ChatMessage.created_at.asc()).all()
