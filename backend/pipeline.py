from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

# Load model and tokenizer
model_name = "facebook/nllb-200-distilled-600M"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

def translate(source_text, source_lang, target_lang):

    # Kinyarwanda Tokenizer
    tokenizer.src_lang = source_lang

    # Tokenize the input text
    inputs = tokenizer(source_text, return_tensors="pt")

    # Generate the translation according to target language specified
    translated_tokens = model.generate(
        **inputs, forced_bos_token_id=tokenizer.lang_code_to_id[target_lang], max_length=30
    )

    # Decode the translated tokens for translated text
    translated_text = tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)[0]

    return translated_text