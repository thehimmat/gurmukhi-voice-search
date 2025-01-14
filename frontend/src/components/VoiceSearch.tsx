import React, { useState, useEffect, useRef } from 'react';
import './VoiceSearch.css';

interface VoiceSearchProps {
  onResults?: (results: any) => void;
}

interface MediaRecorderWithStream extends MediaRecorder {
  stream: MediaStream;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({ onResults }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [status, setStatus] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorderWithStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm'
        }) as MediaRecorderWithStream;

        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e: BlobEvent) => {
          chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          setStatus('Processing audio...');
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');

          try {
            setStatus('Analyzing speech...');
            const response = await fetch('http://localhost:8000/process_audio', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResults(data);
            setStatus('Analysis complete');
            if (onResults) {
              onResults(data);
            }
          } catch (error) {
            console.error("Error processing audio:", error);
            setStatus('Error processing audio');
          }
        };
      })
      .catch(err => {
        console.error('Error accessing microphone:', err);
        setStatus('Error accessing microphone');
      });
  }, [onResults]);

  const startRecording = () => {
    if (mediaRecorderRef.current && !isRecording) {
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatus('Recording...');
      chunksRef.current = [];
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="voice-search-container">
      <div className="voice-search-content">
        <div className="status-indicator">
          <div className={`recording-dot ${isRecording ? 'active' : ''}`} />
          <span className="status-text">{status}</span>
        </div>

        <button 
          className={`voice-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>

        {results && (
          <div className="results-container">
            <h3>Analysis Results:</h3>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceSearch; 