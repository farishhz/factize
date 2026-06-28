import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from .services.ai_service import analyze_chat_stream
from .services.ai_detector_service import analyze_hybrid_image

app = FastAPI(title="si-FAKTA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Attachment(BaseModel):
    name: str
    type: str
    data: Optional[str] = None # Base64 string

class Message(BaseModel):
    role: str
    content: str
    attachments: Optional[List[Attachment]] = None

class ChatRequest(BaseModel):
    messages: List[Message]
    model: Optional[str] = 'gemini-2.5-flash'

@app.get("/")
def read_root():
    return {"message": "Welcome to si-FAKTA API"}

class VerifyKeyRequest(BaseModel):
    key: str

class VerifyTokenRequest(BaseModel):
    token: str

@app.post("/api/verify-gemini")
async def verify_gemini(request: VerifyKeyRequest):
    try:
        from google import genai
        # Uji coba sederhana untuk memvalidasi Kunci API Gemini
        client_test = genai.Client(api_key=request.key)
        client_test.models.list()
        return {"valid": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/verify-hf")
async def verify_hf(request: VerifyTokenRequest):
    try:
        import httpx
        # Uji coba autentikasi token ke API Hugging Face
        headers = {"Authorization": f"Bearer {request.token}"}
        async with httpx.AsyncClient(timeout=10.0) as client_http:
            res = await client_http.get("https://huggingface.co/api/whoami-v2", headers=headers)
            if res.status_code == 200:
                return {"valid": True}
            else:
                raise Exception("Token tidak valid atau tidak memiliki izin akses.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/chat")
async def chat(request: ChatRequest, x_gemini_api_key: Optional[str] = Header(None)):
    print(f"Menerima permintaan chat stream dengan model {request.model}.")
    return StreamingResponse(
        analyze_chat_stream(request.messages, request.model, x_gemini_api_key),
        media_type="text/event-stream"
    )

@app.post("/api/scan-image")
async def scan_image(file: UploadFile = File(...), x_hf_token: Optional[str] = Header(None)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File yang diunggah bukan gambar.")
    
    try:
        contents = await file.read()
        result = analyze_hybrid_image(contents, x_hf_token)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
