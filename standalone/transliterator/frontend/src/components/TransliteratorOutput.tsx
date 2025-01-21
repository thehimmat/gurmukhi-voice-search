import React from 'react';
import CopyButton from './CopyButton';

interface TransliteratorOutputProps {
  text: string;
  isLoading: boolean;
  error?: string;
  outputFormat: string;
  onOutputFormatChange: (format: string) => void;
}

const TransliteratorOutput: React.FC<TransliteratorOutputProps> = ({
  text,
  isLoading,
  error,
  outputFormat,
  onOutputFormatChange,
}) => {
  const handleOutputFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value;
    onOutputFormatChange(newFormat);
  };

  return (
    <div className="transliterator-output">
      <div className="format-control">
        <label>Output Format:</label>
        <select
          value={outputFormat}
          onChange={handleOutputFormatChange}
          disabled={isLoading}
        >
          <option value="unicode">Gurmukhi Unicode</option>
          <option value="anvaad">English (Anvaad)</option>
          <option value="practical">English (Practical)</option>
          <option value="iso15919">English (ISO 15919)</option>
          <option value="ipa">International Phonetic Alphabet</option>
          <option value="devnagri">Devanagari</option>
          <option value="shahmukhi">Shahmukhi</option>
        </select>
      </div>

      <div className="output-container">
        <textarea
          value={text}
          readOnly
          className="output-text"
          rows={5}
          placeholder="Transliterated text will appear here..."
        />
        {error && <div className="output-error">{error}</div>}
        <CopyButton text={text} />
      </div>
    </div>
  );
};

export default TransliteratorOutput; 