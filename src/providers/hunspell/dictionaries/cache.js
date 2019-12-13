'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const nodeVersion = Number(
  process.version.match(/^v(\d+\.\d+)/)[1].replace(/\.(\d)$/, '.0$1')
);

module.exports = {
  createCacheDir,
  getCachePath,
};

/**
 * @param {string} subDir
 * @return {string}
 */
function createCacheDir(subDir) {
  const targetPath = getCachePath(subDir);
  mkDir(targetPath);
  return targetPath;
}

/**
 * @param {string} subDir
 * @return {string}
 */
function getCachePath(subDir = '') {
  const home = os.homedir();
  const name = 'spech.js';
  const targetSubDir = path.join(name, subDir);

  switch (process.platform) {
    case 'darwin': {
      return path.join(home, 'Library', 'Caches', targetSubDir);
    }

    case 'win32': {
      if (process.env.LOCALAPPDATA) {
        return path.join(process.env.LOCALAPPDATA, targetSubDir);
      }

      return path.join(home, 'Appdata', 'Local', targetSubDir);
    }

    default: {
      if (process.env.XDG_CACHE_HOME) {
        return path.join(process.env.XDG_CACHE_HOME, name);
      }

      return path.join(home, '.cache', name);
    }
  }
}

function mkDir(dirPath) {
  if (nodeVersion >= 10.12) {
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }

  try {
    fs.mkdirSync(dirPath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return mkDir(path.dirname(dirPath)) && mkDir(dirPath);
    }

    try {
      if (fs.statSync(dirPath).isDirectory()) {
        return true;
      }

      // noinspection ExceptionCaughtLocallyJS
      throw error;
    } catch (e) {
      throw e;
    }
  }
}
