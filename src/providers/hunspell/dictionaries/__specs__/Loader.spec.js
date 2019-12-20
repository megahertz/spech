'use strict';

const { describe, expect, it } = require('humile');
const path = require('path');
const Loader = require('../Loader');

describe('hunspell/Loader', () => {
  it('loadFromDir', async () => {
    const dictPath = path.join(__dirname, 'fixtures/en-us');
    const dict = await create().loadFromDir(dictPath, false);
    expect(dict.aff.length).toBe(3);
    expect(dict.dic.length).toBe(3);
  });
});

function create() {
  return new Loader('en-us');
}
