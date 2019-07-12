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
  const [content, setContent] = useState([]);

  useEffect(() => {
    const getContent = async () => {
      await window.send('addDat', {isMain: true});
      await Promise.all(datKeys.map(async key => {
        return await window.send('addDat', {key});
      }));
      const extraDats = await window.send('getArchives');
      console.log({extraDats})
      const newContent = await window.send('getContent', {archive: extraDats[0]});
      console.log({newContent});
      setContent(newContent);
    };

    getContent();
  }, []);

  return (
    <div className={classes.root}>
      <h1 className={classes.title}><i>GLP</i> 📑</h1>
      {content.length > 0 ? <Home main={mainArchive} extra={extArchives} content={content}/> : <h2>Loading...</h2>}
    </div>
  );
}

export default AppContainer;
