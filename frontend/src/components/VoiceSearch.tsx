import React, { useState, useRef } from 'react';

const VoiceSearch = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{text: string, similarity_score: number, reason: string}>>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      console.log('Starting recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        console.log('Data available from recorder:', e.data.size);
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        console.log('Initial audio blob size:', audioBlob.size);
        
        // Convert to WAV using Web Audio API
        const audioContext = new AudioContext();
        const audioData = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        
        // Create WAV file
        const wavBlob = await convertToWav(audioBuffer);
        console.log('WAV blob size:', wavBlob.size);
        
        const formData = new FormData();
        formData.append('audio', wavBlob, 'recording.wav');

        try {
          console.log('Sending to backend...');
          const response = await fetch('http://localhost:8000/process_audio', {
            method: 'POST',
            body: formData,
          });
          console.log('Response status:', response.status);
          const data = await response.json();
          console.log('Response data:', data);
          
          if (data.error) {
            console.error('Error from backend:', data.error);
          } else {
            console.log('Received matches:', data.top_matches);
            setSearchResults(data.top_matches || []);
          }
        } catch (error) {
          console.error('Error processing audio:', error);
        }
      };

      mediaRecorder.start(1000); // Record in 1-second chunks
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
    }
  };

  // Helper function to convert AudioBuffer to WAV
  const convertToWav = async (audioBuffer: AudioBuffer): Promise<Blob> => {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // Write WAV header
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeUTFBytes(view, 8, 'WAVE');
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * 2, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true);
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, length, true);

    // Write audio data
    const data = new Float32Array(audioBuffer.length);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < audioBuffer.length; i++) {
      const sample = channelData[i];
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(44 + (i * 2), int16, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  const writeUTFBytes = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="voice-search">
      <header className="App-header">
        <h1>Gurmukhi Voice Search</h1>
        
        <div className="voice-controls">
          <button 
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onClick={handleRecord}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          
          <div className="status-indicator">
            {isRecording ? 'Recording...' : 'Ready to record'}
          </div>
        </div>

        <div className="search-results">
          {searchResults && searchResults.length > 0 ? (
            <ul>
              {searchResults.map((result, index) => (
                <li key={index}>
                  <div><strong>Text:</strong> {result.text}</div>
                  <div><strong>Score:</strong> {result.similarity_score.toFixed(3)}</div>
                  <div><strong>Reason:</strong> {result.reason}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No search results yet. Try recording a query!</p>
          )}
        </div>
      </header>
    </div>
  );
};

export default VoiceSearch; 