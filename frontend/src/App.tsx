import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';  // Reset height
    e.target.style.height = `${Math.min(e.target.scrollHeight, 400)}px`;  // Set new height
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Gurmukhi Transliterator</h1>
        <div className="converter-container">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleTextareaChange}
            placeholder="Enter Gurmukhi text here..."
            rows={4}
            className="input-field"
          />
          {error && <div className="error-message">{error}</div>}
          <div className="result-container">
            <div className="result-text" style={{ whiteSpace: 'pre-wrap' }}>
              {result || 'Type something to see conversion'}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
