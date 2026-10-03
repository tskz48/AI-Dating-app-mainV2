
from transformers import AutoTokenizer, AutoModelForCausalLM

QWEN_MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"

qwen_tokenizer = AutoTokenizer.from_pretrained(QWEN_MODEL_NAME)

qwen_model = AutoModelForCausalLM.from_pretrained(
    QWEN_MODEL_NAME,
    device_map="auto"
)

qwen_model.eval()