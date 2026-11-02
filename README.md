# 🏛️ NitiVani | AI Policy Omni-Engine

> **Transforming Complex Government Policies into Accessible Citizen Insights Across 22 Indian Languages.**

NitiVani is a full-stack AI-powered policy analysis platform designed to bridge the communication gap between governance and citizens. Built for civic tech and public sector innovation, it ingests dense bureaucratic policy documents, simplifies them into plain language, maps out welfare grants, checks individual eligibility, highlights legal rights and duties, tracks compliance deadlines, and generates regional voice explainers.

---

## 🚀 Key Features (10-Module Omni-Engine)

1. **AI Document Simplifier:** Automatically breaks down jargon-heavy official PDFs into clear, structured plain-language summaries.
2. **Multilingual Regional Translation:** Full support for all 22 officially recognized Eighth Schedule languages of India (Assamese, Hindi, Bengali, Gujarati, Marathi, Telugu, Tamil, etc.).
3. **Hidden Grant & Scheme Discovery:** Scans documents to extract hidden welfare grants, subsidies, and financial assistance programs.
4. **Smart Eligibility Checker:** Evaluates user-specific parameters (such as annual family income) against policy rules to determine benefit qualification.
5. **Rights & Duties Explainer:** Isolates and categorizes the legal protections and civic responsibilities mandated by the policy.
6. **Ask NitiVani (Interactive Q&A):** Chat directly with the policy document to get precise, source-backed answers.
7. **Official Letter Auto-Drafter:** Instantly drafts formal applications, grievance letters, or compliance documents based on policy guidelines.
8. **Deadline & Compliance Tracker:** Extracts critical submission windows and expiration dates, flagging them by severity level.
9. **Audio Voice Explainer:** Converts key insights into natural-sounding audio summaries for auditory accessibility.
10. **Citizen Report Export:** Compiles all analysis, extracted schemes, and drafts into an offline `.txt` report.

---

## 🛠️ Tech Stack

## ⚙️ Complete Installation & Setup Guide

Follow these steps to set up and run the NitiVani platform locally on your machine.

### Prerequisites
* **Python 3.9+** installed on your system.
* A free **Groq API Key** (obtainable from [Groq Console](https://console.groq.com/)).

### Step 1: Clone the Repository
```bash
git clone https://github.com/DeepSpark-minds/NitiVani.git
cd NitiVani
```

### Step 2: Set Up the Backend Environment
Navigate into the backend directory and create a Python virtual environment:
```bash
cd backend
python -m venv venv
```

Activate the virtual environment:
* **Windows (Command Prompt / PowerShell):**
  ```bash
  venv\Scripts\activate
  ```
* **macOS / Linux:**
  ```bash
  source venv/bin/activate
  ```

### Step 3: Install Python Dependencies
Install all required libraries using `pip`:
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Create a file named `.env` inside the `backend/` directory and add your Groq API key:
```env
GROQ_API_KEY=your_actual_groq_api_key_here
```

### Step 5: Start the Backend Server
Run the FastAPI application via Uvicorn with live reload enabled:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*The backend API will now be live at `http://localhost:8000` (API documentation is available at `http://localhost:8000/docs`).*

### Step 6: Launch the Frontend
1. Open a new terminal window.
2. Navigate to the `frontend/` directory or simply open `frontend/index.html` directly in your web browser.
3. For the best development experience, open the folder in **VS Code** and use the **Live Server** extension to launch `index.html`.

---

* **Backend:** Python, FastAPI, PyPDF2, Edge-TTS, Python-Multipart
* **AI Engine:** Groq API (powered by high-performance LLM pipelines)
* **Frontend:** Modern HTML5, CSS3 (Custom Dashboard Architecture), JavaScript (ES6+)
* **System Integration:** Windows Service management via NSSM (Non-Sucking Service Manager), Cloudflare Tunnels for live deployment capability.

---

## 📂 Project Structure

```text
Project_NitiVani/
│
├── frontend/
│   ├── index.html       # Modern SaaS-level dashboard UI
│   ├── style.css        # Responsive styling with Inter font & CSS variables
│   └── app.js           # Frontend controller & asynchronous API handler
│
├── backend/
│   ├── main.py          # FastAPI server and application endpoints
│   ├── requirements.txt # Python package dependencies
│   ├── .env             # Environment configuration (API Keys - Git ignored)
│   ├── nssm.exe         # Background service management binary
│   ├── services/
│   │   ├── llm_engine.py   # Groq LLM prompts & structured JSON parsers
│   │   ├── pdf_engine.py   # Memory-optimized PDF text extraction
│   │   └── audio_engine.py # Text-to-speech audio generation pipeline
│   └── temp_audio/      # Temporary storage for generated voice explainers (.mp3)
│
└── .gitignore           # Protects sensitive environment variables and caches
