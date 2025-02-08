import React, { useState, useRef, useEffect } from 'react';
import { Select } from 'antd';
import { GurmukhiISO15919 } from '../utils/transliteration/iso15919';
// import { GurmukhiPractical } from '../utils/transliteration/practical';
import { GurmukhiLegacy } from '../utils/transliteration/legacy';
import anvaad from 'anvaad-js';
import './Transliterator.css';

const { Option } = Select;

interface TransliteratorProps {
  // Add any props if needed
}

const Transliterator: React.FC<TransliteratorProps> = () => {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'gurmukhi' | 'ascii'>('gurmukhi');
  const [style, setStyle] = useState('iso15919');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Test Anvaad on component mount with full word
  useEffect(() => {
    try {
      // Test with a complete word
      const testWord = 'ਗੁਰਮੁਖੀ';
      console.log('Testing Anvaad with:', testWord);
      const testResult = anvaad.translit(testWord);
      console.log('Anvaad test result:', testResult);
      
      // Log available Anvaad methods
      console.log('Available Anvaad methods:', Object.keys(anvaad));
    } catch (e) {
      console.error('Anvaad test failed:', e);
    }
  }, []);

  const detectInputType = (text: string): 'gurmukhi' | 'ascii' => {
    const gurmukhiPattern = /[\u0A00-\u0A7F]/;
    return gurmukhiPattern.test(text) ? 'gurmukhi' : 'ascii';
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInput(newText);
    setInputType(detectInputType(newText));
    setError('');
  };

  const transliterate = (text: string, style: string) => {
    if (!text) {
      setOutput('');
      setError('');
      return;
    }

    try {
      let result = '';
      const processedInput = inputType === 'ascii' 
        ? GurmukhiLegacy.toUnicode(text, 'anmollipi')
        : text;

      console.log('Processing:', {
        inputType,
        originalText: text,
        processedInput,
        style
      });

      switch (style) {
        case 'iso15919':
          result = GurmukhiISO15919.toPhonetic(processedInput);
          break;
        case 'practical':
          try {
            // Try direct transliteration first
            result = anvaad.translit(processedInput);
            console.log('Direct Anvaad result:', result);
            
            // If no result, try alternative approach
            if (!result) {
              // Split into words and process each
              const words = processedInput.split(' ');
              result = words
                .map(word => word ? anvaad.translit(word) : '')
                .filter(Boolean)
                .join(' ');
              console.log('Word-by-word Anvaad result:', result);
            }
            
            if (!result) {
              throw new Error('Unable to transliterate with Anvaad');
            }
          } catch (anvaadError) {
            console.error('Anvaad error:', anvaadError);
            throw new Error(`Anvaad transliteration failed: ${anvaadError.message}`);
          }
          break;
        case 'unicode':
          result = processedInput;
          break;
        default:
          throw new Error('Unsupported conversion type');
      }
      
      setOutput(result);
      setError('');
    } catch (error) {
      console.error('Transliteration error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setOutput('');
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      transliterate(input, style);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [input, style]);

  return (
    <div className="transliterator">
      <header className="App-header">
        <h1>Gurmukhi Transliterator</h1>
        <div className="style-selector">
          <Select
            value={style}
            onChange={(value) => {
              setStyle(value);
              transliterate(input, value);
            }}
            style={{ width: 200 }}
          >
            <Option value="iso15919">ISO 15919</Option>
            <Option value="practical">Practical (Anvaad)</Option>
            <Option value="unicode">Gurmukhi Unicode</Option>
          </Select>
        </div>
        <div className="converter-container">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleTextareaChange}
            placeholder={inputType === 'ascii' ? 
              "Enter Roman font text (AnmolLipi) here..." : 
              "Enter Gurmukhi text here..."}
            rows={4}
            className="input-field"
          />
          <div className="input-type-indicator">
            Detected Input: {inputType === 'gurmukhi' ? 'Gurmukhi Unicode' : 'ASCII Roman'}
          </div>
          {error && <div className="error-message">{error}</div>}
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
