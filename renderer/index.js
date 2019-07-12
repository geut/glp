import React from 'react';
import ReactDOM from 'react-dom';
import '../client-preload';
import './client-ipc';
import '../index.css';
import AppContainer from './app';

// Render React app inside root
ReactDOM.render(
  <AppContainer/>,
  document.querySelector('#app')
);
