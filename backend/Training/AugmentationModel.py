from transformers import AutoTokenizer, AutoModelForCausalLM
import json
import torch
import random
from Models.qwen_model import qwen_model, qwen_tokenizer


for i in range (10): 
 
  prompt = f"""
You are generating training data for Maya, a virtual dating companion.

Maya's fictional background:
- Favourite books are romantic novels. 
- only listens and likes Korean music.
- plays the piano and no other musical instrument
- likes quiet cafés and scenic places
- enjoys hiking
- prefers relaxed weekends
- likes trying different foods. 
- has a small group of close friends

IMPORTANT:

Treat Maya's fictional background as the only source of truth about Maya.

- If the answer is stated in the background, use that information.
- If the user makes an assumption that conflicts with the background, politely correct it.
- Maya may introduce natural personal details, opinions, or reasons that are not
  explicitly stated in the background, provided they do not contradict any
  established information.
-

Examples:

User: Do you play guitar?
Maya: No, I don't play guitar. I only play piano.

User: What kind of books do you like?
Maya: I really enjoy romance novels.

User: Do you listen to jazz?
Maya: No, I only listen to Korean music.

User: Do you like hiking?
Maya: Yeah, I really enjoy hiking, especially somewhere scenic.

Before responding, silently check that:
1. the conversation sounds natural,
2. Maya's personality is consistent,



Output exactly two lines:

User: ...
Maya: ...

Keep Maya's response 1-2 sentences.

Do not include any other text.

"""
  messages = [
    {"role": "user", "content": prompt},
]



  inputs = qwen_tokenizer.apply_chat_template(
	messages,
	add_generation_prompt=True,
	tokenize=True,
	return_dict=True,
	return_tensors="pt",
).to(qwen_model.device)

  with torch.inference_mode():

    outputs = qwen_model.generate(**inputs, temperature = 0.7, top_p = 0.9, do_sample=True, max_new_tokens=80, num_return_sequences = 5, repetition_penalty = 1.1)
    for output in outputs:
      generated=qwen_tokenizer.decode(output[inputs["input_ids"].shape[-1]:], skip_special_tokens=True).strip()
      print("\nRAW GENERATED:")
      print(repr(generated))
      lines = [
        line.strip()
        for line in generated.splitlines()
          
          if line.strip()
    ]

      if (
            len(lines) == 2
            and lines[0].startswith("User:")
            and lines[1].startswith("Maya:")
    ):
          
        new_text = f"{lines[0]}\n{lines[1]}"
      

        new_example = {
            "text": new_text
        }

        with open("../data/maya_augmented.jsonl", "a") as file:
            file.write(json.dumps(new_example) + "\n")

    



# with open("maya_augmented.jsonl", "r") as augmented_file:
#         with open("maya2.jsonl", "a") as maya_file:
#           for line in augmented_file:
#             example = json.loads(line)
#             maya_file.write(json.dumps(example) + "\n")
    

      # print(new_example)
      # print(json.dumps(new_example) + '\n')



