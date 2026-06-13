from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, reports, chat, dashboard
from sqlalchemy import text
from app.db.database import engine, Base
import app.models.models as models

models.Base.metadata.create_all(bind=engine)

def add_column_if_not_exists(engine, table_name, column_name, column_type):
    try:
        with engine.begin() as conn:
            result = conn.execute(text(f"PRAGMA table_info({table_name})"))
            columns = [row[1] for row in result.fetchall()]
            if column_name not in columns:
                conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"))
    except Exception as e:
        print(f"Error checking/migrating database column {table_name}.{column_name}: {e}")

# Run startup migrations
add_column_if_not_exists(engine, "analyses", "language", "VARCHAR DEFAULT 'en'")
add_column_if_not_exists(engine, "lab_values", "language", "VARCHAR DEFAULT 'en'")

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
