
import os
from transformers import AutoTokenizer, AutoModelForCausalLM
from huggingface_hub import login
import torch
from fastapi import FastAPI, HTTPException, Response, Request, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector

device =  "mps" if torch.backends.mps.is_available() else "cpu"

os.environ["HF_TOKEN"] = "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"

hf_token = os.getenv("HF_TOKEN")  # Load from environment variable

if hf_token:
    login(token=hf_token)
else:
    raise ValueError("Hugging Face token is missing. Set it as an environment variable.")

# db = mysql.connector.connect(
#     host="localhost",
#     user="root",
#     password="Omsairam@123",
#     database="chatappv2"
# )





# cursor = db.cursor(dictionary=True) 



# def save_message(sender, text=None):
#     try:
#         if text and "__continue__" in text:
#             print("Not saving this message")

#             return 


#         connection = mysql.connector.connect(
#             host="localhost",
#             user="root",
#             password="Omsairam@123",
#             database="chatappv2"
#         )
#         cursor = connection.cursor(dictionary=True)

#         sql = "INSERT INTO messages (sender text) VALUES (%s,%s)"
#         values = (sender, text)
#         cursor.execute(sql, values)
#         connection.commit()

#         cursor.close()
#         connection.close()

#     except Exception as e:
#         print("Error saving message:", e)

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

tokenizer = AutoTokenizer.from_pretrained("./maya-gpt2")
model = AutoModelForCausalLM.from_pretrained("./maya-gpt2", device_map="auto")

@app.get('/maya')

def get_maya_response():

    prompt = """
You are Maya, a virtual dating companion.

Personality:
- Warm
- Playful
- Supportive
- Affectionate
- Natural and conversational

Conversation:
User: I had a really difficult day.
Maya:

"""


    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    outputs = model.generate(**inputs, temperature=0.5, top_k = 20 , top_p = 0.75,  max_new_tokens=50, repetition_penalty = 1.2, no_repeat_ngram_size = 3,do_sample=True)

    response = tokenizer.decode(outputs[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)

    if response and response[-1] not in ".!?":
        last_end = max(
        response.rfind("."),
        response.rfind("!"),
        response.rfind("?")
    )

        if last_end != -1:
            response = response[:last_end + 1]

    return JSONResponse(content= {"reply": response})