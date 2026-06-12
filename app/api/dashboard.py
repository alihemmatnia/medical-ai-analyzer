from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.database import get_db
from app.models import models
from app.api import deps
from typing import Any

router = APIRouter()

@router.get("/")
def get_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(deps.get_current_user)) -> Any:
    reports = db.query(models.Report).filter(models.Report.user_id == current_user.id).order_by(desc(models.Report.uploaded_at)).limit(5).all()
    
    latest_report = reports[0] if reports else None
    health_score = 0
    ai_findings = None
    
    if latest_report and latest_report.analysis:
        health_score = latest_report.analysis.health_score
        ai_findings = {
            "summary": latest_report.analysis.summary,
            "urgency": latest_report.analysis.urgency
        }
        
    # Gather trends
    all_reports = db.query(models.Report).filter(models.Report.user_id == current_user.id).order_by(models.Report.uploaded_at.asc()).all()
    trends = []
    
    for r in all_reports:
        if r.lab_values:
            trend_point = {"date": r.uploaded_at.strftime("%Y-%m-%d")}
            for lv in r.lab_values:
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
