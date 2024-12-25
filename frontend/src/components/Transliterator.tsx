import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../App.css';

function Transliterator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [style, setStyle] = useState('iso15919');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const transliterate = async (text: string, transliterationStyle: string) => {
    try {
      const response = await fetch('http://localhost:8000/transliterate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          style: transliterationStyle
        }),
      });
      const data = await response.json();
      setOutput(data.result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Add useEffect to handle initial transliteration and style changes
  useEffect(() => {
    if (input) {
      transliterate(input, style);
    }
  }, [input, style]); // Trigger when either input or style changes

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';  // Reset height
    e.target.style.height = `${Math.min(e.target.scrollHeight, 400)}px`;  // Set new height
  };

  /**
   * TODO: UI/UX Improvements
   * - Add Gurmukhi keyboard component for easier input
   * - Add rules/mappings display panel for each transliteration system
   * - Add custom rule configuration interface
   * - Add IPA output option
   * - Add non-unicode input support
   * - Add visual feedback for implied 'a' vowels
   * - Add documentation panel for each transliteration system
   */

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
        </div>
        <div className="converter-container">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleTextareaChange}
            placeholder="Enter Gurmukhi text here..."
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
}

export default Transliterator;
