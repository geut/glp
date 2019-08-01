import {promises as fs} from 'fs';
import React, {useEffect, useState} from 'react';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import LinearProgress from '@material-ui/core/LinearProgress';
import {makeStyles} from '@material-ui/core/styles';
import {useStateValue} from '../hooks';
import Block from '../components/block';

const {readFile} = fs;

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

// NOTE(dk): move to components/ dir as a new component ...
const SimpleLoader = () => {
  const [, dispatch] = useStateValue();

  const goHome = e => {
    e.preventDefault();
    dispatch({
      type: 'GOTO',
      activePage: 'home'
    });
  };

  return (
    <div>
      <Breadcrumbs aria-label="Breadcrumb">
        <Link color="inherit" href="/" onClick={goHome}>
          Home
        </Link>
      </Breadcrumbs>
      <LinearProgress/>
      <Typography gutterBottom align="center" variant="h6">
        Fetching file...
      </Typography>
    </div>
  );
};

const Detail = props => {
  const classes = useStyles();
  const [, dispatch] = useStateValue();
  const [fileContent, setFileContent] = useState();
  const {fileData} = props;

  useEffect(() => {
    const getFile = async () => {
      console.log('retrieving file...');
      const {fileType, filePath} = await window.send('getFileTypeAndPath', {key: fileData.url, filename: fileData.fullPath});
      console.log({fileType, filePath});
      if (fileType === undefined) {
        // TODO(deka): check nodeInfo.node.title extension
        // it will probably rendered inside a code block element.
        const fc = await readFile(filePath);
        console.log({fc});
        // TODO(deka): IMPROVE THIS.
        setFileContent(fc.toString());
      } else {
        // TODO(deka): check fileType.ext for choosing the right representation element
        console.log('render not supported yet');
      }
    };

    getFile();
  }, [fileData]);

  const goHome = e => {
    e.preventDefault();
    dispatch({
      type: 'GOTO',
      activePage: 'home'
    });
  };

  return (
    <div>
      {fileContent ?
        <>
          <Breadcrumbs aria-label="Breadcrumb">
            <Link color="inherit" href="/" onClick={goHome}>
              Home
            </Link>
            <Typography color="textPrimary">{fileData.title}</Typography>
          </Breadcrumbs>
          <div>
            <Block content={fileContent} title={fileData.title}/>
          </div>
        </> :
        <SimpleLoader/>}
    </div>
  );
};

Detail.propTypes = {
  fileData: PropTypes.object.isRequired
};

export default Detail;
