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

  it('asLines', () => {
    const list = new CorrectionList([
      new Correction({ startLine: { number: 0 }, endLine: { number: 0 } }),
      new Correction({ startLine: { number: 0 }, endLine: { number: 0 } }),
      new Correction({ startLine: { number: 2 }, endLine: { number: 2 } }),
    ]);

    const lines = list.asLines();

    expect(Object.keys(lines).length).toBe(2);
    expect(lines[0].length).toBe(2);
    expect(lines[2].length).toBe(1);
  });
});
