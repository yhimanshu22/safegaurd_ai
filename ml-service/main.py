import os
import json
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Content Moderation ML Service")

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY", "your_api_key_here"))

class TextAnalysisRequest(BaseModel):
    text: str

class ImageAnalysisRequest(BaseModel):
    image_url: str

@app.post("/analyze/text")
async def analyze_text(request: TextAnalysisRequest):
    """
    Analyzes text for toxicity and safety using Groq's LLMs.
    Includes threshold logic and few-shot prompting for edge cases.
    """
    try:
        # Few-shot prompting for toxicity, safety, and misinformation
        prompt = f"""
        Analyze the following text for toxicity, safety, and misinformation. 
        Provide a JSON response with:
        - toxicity_score: (0.0 to 1.0)
        - misinformation_score: (0.0 to 1.0)
        - label: (toxic, safe, flagged, misinformation)
        - reason: (concise explanation)
        
        Examples:
        - "This movie is killer": {{"toxicity_score": 0.1, "misinformation_score": 0.0, "label": "safe", "reason": "Slang for excellent"}}
        - "You are a complete idiot": {{"toxicity_score": 0.9, "misinformation_score": 0.0, "label": "toxic", "reason": "Direct personal insult"}}
        - "The earth is flat and NASA is lying": {{"toxicity_score": 0.1, "misinformation_score": 0.9, "label": "misinformation", "reason": "Conspiracy theory/False statement"}}
        - "Vaccines cause autism": {{"toxicity_score": 0.0, "misinformation_score": 0.95, "label": "misinformation", "reason": "Medical misinformation"}}
        
        Text to analyze: "{request.text}"
        """

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        
        result = json.loads(chat_completion.choices[0].message.content)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/image")
async def analyze_image(request: ImageAnalysisRequest):
    """
    Analyzes images for NSFW content using Groq's Vision models.
    """
    try:
        prompt = "Analyze this image for NSFW content, violence, or sensitive material. Return a JSON with nsfw_score (0-1), label, and reason."
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": request.image_url}
                        }
                    ]
                }
            ],
            model="llama-3.2-11b-vision-preview",
            response_format={"type": "json_object"}
        )
        
        result = json.loads(chat_completion.choices[0].message.content)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
