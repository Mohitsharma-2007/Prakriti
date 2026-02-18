import os
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials missing in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

# CORS logic
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DiagnosisResponse(BaseModel):
    disease_name: str
    confidence: float
    treatment: str
    prevention: str
    image_url: str

@app.get("/")
def read_root():
    return {"message": "Prakriti API is running"}

@app.post("/diagnose", response_model=DiagnosisResponse)
async def diagnose(file: UploadFile = File(...)):
    try:
        # 1. Upload to Supabase Storage
        file_content = await file.read()
        file_ext = file.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"
        bucket_name = "crop-images"

        # Upload
        res = supabase.storage.from_(bucket_name).upload(
            file_name,
            file_content,
            {"content-type": file.content_type}
        )
        
        # Get Public URL
        public_url = supabase.storage.from_(bucket_name).get_public_url(file_name)

        # 2. Call Gemini API
        import google.generativeai as genai
        import json
        from system_prompt import PRAKRITI_SYSTEM_PROMPT

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Prepare the prompt
        response = model.generate_content([
            PRAKRITI_SYSTEM_PROMPT,
            {
                "mime_type": file.content_type,
                "data": file_content
            }
        ])
        
        # Parse JSON response
        try:
            # Clean response text if it contains markdown
            text = response.text.replace("```json", "").replace("```", "").strip()
            ai_data = json.loads(text)
            
            disease_name = ai_data.get("disease_name", "Unknown Issue")
            confidence = ai_data.get("confidence", 0.0)
            treatment = ai_data.get("treatment", "Consult a local expert.")
            prevention = ai_data.get("prevention", "Practice good crop hygiene.")
            
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            disease_name = "Analysis Error"
            confidence = 0.0
            treatment = "Could not parse AI response. Please try again."
            prevention = "N/A"
            print(f"Failed to parse JSON: {response.text}")

        # 3. Save to Database
        data = {
            "image_url": public_url,
            "disease_name": disease_name,
            "confidence": confidence,
            "treatment": treatment,
            "prevention": prevention
        }
        
        db_res = supabase.table("diagnoses").insert(data).execute()

        return DiagnosisResponse(
            disease_name=disease_name,
            confidence=confidence,
            treatment=treatment,
            prevention=prevention,
            image_url=public_url
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ... existing code ...

# AI Chat Endpoint
from pydantic import BaseModel
# ChatRequest removed as we use WebSocket
# @app.post("/chat/ai") removed


from fastapi import WebSocket
@app.websocket("/ws/live-chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    from ai_agent import handle_live_chat_session
    await handle_live_chat_session(websocket)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
