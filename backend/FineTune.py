from datasets import load_dataset

from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    DataCollatorForLanguageModeling,
    TrainingArguments,
    Trainer,
)

dataset = load_dataset(
    "json",
    data_files="maya_train.jsonl",
    split="train"
)

dataset = dataset.train_test_split(
    test_size=0.1,
    seed=42
)

model_name = "openai-community/gpt2"

tokenizer = AutoTokenizer.from_pretrained(model_name)

tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(model_name)


def tokenize(example):
    return tokenizer(
        example["text"],
        truncation=True,
        max_length=64,
    )


tokenized_dataset = dataset.map(
    tokenize,
    remove_columns=["text"]
)

data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer,
    mlm=False
)

training_args = TrainingArguments(
    output_dir="./maya-gpt2",

    num_train_epochs=3,

    per_device_train_batch_size=1,
    bf16=True,
    per_device_eval_batch_size=1,

    gradient_accumulation_steps=1,

    learning_rate=5e-5,

    eval_strategy="epoch",
    save_strategy="epoch",

    logging_steps=10,

    report_to="none",
)


trainer = Trainer(
    model=model,
    args=training_args,

    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["test"],

    data_collator=data_collator,
    processing_class=tokenizer,
)

trainer.train()


trainer.save_model("./maya-gpt2")

tokenizer.save_pretrained("./maya-gpt2")