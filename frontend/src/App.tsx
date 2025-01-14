import React, { useState } from 'react';
import { Tabs, ConfigProvider, theme } from 'antd';
import type { TabsProps } from 'antd';
import VoiceSearch from './components/VoiceSearch';
import Transliterator from './components/Transliterator';
import './App.css';

const App: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string>('voice');

  const items: TabsProps['items'] = [
    {
      key: 'voice',
      label: 'Voice Search',
      children: <VoiceSearch />
    },
    {
      key: 'transliterator',
      label: 'Transliterator',
      children: <Transliterator />
    }
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#4CAF50',
        },
      }}
    >
      <div className="App">
        <header className="App-header">
          <h1>Gurmukhi Voice Search</h1>
        </header>
        <main>
          <Tabs 
            defaultActiveKey="voice"
            activeKey={activeKey}
            onChange={setActiveKey}
            items={items}
          />
        </main>
      </div>
    </ConfigProvider>
  );
};

export default App;
