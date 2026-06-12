import json
from openai import OpenAI
from app.core.config import settings

def get_client():
    if not settings.OPENAI_API_KEY:
        return None
    
    kwargs = {"api_key": settings.OPENAI_API_KEY}
    if settings.OPENAI_BASE_URL:
        kwargs["base_url"] = settings.OPENAI_BASE_URL
        
    return OpenAI(**kwargs)

def analyze_medical_report(text: str):
    client = get_client()
    if not client:
        return None
        
    prompt = f"""
    You are an expert AI medical assistant. Analyze the following medical report text and extract the required information in a structured JSON format.

    Report Text:
    {text}

    Output JSON structure exactly like this:
    {{
      "executive_summary": "Simple explanation for non-medical users.",
      "abnormal_findings": "Highlight unusual values.",
      "possible_concerns": "Explain what results may indicate.",
      "health_suggestions": "Lifestyle recommendations.",
      "follow_up_recommendations": "What should be discussed with a doctor.",
      "urgency_level": "Normal", // MUST be one of: Normal, Low, Medium, High
      "health_score": 85, // Integer from 0 to 100 based on the report
      "lab_values": [
        {{
          "test_name": "string",
          "value": "string",
          "reference_range": "string",
          "unit": "string"
        }}
      ]
    }}
    Extract as many relevant lab values as possible (e.g., CBC, Glucose, Lipid Profile, Liver/Kidney Function).
    Do NOT include any markdown formatting, just return raw JSON.
    """
    
    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a medical data extraction API that only outputs raw JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error with OpenAI API: {e}")
        return None

def chat_with_assistant(history: list, new_message: str, report_text: str = None):
    client = get_client()
    if not client:
        return "OpenAI API Key is missing. Please configure it in .env."
        
    messages = [
        {"role": "system", "content": "You are a helpful AI medical assistant. You will answer questions based on the user's medical report and general medical knowledge. Remember to add a disclaimer that you are not a substitute for professional medical advice."}
    ]
    if report_text:
        messages.append({"role": "system", "content": f"The user's recent medical report text: {report_text}"})
    
    for msg in history:
        messages.append({"role": msg.role, "content": msg.message})
        
    messages.append({"role": "user", "content": new_message})
    
    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        return "I'm sorry, I'm having trouble analyzing your request right now."

def compare_medical_reports(report_text_1: str, report_text_2: str):
    client = get_client()
    if not client:
        return None
        
    prompt = f"""
    You are an expert AI medical assistant. Compare the following two medical reports for the same patient and analyze the differences, trends, and health progression.
    
    IMPORTANT: Identify the date or timestamp of each report from their texts. You must determine which report is actually earlier (older) and which is later (newer) based on their internal document dates. Then, analyze the health progression and metric changes chronologically FROM the older report TO the newer report.
    
    Report 1:
    {report_text_1}
    
    Report 2:
    {report_text_2}
    
    Output JSON structure exactly like this:
    {{
      "improved_metrics": ["e.g. Hemoglobin (from 11.2 to 13.5 g/dL)", "LDL Cholesterol (from 150 to 120 mg/dL)"],
      "worsened_metrics": ["e.g. Fasting Glucose (from 95 to 115 mg/dL)"],
      "stable_metrics": ["e.g. Creatinine (remained at 0.9 mg/dL)"],
      "ai_summary": "A detailed explanation of the progress, highlighting what has improved or worsened, lifestyle changes that might have contributed, and key recommendations to discuss with their physician. In your summary, clearly mention the dates of both reports to orient the patient."
    }}
    Do NOT include any markdown formatting, just return raw JSON.
    """
    
    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a medical data comparison API that only outputs raw JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error with OpenAI API during comparison: {e}")
        return None

