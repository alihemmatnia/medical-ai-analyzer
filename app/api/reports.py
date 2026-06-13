from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Header
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas import schemas
from app.models import models
from app.api import deps
from app.services import text_extractor, openai_analyzer
import os
import shutil
import uuid

router = APIRouter()

UPLOAD_DIR = "storage/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.ReportResponse)
async def upload_report(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.pdf', '.jpg', '.jpeg', '.png']:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    extracted_text = text_extractor.extract_text(file_path, file.filename)
    
    report = models.Report(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        extracted_text=extracted_text
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return report

@router.get("/", response_model=list[schemas.ReportResponse])
def get_reports(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(deps.get_current_user),
    accept_language: str = Header("en")
):
    reports = db.query(models.Report).filter(models.Report.user_id == current_user.id).all()
    res = []
    for r in reports:
        analysis = db.query(models.Analysis).filter(
            models.Analysis.report_id == r.id,
            models.Analysis.language == accept_language
        ).first()
        if not analysis:
            analysis = db.query(models.Analysis).filter(models.Analysis.report_id == r.id).first()
            
        lab_values = db.query(models.LabValue).filter(
            models.LabValue.report_id == r.id,
            models.LabValue.language == accept_language
        ).all()
        if not lab_values:
            lab_values = db.query(models.LabValue).filter(models.LabValue.report_id == r.id).all()
            
        res.append(schemas.ReportResponse(
            id=r.id,
            user_id=r.user_id,
            filename=r.filename,
            uploaded_at=r.uploaded_at,
            analysis=analysis,
            lab_values=lab_values
        ))
    return res

@router.get("/{report_id}", response_model=schemas.ReportResponse)
def get_report(
    report_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(deps.get_current_user),
    accept_language: str = Header("en")
):
    report = db.query(models.Report).filter(models.Report.id == report_id, models.Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    analysis = db.query(models.Analysis).filter(
        models.Analysis.report_id == report_id,
        models.Analysis.language == accept_language
    ).first()
    if not analysis:
        analysis = db.query(models.Analysis).filter(models.Analysis.report_id == report_id).first()
        
    lab_values = db.query(models.LabValue).filter(
        models.LabValue.report_id == report_id,
        models.LabValue.language == accept_language
    ).all()
    if not lab_values:
        lab_values = db.query(models.LabValue).filter(models.LabValue.report_id == report_id).all()
        
    return schemas.ReportResponse(
        id=report.id,
        user_id=report.user_id,
        filename=report.filename,
        uploaded_at=report.uploaded_at,
        analysis=analysis,
        lab_values=lab_values
    )

@router.post("/{report_id}/analyze", response_model=schemas.AnalysisResponse)
def analyze_report(
    report_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(deps.get_current_user),
    accept_language: str = Header("en")
):
    report = db.query(models.Report).filter(models.Report.id == report_id, models.Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Check if analysis for this language already exists
    analysis = db.query(models.Analysis).filter(
        models.Analysis.report_id == report_id,
        models.Analysis.language == accept_language
    ).first()
    if analysis:
        return analysis
        
    analysis_data = openai_analyzer.analyze_medical_report(report.extracted_text, language=accept_language)
    if not analysis_data:
        raise HTTPException(status_code=500, detail="Error analyzing report")
        
    analysis = models.Analysis(
        report_id=report.id,
        summary=analysis_data.get("executive_summary", ""),
        findings=analysis_data.get("abnormal_findings", ""),
        urgency=analysis_data.get("urgency_level", "Normal"),
        health_score=analysis_data.get("health_score", 0),
        language=accept_language
    )
    db.add(analysis)
    
    # Add lab values in this language
    for lab in analysis_data.get("lab_values", []):
        lab_val = models.LabValue(
            report_id=report.id,
            test_name=lab.get("test_name", ""),
            value=lab.get("value", ""),
            reference_range=lab.get("reference_range", ""),
            unit=lab.get("unit", ""),
            language=accept_language
        )
        db.add(lab_val)
        
    db.commit()
    db.refresh(analysis)
    return analysis

@router.post("/compare", response_model=schemas.CompareResponse)
def compare_reports(
    req: schemas.CompareRequest, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(deps.get_current_user),
    accept_language: str = Header("en")
):
    report_1 = db.query(models.Report).filter(models.Report.id == req.report_id_1, models.Report.user_id == current_user.id).first()
    report_2 = db.query(models.Report).filter(models.Report.id == req.report_id_2, models.Report.user_id == current_user.id).first()
    
    if not report_1 or not report_2:
        raise HTTPException(status_code=404, detail="One or both reports not found")
        
    text_1 = report_1.extracted_text or ""
    text_2 = report_2.extracted_text or ""
    
    comparison_data = openai_analyzer.compare_medical_reports(text_1, text_2, language=accept_language)
    if not comparison_data:
        raise HTTPException(status_code=500, detail="Error performing comparison analysis")
        
    return schemas.CompareResponse(
        improved_metrics=comparison_data.get("improved_metrics", []),
        worsened_metrics=comparison_data.get("worsened_metrics", []),
        stable_metrics=comparison_data.get("stable_metrics", []),
        ai_summary=comparison_data.get("ai_summary", "Comparison completed.")
    )
