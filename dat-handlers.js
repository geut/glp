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
    this.archives = new Map();
    this.metadata = new Map();
    this.defaultMetadata = {
      children: [{}]
    };
  }

  ping() {
    return 'pong';
  }

  getMainArchive() {
    return this.mainArchive;
  }

  getArchives() {
    return Promise.resolve(this.archives.keys());
  }

  getMetadata() {
    return Promise.resolve(Array.from(this.metadata.values()));
  }

  addDat({isMain, key, datOpts}) {

    if (key && this.archives.has(key)) {
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

    const getDatJSON = async (archive) => {
      return new Promise((resolve, reject) => {
        archive.readFile('/dat.json', (err, content) => {
          let metadata = {
            ...this.defaultMetadata,
            url: archive.key.toString('hex'),
            title: archive.key.toString('hex').slice(0, 6),
            description: 'External Dat'
          };
          if (err) {
            console.warn(err);
            return resolve(metadata)
          }

          try {
            const rawMeta = JSON.parse(content);
            metadata = {...this.defaultMetadata, ...rawMeta, url: archive.key.toString('hex')};
            resolve(metadata)
            // TODO: emit metadata :thinking_face:
          } catch (_) {}
        });
      })
    }

    return new Promise((resolve, reject) => {
      dat(destDir, {key, sparse: true}, async (err, dat) => {
        if (err) {
          return reject(err);
        }

        key = dat.archive.key.toString('hex');

        dat.joinNetwork();

        dat.trackStats();

        if (dat.writable) {
          dat.importFiles(importOpts);
        }

        // TODO: emit dat loaded ok

        const datJSON = await getDatJSON(dat.archive);
        console.log({datJSON})
        this.metadata.set(key, datJSON);

        if (isMain) {
          this.mainArchive = key;
        }

        this.archives.set(key, dat.archive);

        resolve(key);
      });
    });
  }

  async getContent({ key, path }) {
    path = path || '/';
    // FIXME @deka: I need to rethink this whole interaction. the archive is not being passed correctly
    // due to the stringify on the dat-ipc. So I can pass the archive key for ex, as an identifier to get
    // the selected hyperdrive content.
    const archive = this.archives.get(key);
    const found = await stat(archive, path);
    if (found.isFile()) {
      const fileContent = await getFileContent(archive, path);
      console.log('fileContent', fileContent);
    } else {
      // return files
      const list = await getDirContent(archive, path);
      console.log({ list });
      const files = await buildFileItems(archive, list);
      console.log({ files });
      return files;
    }
  }
};

module.exports = (opts) => new DatHandler(opts);
