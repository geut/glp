import React, { useState } from 'react';
import Config from '../config';
// get dat daemon ipc api
const DatContext = React.createContext([{}, () => {}]);

function assignDat(datDaemonInstance) {

}

const DatContextProvider = async (props) => {
  // start dat daemon ipc api, loading default dats & user dat
  const [datInfo, setDatInfo] = useState({})
  return datReady ? (
    <DatContext.Provider value={}>
      {props.children}
    </DatContext.Provider>
  ) : null
}

export default { DatContext, DatContextProvider }
