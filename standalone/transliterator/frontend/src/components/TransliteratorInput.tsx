import React, { useRef, useState, useEffect } from 'react';
import { detectInputType } from '../utils/textDetection';

interface TransliteratorInputProps {
  onTextChange: (text: string) => void;
  onFormatChange: (format: string) => void;
  isLoading: boolean;
}

const TransliteratorInput: React.FC<TransliteratorInputProps> = ({ 
  onTextChange, 
  onFormatChange,
  isLoading 
}) => {
  const [text, setText] = useState('');
  const [detectedFormat, setDetectedFormat] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cursorPositionRef = useRef<number>(0);

  // Maintain focus on initial render
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    cursorPositionRef.current = e.target.selectionStart || 0;
    
    setText(newText);
    const format = newText.trim() ? detectInputType(newText) : '';
    setDetectedFormat(format);
    onFormatChange(format);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only trigger transliteration if format is supported
    if (format !== 'unsupported' && newText) {
      timeoutRef.current = setTimeout(() => {
        onTextChange(newText);
      }, 300);
    }
  };

  // Restore cursor position and focus after any update
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        cursorPositionRef.current,
        cursorPositionRef.current
      );
    }
  }, [text, isLoading]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="transliterator-input">
      <div className="format-control">
        <label>Input Format:</label>
        <span className={`detected-format ${detectedFormat === 'unsupported' ? 'unsupported' : ''}`}>
          {detectedFormat === 'unicode' ? 'Gurmukhi Unicode' : 
           detectedFormat === 'legacy' ? 'ASCII/Legacy Gurmukhi' : 
           detectedFormat === 'unsupported' ? 'Unsupported Format' :
           'Type something...'}
        </span>
      </div>

      <textarea
        ref={inputRef}
        value={text}
        onChange={handleTextChange}
        placeholder="Enter Gurmukhi text (Unicode or ASCII)..."
        disabled={isLoading}
        className="text-input"
        rows={5}
        onBlur={(e) => {
          e.target.focus();
        }}
      />
    </div>
  );
};

export default TransliteratorInput; 