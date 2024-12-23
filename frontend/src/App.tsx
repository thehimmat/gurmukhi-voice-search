import React, { useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handleTransliterate = async () => {
    // TODO: We'll add the API call here later
    console.log('Input text:', input);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Gurmukhi to ISO 15919 Converter</h1>
        <div className="converter-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter Gurmukhi text here..."
            rows={4}
            className="input-field"
          />
          <button 
            onClick={handleTransliterate}
            className="convert-button"
          >
            Convert
          </button>
          {result && (
            <div className="result-container">
              <h3>Result:</h3>
              <p className="result-text">{result}</p>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
