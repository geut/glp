import React from 'react';
import ReactDOM from 'react-dom';
import '../client-preload';
import './client-ipc';
import '../index.css';
import 'draft-js/dist/Draft.css';
import 'draftail/dist/draftail.css';
import 'draft-js-inline-toolbar-plugin/lib/plugin.css';
import Root from './root';

// Render React app inside root
ReactDOM.render(
  <Root/>,
  document.querySelector('#app')
);
