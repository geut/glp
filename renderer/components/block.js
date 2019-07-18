import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';

import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    display: 'flex'
  },
  block: {
    borderRadius: '40px 10px',
    backgroundColor: 'gray'
  }
}));

const Block = props => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Paper className={classes.block}>
        <h1>{props.title}</h1>
        <pre>
          {props.content}
        </pre>
      </Paper>
    </div>
  );
};

Block.defaultProps = {
  title: ''
};

Block.propTypes = {
  content: PropTypes.string.isRequired,
  title: PropTypes.string
};

export default Block;
