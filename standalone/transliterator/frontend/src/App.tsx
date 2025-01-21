import React, { useState, useCallback, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import TransliteratorInput from './components/TransliteratorInput';
import TransliteratorOutput from './components/TransliteratorOutput';
import { transliterate } from './services/api';
import { detectInputType, initializeLegacyChars } from './utils/textDetection';
import './App.css';

const App: React.FC = () => {
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [outputFormat, setOutputFormat] = useState('practical');
  const [unicodeText, setUnicodeText] = useState('');

  const transliterateText = useCallback(async (
    text: string,
    inputFormat: string,
    outFormat: string
  ) => {
    try {
      const result = await transliterate(text, inputFormat, outFormat);
      return result;
    } catch (err) {
      throw err;
    }
  }, []);

  const handleTextChange = useCallback(async (text: string) => {
    if (!text.trim()) {
      setOutput('');
      setError(undefined);
      setUnicodeText('');
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const inputFormat = detectInputType(text);
      
      if (inputFormat !== 'unicode') {
        // Convert to Unicode using our legacy converter
        const unicode = await transliterateText(text, 'legacy', 'unicode');
        setUnicodeText(unicode);
        // Now use this Unicode text for the output format
        const result = await transliterateText(unicode, 'unicode', outputFormat);
        setOutput(result);
      } else {
        // Input is already Unicode
        setUnicodeText(text);
        const result = await transliterateText(text, 'unicode', outputFormat);
        setOutput(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [outputFormat, transliterateText]);

  const handleOutputFormatChange = useCallback(async (format: string) => {
    setOutputFormat(format);
    if (unicodeText) {
      try {
        setIsLoading(true);
        const result = await transliterateText(unicodeText, 'unicode', format);
        setOutput(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
  }, [unicodeText, transliterateText]);

  const handleFormatChange = useCallback((format: string) => {
    if (format === 'unsupported') {
      setOutput('');
      setError('This system only supports Gurmukhi Unicode and ASCII-based Gurmukhi text. Please use one of these input formats.');
    } else if (format === '') {  // When input is empty
      setError(undefined);  // Clear the error
    }
  }, []);

  // Initialize legacy characters on mount
  useEffect(() => {
    initializeLegacyChars();
  }, []);

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <h1>Gurmukhi Transliterator</h1>
        </header>
        
        <main className="app-main">
          <div className="transliterator-container">
            <TransliteratorInput
              onTextChange={handleTextChange}
              onFormatChange={handleFormatChange}
              isLoading={isLoading}
            />
            
            <ErrorBoundary
              fallback={
                <div className="error-boundary">
                  Error in output component
                  <button className="reload-button" onClick={() => window.location.reload()}>
                    Reload
                  </button>
                </div>
              }
            >
              <TransliteratorOutput
                text={output}
                isLoading={isLoading}
                error={error}
                outputFormat={outputFormat}
                onOutputFormatChange={handleOutputFormatChange}
              />
            </ErrorBoundary>
          </div>
        </main>

        <footer className="app-footer">
          <p>
            Convert between different Gurmukhi text formats and transliteration systems.
          </p>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App; 