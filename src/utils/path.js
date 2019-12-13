'use strict';

const path = require('path');

module.exports = {
  shortenPath,
};

function shortenPath(rootPath, absolutePath) {
  if (!rootPath) {
    return absolutePath;
  }

  if (!absolutePath.startsWith('/')) {
    return absolutePath;
  }

  const relativePath = path.relative(rootPath, absolutePath);
  if (relativePath.startsWith(path.join('..', '..', '..'))) {
    return absolutePath;
  }

  if (relativePath.length > absolutePath) {
    return absolutePath;
  }

  return relativePath;
}
