import 'antd/dist/reset.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

screen.orientation.lock('landscape').catch(error => console.warn(error));