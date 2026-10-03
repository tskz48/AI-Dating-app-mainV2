from datasets import load_dataset

from transformers import (
    AutoTokenizer,
    AutoConfig,
    AutoModelForCausalLM,
    DataCollatorForLanguageModeling,
    TrainingArguments,
    Trainer,
    EarlyStoppingCallback,
    default_data_collator,
)

dataset = load_dataset(
    "json",
    data_files="../data/maya_augmented.jsonl",
    split="train"
)



train_temp = dataset.train_test_split(
    test_size=0.2,
    seed=42
)

val_test = train_temp["test"].train_test_split(
    test_size=0.5,
    seed=42
)


train_dataset = train_temp["train"]   
val_dataset = val_test["train"]       
test_dataset = val_test["test"] 



model_name = "openai-community/gpt2"


config = AutoConfig.from_pretrained(model_name)

config.resid_pdrop = 0.2
config.embd_pdrop = 0.2
config.attn_pdrop = 0.2

tokenizer = AutoTokenizer.from_pretrained(model_name)

tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(model_name, config=config)

model.config.pad_token_id = tokenizer.pad_token_id


for example in dataset:
    tokens = tokenizer(
        example["text"] + tokenizer.eos_token,
        add_special_tokens=False
    )["input_ids"]

    if len(tokens) > 128:
        print(len(tokens), example["text"])

# def tokenize(example):
#     text = example["text"]

#     # Separate the user/prompt part from Maya's answer
#     user_part, maya_part = text.split("\nMaya:", 1)

#     prompt = user_part + "\nMaya:"
#     response = maya_part

#     # Tokenize the prompt
#     prompt_ids = tokenizer(
#         prompt,
#         add_special_tokens=False
#     )["input_ids"]

#     # Tokenize Maya's response
#     response_ids = tokenizer(
#         response,
#         add_special_tokens=False
#     )["input_ids"]

#     # GPT-2 receives BOTH prompt and response
#     input_ids = (
#         prompt_ids
#         + response_ids
#         + [tokenizer.eos_token_id]
#     )

#     # But the loss ignores the prompt
#     labels = (
#         [-100] * len(prompt_ids)
#         + response_ids
#         + [tokenizer.eos_token_id]
#     )

#     input_ids = input_ids[:128]
#     labels = labels[:128]

#     attention_mask = [1] * len(input_ids)

#     padding_length = 128 - len(input_ids)

#     # Pad inputs
#     input_ids += [tokenizer.pad_token_id] * padding_length

#     # Ignore padding in attention
#     attention_mask += [0] * padding_length

#     # Ignore padding in loss
#     labels += [-100] * padding_length


#     return {
#         "input_ids": input_ids,
#         "attention_mask": attention_mask,
#         "labels": labels
#     }


# train_tokenized_dataset = train_dataset.map(
#     tokenize,
#     remove_columns=["text"]
# )

# val_tokenized_dataset = val_dataset.map(
#     tokenize,
#     remove_columns=["text"]
# )

# test_tokenized_dataset = test_dataset.map(
#     tokenize,
#     remove_columns=["text"]
# )


# data_collator=default_data_collator

# training_args = TrainingArguments(
#     output_dir="./maya-gpt2",

#     num_train_epochs=5,

#     per_device_train_batch_size=2,
#     bf16=True,
#     per_device_eval_batch_size=2,

#     gradient_accumulation_steps=1,

#     learning_rate=2e-5,
#     weight_decay = 0.10,
#     warmup_steps = 0.1,

#     eval_strategy="epoch",
#     save_strategy="no",

#     logging_strategy='epoch',

#     report_to="none",
#     dataloader_num_workers=2,
#     dataloader_persistent_workers=True,
# )


# trainer = Trainer(
#     model=model,
#     args=training_args,

#     train_dataset=train_tokenized_dataset,
#     eval_dataset=val_tokenized_dataset,

#     data_collator=data_collator,
#     processing_class=tokenizer,
# )

# print("Training device:", training_args.device)
# print("Model device:", next(trainer.model.parameters()).device)
# trainer.train()

# test_results = trainer.evaluate(eval_dataset=test_tokenized_dataset, metric_key_prefix = 'test')
# print(test_results)

# trainer.save_model("./mayaV2-gpt2")

# tokenizer.save_pretrained("./mayaV2-gpt2")