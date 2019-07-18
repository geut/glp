import React, {createContext, useReducer, useContext} from 'react';
import PropTypes from 'prop-types';

// ** Dat hook B-) **
function setupArchives(datLinks) {
  // Load defaults dats from config
  // load user dat
  // return all the archives (hyperdrives) back to the app
}
// ** END dat hook **

export const GLPContext = createContext();

export const StateProvider = ({reducer, initialState, children}) => (
  <GLPContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </GLPContext.Provider>
);

StateProvider.defaultProps = {
  initialState: {}
};

StateProvider.propTypes = {
  reducer: PropTypes.func.isRequired,
  children: PropTypes.element.isRequired,
  initialState: PropTypes.object
};

export const useStateValue = () => useContext(GLPContext);
