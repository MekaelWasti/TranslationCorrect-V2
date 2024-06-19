import { useState } from 'react'
import './App.css'

function App() {
  const [translation, setTranslation] = useState('')

  // Functions

  const handleSubmission = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const userInput = e.currentTarget.value;
      console.log("User Input: ", userInput);
      sendTranslation(userInput);
    }
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
      setTranslation(data.response);
    } catch (error) {
      console.error('Error:', error);
    }

  }

  return (
    <>
    <div className="main_container">
      <nav>
        <img className='logo' src="favicon.svg" alt="" />
        <h1>Errors in Translation</h1>
      </nav>
      <input onKeyDown={handleSubmission} className='translation_input' placeholder='Please Enter Your Input Sentence' type="text" />
      <p>{translation}</p>
    </div>
    </>
  )
}

export default App
