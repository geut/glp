import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import LinearProgress from '@material-ui/core/LinearProgress';

import {useStateValue} from '../hooks';

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
  const [, dispatch] = useStateValue();
  const [filter, setFilter] = useState('');
  const [treeData, setTreeData] = useState(props.metadata);

  console.log({treeData});

  const handleChange = event => {
    setFilter(event.target.value);
  };

  const findInTree = (element, findKey, key, children) => {
    if (element[findKey] === key) {
      if (children) {
        element.children = children;
      }

      return element;
    }

    if (element.children) {
      let result;
      for (const el of element.children) {
        result = findInTree(el, findKey, key, children);
        if (result) {
          return result;
        }
      }
    }

    return null;
  };

  const updateTree = async ({node, expanded}) => {
    const [key, title, fullPath, basePath] = node.split('_');
    if (!expanded) {
      return;
    }

    // TODO:
    // - get the node from treeData
    // - iterate structure looking for the node containing `node === treeData.item.url`
    // - if (node.children[0].title) return; // already has childrens, nothing to do.
    // check if it was already updated (has childrens)
    console.log({key, fullPath, basePath});

    const content = await window.send('getContent', {key, path: basePath ? basePath : fullPath});

    // Note(dk): update treedata node children
    const newTree = [...treeData];
    let rootIdx;
    for (let i = 0; i < newTree.length; i++) {
      if (newTree[i].url === key) {
        rootIdx = i;
        break;
      }
    }

    findInTree(newTree[rootIdx], 'fullPath', fullPath, content);
    setTreeData(newTree);
  };

  const renderContent = nodeInfo => {
    dispatch({
      type: 'GOTO',
      activePage: 'detail',
      state: {
        fileData: nodeInfo
      }
    });
  };

  const getNodeId = (item, rootKey, path) => {
    if (item.fullPath) {
      return `${rootKey}_${item.title}_${item.fullPath}_${path ? path : ''}`;
    }

    return `${rootKey}_${item.title}_${item.title}_${path ? path : ''}`;
  };

  const renderTreeItem = (item, rootKey, path = '') => {
    if (!item.children) {
      return (
        <TreeItem
          nodeId={getNodeId(item, rootKey)}
          label={item.title}
          onClick={() => renderContent(item)}
        />
      );
    }

    return (
      <TreeItem nodeId={getNodeId(item, rootKey, path)} label={item.title}>
        {item.children[0] ? item.children.map(i => renderTreeItem(i, rootKey)) : <LinearProgress/>}
      </TreeItem>
    );
  };

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
          <TreeView
            defaultCollapseIcon={<ExpandMoreIcon/>}
            defaultExpandIcon={<ChevronRightIcon/>}
            onNodeToggle={async (nodeId, expanded) => updateTree({node: nodeId, expanded})}
          >
            {treeData.map(root => renderTreeItem(root, root.url, '/'))}
          </TreeView>
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
