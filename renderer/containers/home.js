import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import SortableTree, {changeNodeAtPath} from 'react-sortable-tree';
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
  const [treeData, setTreeData] = useState(props.metadata);

  console.log(treeData);
  const handleChange = event => {
    setFilter(event.target.value);
  };

  const getNodeKey = ({ treeIndex }) => treeIndex;

  const updateTree = async ({treeData: td, node, expanded, path}) => {
    console.log({expanded})
    if (!expanded) return;
    if (node.children[0].title) return;
    console.log({node})
    const content = await window.send('getContent', {key: node.url});
    console.log({content})
    // update treedata node children
    const newTree = changeNodeAtPath({
      treeData: td,
      path,
      getNodeKey,
      newNode: {
        ...node,
        children: content
      }
    })

    setTreeData(newTree);
  }

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
            onVisibilityToggle={updateTree}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}

Home.defaultProps = {
  mainKey: '',
  archives: [],
  metadata: []
};

Home.propTypes = {
  mainKey: PropTypes.string,
  archives: PropTypes.array,
  metadata: PropTypes.array
};

export default Home;
