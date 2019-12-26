'use strict';

const fs = require('fs');
const path = require('path');
const Document = require('../../../models/Document');

const cache = {};
function readDocument(fileName) {
  if (!cache[fileName]) {
    cache[fileName] = fs.readFileSync(path.join(__dirname, fileName), 'utf8');
  }

  return cache[fileName];
}

function loadFixture(fileName) {
  const content = readDocument(fileName);
  return new Document(fileName, content, Document.Format.markdown);
}

module.exports = {
  createDirectiveDoc: () => loadFixture('directive.md'),
};
