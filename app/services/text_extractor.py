import pdfplumber
import easyocr
import os

reader = easyocr.Reader(['en'])

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error extracting PDF: {e}")
    return text

def extract_text_from_image(file_path: str) -> str:
    try:
        result = reader.readtext(file_path, detail=0)
        return "\n".join(result)
    except Exception as e:
        print(f"Error extracting image: {e}")
        return ""

def extract_text(file_path: str, filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    if ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif ext in ['.jpg', '.jpeg', '.png']:
        return extract_text_from_image(file_path)
    else:
        return ""
