import React from 'react';
import { ConfigProvider, theme } from 'antd';
import Transliterator from './components/Transliterator';
import './App.css';

const App: React.FC = () => {
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
        <Transliterator />
      </div>
    </ConfigProvider>
  );
};

export default App;
