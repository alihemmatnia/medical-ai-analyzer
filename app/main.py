from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, reports, chat, dashboard
from app.db.database import engine, Base
import app.models.models as models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Medical Report Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Medical Report Analyzer API"}
