import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';

const useStyles = makeStyles(theme => ({
  filter: {
    textAlign: 'center',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  treeContainer: {
    display: 'block',
    width: '90%'
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary
  }
}));

function Home(props) {
  const classes = useStyles();
  const [filter, setFilter] = useState('');
  const [treeData, setTreeData] = useState(props.content);

  console.log(treeData);
  const handleChange = event => {
    setFilter(event.target.value);
  };

  /*
  useEffect(() => {
    const meta2 = props.archives.map(a => a.metadata)
    setTreeData([props.main.metadata, ...meta2]);
  }, [props.main.metadata, props.archives]);
  */

  return (
    <Grid
      container
      direction="column"
      justify="space-around"
      alignItems="center"
      spacing={4}
    >
      <Grid item xs={12}>
        <TextField
          id="filter-content"
          label="Filter..."
          className={classes.filter}
          value={filter}
          margin="normal"
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} className={classes.treeContainer}>
        <Paper className={classes.paper}>
          <SortableTree
            treeData={treeData}
            isVirtualized={false}
            onChange={treeData => setTreeData(treeData)}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}

Home.defaultProps = {
  main: {},
  archives: []
};

Home.propTypes = {
  main: PropTypes.object,
  archives: PropTypes.array
};

export default Home;
