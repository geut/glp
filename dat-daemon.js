// Dat daemon ipc
const serverHandlers = require('./dat-handlers')();
const ipc = require('./dat-ipc');

let isDev;
let version;

if (process.argv[2] === '--subprocess') {
  isDev = false;
  version = process.argv[3];

  const socketName = process.argv[4];
  ipc.init(socketName, serverHandlers);
} else {
  const {ipcRenderer, remote} = require('electron');
  isDev = true;
  version = remote.app.getVersion();

  ipcRenderer.on('set-socket', (event, {name}) => {
    ipc.init(name, serverHandlers);
  });
}

console.log(version, isDev);
