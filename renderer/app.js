import React, {useState, useEffect} from 'react';

import {makeStyles} from '@material-ui/core/styles';

import Config from '../config';
import Home from './containers/home';

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
Const datLinks = Config.get('keys')
const { archives, loading } = await setupArchives(datLinks)
const archivesContext = createContext(archives)
*/

function AppContainer() {
  const classes = useStyles();
  const datKeys = Config.get('keys');
  const [mainArchive, setMainArchive] = useState({});
  const [extArchives, setExtArchives] = useState([]);
  // TODO(deka): move content to home component...
  const [metadata, setMetadata] = useState([]);

  useEffect(() => {
    const getContent = async () => {
      const mainKey = await window.send('addDat', {isMain: true});
      setMainArchive(mainKey);
      await Promise.all(datKeys.map(async key => {
        const val = await window.send('addDat', {key});
        return val;
      }));
      const archives = await window.send('getArchives');
      const meta = await window.send('getMetadata');
      console.log({meta});
      setExtArchives(archives);
      setMetadata(meta);
    };

    getContent();
  }, []);

  return (
    <div className={classes.root}>
      <h1 className={classes.title}><i>GLP</i> 📑</h1>
      {metadata.length > 0 ? <Home mainKey={mainArchive} extra={extArchives} metadata={metadata} /> : <h2>Loading...</h2>}
    </div>
  );
}

export default AppContainer;
