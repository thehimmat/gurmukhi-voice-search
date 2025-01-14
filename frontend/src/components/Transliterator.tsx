import React, { useState, useRef, useEffect } from 'react';
import './Transliterator.css';

interface TransliteratorProps {
  // Add any props if needed
}

const Transliterator: React.FC<TransliteratorProps> = () => {
  const [input, setInput] = useState('');
  const [style, setStyle] = useState('iso15919');
  const [output, setOutput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Add debounce to wait for user to finish typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Always call transliterate, even with empty input
      transliterate(input, style);
    }, 300); // Wait 300ms after last keystroke

    return () => clearTimeout(timeoutId);
  }, [input, style]);

  const transliterate = async (text: string, style: string) => {
    try {
      // If input is empty, clear output immediately
      if (!text) {
        setOutput('');
        return;
      }

      const response = await fetch('http://localhost:8000/transliterate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, style }),
      });
      
      const data = await response.json();
      if (data.result !== undefined) {  // Check for undefined instead of truthiness
        setOutput(data.result);
      } else if (data.error) {
        setOutput(`Error: ${data.error}`);
      }
    } catch (error) {
      setOutput('Error connecting to server');
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInput(newText);
    // Remove immediate transliterate call
    // transliterate will be called by useEffect after delay
  };

  return (
    <div className="transliterator">
      <header className="App-header">
        <h1>Gurmukhi Transliterator</h1>
        <div className="style-selector">
          <label>
            <input
              type="radio"
              value="iso15919"
              checked={style === 'iso15919'}
              onChange={(e) => {
                setStyle(e.target.value);
                transliterate(input, e.target.value);
              }}
            />
            ISO 15919
          </label>
          <label>
            <input
              type="radio"
              value="practical"
              checked={style === 'practical'}
              onChange={(e) => {
                setStyle(e.target.value);
                transliterate(input, e.target.value);
              }}
            />
            Practical
          </label>
          <label>
            <input
              type="radio"
              value="legacy"
              checked={style === 'legacy'}
              onChange={(e) => {
                setStyle(e.target.value);
                transliterate(input, e.target.value);
              }}
            />
            Roman Font to Gurmukhi
          </label>
        </div>
        <div className="converter-container">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleTextareaChange}
            placeholder={style === 'legacy' ? 
              "Enter Roman font text (AnmolLipi) here..." : 
              "Enter Gurmukhi text here..."}
            rows={4}
            className="input-field"
          />
          <div className="result-container">
            <div className="result-text" style={{ whiteSpace: 'pre-wrap' }}>
              {output || 'Type something to see conversion'}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Transliterator;
