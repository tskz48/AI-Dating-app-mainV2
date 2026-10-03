
import os
from transformers import AutoTokenizer, AutoModelForCausalLM
from huggingface_hub import login
import torch
from fastapi import FastAPI, HTTPException, Response, Request, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
import time
from dotenv import load_dotenv

device =  "mps" if torch.backends.mps.is_available() else "cpu"

load_dotenv()

hf_token = os.getenv("HF_TOKEN")  # Load from environment variable

if hf_token:
    login(token=hf_token)
else:
    raise ValueError("Hugging Face token is missing. Set it as an environment variable.")

from RAG import retrieve_memories, format_memories, extract_memory, store_memory
from Models.qwen_model import qwen_model, qwen_tokenizer


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

tokenizer = AutoTokenizer.from_pretrained("Models/mayaV2-gpt2")
model = AutoModelForCausalLM.from_pretrained("Models/mayaV2-gpt2", device_map="auto")

print(type(model))


def format_conversation(messages):
    conversation = ""

    for message in messages:
        if message["sender"] == "User":
            conversation += f"User: {message['text']}\n"
        else:
            conversation += f"Maya: {message['text']}\n"

    return conversation

@app.post('/maya')

async def get_maya_response(request:Request):

    data = await request.json()

    user_message = data["message"]

    history = data.get("history", [])

    older_history=history[:-10]
    recent_history=history[-10:]


    older_conversation=format_conversation(older_history)
    recent_conversation=format_conversation(recent_history)

    if older_history:
        summary_prompt = f"""
Summarize the following conversation between a user and Maya.

Preserve:
- important facts the user revealed about themselves
- personal information Maya established about herself
- preferences stated by either person
- important events or experiences discussed
- plans, promises, or unresolved topics
- information that may be useful in a future conversation

Do not invent any information.
Do not include unimportant conversational filler.

Conversation:

{older_conversation}

Summary:
"""
    
        summary_inputs = qwen_tokenizer(
        summary_prompt,
        return_tensors="pt"
    ).to(qwen_model.device)
        
        start = time.perf_counter()

        with torch.inference_mode():
            summary_outputs = qwen_model.generate(**summary_inputs, max_new_tokens=120, do_sample=False)

        print("Summary time:", time.perf_counter() - start)
        conversation_summary = qwen_tokenizer.decode(
        summary_outputs[0][summary_inputs["input_ids"].shape[-1]:],
    skip_special_tokens=True
).strip()
    
    else:
        conversation_summary=""
    
    start = time.perf_counter()
    retrieved_memories = retrieve_memories(
    user_message,
    top_k=3
)
    print("RAG retrieval time:", time.perf_counter() - start)

    relevant_memories = format_memories(
    retrieved_memories
)

    prompt = f"""
    
Relevant long-term memories:    
{relevant_memories}
    
Previous conversation summary:
{conversation_summary}

Recent conversation:
{recent_conversation}


User: {user_message}
Maya:"""


    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    start=time.perf_counter()
    outputs = model.generate(**inputs, temperature=0.7, top_p = 0.9,  max_new_tokens=80, repetition_penalty = 1.1, no_repeat_ngram_size = 3,do_sample=True)
    print("Maya generation time:", time.perf_counter() - start)
    response = tokenizer.decode(outputs[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
    if response.lower().startswith("[pause]"):

        response = response[7:].strip()

    if response and response[-1] not in ".!?":
        last_end = max(
        response.rfind("."),
        response.rfind("!"),
        response.rfind("?")
    )

        if last_end != -1:
            response = response[:last_end + 1]
    start = time.perf_counter()

    memory=extract_memory(user_message,response)

    print("Memory extraction time:", time.perf_counter() - start)


    print("EXTRACTED MEMORY:", repr(memory))

    if memory is not None:
        print("STORING MEMORY...")
        store_memory(memory)
    else:
        print("NO MEMORY TO STORE")

    return JSONResponse(content= {"reply": response})









 
# @app.get("/get-messages/")
# async def get_messages():
#     try:
#         connection = mysql.connector.connect(
#             host="localhost",
#             user="root",
#             password="Omsairam@123",
#             database="chatappv2"
#         )
#         cursor = connection.cursor(dictionary=True)
#         cursor.execute("SELECT * FROM messages")
#         messages = cursor.fetchall()

#         for msg in messages:
#             if isinstance(msg.get('created_at'), (datetime.datetime, datetime.date)):
#                 msg['timestamp'] = msg['created_at'].isoformat()
#                 del msg['created_at']


#         cursor.close()
#         connection.close()

#         return JSONResponse(content=messages)
#     except Exception as e:
#         print("Error fetching messages:", e)
#         raise HTTPException(status_code=500, detail="Error fetching messages")


# @app.delete("/delete-messages/")
# async def delete_messages():
#     try:
#         connection = mysql.connector.connect(
#             host="localhost",
#             user="root",
#             password="Omsairam@123",
#             database="chatappv2"
#         )
#         cursor = connection.cursor()
        
#         # Delete all rows from the messages table
#         cursor.execute("DELETE * FROM messages")
#         connection.commit()

#         cursor.close()
#         connection.close()

#         return JSONResponse(content={"message": "All messages deleted successfully."})
#     except Exception as e:
#         print("Error deleting messages:", e)
#         raise HTTPException(status_code=500, detail="Error deleting messages")