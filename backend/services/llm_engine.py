import os
import json
import time
from groq import Groq
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

class DocumentAnalysis(BaseModel):
    reasoning_process: str = Field(description="Think step-by-step to identify the document's true nature.")
    document_type: str = Field(description="What kind of document is this?")
    target_audience: str = Field(description="Who is this document meant for?")
    core_requirements_or_eligibility: list[str] = Field(description="Conditions that must be met.")
    limitations_or_exceptions: list[str] = Field(description="Exceptions, warnings, or restrictions.")
    benefits_or_value: list[str] = Field(description="The exact benefits or value provided.")
    actionable_steps: list[str] = Field(description="Step-by-step actions the reader should take.")

def analyze_document_text(raw_text: str, target_language: str) -> dict:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    if len(raw_text) > 25000:
        raw_text = raw_text[:25000] + "\n\n... [DOCUMENT TRUNCATED DUE TO FREE TIER API LIMITS] ..."
    
    prompt = f"""
    You are an elite, highly logical document analyst. 
    Your task is to accurately analyze ANY type of document provided to you.
    
    CRITICAL RULES TO AVOID ERRORS:
    1. REASON FIRST: Use the 'reasoning_process' field to silently think through the document.
    2. ADAPT: Adapt the extraction fields to fit the document logically. 
    3. BE PRECISE: If a specific detail is missing, write 'Not specified'. Do not guess.
    4. TRANSLATE: Translate all final extracted fields strictly into {target_language} (except JSON keys).
    
    You MUST return a valid JSON object matching this EXACT structure:
    {{
        "reasoning_process": "string",
        "document_type": "string",
        "target_audience": "string",
        "core_requirements_or_eligibility": ["string"],
        "limitations_or_exceptions": ["string"],
        "benefits_or_value": ["string"],
        "actionable_steps": ["string"]
    }}
    
    Document Text:
    {raw_text}
    """
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # Upgraded to Groq's Llama 3 70B model for high-speed logic
            chat_completion = client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": "You are a JSON-only API. You always return strict, perfectly formatted JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    model="openai/gpt-oss-120b", # CHANGED THIS LINE
                    temperature=0.1,
                    response_format={"type": "json_object"},
                )
            
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg and attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise ValueError(f"Groq LLM Engine failed: {error_msg}")

def check_user_eligibility(raw_text: str, income: int, target_language: str) -> dict:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    if len(raw_text) > 25000: raw_text = raw_text[:25000]
    prompt = f"""
    Analyze the document to check if an applicant with an annual income of ₹{income} is eligible for the schemes.
    
    CRITICAL: The JSON keys MUST remain in English. Translate the 'reasoning' value into {target_language}.
    
    Return a strict JSON object:
    {{
        "is_eligible": true,
        "reasoning": "Detailed explanation translated into {target_language}"
    }}
    Document: {raw_text}
    """
    chat = client.chat.completions.create(
        messages=[{"role": "system", "content": "You are a JSON API."}, {"role": "user", "content": prompt}],
        model="openai/gpt-oss-120b", temperature=0.1, response_format={"type": "json_object"}
    )
    return json.loads(chat.choices[0].message.content)

def extract_schemes_from_document(raw_text: str, target_language: str) -> dict:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    if len(raw_text) > 25000: raw_text = raw_text[:25000]
    prompt = f"""
    Extract welfare schemes, grants, and subsidies from the policy document.
    
    CRITICAL: The JSON keys MUST remain in English. Translate the text values into {target_language}.
    
    Return a strict JSON object:
    {{
        "schemes": [
            {{
                "title": "Scheme Name in {target_language}",
                "sector": "Target Sector in {target_language}",
                "desc": "Benefit description in {target_language}"
            }}
        ]
    }}
    Document: {raw_text}
    """
    chat = client.chat.completions.create(
        messages=[{"role": "system", "content": "You are a JSON API."}, {"role": "user", "content": prompt}],
        model="openai/gpt-oss-120b", temperature=0.1, response_format={"type": "json_object"}
    )
    return json.loads(chat.choices[0].message.content)

def extract_rights_and_duties(raw_text: str, target_language: str) -> dict:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    if len(raw_text) > 25000: raw_text = raw_text[:25000]
    prompt = f"""
    Extract legal rights and civic duties from the document.
    
    CRITICAL: The JSON keys ("rights", "duties") MUST remain in English. Translate the list items into {target_language}.
    
    Return a strict JSON object:
    {{
        "rights": ["Right 1 in {target_language}", "Right 2 in {target_language}"],
        "duties": ["Duty 1 in {target_language}"]
    }}
    Document: {raw_text}
    """
    chat = client.chat.completions.create(
        messages=[{"role": "system", "content": "You are a JSON API."}, {"role": "user", "content": prompt}],
        model="openai/gpt-oss-120b", temperature=0.1, response_format={"type": "json_object"}
    )
    return json.loads(chat.choices[0].message.content)

def ask_document_question(raw_text: str, question: str, target_language: str) -> dict:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    if len(raw_text) > 25000: raw_text = raw_text[:25000]
    prompt = f"""
    Answer the user's question based strictly on the document.
    User Question: {question}
    
    CRITICAL: The JSON key MUST remain in English. Translate the answer into {target_language}.
    
    Return a strict JSON object:
    {{
        "answer": "Your direct answer in {target_language}."
    }}
    Document: {raw_text}
    """
    chat = client.chat.completions.create(
        messages=[{"role": "system", "content": "You are a JSON API."}, {"role": "user", "content": prompt}],
        model="openai/gpt-oss-120b", temperature=0.1, response_format={"type": "json_object"}
    )
    return json.loads(chat.choices[0].message.content)

def generate_official_letter(raw_text: str, target_language: str) -> dict:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    if len(raw_text) > 25000: raw_text = raw_text[:25000]
    prompt = f"""
    Draft a standard, professional application or compliance letter based on this policy.
    
    CRITICAL: The JSON key MUST remain in English. The drafted letter itself MUST be written entirely in {target_language}.
    
    Return a strict JSON object:
    {{
        "draft": "The full letter text in {target_language}."
    }}
    Document: {raw_text}
    """
    chat = client.chat.completions.create(
        messages=[{"role": "system", "content": "You are a JSON API."}, {"role": "user", "content": prompt}],
        model="openai/gpt-oss-120b", temperature=0.1, response_format={"type": "json_object"}
    )
    return json.loads(chat.choices[0].message.content)

def extract_document_deadlines(raw_text: str, target_language: str) -> dict:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    if len(raw_text) > 25000: raw_text = raw_text[:25000]
    prompt = f"""
    Extract critical deadlines and compliance windows.
    
    CRITICAL: JSON keys MUST remain in English. Translate 'task' and 'date' into {target_language}.
    CRITICAL: The 'severity' value MUST remain in English (High, Medium, or Low).
    
    Return a strict JSON object:
    {{
        "deadlines": [
            {{
                "task": "Task in {target_language}",
                "date": "Date in {target_language}",
                "severity": "High"
            }}
        ]
    }}
    Document: {raw_text}
    """
    chat = client.chat.completions.create(
        messages=[{"role": "system", "content": "You are a JSON API."}, {"role": "user", "content": prompt}],
        model="openai/gpt-oss-120b", temperature=0.1, response_format={"type": "json_object"}
    )
    return json.loads(chat.choices[0].message.content)

def generate_full_report(raw_text: str, target_language: str) -> dict:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    if len(raw_text) > 25000: raw_text = raw_text[:25000]
    prompt = f"""
    Create a clean, well-formatted plain-text citizen report summarizing schemes, deadlines, and rules.
    
    CRITICAL: The JSON key MUST remain in English. The report content MUST be written entirely in {target_language}.
    
    Return a strict JSON object:
    {{
        "report_text": "Complete report in {target_language}"
    }}
    Document: {raw_text}
    """
    chat = client.chat.completions.create(
        messages=[{"role": "system", "content": "You are a JSON API."}, {"role": "user", "content": prompt}],
        model="openai/gpt-oss-120b", temperature=0.1, response_format={"type": "json_object"}
    )
    return json.loads(chat.choices[0].message.content)

def translate_document_summary(raw_text: str, target_language: str) -> dict:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    if len(raw_text) > 25000: raw_text = raw_text[:25000]
    prompt = f"""
    Translate the key points of the following document into {target_language}.
    
    CRITICAL: The JSON key MUST remain in English. The translation must be entirely in {target_language}.
    
    Return a strict JSON object:
    {{
        "translated_text": "The full translation in {target_language}."
    }}
    Document: {raw_text}
    """
    chat = client.chat.completions.create(
        messages=[{"role": "system", "content": "You are a JSON API."}, {"role": "user", "content": prompt}],
        model="openai/gpt-oss-120b", temperature=0.1, response_format={"type": "json_object"}
    )
    return json.loads(chat.choices[0].message.content)