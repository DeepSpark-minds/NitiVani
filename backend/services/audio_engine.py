import os
import uuid
import edge_tts

# A basic map to give the AI the correct regional accent
VOICE_MAPPING = {
    "English": "en-IN-NeerjaExpressiveNeural", # Indian English Accent
    "Hindi": "hi-IN-SwaraNeural",
    "Gujarati": "gu-IN-DhwaniNeural",
    "Bengali": "bn-IN-TanishaaNeural",
    "Tamil": "ta-IN-PallaviNeural"
}

async def generate_speech(analysis_data: dict, target_language: str) -> str:
    """
    Converts the AI's JSON analysis into an MP3 file.
    Returns the URL path for the frontend to play.
    """
    # 1. Ensure a folder exists to hold the audio files
    os.makedirs("temp_audio", exist_ok=True)
    
    # 2. Select the right voice (Default to Indian English if not found)
    voice = VOICE_MAPPING.get(target_language, "en-IN-NeerjaExpressiveNeural")
    
    # 3. Create a conversational script out of the JSON data
    benefits = ", ".join(analysis_data.get("benefits_or_value", ["No specific benefits mentioned."]))
    action_steps = ", ".join(analysis_data.get("actionable_steps", ["No specific steps."]))
    
    script = f"Here is the summary. Key takeaways: {benefits}. Next steps you should take: {action_steps}."
    
    # 4. Generate a unique filename and save the audio
    filename = f"{uuid.uuid4().hex}.mp3"
    filepath = os.path.join("temp_audio", filename)
    
    communicate = edge_tts.Communicate(script, voice)
    await communicate.save(filepath)
    
    # 5. Return the URL path that the React frontend will use
    return f"/audio/{filename}"