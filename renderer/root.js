import React from 'react';

import {StateProvider} from './hooks';
import App from './app';

const Root = () => {
  const initialState = {
    activePage: ''
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case 'GOTO':
        return {
          ...state,
          activePage: action.activePage,
          ...action.state
        };

      default:
        return state;
    }
  };

  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <App/>
    </StateProvider>
  );
};

export default Root;
