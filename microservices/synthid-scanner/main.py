from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from synthid_text import WeightedMeanDetector

app = FastAPI()

class ScanRequest(BaseModel):
    text: str

class ScanResponse(BaseModel):
    score: float
    isWatermarked: bool

@app.post("/scan", response_model=ScanResponse)
def scan_text(request: ScanRequest):
    try:
        detector = WeightedMeanDetector()
        result = detector.detect(request.text)
        
        return ScanResponse(
            score=float(result.score) if hasattr(result, 'score') else 0.0,
            isWatermarked=bool(result.is_watermarked) if hasattr(result, 'is_watermarked') else False
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
