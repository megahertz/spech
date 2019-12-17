'use strict';

const fs = require('fs');
const path = require('path');

function loadFixture(fileName) {
  return fs.readFileSync(path.join(__dirname, fileName), 'utf8');
}

const loremIpsumIndexes = [
  0, 21, 96, 174, 252, 331, 407, 479, 551, 596, 597, 615, 694, 771, 847, 926,
  1004, 1083, 1153, 1229, 1230, 1231, 1256, 1330, 1404, 1476, 1544, 1616, 1691,
  1763, 1833, 1906, 1982, 2020, 2021, 2096, 2172, 2244,
];

module.exports = {
  loremIpsum: loadFixture('loremIpsum.txt'),
  loremIpsumIndexes,
  codeBlocks: loadFixture('code-blocks.markdown'),
};
