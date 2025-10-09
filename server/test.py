# test.py
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")  # Stable, supports generateContent
try:
    response = model.generate_content("Explain Photosynthesis in 50 words.")
    print("Success! Response:", response.text)
except Exception as e:
    print(f"Error: {e}")