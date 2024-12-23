import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleTransliterate = async (text: string) => {
    if (!text.trim()) {
      setResult('');
      return;
    }

    try {
      setError('');
      const response = await axios.post('http://localhost:8000/api/transliteration/convert', {
        text: text
      });
      setResult(response.data.result);
    } catch (err) {
      setError('Error converting text. Please try again.');
      console.error('Error:', err);
    }
  };

  // Debounce the API calls to avoid too many requests
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleTransliterate(input);
    }, 300); // Wait 300ms after last keystroke before converting

    return () => clearTimeout(timeoutId);
  }, [input]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Gurmukhi to ISO 15919 Converter</h1>
        <div className="converter-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter Gurmukhi text here..."
            rows={1}
            className="input-field"
          />
          {error && <div className="error-message">{error}</div>}
          <div className="result-container">
            <div className="result-text">
              {result || 'Type something to see conversion'}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
