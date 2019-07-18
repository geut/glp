import React from 'react';
import ReactDOM from 'react-dom';
import '../client-preload';
import './client-ipc';
import '../index.css';
import Root from './root';

// Render React app inside root
ReactDOM.render(
  <Root/>,
  document.querySelector('#app')
);
