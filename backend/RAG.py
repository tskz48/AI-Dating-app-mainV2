from sentence_transformers import SentenceTransformer
import numpy as np
import json
import torch
from pathlib import Path
from Models.qwen_model import qwen_model, qwen_tokenizer

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

MEMORY_FILE = Path(__file__).resolve().parent / "data" / "memories.json"

def extract_memory(user_message, maya_response):
  memory_prompt = f"""
  Decide whether the following conversation contains information worth
  remembering for future conversations.

  Store only information that is:
  - likely to remain useful later
  - a stable preference, interest, relationship, important plan,
    established personal fact, or established Maya fact
  - not trivial conversational filler
  - not merely a temporary mood or activity

  Identify who the memory is about:
  - "user" if the fact describes the user
  - "maya" if the fact describes Maya
  - "both" if the fact genuinely describes both


  Classify the memory using exactly one of these types:
  - preference
  - interest
  - relationship
  - plan
  - fact


  If nothing should be remembered, respond exactly:
  NONE

  If something should be remembered, respond with valid JSON only in this format:

  {{
    "text": "short standalone memory",
    "subject": "user",
    "type": "preference"
}}

Do not include markdown.
Do not include ```json.
Do not include any explanation.


  Conversation:
  User: {user_message}
  Maya: {maya_response}

  Memory:
  """

  messages = [
          {
              "role": "user",
              "content": memory_prompt
          }
      ]

  inputs = qwen_tokenizer.apply_chat_template(
          messages,
          add_generation_prompt=True,
          tokenize=True,
          return_dict=True,
          return_tensors="pt"
      ).to(qwen_model.device)

  with torch.inference_mode():

          outputs = qwen_model.generate(
              **inputs,
              do_sample=False,
              max_new_tokens=80
          )

  memory_text = qwen_tokenizer.decode(
          outputs[0][inputs["input_ids"].shape[-1]:],
          skip_special_tokens=True
      ).strip()

  if memory_text.upper() == "NONE":
      return None
  
  try:
        memory = json.loads(memory_text)
  except json.JSONDecodeError:
        print("Invalid memory JSON:", memory_text)
        return None
  
  valid_subjects = {"user", "maya", "both"}
  valid_types = {
        "preference",
        "interest",
        "relationship",
        "plan",
        "fact"
    }

  if memory.get("subject") not in valid_subjects:
        return None

  if memory.get("type") not in valid_types:
        return None

  if not memory.get("text"):
        return None


  return memory




def load_memories():

    if not MEMORY_FILE.exists():
        return []

    with open(MEMORY_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_memories(memories):

    with open(MEMORY_FILE, "w", encoding="utf-8") as file:
        json.dump(
            memories,
            file,
            ensure_ascii=False,
            indent=2
        )


def store_memory(memory):

    memories = load_memories()


    memories.append(memory)

    save_memories(memories)


def retrieve_memories(query, top_k=3):

    memories = load_memories()

    if not memories:
        return []

    memory_texts = [
        memory["text"]
        for memory in memories
    ]

    query_embedding = embedding_model.encode(
        query,
        normalize_embeddings=True
    )

    memory_embeddings = embedding_model.encode(
        memory_texts,
        normalize_embeddings=True
    )

    similarities = memory_embeddings @ query_embedding

    best_indices = np.argsort(similarities)[::-1][:top_k]

    return [
        memories[index]
        for index in best_indices
    ]


def format_memories(memories):

    if not memories:
        return ""

    return "\n".join(
        f"- {memory['text']}"
        for memory in memories
    )















