import React, {useState, useEffect} from 'react';

import {makeStyles} from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';

import {switchcase} from 'common/utils';
import Config from '../config';
import {useStateValue} from './hooks';
import Home from './containers/home';
import Loader from './containers/loader';
import Detail from './containers/detail';

if (module.hot) {
  module.hot.accept();
}

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

function AppContainer() {
  const classes = useStyles();
  const [{activePage, fileData}, dispatch] = useStateValue();
  // NOTE(deka): local state, possibly these should be moved inside useStateValue
  const [mainArchive, setMainArchive] = useState({});
  const [extArchives, setExtArchives] = useState([]);
  // TODO(deka): move content to home component...
  const [metadata, setMetadata] = useState([]);

  useEffect(() => {
    const getContent = async () => {
      console.log('getContent');
      const datKeys = Config.get('keys');
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
      dispatch({type: 'GOTO', activePage: 'home'});
    };

    getContent();
  }, []);

  return (
    <main className={classes.root}>
      {switchcase({
        loading: () => <Loader/>,
        home: () => <Fade in><Home mainKey={mainArchive} extra={extArchives} metadata={metadata}/></Fade>,
        detail: () => <Fade in><Detail fileData={fileData}/></Fade>
      })(<Loader/>)(activePage)}
    </main>
  );
}

export default AppContainer;
