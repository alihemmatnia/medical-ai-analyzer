# AI Medical Report Analyzer

AI Medical Report Analyzer is a full-stack web application designed to help users upload, extract, and analyze medical reports (PDFs and images). By leveraging OpenAI's language models and OCR technologies, the application extracts critical health data, identifies abnormal findings, and provides an interactive AI medical assistant to discuss your health trends.

> **Disclaimer:** This AI analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.

## Features

- **Authentication:** Secure user registration and login with JWT.
- **Report Upload:** Supports uploading medical reports in PDF, JPG, JPEG, and PNG formats.
- **Text Extraction:** Uses `pdfplumber` for PDFs and `EasyOCR` for images.
- **AI Analysis:** Analyzes extracted text via the OpenAI API to generate an executive summary, identify abnormal findings, suggest lifestyle changes, and assign an urgency level.
- **Health Dashboard:** Visualizes health trends (e.g., Glucose, Cholesterol) across multiple reports using interactive Recharts.
- **AI Chat Assistant:** A contextual chat interface that lets you ask questions specifically about your uploaded reports.

## Tech Stack

### Backend
- **Python 3.12**
- **FastAPI** & **Uvicorn**
- **SQLAlchemy** & **SQLite**
- **Pydantic v2**
- **JWT Authentication** (`python-jose`, `passlib`)
- **OpenAI API**
- **pdfplumber**, **Pillow**, **EasyOCR**

### Frontend
- **React** (TypeScript)
- **Vite**
- **TailwindCSS**
- **Axios**
- **React Router**
- **Recharts**
- **Lucide Icons**

## Prerequisites

- Python 3.12 or higher
- Node.js (v18+ recommended)
- An active OpenAI API Key

## Installation & Setup

### 1. Clone the repository

Navigate to the project directory:
```bash
cd medical-ai-analyzer
```

### 2. Configure Environment Variables

In the root of the project, you will find a `.env` file (or `.env.template`). Open it and add your actual OpenAI API Key:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=
SECRET_KEY=your_super_secret_key_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///../storage/medical.db
```

### 3. Backend Setup

Open a terminal in the root directory:

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate the virtual environment:
   - **Windows (PowerShell):** `.\venv\Scripts\Activate.ps1`
   - **Windows (CMD):** `.\venv\Scripts\activate.bat`
   - **Linux/Mac:** `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will be running at `http://127.0.0.1:8000`. You can view the API documentation at `http://127.0.0.1:8000/docs`.

### 4. Frontend Setup

Open a new terminal window and navigate to the frontend directory:

1. Move to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be running at `http://localhost:5173`.

## Folder Structure

```text
medical-ai-analyzer/
├── app/
│   ├── api/          # API Route handlers (auth, chat, dashboard, reports)
│   ├── core/         # Config and Security settings
│   ├── db/           # Database setup and sessions
│   ├── models/       # SQLAlchemy database models
│   ├── schemas/      # Pydantic schemas for data validation
│   ├── services/     # Business logic (Text extraction, OpenAI analysis)
│   └── main.py       # FastAPI application entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components (Layout, etc.)
│   │   ├── pages/      # React Pages (Dashboard, Upload, Analysis, Chat, Auth)
│   │   ├── services/   # Axios API client setup
│   │   ├── App.tsx     # React Router setup
│   │   └── main.tsx    # React application entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── storage/
│   ├── uploads/      # Uploaded medical reports (PDF/images)
│   └── medical.db    # SQLite database file
├── .env              # Environment variables
└── requirements.txt  # Python backend dependencies
```

## Usage

1. Open your browser and navigate to the frontend URL.
2. Register a new account and log in.
3. Click on "Upload Report" to upload your medical lab results.
4. Wait for the extraction and AI analysis to complete.
5. Review the Analysis page for a summary, abnormal findings, and extracted lab values.
6. Head to the Dashboard to see your health trends charted over time.
7. Use the AI Chat to ask specific medical questions regarding your results.
