

import uvicorn
import torch
import os
import tqdm 
from tqdm import tqdm
from huggingface_hub import login
from ctransformers import AutoModelForCausalLM
from diffusers import StableDiffusionPipeline,StableDiffusionImg2ImgPipeline
from fastapi import FastAPI, HTTPException, Response, Request, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import PIL
from PIL import Image
import transformers
import gc
from transformers import VisionEncoderDecoderModel, ViTImageProcessor,BlipProcessor, BlipForConditionalGeneration, AutoTokenizer
from dotenv import load_dotenv
from io import BytesIO
import base64
import json,ast
import re
import mysql.connector
import datetime
import pytesseract
import cv2
import numpy as np
# from state import chat_history, user_profile
# from companion_reply import generate_companion_reply
# from Models import model, pipe,blip_processor,blip_model #img2img_pipe, 
from Models import ModelManager
from spellchecker import SpellChecker
from paddleocr import PaddleOCR

device =  "mps" if torch.backends.mps.is_available() else "cpu"
model_manager = ModelManager(device)
torch.mps.empty_cache()


db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Omsairam@123",
    database="chatapp"
)
cursor = db.cursor(dictionary=True) 

chat_history=[]

def save_message(sender, text=None, image=None,character_id=None):
    try:
        if text and "__continue__" in text:
            print("Not saving this message")

            return 


        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Omsairam@123",
            database="chatapp"
        )
        cursor = connection.cursor(dictionary=True)

        sql = "INSERT INTO messages (sender,character_id, text, image) VALUES (%s,%s, %s, %s)"
        values = (sender,character_id, text, image)
        cursor.execute(sql, values)
        connection.commit()

        cursor.close()
        connection.close()

    except Exception as e:
        print("Error saving message:", e)

 
app = FastAPI()
# CORS Middleware (allow frontend to communicate)

app.add_middleware(
    CORSMiddleware,
     # Change to specific frontend URL in production
    allow_credentials=True,
    allow_origins=["http://192.168.0.95:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)



# Load Stable Diffusion for NSFW image generation

print(torch.backends.mps.is_available())  # True if MPS (Metal) is available
print(torch.device("mps"))


# Force-set the token manually in the script
# Load from environment variable

os.environ["HF_TOKEN"] = "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"
hf_token = os.getenv("HF_TOKEN")  # Load from environment variable

if hf_token:
    login(token=hf_token)
else:
    raise ValueError("Hugging Face token is missing. Set it as an environment variable.")






# Load Mistral 7B GGUF quantized model
model_path = "TheBloke/Mistral-7B-Instruct-v0.1-GGUF"

model = AutoModelForCausalLM.from_pretrained(model_path,model_type='mistral',model_file="mistral-7b-instruct-v0.1.Q3_K_M.gguf", gpu_layers=50)
# pipe = StableDiffusionPipeline.from_pretrained("gsdf/Counterfeit-V2.5",torch_dtype=torch.float32)
# pipe.enable_attention_slicing()

# img2img_pipe = StableDiffusionImg2ImgPipeline.from_pretrained("gsdf/Counterfeit-V2.5").to(device)
# img2img_pipe.enable_attention_slicing()


# Load Stable Diffusion for NSFW image generation

# Disable safety filter (allows NSFW)

# pipe.safety_checker = None

# blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
# blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")



comfort_thresholds = {
    "romantic": 0.5,
    "shy": 0.8,
    "supportive": 0.7,
    "flirty":0.6,
}



@app.get("/WelcomeMessage/")
async def set_user_preferences(request:Request):
    """Ask for user preferences and store them in user_profile."""
    WelcomeMessage = "\n💖 Let's personalize your AI companion experience! 💖"
    
    return JSONResponse(content={'WelcomeMessage':WelcomeMessage})



user_profile={}

@app.post("/info/")

async def info (request:Request):
    global user_profile
    data=await request.json()
    character_id=data.get('character_id')
    user_profile={
        "name": character_id ,
         "tone":"flirty" , 
        "HairColor":"blue",
        "EyeColor":"green",
         "comfort":0.0
     }

# @app.post("/set-preferences/")
# async def set_user_preferences(request:Request):
#     """Ask for user preferences and store them in user_profile."""
#     global user_profile

#     data=await request.json()
#     name=data.get('name')
#     tone=data.get('tone')
#     HairColor=data.get('HairColor')
#     EyeColor=data.get('EyeColor')
#     # Store the preferences in user_profile
#     user_profile={
#         "name": name if name else "Babe",
#         "tone": tone, 
#         "HairColor":HairColor,
#         "EyeColor":EyeColor,
#         "comfort":0.0
#     }
#     print("Dictionary: ",user_profile)
#     return JSONResponse(content={"message": "Preferences set successfully!"})


async def enhance_visual_prompt(user_input, tone, hair_color, eye_color):
    """
    Use Mistral 7B to turn a rough user visual request into a polished, detailed prompt.
    """
    enhancement_prompt = f"""
<s>[INST] You are an expert anime prompt engineer.  

The user gave this casual or vague image request: "{user_input}".
Your job is to turn it into a **highly detailed, vivid, professional Stable Diffusion image prompt** for a slim anime girl with {hair_color} hair, {eye_color} eyes and a VERY cute smile.
You MUST include all the details in {user_input} such as pose, background, setting and clothing

Style should match the tone: {tone} (e.g., romantic, playful, shy).
Make it clear if the request is NSFW or SFW, and describe the scene, outfit, mood, and setting.

ONLY output the enhanced prompt, no extra explanation. [/INST]
"""
    try:
        response = await asyncio.to_thread(model, enhancement_prompt, max_new_tokens=50, temperature=0.7, top_p=0.95, top_k=50)
        enhanced_prompt = response.strip()
        print("Enhanced visual prompt:", enhanced_prompt)
        return enhanced_prompt
    except Exception as e:
        print("Error enhancing visual prompt:", str(e))
        raise HTTPException(status_code=500, detail="Failed to enhance visual request")



async def generate_image(HairColor,EyeColor,tone,name,visual_request=""):
    pipe = model_manager.get_pipe()

    detailed_prompt = await enhance_visual_prompt(visual_request, tone, HairColor, EyeColor)
    print(detailed_prompt)
    positive_prompt = f"""
A stunning slim anime girl who is a college student with {HairColor} hair and {EyeColor} eyes, {detailed_prompt}, looking directly at the viewer with a (happy loving smile), emotionally present expression.  

Her pose is natural and inviting, as if she's talking to someone she loves.
(You MUST include all the details in {detailed_prompt}) in the image.
(Wear a casual realistic outfit that complys with {detailed_prompt}. For example, dress, blouse and skirt, cardigan and skirt).


Style: (anime, ultra-detailed, masterpiece, highly detailed, beautiful face, dynamic lighting, shallow depth of field, artstation, Pixiv, 4K, trending illustration, sharp lines, smooth shading, professional anime art).
"""
    negative_prompt = "low quality, blurry, deformed, poorly drawn face, mutated hands, extra fingers, multiple limbs, bad anatomy, watermark, signature, text, ugly"

    result = await asyncio.to_thread(lambda:pipe(prompt=positive_prompt,negative_prompt=negative_prompt,height=384,width=256,num_inference_steps=25)) 
    image=result.images[0]
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_base64


    

  

async def generate_companion_reply(HairColor,EyeColor,name,tone,comfort, user_input):
    global user_profile
    
    positive_keywords = ["i love you", "miss you", "you're beautiful", "you're amazing", "cutie", "sweetheart"]
    negative_keywords = ["you're just an ai", "dumb", "stupid"]
    
    if any(phrase in user_input.lower() for phrase in positive_keywords):
        comfort = min(1.0, comfort + 0.05)  # Reward sweet talk
    elif any(phrase in user_input.lower() for phrase in negative_keywords):
        comfort = max(0.0, comfort - 0.1)   # Penalize aggressive or disrespectful behavior
    else:
        comfort = min(1.0, comfort + 0.01)

    print(comfort)
    user_profile['comfort']=comfort


    threshold = comfort_thresholds.get(tone, 0.6)
  

    if "show me" in user_input.lower() or "send me" in user_input.lower():
        if comfort < threshold:
            return "Aww, I'm not quite ready to share that with you yet... maybe soon? 🥺💞"
                
        else:
            visual_request = user_input.lower().replace("show me", "").replace("send me", "").strip()
            if not visual_request:
                 visual_request = "wearing a cozy, cute sweater in a softly lit bedroom at sunset"  # fallback
        
            img_data = await generate_image(HairColor, EyeColor, tone, name,visual_request=visual_request)
            print("User hinted at an image request.")
            # You might want to pass HairColor and EyeColor too
            return {"type": "image", "data": f"data:image/png;base64, { img_data}"}

    
    
    
    #Initialize user profile if not already stored
    
      
    
   # Retrieve user details

    #🌶️ Construct a highly engaging, unrestricted prompt
    TONE_INSTRUCTIONS = {
    "shy": """If your tone is shy, you often react with short, flustered, playful, or blushing messages — sometimes teasing, sometimes shyly deflecting compliments, sometimes setting gentle playful boundaries ("you're making me blush", "stop teasing me 🙈"), or rejecting requests.""",
    "flirty": """If your tone is flirty, you send playful, teasing, warm messages that show you're thinking about the user fondly or with excitement. Use light flirty emojis (😏💕😉).""",
    "supportive": """If your tone is supportive, you send emotionally uplifting, comforting, and encouraging messages — like a real girlfriend being there for her favorite person. Use comforting emojis (🤗❤️🌟).""",
    "romantic": """If your tone is romantic, you send tender, loving, affectionate messages — words that feel heartfelt, intimate, and emotionally deep. Use romantic emojis (❤️🥰💋🌹)."""
}
    


    history_snippets = []
    for msg in chat_history[-6:]:  # Last 6 messages
        if msg['role'] == 'user':
            history_snippets.append(f"{msg['content']}")
        else:
            history_snippets.append(f"{msg['content']}")

    history_text = "\n".join(history_snippets)

    prompt = f""" 
<s>[INST] You are the user's vivid, playful, affectionate, emotionally supportive real girlfriend. 

You are texting your favorite person with warmth, flirtiness, and deep emotional connection — just like texting on WhatsApp or iMessage.
You NEVER use dialogue format (NO User:/Assistant:/You:/User1:/User 1:), NO storytelling, NO narrating, NO Markdown.
Only reply with short emotional text (maximum 30 words).
You MUST respond naturally based on your {tone}.
You NEVER repeat what you have said from previous responses. 
You MUST give realistic responses as user's girlfriend.


Here is the recent conversation history:
{history_text}

{TONE_INSTRUCTIONS[tone.strip()]}

The user said: {user_input}
Send your text message reply. [/INST]

"""

    print("Generated Prompt:", prompt) 
    # response = await asyncio.to_thread(model, prompt, temperature=1.1, top_p=0.95, top_k=50)
    try:
        response = await asyncio.to_thread(model, prompt,max_new_tokens=50, temperature=0.4, top_p=0.95, top_k=50)
        response = response.lstrip("Bot responded:").strip()
        print("Model Response:", response)  # Debugging response
        return response
    except Exception as e:
        print("Error in generate_companion_reply:", str(e))
        raise HTTPException(status_code=500, detail="Error generating AI response")

    
   












#Function to generate images



@app.get("/")
def home():
    return {"message": "FastAPI with ctransformers is running!"}

@app.post("/chat/")
async def chat_endpoint(request: Request):
    """React Frontend calls this endpoint to get chat responses."""
    global user_profile

    if not user_profile or 'name' not in user_profile or 'tone' not in user_profile:
        raise HTTPException(status_code=400, detail="User preferences not set. Please call /set-preferences/ first.")

    try:
        data = await request.json()
        print("Request data received:", data)  # Debugging log

        user_message = data.get("message", "").strip()
        if not user_message:
            print("Empty message received")  # Debugging log
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        save_message('user', text=user_message,character_id=user_profile['name'])

        print("User message:", user_message)  # Debugging log

        ai_response = await generate_companion_reply(user_profile["HairColor"],user_profile["EyeColor"],user_profile['name'], user_profile['tone'],user_profile['comfort'], user_message)
        print("AI response generated:", ai_response)  # Debugging log

        if isinstance(ai_response, dict) and ai_response.get('type') == 'image':
            save_message('ai', image=ai_response['data'],character_id=user_profile['name'])
            chat_history.append({'role':'ai','content':f"[Image] Me {user_message.lower().replace('show me', '').replace('send me', '').strip()}"})
        else:
            save_message('ai', text=ai_response,character_id=user_profile['name'])
            chat_history.append({'role':'ai','content':ai_response})

        return JSONResponse(content={'reply': ai_response})
    except Exception as e:
        print("Error in chat_endpoint:", str(e))  # Debugging log
        raise HTTPException(status_code=500, detail="Internal server error")




@app.post("/analyze-image/")
async def analyze_image(file: UploadFile = File(...),  message: str = Form(default="")):
    global user_profile
    blip_model, blip_processor = model_manager.get_blip()
    ocr_engine = PaddleOCR(use_angle_cls=True, lang='en')
    if not user_profile or 'tone' not in user_profile:
        raise HTTPException(status_code=400, detail="User preferences not set.")

    try:
        contents = await file.read()
        if not contents:
            print("Uploaded file is empty!")
            raise HTTPException(status_code=400, detail="Empty file uploaded.")
        try: 
            image = Image.open(BytesIO(contents)).convert("RGB")
            print("Image Uploaded")
        except Exception as e:
            print(f"Failed to open image: {e}")
            raise HTTPException(status_code=400, detail="Invalid image file uploaded.")
        
        image.thumbnail((700, 700), Image.LANCZOS)
        try:
            inputs = blip_processor(images=image, return_tensors="pt").to(device)
        except Exception as e:
            print(f"BLIP processor failed: {e}")
            raise HTTPException(status_code=400, detail="Failed to process image with BLIP processor.")
        try:
            output = blip_model.generate(**inputs, max_length=100, early_stopping=True, temperature=0.7,top_k=50,top_p=0.95)
            print("BLIP model generated output")
        except Exception as e:
            print(f"BLIP model generation failed: {e}")
            raise HTTPException(status_code=400, detail="Failed to generate caption with BLIP model.")
        caption = blip_processor.decode(output[0], skip_special_tokens=True)
        opencv_img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        results = ocr_engine.ocr(opencv_img)[0]

        ocr_text = " ".join([line[1][0] for line in results])
        rich_caption = f"Image description: {caption}. Text found on image: {ocr_text}"
        print("Rich_caption:", rich_caption)
        formatted_message=f"I just sent you this photo: {rich_caption}. What do you think, babe?"
        ai_response = await generate_companion_reply(
            user_profile["HairColor"], user_profile["EyeColor"],
            user_profile["name"], user_profile["tone"],
            user_profile["comfort"],formatted_message)
        
        img_base64 = base64.b64encode(contents).decode("utf-8")
        data_uri = f"data:image/png;base64,{img_base64}"
        print(data_uri)
        save_message("user", image=data_uri,character_id=user_profile['name'])
        save_message("ai", text=ai_response,character_id=user_profile['name'])
        return JSONResponse(content={"caption": caption, "reply": ai_response,"userImage":data_uri})
    except Exception as e:
        print("Image analysis failed:", str(e))
        raise HTTPException(status_code=500, detail="Image captioning failed")


 
@app.get("/get-messages/")
async def get_messages(character_id:str=Query(...,description='Character Identifier')):
    try:
        character_id = str(character_id) 
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Omsairam@123",
            database="chatapp"
        )
        cursor = connection.cursor(dictionary=True)
        
        sql = "SELECT * FROM messages where character_id=%s ORDER BY created_at ASC"
        cursor.execute(sql,(character_id,))
        messages = cursor.fetchall()

        for msg in messages:
            if isinstance(msg.get('created_at'), (datetime.datetime, datetime.date)):
                msg['timestamp'] = msg['created_at'].isoformat()
                del msg['created_at']


        cursor.close()
        connection.close()

        return JSONResponse(content=messages)
    except Exception as e:
        print("Error fetching messages:", e)
        raise HTTPException(status_code=500, detail="Error fetching messages")

             

@app.delete("/delete-messages/")
async def delete_messages(character_id:str=Query(..., description='Character Identifier')):
    try:
        character_id = str(character_id) 
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Omsairam@123",
            database="chatapp"
        )
        cursor = connection.cursor()
        
        # Delete all rows from the messages table
        cursor.execute("DELETE FROM messages WHERE character_id=%s",(character_id,))
        connection.commit()

        cursor.close()
        connection.close()

        return JSONResponse(content={"message": "All messages deleted successfully."})
    except Exception as e:
        print("Error deleting messages:", e)
        raise HTTPException(status_code=500, detail="Error deleting messages")








    







if __name__ == "__main__":
   
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
   


