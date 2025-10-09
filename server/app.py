from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import google.generativeai as genai
import pdfplumber
from PIL import Image
import io
import os
from dotenv import load_dotenv
import json

app = FastAPI(title="EaseEd Backend")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
youtube_service = build("youtube", "v3", developerKey=os.getenv("YOUTUBE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")  # Free, fast model

# Helper: Extract text from PDF
async def extract_pdf_text(file: UploadFile):
    contents = await file.read()
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        text = "".join(page.extract_text() or "" for page in pdf.pages)
    return text

# Helper: Process image for Gemini (multimodal)
def process_image(file: UploadFile):
    contents = file.file.read()
    image = Image.open(io.BytesIO(contents))
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()
    return img_byte_arr

# Helper: Get YouTube content (transcript or description)
async def get_youtube_content(url: str):
    try:
        video_id = url.split("v=")[1].split("&")[0]
        # Get video details
        video_response = youtube_service.videos().list(part="snippet", id=video_id).execute()
        description = video_response["items"][0]["snippet"]["description"]
        # Try to get transcript
        try:
            captions = youtube_service.captions().list(part="snippet", videoId=video_id).execute()
            if captions["items"]:
                caption_id = captions["items"][0]["id"]
                transcript = youtube_service.captions().download(id=caption_id, tfmt="srt").execute()
                content = transcript.decode("utf-8")
            else:
                content = description
        except HttpError:
            content = description  # Fallback
        return content
    except:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL or no access to content.")

# Endpoint: Learn/Explain from text
@app.post("/api/learn/text")
async def learn_text(text: str = Form(...)):
    prompt = f"Explain the following content in simple terms (max 200 words): {text}"
    response = model.generate_content(prompt)
    return {"result": response.text}

# Endpoint: Quiz from text
@app.post("/api/quiz/text")
async def quiz_text(text: str = Form(...)):
    prompt = f"Generate 3 multiple-choice questions based on this content in JSON format: {{questions: [{{question: str, options: [str], answer: str}}]}} {text}"
    response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
    try:
        quiz_data = json.loads(response.text)
        return {"result": json.dumps(quiz_data, indent=2)}
    except:
        return {"result": response.text}  # Fallback if JSON fails

# Endpoint: Notes from text
@app.post("/api/notes/text")
async def notes_text(text: str = Form(...)):
    prompt = f"Generate concise notes (bullet points, max 5) from this content: {text}"
    response = model.generate_content(prompt)
    return {"result": response.text}

# Endpoint: Process PDF (for any goal)
@app.post("/api/{goal}/pdf")
async def process_pdf(goal: str, file: UploadFile = File(...)):
    if goal not in ["learn", "quiz", "notes"]:
        raise HTTPException(status_code=400, detail="Invalid goal. Use 'learn', 'quiz', or 'notes'.")
    if not file.content_type == "application/pdf":
        raise HTTPException(status_code=400, detail="Upload a PDF file.")
    text = await extract_pdf_text(file)
    if goal == "learn":
        prompt = f"Explain the following content in simple terms (max 200 words): {text}"
    elif goal == "quiz":
        prompt = f"Generate 3 multiple-choice questions based on this content in JSON format: {{questions: [{{question: str, options: [str], answer: str}}]}} {text}"
    elif goal == "notes":
        prompt = f"Generate concise notes (bullet points, max 5) from this content: {text}"
    response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json" if goal == "quiz" else None})
    if goal == "quiz":
        try:
            quiz_data = json.loads(response.text)
            return {"result": json.dumps(quiz_data, indent=2)}
        except:
            return {"result": response.text}
    return {"result": response.text}

# Endpoint: Process Image (for any goal, multimodal)
@app.post("/api/{goal}/image")
async def process_image_endpoint(goal: str, file: UploadFile = File(...)):
    if goal not in ["learn", "quiz", "notes"]:
        raise HTTPException(status_code=400, detail="Invalid goal. Use 'learn', 'quiz', or 'notes'.")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload an image file.")
    img_data = process_image(file)
    if goal == "learn":
        prompt = "Explain the content of this image in simple terms (max 200 words)."
    elif goal == "quiz":
        prompt = "Generate 3 multiple-choice questions based on this image in JSON format: {questions: [{question: str, options: [str], answer: str}]}"
    elif goal == "notes":
        prompt = "Generate concise notes (bullet points, max 5) from this image."
    response = model.generate_content([prompt, {"mime_type": "image/png", "data": img_data}], generation_config={"response_mime_type": "application/json" if goal == "quiz" else None})
    if goal == "quiz":
        try:
            quiz_data = json.loads(response.text)
            return {"result": json.dumps(quiz_data, indent=2)}
        except:
            return {"result": response.text}
    return {"result": response.text}

# Endpoint: Process YouTube (for any goal)
@app.post("/api/{goal}/youtube")
async def process_youtube(goal: str, url: str = Form(...)):
    if goal not in ["learn", "quiz", "notes"]:
        raise HTTPException(status_code=400, detail="Invalid goal. Use 'learn', 'quiz', or 'notes'.")
    content = await get_youtube_content(url)
    if goal == "learn":
        prompt = f"Explain the following YouTube content in simple terms (max 200 words): {content}"
    elif goal == "quiz":
        prompt = f"Generate 3 multiple-choice questions based on this YouTube content in JSON format: {{questions: [{{question: str, options: [str], answer: str}}]}} {content}"
    elif goal == "notes":
        prompt = f"Generate concise notes (bullet points, max 5) from this YouTube content: {content}"
    response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json" if goal == "quiz" else None})
    if goal == "quiz":
        try:
            quiz_data = json.loads(response.text)
            return {"result": json.dumps(quiz_data, indent=2)}
        except:
            return {"result": response.text}
    return {"result": response.text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)