const assert = require('assert');
const {pipeline} = require('stream');
const {promises: fsPromises, createWriteStream} = require('fs');
const {join} = require('path');
const {promisify} = require('util');
const mkdirp = require('mkdirp');
const dat = require('dat-node');
const fileType = require('file-type');
const Config = require('./config');

const {access} = fsPromises;
const pmkdirp = promisify(mkdirp);
const ppipeline = promisify(pipeline);

/** Helpers **/
const defaultState = () => ({
  parents: []
});

function getFileContent(archive, path) {
  return new Promise((resolve, reject) => {
    // Todo, check file type (mime type?)
    archive.readFile(path, 'utf-8', (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}

function getDirContent(archive, path) {
  return new Promise((resolve, reject) => {
    archive.readdir(path, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

async function stat(archive, path) {
  return new Promise((resolve, reject) => {
    archive.stat(path, (err, stat) => {
      if (err) {
        reject(err);
      } else {
        resolve(stat);
      }
    });
  });
}

function buildPath(parentPath, filename) {
  const path = join(parentPath, filename);
  return path.replace(/^\/+/g, '');
}

async function buildFileItems(archive, list, parentPath) {
  console.log('buildFileItems triggered.');

  const fileItems = [];
  for (let i = 0; i < list.length; i++) {
    const filename = list[i];
    const fullPath = buildPath(parentPath, filename);
    const fileStat = await stat(archive, fullPath);

    const item = {
      url: archive.key.toString('hex'),
      title: filename,
      size: fileStat.size,
      modifiedTimestamp: fileStat.mtime.getTime(),
      nativeIndex: i,
      fullPath
    };

    if (!fileStat.isFile()) {
      item.children = [];
    }

    fileItems.push(item);
  }

  return fileItems;
}

/** END Helpers **/

class DatHandler {
  constructor() {
    this.messagesHistory = [];
    this.mainArchive = null;
    // External archives
    this.archives = new Map();
    this.metadata = new Map();
    this.defaultMetadata = {
      children: []
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
    return Promise.resolve([...this.metadata.values()]);
  }

  async addDat({isMain, key, datOpts}) {
    if (key && this.archives.has(key)) {
      console.log('Already loaded key. Nothing to do.');
      return;
    }

    let destDir = Config.get('directories').main;
    if (!isMain) {
      destDir = Config.get('directories').dest;
    }

    const importOpts = {
      watch: true,
      resume: true,
      ignoreHidden: true,
      compareFileContent: true,
      ...datOpts
    };

    const getDatJSON = async archive => {
      return new Promise((resolve, reject) => {
        archive.readFile('dat.json', (err, content) => {
          let metadata = {
            ...this.defaultMetadata,
            url: archive.key.toString('hex'),
            fullPath: archive.key.toString('hex').slice(0, 6),
            title: archive.key.toString('hex').slice(0, 6),
            description: 'External Dat'
          };
          if (err) {
            console.warn(err);
            return resolve(metadata);
          }

          try {
            const rawMeta = JSON.parse(content);
            metadata = {...this.defaultMetadata, ...rawMeta, fullPath: rawMeta.title, url: archive.key.toString('hex')};
            // TODO: emit metadata :thinking_face:
          } catch (_) {}

          resolve(metadata);
        });
      });
    };

    let pathkey = key;
    if (key && key.startsWith('dat://')) {
      pathkey = key.slice(6, key.length);
      destDir = join(destDir, pathkey);
      await pmkdirp(destDir);
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
        this.metadata.set(key, datJSON);

        if (isMain) {
          this.mainArchive = key;
        }

        this.archives.set(key, dat.archive);

        resolve(key);
      });
    });
  }

  async downloadFile(archive, filename, filePath) {
    return new Promise((resolve, reject) => {
      pipeline(
        archive.createReadStream(filename),
        createWriteStream(filePath),
        err => {
          if (err) {
            console.error(err);
            return reject(err);
          }

          console.log('File saved succesfully');
          return resolve();
        }
      );
    });
  }

  async checkAccess(filePath) {
    try {
      await access(filePath);
      return true;
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  async getFileTypeAndPath({key, filename}) {
    assert.ok(key, 'key is required');
    assert.ok(filename, 'filename is required');
    const isMain = this.mainArchive === key;
    const dirs = Config.get('directories');
    const archive = this.archives.get(key);
    const read = archive.createReadStream(filename);
    let filePath = join(isMain ? dirs.main : dirs.dest, filename);

    if (!isMain) {
      filePath = join(isMain ? dirs.main : dirs.dest, key, filename);
      const parent = join(isMain ? dirs.main : dirs.dest, key);
      await pmkdirp(parent);
      const exists = await this.checkAccess(filePath);
      if (!exists) {
        // File does not exists, dwld it
        await this.downloadFile(archive, filename, filePath);
      }
    }

    const ftStream = await fileType.stream(read);
    return {fileType: ftStream.fileType, filePath};
  }

  async getContent({key, path}) {
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
      // Return files
      const list = await getDirContent(archive, path);
      console.log({list});
      const files = await buildFileItems(archive, list, path);
      console.log({files});
      return files;
    }
  }
}

module.exports = opts => new DatHandler(opts);
