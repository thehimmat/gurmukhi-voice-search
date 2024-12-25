import React, { useState } from 'react';
import Transliterator from './components/Transliterator';
import VoiceSearch from './components/VoiceSearch';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('transliterator');

  return (
    <div className="App">
      <nav className="tab-navigation">
        <button 
          className={activeTab === 'transliterator' ? 'active' : ''}
          onClick={() => setActiveTab('transliterator')}
        >
          Transliterator
        </button>
        <button 
          className={activeTab === 'voiceSearch' ? 'active' : ''}
          onClick={() => setActiveTab('voiceSearch')}
        >
          Voice Search
        </button>
      </nav>

      {activeTab === 'transliterator' ? <Transliterator /> : <VoiceSearch />}
    </div>
  );
}

export default App;
