import React, {useEffect, useState} from 'react';
import { DraftailEditor, BLOCK_TYPE, INLINE_STYLE } from 'draftail';

import {useStateValue} from '../hooks';

const onSave = (content) => {
  console.log("saving", content)
  // sessionStorage.setItem("draftail:content", JSON.stringify(content))
}

const Edit = props => {
  return (
    <DraftailEditor
      rawContentState={null}
      onSave={onSave}
      blockTypes={[
        { type: BLOCK_TYPE.HEADER_THREE },
        { type: BLOCK_TYPE.UNORDERED_LIST_ITEM },
      ]}
      inlineStyles={[{ type: INLINE_STYLE.BOLD }, { type: INLINE_STYLE.ITALIC }]}
    />
  )
}

export default Edit;

