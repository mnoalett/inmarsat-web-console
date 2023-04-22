import 'antd/dist/reset.css';
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';


ReactDOM.render(
  <App />,
  document.getElementById('root'),
);

screen.orientation.lock('landscape').catch(error => console.warn(error));