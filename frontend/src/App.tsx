import './App.css'

function App() {
  return (
    <div className="landing-page-parent">
      <div className="navbar">
        <ul className="navbar-contents">
          <li className="navbar-item"><a className="navbar-item-name" href="http://localhost:5173">Translation Error</a></li>
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
              <textarea className="from-text" placeholder="Type to translate."></textarea>
              <textarea className="to-text" placeholder="Translated text appears here." readOnly disabled></textarea>
            </div>
          </div>
        </div>
        <div className="translate-text-button">
          <button>Translate Text</button>
        </div>
      </div>
    </div>

// import { useState } from 'react'
// import './App.css'

// function App() {
//   const [translation, setTranslation] = useState('')

//   // Functions

//   const handleSubmission = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       const userInput = e.currentTarget.value;
//       console.log("User Input: ", userInput);
//       sendTranslation(userInput);
//     }
//   }

//   const sendTranslation = async (userInput:string) => {

//     try {
//       const response = await fetch('http://127.0.0.1:63030/submit_translation/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ value: userInput }),
  
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("Recieved: ", data);
//       console.log("Response: ", data.response);
//       setTranslation(data.response);
//     } catch (error) {
//       console.error('Error:', error);
//     }

//   }

//   return (
//     <>
//     <div className="main_container">
//       <nav>
//         <img className='logo' src="favicon.svg" alt="" />
//         <h1>Errors in Translation</h1>
//       </nav>
//       <input onKeyDown={handleSubmission} className='translation_input' placeholder='Please Enter Your Input Sentence' type="text" />
//       <p>{translation}</p>
//     </div>
<!--     </> -->
  )
}

export default App
