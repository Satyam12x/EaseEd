# list_models.py
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    models = [m for m in genai.list_models()]
    print("Available models:")
    for model in models:
        print(f"- {model.name}: {model.supported_generation_methods}")
except Exception as e:
    print(f"Error listing models: {e}")