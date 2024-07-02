from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import json

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



def errorSpanHighlighter(translation, spans):
    final = translation

    zIndex = 0
    offset = 0

    color_mappings = {
        "Incorrect Subject": "#00A0F0",
        "Omission": "#59c00aba",
        "Incomplete Sentence": "#D3365A",
    }
    for error in spans["errors"]:
        # init
        start = error["start_index_translation"]
        end = error["end_index_translation"]
        color = color_mappings[error["error_type"]]

        # tags
        Ltag = "<span class='highlight' style='background-color: " + color + "; padding: " + str(zIndex) + "vh 0vw " + str(zIndex) + "vh 0vw; zIndex: " + str(zIndex) + "'>"
        Rtag = "</span>"
        
        # Algo
        # Must go left to right if we use this ordering of offset
        final = final[:start + offset] + Ltag + final[start + offset:end + offset] + Rtag + final[end + offset:]
        offset += len(Ltag) + len(Rtag)
        zIndex += 1

    return "<span>" + final + "</span>"



def error_span():
    with open('sample_error_span.json', encoding='utf-8') as f:
        data = json.load(f)

    return data