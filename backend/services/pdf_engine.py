import pypdf
import io

def extract_text_from_memory(file_bytes: bytes) -> str:
    """
    Securely reads a PDF from memory and extracts raw text using pure Python.
    Bypasses disk storage to prevent data leaks.
    """
    try:
        # Convert the raw bytes into a file-like object in memory
        pdf_file = io.BytesIO(file_bytes)
        reader = pypdf.PdfReader(pdf_file)
        
        full_text = []
        
        # Loop through every page and extract text
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text.append(text)
                
        # Join all pages with a clean separator
        return "\n---PAGE BREAK---\n".join(full_text)
        
    except Exception as e:
        raise ValueError(f"Failed to parse PDF document: {str(e)}")