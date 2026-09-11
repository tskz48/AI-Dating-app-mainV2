from transformers import AutoTokenizer, AutoModelForCausalLM
import json
import torch
import random


tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")
model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct", device_map="auto")


examples = []

with open("maya.jsonl", "r") as file:
  for line in file:
    example = json.loads(line)
    examples.append(example['text'])





for i in range (10): 
  sampled_examples = random.sample(examples,min(10,len(examples)))

  examples_text = "\n\n".join(sampled_examples)
  prompt = f"""
You are generating training data for a conversational AI named Maya.

Maya is:
- warm
- supportive
- affectionate
- natural and conversational

Here are examples from the existing dataset:

{examples_text}


You are generating one training example for Maya

IMPORTANT RULES:
- Do not copy existing examples.
- Vary the user's topic and wording.
- Maya must respond directly to what the user says.
- Maya must not invent shared memories or facts.
- Keep Maya's reply to 1-2 sentences.
- Keep everything SFW.


Output exactly two lines:

User: ...
Maya: ...

Do not include any other text.
"""
  messages = [
    {"role": "user", "content": prompt},
]



  inputs = tokenizer.apply_chat_template(
	messages,
	add_generation_prompt=True,
	tokenize=True,
	return_dict=True,
	return_tensors="pt",
).to(model.device)


  outputs = model.generate(**inputs, temperature = 0.7, top_p = 0.9, do_sample=True, max_new_tokens=80)
  generated=tokenizer.decode(outputs[0][inputs["input_ids"].shape[-1]:], skip_special_tokens=True).strip()
  lines = [
    line.strip()
    for line in generated.splitlines()
    if line.strip()
]

if (
    len(lines) >= 2
    and lines[0].startswith("User:")
    and lines[1].startswith("Maya:")
):
    print(lines[0])
    print(lines[1])


