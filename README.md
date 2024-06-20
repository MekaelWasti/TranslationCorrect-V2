# Run Instructions

### PIP & Packages

make your own env in the root folder of our repo with 

```jsx
pip install virtualenv
```

```
python -m venv {name your env}
```

e.g.

```
python -m venv myenv
```

This will create your environment folder. Do not push this folder when you are pushing to the repo, it will probably cause problems if you even try because massive file sizes. Either manually stage changes when pushing and do not push this folder, or put it in the gitignore

Then you can do 

```jsx
{the name of your env}\Scripts\activate
```

e.g.
```
myenv\Scripts\activate
```

now do

```jsx
pip install -r requirements.txt
```

It should install without collisions, if it doesn’t then fix it, ask me if you need to

### To run Backend

```jsx
cd .\backend\
```
```
uvicorn main:app --reload --host 0.0.0.0 --port 63030
```

Should get this
```
INFO:     Will watch for changes in these directories: ['C:\\Users\\mekae\\Desktop\\CS\\ML-DL\\Projects\\Lee Lab\\Error-in-Translations\\backend']
INFO:     Uvicorn running on http://0.0.0.0:63030 (Press CTRL+C to quit)
INFO:     Started reloader process [68584] using WatchFiles
INFO:     Started server process [63380]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
WARNING:  WatchFiles detected changes in 'main.py'. Reloading...
INFO:     Shutting down
INFO:     Waiting for application shutdown.
INFO:     Application shutdown complete.
INFO:     Finished server process [63380]
INFO:     Started server process [51168]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```
### Frontend

You’re going to need react, which needs node so install that and make it work

Make a new terminal and then

```jsx
cd .\frontend\
```

Should be able to find versions using ```node -v``` and ```npm -v```
```
PS C:\Users\mekae\Desktop\CS\ML-DL\Projects\Lee Lab\Error-in-Translations\frontend> node -v
v20.13.1 
PS C:\Users\mekae\Desktop\CS\ML-DL\Projects\Lee Lab\Error-in-Translations\frontend> npm -v       
10.8.0
```

Then I you should be able to 

```jsx
npm install
```

and then to run it 

```jsx
npm run dev
```

```
  VITE v5.2.13  ready in 244 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

ctrl+click on the localhost link to open it up in the browser

Translate should work on your typed input, if not, check the console log in the browser for hints of what went wrong













---




![POC Diagram](https://github.com/MekaelWasti/Error-in-Translations/assets/40731373/af13deda-d751-4ae0-ae01-ec90f71fb754)


# Phase 1

## Input

- User input is a **source sentence** (e.g. “Hello, how are you?”).

## Model 1 - NMT

- This input is fed into our **Model 1,** which is an **NLLB LLM** model. It conducts translation through it’s inference and outputs the translation in the target language along with a **score** in the form of **spBLEU or chrF++.**
- The source language is fed to the tokenizer and the target language is fed as a param to the model.generate() call ** (based on the generation segment of documentation [M2M100 (huggingface.co)](https://huggingface.co/docs/transformers/main/en/model_doc/m2m_100#transformers.M2M100ForConditionalGeneration))
- Output should of course contain the translated sentence (e.g. “Salut, comment ça va”). This and the score then goes into Model 2

## Model 2 - Quality Estimation (QE)

- This model will take the translation sentence as input (input: translation(source, target)) and will output a QE score. This score should be used to evaluate the quality of the translation and likely put against a threshold to determine the next step
- Methods to try and benchmark to find the best one
    - Method 1:
        - HRL Comet QE Model or AfroComet QE models can be used
    - Method 2:
        - In context prompting using GPT 4.5 API (from Prof Christopher Collins) or Llama 3
            - Hokkien LREC
            - Bohan
- Can talk to someone named Riddhi for more information and resources on this part

## Data

- **Error Dataset:** Needs literature review to on error datasets to figure out which one to use.
    - Error Categories
    - Error Dataset
    - Which languages?
    - Seq-Tags
        - Classify error types
        - Target Seq: ~-~-~-~-~-~-~
        - Seq-tags:  [✔] [X] [✔] [✔] [X] [✔] [✔]
        - 
            
            ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/345c586f-44b7-4a2c-91e0-908f51ec6f63/4eebaaf7-d70f-4ee1-bedd-c7f251e795e1/Untitled.png)
            

# Interface

- Not concerned with this for now but it will take the user input, communicate it with the translation pipeline, return the translation and dynamically update.
- It will offer the user functions such as
    - **Edit context:** allow for context prompting that will guide the style of the translation, few-shot examples are permitted
    - **Rephrase:** will provide an alternative translation to the source sentence and avoid repeating previous translations
    - **Accept:** indicate to the system that the translation provided is accurate and can be used to reward the RLHF component of the pipeline
- If we go this human feedback route we will likely also have **reject/correct errors** so that penalties can be applied to the RLHF system

---

# Phase 2

## Reinforcement Learning from Human Feedback (RLHF)

**This is rough understanding and may not be 100% accurate to RL methods** 

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/345c586f-44b7-4a2c-91e0-908f51ec6f63/59902eae-a338-4131-87a3-db1b5fa4d5b9/Untitled.png)

Environment is the base models of translation and quality estimation

1. Action from the agent is translation
    1. RL
    2. RLHF
    3. PPO
2. Feedback on the translation from human or QE model decides on whether to reward or penalize the translation model
3. Correction and feedback outcome are used to train the model
4. Loop

Env: Model - Translation Error

Agent: Translator (human or data or model)

Action: Translation Pair

Reward Penalty: Error
