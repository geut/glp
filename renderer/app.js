import React, {createContext} from 'react';

import {makeStyles} from '@material-ui/core/styles';

import Config from '../config';
import Home from './containers/Home';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  title: {
    textAlign: 'right',
    padding: theme.spacing(2),
    right: '1em'
  }
}));

/*
Const datLinks = Config.get('dats')
const { archives, loading } = await setupArchives(datLinks)
const archivesContext = createContext(archives)
*/

function AppContainer() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <h1 className={classes.title}><i>GLP</i> 📑</h1>
      <Home/>
    </div>
  );
}

export default AppContainer;
