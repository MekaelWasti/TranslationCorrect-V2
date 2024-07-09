# uvicorn main:app --reload --host 0.0.0.0 --port 63030
from fastapi import FastAPI, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from comet import download_model, load_from_checkpoint
import os
from pydantic import BaseModel
import asyncio
from pipeline import translate, error_span, errorSpanHighlighter, edit_context, rephrase, generate_error_spans
import threading
import time
import json

app = FastAPI()

@app.on_event("startup")
async def startup_event():

    # Set up OpenAI Client
    global client, tokenizer, translation_model, error_span_model


    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    from openai import OpenAI
    client = OpenAI(api_key= OPENAI_API_KEY)

    # Load translation model and tokenizer
    model_name = "facebook/nllb-200-distilled-600M"
    # tokenizer = AutoTokenizer.from_pretrained(model_name)
    # translation_model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    local_model_dir = "./local_model"
    tokenizer = AutoTokenizer.from_pretrained(local_model_dir)
    translation_model = AutoModelForSeq2SeqLM.from_pretrained(local_model_dir)

    local_model_dir = "./local_model"
    tokenizer.save_pretrained(local_model_dir)
    translation_model.save_pretrained(local_model_dir)

    # Load error span model
    # error_span_model_path = download_model("Unbabel/XCOMET-XL")
    error_span_model_path = 'C:\\Users\\mekae\\.cache\\huggingface\\hub\\models--Unbabel--XCOMET-XL\\snapshots\\baa17625e541fe87c4c0010616e35eab12c864f7\\checkpoints\\model.ckpt'
    error_span_model = load_from_checkpoint(error_span_model_path)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

class StringItem(BaseModel):
    value: str
    translation: str

error_spans_storage = {
    # "Stunting on me you get exposed" : ("{'errors': [{'original_text': 'Stunting on me you get exposed', 'translated_text': '着我,你会被曝光.', 'correct_text': 'Exposing yourself to me, you will get exposed.', 'start_index_orig': 0, 'end_index_orig': 29, 'start_index_translation': 0, 'end_index_translation': 14, 'error_type': 'Hallucinations'}]}", "<span>斯坦福大学医学院的学生周一宣布发明了一种新的诊断工具,可以根据<span class='highlight' style='background-color: #2f3472; padding: 0vh 0vw 0vh 0vw; zIndex: 0'>小型印花芯片</span>的</span>")
}  # Temporary in-memory storage for error spans


@app.get("/")
def read_root():
    return {"Hello": "World"}



@app.post("/submit_translation")
def submit_prompt(item: StringItem):
    print(item.value)

    src = item.value

    res = translate(tokenizer, translation_model, src, "en", "zho_Hans")


    # highlights = """<span><span class="highlight" style="background-color: #00A0F0; padding: 0vh 0vw 0vh 0vw; z-index: 0;">Student</span>s from Stanford University Medical School an    <span class="highlight" style="background-color: #D3365A; padding: 1vh 0vw 1vh 0vw; z-index: 1;">nounced Monday the invention of a new diagnostic tool tha</span>    t can sort cells by type of small printed chip</span>"""
    threading.Thread(target=generate_and_store_error_spans, args=(src, res)).start()
    
    
    # res = backend_translation(item.value)
    # return {"received_string": src, "response": res, "spans": error_spans, "highlights": highlights}
    return {"received_string": src, "response": res}

def generate_and_store_error_spans(src, mt):

    print("SRC: ", src, "MT: ", mt)
    error_spans,highlights = generate_error_spans(error_span_model, client, src, mt)
    
    # Store the error spans
    error_spans_storage[src] = (error_spans,highlights)
    print(f"Stored Spans: {error_spans_storage[src]}")
    # print(f"Generated Spans: {error_spans}")

@app.post("/fetch_error_spans/")
def fetch_error_spans(item: StringItem):
    src = item.value
    res = item.translation
    
    spans = error_spans_storage.get(src, [])

    error_spans = spans[0]
    highlights = spans[1]

    print(f"Returning Spans: {error_spans}")

    # error_spans = {
    # 'text': '小型印刷晶片', 
    # 'confidence': 0.3709107041358948, 
    # 'severity': 'minor', 
    # 'start': 31, 
    # 'end': 37
    #     }
    

    # return {"status": "success", "error_spans": error_spans}
    return {"status": "success", "error_spans": error_spans, "highlights": highlights}


@app.post("/edit_translation_context")
def edit_translation_context(item: StringItem):
    print(item.value)

    original_source_text = item.value

    # temporary values
    source_language = "zh"
    target_language = "en"

    # Dummy values
    # Poetic Example
    context = "A poetic two line rhyming style"
    few_shot_examples = '''"Light speeds away, in a blink it will fly."
                "Stars reach from afar, with light from eons bold."
            '''

    res = edit_context(client, context, item.value, source_language, target_language, few_shot_examples)

    return {"response": res}


@app.post("/rephrase")
def rephrase(item: StringItem):
    print(item.value)

    original_source_text = item.value

    # temporary values
    source_language = "zh"
    target_language = "en"

    # Dummy previous translations, ideally should be stored session wise, probably on the client side
    previous_translations = [
        "The weather is great today, let's take a walk in the park together.",
        "Today's weather is wonderful, shall we go for a walk in the park?",
        "It's a beautiful day today, how about we go for a stroll in the park?",
    ]

    res = rephrase(client, previous_translations, original_source_text, source_language, target_language)

    return {"response": res}



if __name__ == "__main__":
    import uvicorn
    # uvicorn.run(app, host="0.0.0.0", port=8000)
    uvicorn.run(app, host="0.0.0.0", port=63030)