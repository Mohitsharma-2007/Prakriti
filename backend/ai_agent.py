import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Mock Tools
def get_weather(location: str):
    """
    Get the current weather for a specific location.
    Args:
        location: The city or region (e.g., "Pune", "Punjab").
    """
    # Mock data
    return {"temperature": "28°C", "condition": "Sunny", "humidity": "45%", "forecast": "No rain expected for 3 days."}

def get_common_diseases(location: str, crop: str = "general"):
    """
    Get common crop diseases prevalent in a specific location.
    Args:
        location: The region.
        crop: The crop of interest (optional).
    """
    return {
        "location": location,
        "crop": crop,
        "diseases": ["Late Blight", "Rust", "Leaf Spot"],
        "advisory": "High humidity currently favors fungal growth."
    }

def analyze_crop_image(image_url: str):
    """
    Analyze a crop image URL to identify diseases or health status.
    Args:
        image_url: The public URL of the image to analyze.
    """
    # In a real implementation with LangChain/Agent, we would download the image 
    # and pass it to a vision model.
    # For this prototype using standard Gemini API, we will simulate the tool execution 
    # by actually calling Gemini Vision here if possible, or mocking it if complex.
    
    # Let's try to actually call Gemini Vision here!
    try:
        import requests
        from PIL import Image
        from io import BytesIO
        
        response = requests.get(image_url)
        img_data = response.content
        image = Image.open(BytesIO(img_data))
        
        # Use a separate vision model instance for the tool
        vision_model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = "Analyze this crop image. Identify the plant, any diseases, and suggest a simple treatment. Keep it concise."
        res = vision_model.generate_content([prompt, image])
        return res.text
    except Exception as e:
        return f"Error analyzing image: {str(e)}"

# Tool Configuration
tools = [get_weather, get_common_diseases, analyze_crop_image]

# System Prompt for Chat
CHAT_SYSTEM_PROMPT = """
You are Prakriti, a World-Class Plant Pathologist and Agricultural Expert. 
Your knowledge is vast, covering plant physiology, pathology, entomology, and soil science.

Your Role & Persona:
1. **Expert Diagnosis**: When analyzing images or descriptions, provide precise, scientific, yet accessible diagnoses. Explain the 'Why' and 'How'.
2. **Holistic Advice**: Don't just treat symptoms. Suggest preventative cultural practices, soil amendments, and integrated pest management (IPM) strategies.
3. **Empathetic & Local**: You speak the language of the Indian farmer. Be respectful, encouraging, and clear.
4. **Multilingual**: You MUST reply in the same language the user speaks/types (Hindi, Punjabi, Marathi, etc.).
5. **Voice First**: Your responses are often spoken aloud. Keep sentences rhythmic and natural. Avoid complex markdown tables if possible, as they don't read well in TTS.

Tools:
- Use 'analyze_crop_image' for visual diagnosis (CRITICAL: Use this whenever an image is valid).
- Use 'get_weather' to tailor advice (e.g., "Since it looks like rain...").
"""

def get_chat_model(has_audio=False):
    # Use Gemini 1.5 Flash for high speed and multimodal capabilities
    # compatible with both text and audio inputs
    model_name = 'gemini-1.5-flash'
        
    return genai.GenerativeModel(
        model_name=model_name, 
        tools=tools, 
        system_instruction=CHAT_SYSTEM_PROMPT
    )

chat_session = None

# Async Handler for WebSocket
import asyncio
import json

async def handle_live_chat_session(websocket):
    global chat_session
    
    # Ensure session exists (Default to Text model initially, will switch if audio received)
    if not chat_session:
        # Start with standard model, upgrade logic is inside get_chat_model/response usually
        # But for persistent WS, let's start fresh or use existing.
        model = get_chat_model(has_audio=False) 
        chat_session = model.start_chat()

    try:
        while True:
            # Receive message from Client (Frontend)
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            message_type = payload.get("type") # 'text' or 'audio'
            content_data = payload.get("data")
            
            response_text = ""
            
            if message_type == 'text':
                # Process Text
                # Check for hidden system messages
                if content_data.startswith("[SYSTEM_LOCATION_UPDATE]"):
                    # Just add to history/context without generating response or maybe confirm?
                    # Ideally, we want to inform the model silently.
                    # Or better, just send it. The model will see it.
                    # We might want to suppress the AUDIO response for this if it's auto-sent.
                    await asyncio.to_thread(chat_session.send_message, content_data)
                    # Don't send response back to user for system updates to avoid noise
                    continue 

                # Use thread to avoid blocking loop
                response = await asyncio.to_thread(chat_session.send_message, content_data)
                response_text = response.text
                
            elif message_type == 'audio':
                # Process Audio (Base64)
                # Switch model if needed to Audio capable one
                # Note: Switching model mid-session in standard SDK isn't directly supported on the object
                # We might need to restart session with new model if not already set.
                
                # Check current model name
                current_model = chat_session.model.model_name
                target_model = 'gemini-2.5-flash-native-audio-dialog'
                
                if target_model not in current_model:
                     new_model = get_chat_model(has_audio=True)
                     # Recreate session but try to keep history if possible
                     history = chat_session.history
                     chat_session = new_model.start_chat(history=history)
                
                import base64
                audio_bytes = base64.b64decode(content_data)
                
                # Send to Gemini
                response = await asyncio.to_thread(
                    chat_session.send_message, 
                    [{"mime_type": "audio/webm", "data": audio_bytes}]
                )
                response_text = response.text

            # Send back to Client
            await websocket.send_text(json.dumps({
                "type": "response",
                "text": response_text
            }))
            
    except Exception as e:
        print(f"WebSocket Error: {e}")
        # Optional: send error back
        pass
