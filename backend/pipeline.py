# imports
import json
import os
from dotenv import load_dotenv
load_dotenv()
import torch
torch.set_float32_matmul_precision('medium')



def translate(tokenizer, translation_model, source_text, source_lang, target_lang):

    # src Tokenizer
    tokenizer.src_lang = source_lang

    # Tokenize the input text
    inputs = tokenizer(source_text, return_tensors="pt")

    # Generate the translation according to target language specified
    translated_tokens = translation_model.generate(
        **inputs, forced_bos_token_id=tokenizer.lang_code_to_id[target_lang], max_length=30
    )

    # Decode the translated tokens for translated text
    translated_text = tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)[0]

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


  # error_span_model_output = """
        # 'text': '小型印刷晶片', 
        # 'confidence': 0.3709107041358948, 
        # 'severity': 'minor', 
        # 'start': 31, 
        # 'end': 37
        #  }"""



  # GPT Call for error type classification and spans formatting
  response = client.chat.completions.create(
  model="gpt-3.5-turbo-16k",
  messages=[
    {
      "role": "system",
      "content": [
        {
          "text": "You are an expert in multilingual translations. Given MQM scores, corrected text, error spans, you will determine a classification for the error out of ONLY ONE OF the following. YOU CAN ONLY USE ERROR TYPE FROM THE FOLLOWING: Addition of Text ,Negation Errors ,Mask In-filling ,Named Entity (NE) Errors ,Number (NUM) Errors ,Hallucinations. \n\nThen turn that into this format by correctly indicating the start and end corresponding indices\n\n{\r\n    \"errors\": [\r\n      {\r\n        \"original_text\": \"Учените\",\r\n        \"translated_text\": \"Students\",\r\n        \"correct_text\": \"Scientists\",\r\n        \"start_index_orig\": 0,\n\r\n        \"end_index_orig\": 7,\r\n        \"start_index_translation\": 0,\r\n        \"end_index_translation\": 7,\r\n        \"error_type\": \"Incorrect Subject\"\r\n      } \n    ]\r\n  }\r\n\r\n",
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
          # "text": str(data[0]) + "\n\n" + str(error_span_model_output) + " " + str(error_span_model_output)
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

  json_object = json.loads(response.choices[0].message.content)

  # with open('response.json', 'w') as f:
      # json.dump(json_object, f, indent=4)

  highlights = errorSpanHighlighter(mt, json_object)

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
    
    final = translation

    zIndex = 0
    offset = 0

    for error in spans["errors"]:
        # init
        start = error["start_index_translation"]
        end = error["end_index_translation"]
        if error["error_type"] in color_mappings: 
          color = color_mappings[error["error_type"]]
        else:
           color = "#FFFFFF"

        # tags
        Ltag = "<span class='highlight' style='background-color: " + color + "; padding: " + str(zIndex) + "vh 0vw " + str(zIndex) + "vh 0vw; zIndex: " + str(zIndex) + "'>"
        Rtag = "</span>"
        
        # Algo
        # Must go left to right if we use this ordering of offset
        final = final[:start + offset] + Ltag + final[start + offset:end + offset] + Rtag + final[end + offset:]
        offset += len(Ltag) + len(Rtag)
        zIndex += 1

    return "<span>" + final + "</span>"








# Feeding the model (OpenAI API) the original translation meta descriptors and prompting for a new/rephrased/alternate translation
def rephrase(client, previous_translations, original_source_text, source_language, target_language):

  response = client.chat.completions.create(
    # model="gpt-4o-2024-05-13",
    model="gpt-3.5-turbo",
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

# Get alternative translation for demo text
previous_translations = [
  "The weather is great today, let's take a walk in the park together.",
  "Today's weather is wonderful, shall we go for a walk in the park?",
  "It's a beautiful day today, how about we go for a stroll in the park?",
]



# Probably want to use the Translation memory/storage for avoiding repeat translations and get unique results each time
# Few-shot context changing via user input
def edit_context(client, context, original_text, source_language, target_language, few_shot_examples):

  response = client.chat.completions.create(
    # model="gpt-4o-2024-05-13",
    model="gpt-3.5-turbo",
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