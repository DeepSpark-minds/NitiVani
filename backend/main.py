from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import PyPDF2

# All custom services imported cleanly at the top
from services.pdf_engine import extract_text_from_memory
from services.llm_engine import (
    analyze_document_text, check_user_eligibility, translate_document_summary, 
    extract_schemes_from_document, extract_rights_and_duties, ask_document_question,
    generate_official_letter, extract_document_deadlines, generate_full_report
)
from services.audio_engine import generate_speech
app = FastAPI(title="NitiVani AI Omni-Engine", version="3.0")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

os.makedirs("temp_audio", exist_ok=True)
app.mount("/audio", StaticFiles(directory="temp_audio"), name="audio")

@app.post("/api/analyze-policy")
async def analyze_policy_endpoint(file: UploadFile = File(...), target_language: str = Form("English")):
    try:
        file_bytes = await file.read()
        raw_text = extract_text_from_memory(file_bytes)
        analysis_json = analyze_document_text(raw_text, target_language)
        audio_url = await generate_speech(analysis_json, target_language)
        return {"status": "success", "language": target_language, "audio_url": f"http://localhost:8000{audio_url}", "data": analysis_json}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/check-eligibility")
async def evaluate_eligibility(file: UploadFile = File(...), income: int = Form(...), target_language: str = Form("English")):
    try:
        pdf_reader = PyPDF2.PdfReader(file.file)
        raw_text = "".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])
        result = check_user_eligibility(raw_text, income, target_language)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/translate-policy")
async def translate_policy(file: UploadFile = File(...), target_language: str = Form("English")):
    try:
        pdf_reader = PyPDF2.PdfReader(file.file)
        raw_text = "".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])
        result = translate_document_summary(raw_text, target_language)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/extract-schemes")
async def extract_schemes(file: UploadFile = File(...), target_language: str = Form("English")):
    try:
        pdf_reader = PyPDF2.PdfReader(file.file)
        raw_text = "".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])
        result = extract_schemes_from_document(raw_text, target_language)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/extract-rights")
async def extract_rights(file: UploadFile = File(...), target_language: str = Form("English")):
    try:
        pdf_reader = PyPDF2.PdfReader(file.file)
        raw_text = "".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])
        result = extract_rights_and_duties(raw_text, target_language)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/ask-policy")
async def ask_policy_question(file: UploadFile = File(...), question: str = Form(...), target_language: str = Form("English")):
    try:
        pdf_reader = PyPDF2.PdfReader(file.file)
        raw_text = "".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])
        result = ask_document_question(raw_text, question, target_language)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/generate-draft")
async def generate_draft(file: UploadFile = File(...), target_language: str = Form("English")):
    try:
        pdf_reader = PyPDF2.PdfReader(file.file)
        raw_text = "".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])
        result = generate_official_letter(raw_text, target_language)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/extract-deadlines")
async def extract_deadlines(file: UploadFile = File(...), target_language: str = Form("English")):
    try:
        pdf_reader = PyPDF2.PdfReader(file.file)
        raw_text = "".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])
        result = extract_document_deadlines(raw_text, target_language)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/generate-report")
async def generate_report(file: UploadFile = File(...), target_language: str = Form("English")):
    try:
        pdf_reader = PyPDF2.PdfReader(file.file)
        raw_text = "".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])
        result = generate_full_report(raw_text, target_language)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}