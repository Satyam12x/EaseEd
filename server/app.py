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
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound
import re
from urllib.parse import urlparse, parse_qs

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
model = genai.GenerativeModel("gemini-2.5-flash")

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

# Helper: Get YouTube content (transcript or description) - Enhanced for full transcript
async def get_youtube_content(url: str):
    try:
        # Parse URL and extract video ID
        parsed_url = urlparse(url)
        if parsed_url.hostname in ['www.youtube.com', 'youtube.com']:
            query = parse_qs(parsed_url.query)
            video_id = query.get('v', [None])[0]
        elif parsed_url.hostname in ['youtu.be']:
            video_id = parsed_url.path.lstrip('/')
        else:
            match = re.search(r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([0-9A-Za-z_-]{11})', url)
            if match:
                video_id = match.group(1)
            else:
                raise ValueError("Invalid YouTube URL - no video ID found.")

        if not video_id or len(video_id) != 11:
            raise ValueError("Invalid YouTube URL - video ID is malformed.")

        # Get video title and description using YouTube API
        video_response = youtube_service.videos().list(part="snippet", id=video_id).execute()
        if not video_response["items"]:
            raise ValueError("Video not found or private.")
        title = video_response["items"][0]["snippet"]["title"]
        description = video_response["items"][0]["snippet"]["description"]
        
        # Try to get transcript using youtube-transcript-api
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            transcript = None
            # Try all available transcripts (prioritize English, then any language)
            available_languages = [t.language_code for t in transcript_list]
            for lang in ['en', 'en-US', 'en-GB'] + available_languages:
                try:
                    transcript = transcript_list.find_transcript([lang])
                    break
                except NoTranscriptFound:
                    continue
            if not transcript:
                transcript = transcript_list.find_generated_transcript(available_languages) or transcript_list.find_manually_created_transcript(available_languages)
            transcript_data = transcript.fetch()
            # Extract plain text from transcript (no timestamps)
            content = ' '.join(item['text'] for item in transcript_data).strip()
            if content:
                # Include title for context
                full_content = f"Video Title: {title}\n\nTranscript:\n{content}"
                return full_content[:5000]  # Increased limit for detailed notes
        except Exception as transcript_err:
            print(f"Transcript fetch failed (falling back to description): {transcript_err}")
        
        # Fallback to title + description
        fallback_content = f"Video Title: {title}\n\nDescription:\n{description}"
        if description or title:
            return fallback_content[:5000]
        else:
            raise ValueError("No description, title, or transcript available for this video.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching YouTube content: {str(e)}")

# Endpoint: Learn/Explain from text
@app.post("/api/learn/text")
async def learn_text(text: str = Form(...)):
    try:
        if not text.strip():
            raise HTTPException(status_code=400, detail="Text input cannot be empty.")
        prompt = f"Explain the following content in simple terms (max 200 words): {text}"
        response = model.generate_content(prompt)
        return {"result": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text: {str(e)}")

# Endpoint: Quiz from text
@app.post("/api/quiz/text")
async def quiz_text(text: str = Form(...)):
    try:
        prompt = f"Generate 3 multiple-choice questions based on this content in JSON format: {{questions: [{{question: str, options: [str], answer: str}}]}} {text}"
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        try:
            quiz_data = json.loads(response.text)
            return {"result": json.dumps(quiz_data, indent=2)}
        except:
            return {"result": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")

# Endpoint: Notes from text
@app.post("/api/notes/text")
async def notes_text(text: str = Form(...)):
    try:
        prompt = f"Generate concise notes (bullet points, max 5) from this content: {text}"
        response = model.generate_content(prompt)
        return {"result": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating notes: {str(e)}")

# Endpoint: Process PDF (for any goal)
@app.post("/api/{goal}/pdf")
async def process_pdf(goal: str, file: UploadFile = File(...)):
    if goal not in ["learn", "quiz", "notes"]:
        raise HTTPException(status_code=400, detail="Invalid goal. Use 'learn', 'quiz', or 'notes'.")
    if not file.content_type == "application/pdf":
        raise HTTPException(status_code=400, detail="Upload a PDF file.")
    try:
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

# Endpoint: Process Image (for any goal, multimodal)
@app.post("/api/{goal}/image")
async def process_image_endpoint(goal: str, file: UploadFile = File(...)):
    if goal not in ["learn", "quiz", "notes"]:
        raise HTTPException(status_code=400, detail="Invalid goal. Use 'learn', 'quiz', or 'notes'.")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload an image file.")
    try:
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

# Endpoint: Process YouTube (for any goal)
@app.post("/api/{goal}/youtube")
async def process_youtube(goal: str, url: str = Form(...)):
    if goal not in ["learn", "quiz", "notes"]:
        raise HTTPException(status_code=400, detail="Invalid goal. Use 'learn', 'quiz', or 'notes'.")
    try:
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing YouTube: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)