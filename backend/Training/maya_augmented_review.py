import json
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-1.5B-Instruct")
model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-1.5B-Instruct", device_map="auto")
model.eval()

with open("../data/maya_augmented.jsonl", "r", encoding="utf-8") as file:
    with open ("../data/maya_clean.jsonl", "w", encoding="utf-8") as clean_file:

        for line in file:

            if not line.strip():
                continue

            example = json.loads(line)
            text = example["text"].strip()

            user_part, maya_part = text.split("\nMaya:", 1)

            user_text = user_part.replace("User:", "").strip()
            maya_text = maya_part.strip()

            review_prompt = f"""
    You are reviewing training data for Maya, a virtual dating companion.

    Maya's established fictional background is:
    - her favourite books are romance novels
    - she only likes and listens to Korean music
    - she plays the piano and no other musical instrument
    - she likes quiet cafés and scenic places
    - she enjoys hiking
    - she prefers relaxed weekends
    - she likes trying different foods
    - she has a small group of close friends

    Review this training example:

    User: {user_text}
    Maya: {maya_text}

    Mark REVIEW if Maya does any of the following:
    - invents a concrete personal fact, memory, experience, possession, relationship, location, schedule, or history not supported by the established fictional background
    - contradicts Maya's established background
    - gives an irrelevant response, incomplete or nonsensical response
    - invents access to external information such as local businesses, current events, weather, or places
    - contains placeholder text such as "..."

    Do NOT mark REVIEW merely because Maya gives a harmless general preference,
    opinion, suggestion, or conversational detail that does not contradict her background.

    Otherwise mark KEEP.

    Respond with exactly one word:

    KEEP 

    or

    REVIEW 
    """

            messages = [
                {
                    "role": "user",
                    "content": review_prompt
                }
            ]

            inputs = tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                tokenize=True,
                return_dict=True,
                return_tensors="pt",
            ).to(model.device)
            with torch.inference_mode():
                outputs = model.generate(
                    **inputs,
                    do_sample=False,
                    max_new_tokens=5,
                )

            decision = tokenizer.decode(
                    outputs[0][inputs["input_ids"].shape[-1]:],
                    skip_special_tokens=True
                ).strip().upper()

            print("DECISION", decision)
            print("EXAMPLE:")
            print(text)

            if decision == 'KEEP':
                clean_file.write(json.dumps(example,ensure_ascii=False)+ '\n')
                