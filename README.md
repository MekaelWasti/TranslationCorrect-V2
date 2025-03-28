<p align="center">
  <img src="https://github.com/MekaelWasti/TranslationCorrect-V2/blob/1f48ec4fc7c08d1d9f2af9a9d893b8cdfc2f3b2e/frontend/src/assets/logo.svg" alt="TranslationCorrect Logo" width="800">
</p>


# Table of Contents

1. [Use TranslationCorrect Now!](#use-translationcorrect-now)
2. [Full Repo Run Instructions](#full-repo-run-instructions)
3. [Project Description](#project-description)
4. [Data Usage & Training Resources](#data-usage--training-detailsresources)


# Use TranslationCORRECT Now!

The application is deployed <a href="https://error-in-translations.vercel.app/" target="_blank" rel="noopener noreferrer">here.</a>


# Full Repo Run Instructions

### PIP & Packages

**Important**: Please ensure pip is updated to the latest version using the following command

```
python.exe -m pip install --upgrade pip
```

Make your own **virutal environment** in the root folder of our repo using: 

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

<span id="activate-venv">**Activate** the environment using the following for **Windows**:</span>

```jsx
{the name of your env}\Scripts\activate
```
e.g.
```
myenv\Scripts\activate
```


For **Unix-based** systems (Linux/macOS) use `bin` instead of `scripts` as follows

```jsx
{the name of your env}/bin/activate
```
e.g.
```
myenv/bin/activate
```


Now install all **required packages** into your newly created environment:

```jsx
pip install -r requirements.txt
```

### To Run Backend

Make sure your virtual environment is active, using these [commands](#activate-venv)

```jsx
cd .\backend\
```
```
uvicorn main:app --reload --host 0.0.0.0 --port 63030
```
*You can set the port to whatever port is open on your personal network*

You should something like this as output:
```
INFO:     Will watch for changes in these directories: ['C:\\Users\\mekae\\TranslationCorrect\\backend']
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
### To Run Frontend

You're going to need to install [react](https://react.dev/learn/installation) on your machine

In a new terminal, from the **repository's parent folder**, do the following:

```jsx
cd .\frontend\
```

Should be able to find versions using ```node -v``` and ```npm -v```
```
PS C:\Users\mekae\TranslationCorrect\frontend> node -v
v20.13.1 
PS C:\Users\mekae\TranslationCorrect\frontend> npm -v       
10.8.0
```

Then I you should be able to:

```jsx
npm install
```

and then to run it :

```jsx
npm run dev
```

```
  VITE v5.2.13  ready in 244 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**ctrl+click** on the localhost link to open it up in the browser

Translate should work on your typed input, if not, check the console log in the browser for hints of what went wrong



---

# Project Description

Our proposed system, TranslationCorrect, is designed to function as a robust and comprehensive NMT system with iterative improvement. It enables users to generate hypothesis translations, detect potential errors within them, and provide corrections. 

- The system's detailed architecture is composed of three main components:

	**I. Neural Machine Translation:** The system allows users to input source text and generate high-quality hypothesis translations as output.

	**II. Fine-Grained Error Detection:** Fine-grained error detection is performed on hypothesis translations, and a comprehensive analysis of potential translation errors is displayed to the user.

	**III. Error Correction UI:** Users can make detailed edits, including error annotation scoring, annotation insertion, and text modifications (additions and deletions) to the hypothesis translation. Edits are tracked systematically to prioritize organization and clarity for the user. The edits are then collected and submitted to the **Fine-Grained Error Detection** component for iterative improvement in its error detection capabilities.


The three proposed components work closely together, creating a seamless experience for obtaining
accurate MTs. The backend pipeline data flow is illustrated as follows:

![Backend Pipeline Data Flow](https://github.com/MekaelWasti/TranslationCorrect/blob/c2bde9d079bc566ab143238f0bd7692c4400207c/frontend/src/assets/Pipeline%20Flow%20Diagram_readme.svg)

2. A UI that facilitates effective translation correction through features such as error categorization and classification, text extraction, and hovering tooltips).

![User Interface Error Detection and Correction Visualization](https://github.com/MekaelWasti/TranslationCorrect/blob/9cc033a3fc329a60144e234db840ecc039cc4c75/frontend/src/assets/UI_snippets.svg)




# Data Usage & Training Details/Resources

- **MQM Error Dataset:**
	To simulate human user activities, we generated MQM data using OpenAI's o1 model. We designed prompts guiding o1 to self-generate MQM data, focusing on the English-Chinese (en-zh) language pair. The resulting generated data was then evaluated with Unbabel's CometKiwi model, which yielded MQM scores for each data instance. After
	cleaning the duplicates and invalid outputs, we obtained a total of 2,899 MQM data samples, which we used for evaluation (reported in our paper).

- **Error Categories**
We have categorized potential errors into **six categories:**
 - Addition Of Text
 - Negation Errors
 - Mask In-Fill
 - Errors In Numbers
 - Named Entity Errors
 - Hallucination

The first five categories are major error types identified in Unbabel's xCOMET evaluation results, and hallucination is added to the categories as it is a recurring error over our extensive studies.
