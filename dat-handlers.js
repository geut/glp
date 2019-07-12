const assert = require('assert');
const {promisify} = require('util');
const mkdirp = require('mkdirp');
const dat = require('dat-node');
const Config = require('./config');

const pmkdirp = promisify(mkdirp);

/** Helpers **/
const defaultState = () => ({
  parents: []
});

function getFileContent(archive, path) {
  return new Promise((resolve, reject) => {
    // todo, check file type (mime type?)
    archive.readFile(path, 'utf-8', (err, content) => {
      if (err) reject(err);
      else resolve(content);
    })
  });
}

function getDirContent(archive, path){
  return new Promise((resolve, reject) => {
    archive.readdir(path, (err, files) => {
      if (err) reject(err);
      else {
        resolve(files);
      }
    });
  })
}

async function stat(archive, path) {
  return new Promise((resolve, reject) => {
    archive.stat(path, (err, stat) => {
      if (err) reject(err);
      else resolve(stat);
    })
  })
}

function buildPath(explorerState, filename) {
  const path = explorerState.parents.reduce((prev, curr) => {
    return `${prev}/${curr}`;
  }, '');
  return `${path}/${filename}`.replace(/^\/+/g, '');
}

async function buildFileItems(archive, list, explorerState=defaultState()) {
  console.log('buildFileItems triggered.');

  const fileItems = [];
  for (let i = 0; i < list.length; i++) {
    const filename = list[i];
    const fullPath = buildPath(explorerState, filename);
    const fileStat = await stat(archive, fullPath);

    const item = {
      title: filename,
      size: fileStat.size,
      modifiedTimestamp: fileStat.mtime.getTime(),
      nativeIndex: i,
      fullPath
    }

    if (!fileStat.isFile()) {
      item.children = [];
    }

    fileItems.push(item)
  }

  return fileItems;
}

/** END Helpers **/

class DatHandler {
  constructor() {
    this.messagesHistory = [];
    this.mainArchive = null;
    // external archives
    this.archives = [];
    this.keys = new Set();
  }

  ping() {
    return 'pong';
  }

  getMainArchive() {
    return this.mainArchive;
  }

  getArchives() {
    return Promise.resolve(this.archives);
  }

  addDat({isMain, key, datOpts}) {

    if (key && this.keys.has(key)) {
      console.log('Already loaded key. Nothing to do.');
      return;
    }

    let destDir = Config.get('directories').dest;
    if (isMain) {
      destDir = Config.get('directories').main;
    }

    const importOpts = {
      watch: true,
      resume: true,
      ignoreHidden: true,
      compareFileContent: true,
      ...datOpts
    }

    return new Promise((resolve, reject) => {
      dat(destDir, {key, sparse: true}, async (err, dat) => {
        if (err) {
          return reject(err);
        }

        dat.joinNetwork();

        dat.trackStats();

        if (dat.writable) {
          dat.importFiles(importOpts);
        }
        // TODO: emit dat loaded ok


        dat.archive.readFile('/dat.json', (err, content) => {
          let metadata = {metadata: {title: 'external Dat'}};
          if (err) {
            console.warn(err);
            return;
          }

          try {
            metadata = JSON.parse(content);
            // TODO: emit metadata
          } catch (_) {}
        });

        this.keys.add(dat.archive.key);
        if (isMain) {
          this.mainArchive = dat.archive;
        }
        else {
          this.archives.push(dat.archive);
        }
        resolve();
      });
    });
  }

  async getContent({ archive, path }) {
    path = path || '/';
    // FIXME @deka: I need to rethink this whole interaction. the archive is not being passed correctly
    // due to the stringify on the dat-ipc. So I can pass the archive key for ex, as an identifier to get
    // the selected hyperdrive content.
    const found = await stat(this.mainArchive, path);
    if (found.isFile()) {
      const fileContent = await getFileContent(archive, path);
      console.log('fileContent', fileContent);
    } else {
      // return files
      const list = await getDirContent(this.mainArchive, path);
      console.log({ list });
      const files = await buildFileItems(this.mainArchive, list);
      console.log({ files });
      return files;
    }
  }
};

module.exports = (opts) => new DatHandler(opts);
