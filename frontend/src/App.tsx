import { useState } from 'react'
// import loadingIconGrey from './assets/loading_icon_grey.svg'
import loadingIconWhite from './assets/loading_icon_white.svg'
import './App.css'

function App() {
  const [sourceTextInput, setSourceTextInput] = useState('')
  const [translation, setTranslation] = useState('')
  const [isLoading, setIsLoading] = useState(false);


  // Functions

  const handleInputBoxChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const userInput = e.currentTarget.value;
    setSourceTextInput(userInput);
  }
  const handleSubmission = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      console.log(e);
      sendTranslation(sourceTextInput);
      setIsLoading(true);

  }

  const sendTranslation = async (userInput:string) => {

    try {
      const response = await fetch('http://127.0.0.1:63030/submit_translation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: userInput }),
  
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Recieved: ", data);
      console.log("Response: ", data.response);
      setIsLoading(false);
      setTranslation(data.response);
    } catch (error) {
      console.error('Error:', error);
    }

  }



  return (
    <div className="landing-page-parent">
      <div className="navbar">
        <ul className="navbar-contents">
          <li className="navbar-item">
            <img className='logo' src="favicon.svg" alt="" />
            <a className="navbar-item-name" href="http://localhost:5173">Translation Error</a>
            </li>
        </ul>
      </div>
      <div className="input-and-button">
        <div className="input-container">
          <div className="wrapper">
            <ul className="language-bar">
              <li className="from-languages">
                <select>
                  <option value="en-US">English</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="ne-NP">Nepali</option>
                </select>
              </li>
              <li className="to-languages">
                <select>
                  <option value="en-US">English</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="ne-NP">Nepali</option>
                </select>
              </li>
            </ul>
            <div className="text-input">
              <textarea className="from-text" onChange={handleInputBoxChange} placeholder="Type to translate"></textarea>
              <div className="to-text-container">

              {/* <textarea className={`to-text ${isLoading ? "loading" : ''}`} value={translation} placeholder="Translated text appears here" readOnly disabled></textarea> */}
              <textarea className={`to-text ${isLoading ? "loading-icon-hidden" : ""}`}  value={translation} placeholder="Translated text appears here" readOnly disabled></textarea>
              <img className={`loading-icon  ${isLoading ? "" : "loading-icon-hidden"}`} src={loadingIconWhite} alt="" />
              </div>


            </div>
          </div>
        </div>
        <div className="translate-text-button">
          <button onClick={handleSubmission}>Translate Text</button>
        </div>
              {/* <img className='loading-icon ' src={isLoading ? loadingIconWhite : loadingIconGrey} alt="" /> */}
              {/* <div class="glow-text"> */}
                {/* Analyzing */}
              {/* </div> */}
              


      </div>
    </div>

  )
}

export default App
