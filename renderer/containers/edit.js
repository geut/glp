import React, {useEffect, useState} from 'react';
import {DraftailEditor, BLOCK_TYPE, INLINE_STYLE} from 'draftail';
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin';

import {useStateValue} from '../hooks';

const inlineToolbarPlugin = createInlineToolbarPlugin();
const { InlineToolbar } = inlineToolbarPlugin;

const onSave = async content => {
  console.log('saving', content);
  // SessionStorage.setItem("draftail:content", JSON.stringify(content))
  //await send
};

const Edit = props => {
  return (
    <DraftailEditor
      plugins={[inlineToolbarPlugin]}
      rawContentState={null}
      maxListNesting={16}
      blockTypes={[
        {type: BLOCK_TYPE.HEADER_ONE},
        {type: BLOCK_TYPE.HEADER_TWO},
        {type: BLOCK_TYPE.HEADER_THREE},
        {type: BLOCK_TYPE.HEADER_FOUR},
        {type: BLOCK_TYPE.HEADER_FIVE},
        {type: BLOCK_TYPE.UNORDERED_LIST_ITEM},
        {type: BLOCK_TYPE.ORDERED_LIST_ITEM},
        {type: BLOCK_TYPE.CODE}
      ]}
      inlineStyles={[{type: INLINE_STYLE.BOLD}, {type: INLINE_STYLE.ITALIC}]}
      onSave={onSave}
      showUndoControl
      showRedoControl
      enableHorizontalRule
      topToolbar={null}
      bottomToolbar={props => (
        <InlineToolbar {...props}/>
      )}
    />

  );
};

export default Edit;

