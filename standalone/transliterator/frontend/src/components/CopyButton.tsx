import React, { useState } from 'react';

interface CopyButtonProps {
  text: string;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`copy-button ${className || ''} ${copied ? 'copied' : ''}`}
      disabled={!text || copied}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

export default CopyButton; 