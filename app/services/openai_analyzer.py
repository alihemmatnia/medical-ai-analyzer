import json
from openai import OpenAI
from app.core.config import settings

LANG_MAP = {
    "en": "English",
    "fa": "Persian (Farsi)",
    "ar": "Arabic",
    "he": "Hebrew",
    "fr": "French",
    "de": "German",
    "es": "Spanish"
}

def get_client():
    if not settings.OPENAI_API_KEY:
        return None
    
    kwargs = {"api_key": settings.OPENAI_API_KEY}
    if settings.OPENAI_BASE_URL:
        kwargs["base_url"] = settings.OPENAI_BASE_URL
        
    return OpenAI(**kwargs)

def analyze_medical_report(text: str, language: str = "en"):
    client = get_client()
    if not client:
        return None
        
    lang_name = LANG_MAP.get(language, "English")
        
    prompt = f"""
    You are an expert AI medical assistant. Analyze the following medical report text and extract the required information in a structured JSON format.

    Report Text:
    {text}

    IMPORTANT language requirement:
    The entire analysis and all textual values inside the JSON (including 'executive_summary', 'abnormal_findings', 'possible_concerns', 'health_suggestions', 'follow_up_recommendations', and test names inside 'lab_values' like 'Glucose') MUST be generated in the {lang_name} language. 
    Keep the JSON key names (e.g. 'executive_summary', 'lab_values', etc.) exactly as defined in the structure below, but translate their content values to {lang_name}.
    For the 'urgency_level', it MUST be exactly one of the English strings: 'Normal', 'Low', 'Medium', 'High' (do NOT translate 'urgency_level' values, keep them in English so the system can parse them).

    Output JSON structure exactly like this:
    {{
      "executive_summary": "Simple explanation for non-medical users in {lang_name}.",
      "abnormal_findings": "Highlight unusual values in {lang_name}.",
      "possible_concerns": "Explain what results may indicate in {lang_name}.",
      "health_suggestions": "Lifestyle recommendations in {lang_name}.",
      "follow_up_recommendations": "What should be discussed with a doctor in {lang_name}.",
      "urgency_level": "Normal", // MUST be one of: Normal, Low, Medium, High
      "health_score": 85, // Integer from 0 to 100 based on the report
      "lab_values": [
        {{
          "test_name": "translated name in {lang_name} (e.g. Glucose -> گلوکز in Persian)",
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

def chat_with_assistant(history: list, new_message: str, report_text: str = None, language: str = "en"):
    client = get_client()
    if not client:
        return "OpenAI API Key is missing. Please configure it in .env."
        
    lang_name = LANG_MAP.get(language, "English")
    
    system_instruction = f"You are a helpful AI medical assistant. You will answer questions based on the user's medical report and general medical knowledge. Remember to add a disclaimer that you are not a substitute for professional medical advice. IMPORTANT: You MUST respond entirely in the {lang_name} language. All explanations, suggestions, and text should be in {lang_name}."
    
    messages = [
        {"role": "system", "content": system_instruction}
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

def compare_medical_reports(report_text_1: str, report_text_2: str, language: str = "en"):
    client = get_client()
    if not client:
        return None
        
    lang_name = LANG_MAP.get(language, "English")
        
    prompt = f"""
    You are an expert AI medical assistant. Compare the following two medical reports for the same patient and analyze the differences, trends, and health progression.
    
    IMPORTANT language requirement:
    All texts, metrics descriptions, and summaries inside the JSON MUST be in the {lang_name} language. Keep the JSON key names exactly as specified in the schema, but translate all contents to {lang_name}.

    IMPORTANT: Identify the date or timestamp of each report from their texts. You must determine which report is actually earlier (older) and which is later (newer) based on their internal document dates. Then, analyze the health progression and metric changes chronologically FROM the older report TO the newer report.
    
    Report 1:
    {report_text_1}
    
    Report 2:
    {report_text_2}
    
    Output JSON structure exactly like this:
    {{
      "improved_metrics": ["e.g. Metric name and details in {lang_name}"],
      "worsened_metrics": ["e.g. Metric name and details in {lang_name}"],
      "stable_metrics": ["e.g. Metric name and details in {lang_name}"],
      "ai_summary": "A detailed explanation of the progress in {lang_name}, highlighting what has improved or worsened, lifestyle changes that might have contributed, and key recommendations to discuss with their physician. In your summary, clearly mention the dates of both reports in {lang_name} to orient the patient."
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

