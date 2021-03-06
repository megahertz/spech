'use strict';

const { describe, expect, it } = require('humile');
const Correction = require('../Correction');
const CorrectionList = require('../CorrectionList');

describe('CorrectionList', () => {
  it('filterUnique', () => {
    const list = new CorrectionList([
      new Correction({ position: 0, length: 4, provider: 'test' }),
      new Correction({ position: 0, length: 4, provider: 'test2' }),
    ]);

    const filtered = list.filterUnique(['test', 'test2']);

    expect(filtered.map(c => c.provider)).toEqual(['test']);
  });
});
