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


def fast_moderate_text(text: str) -> Optional[Dict[str, Any]]:
    """
    Approach 3: The 'Hybrid Waterfall' Path.
    Quickly identifies 'slam-dunk' safe or toxic cases to save cost and latency.
    """
    text_lower = text.lower().strip()
    print(f"DEBUG: Analyzing '{text_lower}' via Fast Pass...")
    
    # 1. Very safe/common greetings (Fast Pass: SAFE)
    safe_greetings = {"hi", "hello", "hey", "good morning", "good evening", "how are you"}
    if text_lower in safe_greetings or (len(text_lower) < 20 and not any(bad in text_lower for bad in ["bad", "hate", "stupid"])):
        return {
            "toxicity_score": 0.05,
            "misinformation_score": 0.0,
            "label": "safe",
            "reason": "Fast Pass: Highly likely safe greeting/short text",
            "is_fast_pass": True
        }

    # 2. Obvious toxic keywords (Fast Pass: TOXIC)
    # In production, this would be a comprehensive library like 'profanity-check'
    toxic_keywords = ["idiot", "stupid", "hate you", "loser", "trash"]
    for word in toxic_keywords:
        if word in text_lower:
            # We don't return 1.0 immediately to allow for possible nuances, 
            # but for this demo, we mark it as a 'Fast Pass' candidate.
            # However, if we are UNCERTAIN, we return None to escalate to Groq.
            if len(text_lower) < 50: # Only fast-pass short, obvious insults
                return {
                    "toxicity_score": 0.95,
                    "misinformation_score": 0.0,
                    "label": "toxic",
                    "reason": f"Fast Pass: Detected obvious toxic keyword '{word}'",
                    "is_fast_pass": True
                }
    
    return None # Escalate to Cloud API (Groq)


@app.post("/analyze/text")
async def analyze_text(request: TextAnalysisRequest):
    """
    Analyzes text for toxicity and safety using a Hybrid Waterfall approach.
    1. Local Fast Pass (Regex/Heuristic)
    2. Cloud LLM (Groq) for nuanced cases
    """
    # Step 1: Hybrid Waterfall - Fast Pass
    fast_result = fast_moderate_text(request.text)
    if fast_result:
        return fast_result

    # Step 2: Nuanced Analysis via Groq
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
            response_format={"type": "json_object"},
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
        prompt = """
        Analyze this image for NSFW content, violence, or sensitive material. 
        Return a JSON with:
        - nsfw_score: (0.0 to 1.0)
        - label: (SAFE, FLAGGED, or TOXIC)
        - reason: (concise explanation)
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": request.image_url}},
                    ],
                }
            ],
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            response_format={"type": "json_object"},
        )

        result = json.loads(chat_completion.choices[0].message.content)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
