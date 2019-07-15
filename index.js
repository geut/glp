'use strict';
const path = require('path');
const {format: formatUrl} = require('url');
const {app, BrowserWindow, Menu, fork} = require('electron');
/// const {autoUpdater} = require('electron-updater');
const {is} = require('electron-util');
const unhandled = require('electron-unhandled');
const debug = require('electron-debug');
const contextMenu = require('electron-context-menu');
const menu = require('./menu');
const findOpenSocket = require('./utils/find-open-socket');

unhandled();
debug();
contextMenu();

const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDevelopment && module.hot) {
  module.hot.accept();
}

// Note: Must match `build.appId` in package.json
app.setAppUserModelId('com.company.AppName');

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const FOUR_HOURS = 1000 * 60 * 60 * 4;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow;
let serverProcess;
let serverSocket;

const createMainWindow = async socketName => {
  const win = new BrowserWindow({
    title: app.getName(),
    show: false,
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'client-preload.js')
    }
  });

  win.on('ready-to-show', () => {
    win.show();
  });

  win.on('closed', () => {
    // Dereference the window
    // For multiple windows store them in an array
    mainWindow = undefined;
  });

  // Await win.loadFile(path.join(__dirname, 'index.html'));
  if (isDevelopment) {
    win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    win.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }));
  }

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('set-socket', {
      name: socketName
    });
  });

  return win;
};

const createBackgroundWindow = socketName => {
  const win = new BrowserWindow({
    x: 500,
    y: 300,
    width: 700,
    height: 500,
    show: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('set-socket', {name: socketName});
  });

  win.loadFile(path.resolve(__dirname, 'dat-daemon-dev.html'));
  return win;
};

const createBackgroundProcess = socketName => {
  serverProcess = fork(path.join(__dirname, 'dat-daemon.js'), [
    '--subprocess',
    app.getVersion(),
    socketName
  ]);

  serverProcess.on('message', msg => {
    console.log(msg);
  });
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.show();
  }
});

app.on('window-all-closed', () => {
  if (!is.macos) {
    app.quit();
  }
});

app.on('activate', async () => {
  if (!mainWindow) {
    mainWindow = await createMainWindow();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});

(async () => {
  await app.whenReady();
  serverSocket = await findOpenSocket();
  Menu.setApplicationMenu(menu);
  mainWindow = await createMainWindow(serverSocket);

  if (isDevelopment) {
    createBackgroundWindow(serverSocket);
  } else {
    createBackgroundProcess(serverSocket);
  }
})();
