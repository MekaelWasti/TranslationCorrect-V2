# imports
import json
import os
from dotenv import load_dotenv
load_dotenv()
import torch
from torch.cuda.amp import autocast, GradScaler
from io import StringIO

# Enable mixed precision
scaler = GradScaler()
torch.set_float32_matmul_precision('medium')

def translate(tokenizer, translation_model, source_text, source_lang, target_lang):

    # src Tokenizer
    tokenizer.src_lang = source_lang

    # Tokenize the input text
    inputs = tokenizer(source_text, return_tensors="pt").to('cuda')  # Ensure tensors are on GPU

    # Generate the translation according to target language specified
    with autocast():
        translated_tokens = translation_model.generate(
            **inputs, forced_bos_token_id=tokenizer.convert_tokens_to_ids(target_lang), max_length=100
        ).to("cuda")

    # Decode the translated tokens for translated text
    translated_text = tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)[0]

    # Clear unused memory
    manage_gpu_memory()

    return translated_text

def generate_error_spans(error_span_model, client, src, mt):

    data = [
        {
            "src": src,
            "mt": mt
        }
    ]

    error_span_model.eval()
    with torch.no_grad(): 
     error_span_model_output = error_span_model.predict(data, batch_size=1, gpus=1)

     print("SPANS GENERATED: ", error_span_model_output.metadata.error_spans)   

    response = client.chat.completions.create(
        model="gpt-4o-mini-2024-07-18",
        # model="gpt-3.5-turbo-16k",
        messages=[
            {
                "role": "system",
                "content": [
                    {
                        "text": "You are an expert in multilingual translations. Given MQM scores, corrected text, error spans, you will determine a classification for the error out of ONLY ONE OF the following. YOU CAN ONLY USE ERROR TYPE FROM THE FOLLOWING: Addition of Text ,Negation Errors ,Mask In-filling ,Named Entity (NE) Errors ,Number (NUM) Errors ,Hallucinations. \n\nThe output MUST be in JSON format and be correctly indicating the start and end corresponding indices The 'correct_text' attribute must identify the error in the 'translated_text' langauge, meaching they are both different from the original text language \n\n{\r\n    \"errorSpans\": [\r\n      {\r\n        \"original_text\": \"Учените\",\r\n        \"translated_text\": \"Students\",\r\n        \"correct_text\": \"Scientists\",\r\n        \"start_index_orig\": 0,\n\r\n        \"end_index_orig\": 7,\r\n        \"start_index_translation\": 0,\r\n        \"end_index_translation\": 7,\r\n        \"error_type\": \"Incorrect Subject\"\r\n      } \n    ]\r\n  }\r\n\r\n",
                        "type": "text"
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": str(data[0]) + "\n\n" + str(error_span_model_output.system_score) + " " + str(error_span_model_output.metadata.error_spans)
                    }
                ]
            },
        ],
        temperature=1,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    json_object = json.loads(response.choices[0].message.content[8:-4])
    print(json_object)

    highlights = errorSpanHighlighter(mt, json_object)

    # Clear unused memory
    manage_gpu_memory()

    return json_object, highlights

def errorSpanHighlighter(translation, spans):

    color_mappings = {
        "Addition of Text": "#FF5733",
        "Negation Errors": "#00A0F0",
        "Mask In-filling": "#59c00a",
        "Named Entity (NE) Errors": "#D3365A",
        "Number (NUM) Errors": "#8B4513",
        "Hallucinations": "#800080",
        "No Error": "#2f3472"
    }

    final = StringIO()
    final.write(translation)

    zIndex = 0
    offset = 0

    for error in spans["errorSpans"]:
        start = error["start_index_translation"]
        end = error["end_index_translation"]
        color = color_mappings.get(error["error_type"], "#2f3472")

        Ltag = f"<span class='highlight' id='highlight-{zIndex}' style='background-color: {color}; padding: {zIndex}vh 0vw {zIndex}vh 0vw; zIndex: {zIndex}'>"
        Rtag = "</span>"

        final.seek(start + offset)
        final.write(Ltag)
        final.seek(end + offset)
        final.write(Rtag)

        offset += len(Ltag) + len(Rtag)
        zIndex += 1

    return f"<span>{final.getvalue()}</span>"

def rephrase(client, previous_translations, original_source_text, source_language, target_language):

    response = client.chat.completions.create(
        model="gpt-4o-mini-2024-07-18",
        # model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": f"Please provide an alternative translation to and rephrase: \"{previous_translations}\"\r\n          The original text was {original_source_text}.\r\n          The source language is {source_language} and the target language is {target_language}. Give only the translation"
                    }
                ]
            }
        ],
        temperature=1,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    return response.choices[0].message.content

def edit_context(client, context, original_text, source_language, target_language, few_shot_examples):

    response = client.chat.completions.create(
        model="gpt-4o-mini-2024-07-18",
        # model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": f'''Translate "{original_text}" from the {source_language} language, into the {target_language} language
                      using the following context style: "{context}".
                      Here are some examples of the style being used: {few_shot_examples}
                      '''
                    }
                ]
            }
        ],
        temperature=1,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    return response.choices[0].message.content

def error_span():
    with open('sample_error_span.json', encoding='utf-8') as f:
        data = json.load(f)

    return data

def manage_gpu_memory():
    torch.cuda.empty_cache()  # Clear unused memory
    torch.cuda.synchronize()  # Ensure pending operations are complete
