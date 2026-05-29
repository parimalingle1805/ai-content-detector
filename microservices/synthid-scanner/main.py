from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import re
import os

app = FastAPI()

class ScanRequest(BaseModel):
    text: str

class ScanResponse(BaseModel):
    score: float
    isWatermarked: bool

# Load global patterns once
try:
    with open(os.path.join(os.path.dirname(__file__), "patterns.json"), "r") as f:
        PATTERNS = json.load(f)
except Exception as e:
    print(f"Warning: Failed to load patterns.json: {e}")
    PATTERNS = {"phrases": [], "regex_patterns": []}

COMPILED_REGEXES = []
for rp in PATTERNS.get("regex_patterns", []):
    try:
        COMPILED_REGEXES.append((re.compile(rp["pattern"], re.MULTILINE | re.IGNORECASE), rp["weight"]))
    except Exception as e:
        print(f"Regex error for {rp['pattern']}: {e}")

@app.post("/scan", response_model=ScanResponse)
def scan_text(request: ScanRequest):
    try:
        words = request.text.split()
        if len(words) < 15:
            return ScanResponse(score=0.0, isWatermarked=False)

        text_lower = request.text.lower()
        cumulative_weight = 0.0

        for phrase_obj in PATTERNS.get("phrases", []):
            if phrase_obj["text"].lower() in text_lower:
                cumulative_weight += phrase_obj["weight"]

        for compiled_rx, weight in COMPILED_REGEXES:
            if compiled_rx.search(request.text):
                cumulative_weight += weight

        if cumulative_weight >= 4.0:
            score = min(0.95, 0.5 + (cumulative_weight * 0.05))
            return ScanResponse(score=score, isWatermarked=True)
        else:
            return ScanResponse(score=0.15, isWatermarked=False)
            
    except Exception as e:
        print(f"SynthID processing error: {e}")
        return ScanResponse(score=0.85, isWatermarked=False)
