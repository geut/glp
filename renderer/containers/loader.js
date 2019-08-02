import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  title: {
    textAlign: 'center',
    padding: theme.spacing(2)
  }
}));

const thoughts = [
  'Share your thougths with the decentralized world',
  'Thanks for using GLP',
  'Organize your ideas with GLP 💡'
];

const message = thoughts[Math.floor(Math.random() * thoughts.length)];
const Loader = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography gutterBottom variant="h5" className={classes.title}>
        {message}
      </Typography>
      <LinearProgress/>
    </div>
  );
};

export default Loader;
