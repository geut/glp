import React, {useState, useEffect} from 'react';

import {makeStyles} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Fade from '@material-ui/core/Fade';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import EditIcon from '@material-ui/icons/Edit';
import FoldersIcon from '@material-ui/icons/Notes';

import {switchcase} from 'common/utils';
import GEUT from './components/logo';
import Config from '../config';
import {useStateValue} from './hooks';
import Edit from './containers/edit';
import Home from './containers/home';
import Loader from './containers/loader';
import Detail from './containers/detail';

if (module.hot) {
  module.hot.accept();
}

const drawerWidth = 140;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  logo: {
    width: '80px',
    marginLeft: 'auto',
    marginRight: 'auto',
    margin: theme.spacing(1)
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  title: {
    textAlign: 'right',
    padding: theme.spacing(2),
    right: '1em'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
  },
  center: {
    textAlign: 'center'
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


  const actions = [
    {
      action: 'Edit',
      icon: () => <EditIcon/>,
      activePage: 'edit',
      description: 'Write down some thoughts'
    },
    {
      action: 'Navigate',
      icon: () => <FoldersIcon/>,
      activePage: 'home',
      description: 'Navigate ideas'
    }
  ];

  const handleRoute = activePage => {
    dispatch({type: 'GOTO', activePage});
  };

  const drawer = (
    <div className={classes.center}>
      <GEUT className={classes.logo}/>
      <Divider />
      <List>
        {actions.map(({action, icon, activePage}) => (
          <ListItem button key={action} onClick={() => handleRoute(activePage)}>
            <ListItemIcon>{icon()}</ListItemIcon>
            <ListItemText primary={action} />
          </ListItem>
        ))}
      </List>
      <Divider />
    </div>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <nav className={classes.drawer} aria-label="glp actions">
        <Drawer
          open
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      <main className={classes.content}>
        {switchcase({
          loading: () => <Fade in timeout={{enter: 200, exit: 200}}><Loader/></Fade>,
          edit: () => <Fade in timeout={{enter: 200, exit: 200}}><Edit /></Fade>,
          home: () => <Fade in timeout={{enter: 200, exit: 200}}><Home mainKey={mainArchive} extra={extArchives} metadata={metadata}/></Fade>,
          detail: () => <Fade in timeout={{enter: 200, exit: 200}}><Detail fileData={fileData}/></Fade>
        })(<Loader/>)(activePage)}
      </main>
    </div>
  );
}

export default AppContainer;
