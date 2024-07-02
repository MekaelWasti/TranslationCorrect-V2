# uvicorn main:app --reload --host 0.0.0.0 --port 63030
from fastapi import FastAPI, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from pipeline import translate, error_span, errorSpanHighlighter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

class StringItem(BaseModel):
    value: str

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/submit_translation")
def submit_prompt(item: StringItem):
    print(item.value)

    res =  translate(item.value, "en", "zho_Hans")
    error_spans = error_span()
    # highlights = errorSpanHighlighter(res, error_spans)

    highlights = """<span><span class="highlight" style="background-color: #00A0F0; padding: 0vh 0vw 0vh 0vw; z-index: 0;">Student</span>s from Stanford University Medical School an    <span class="highlight" style="background-color: #D3365A; padding: 1vh 0vw 1vh 0vw; z-index: 1;">nounced Monday the invention of a new diagnostic tool tha</span>    t can sort cells by type of small printed chip</span>"""
    
    
    # res = backend_translation(item.value)
    return {"received_string": item.value, "response": res, "spans": error_spans, "highlights": highlights}

if __name__ == "__main__":
    import uvicorn
    # uvicorn.run(app, host="0.0.0.0", port=8000)
    uvicorn.run(app, host="0.0.0.0", port=63030)