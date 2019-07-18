import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import DescriptionIcon from '@material-ui/icons/Description';

import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  }
}));

const ContentButton = props => {
  const {rowInfo, renderContent} = props;
  const classes = useStyles();

  if (rowInfo.node.children) {
    return '';
  }

  return (
    <IconButton
      className={classes.button}
      aria-label="render content"
      onClick={() => renderContent(rowInfo)}
    >

      <DescriptionIcon/>
    </IconButton>
  );
};

ContentButton.defaultProps = {
  rowInfo: {}
};

ContentButton.propTypes = {
  renderContent: PropTypes.func.isRequired,
  rowInfo: PropTypes.object
};

export default ContentButton;
