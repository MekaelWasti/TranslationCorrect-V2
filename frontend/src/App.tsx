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
  )
}

export default App
