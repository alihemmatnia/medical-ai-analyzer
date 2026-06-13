from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.database import get_db
from app.models import models
from app.api import deps
from typing import Any

router = APIRouter()

@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(deps.get_current_user),
    accept_language: str = Header("en")
) -> Any:
    reports = db.query(models.Report).filter(models.Report.user_id == current_user.id).order_by(desc(models.Report.uploaded_at)).limit(5).all()
    
    latest_report = reports[0] if reports else None
    health_score = 0
    ai_findings = None
    
    if latest_report:
        # Find analysis for latest report with correct language
        analysis = db.query(models.Analysis).filter(
            models.Analysis.report_id == latest_report.id,
            models.Analysis.language == accept_language
        ).first()
        if not analysis:
            # fallback
            analysis = db.query(models.Analysis).filter(
                models.Analysis.report_id == latest_report.id
            ).first()
            
        if analysis:
            health_score = analysis.health_score
            ai_findings = {
                "summary": analysis.summary,
                "urgency": analysis.urgency
            }
        
    # Gather trends
    all_reports = db.query(models.Report).filter(models.Report.user_id == current_user.id).order_by(models.Report.uploaded_at.asc()).all()
    trends = []
    
    for r in all_reports:
        # Fetch lab values in correct language
        lab_values = db.query(models.LabValue).filter(
            models.LabValue.report_id == r.id,
            models.LabValue.language == accept_language
        ).all()
        if not lab_values:
            # Fallback
            lab_values = db.query(models.LabValue).filter(
                models.LabValue.report_id == r.id
            ).all()
            
        if lab_values:
            trend_point = {"date": r.uploaded_at.strftime("%Y-%m-%d")}
            for lv in lab_values:
                # Try to parse float
                try:
                    val = float(lv.value.replace('<', '').replace('>', '').replace(' ', ''))
                    trend_point[lv.test_name] = val
                except ValueError:
                    pass
            trends.append(trend_point)
            
    return {
        "health_score": health_score,
        "recent_reports": [{"id": r.id, "filename": r.filename, "uploaded_at": r.uploaded_at} for r in reports],
        "ai_findings": ai_findings,
        "trends": trends
    }
