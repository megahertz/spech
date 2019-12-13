'use strict';

const { describe, expect, it } = require('humile');
const { correctionListFactory } = require('../correctionList');
const Correction = require('../../../models/Correction');
const CorrectionList = require('../../../models/CorrectionList');

describe('correctionList', () => {
  it('should print each correction', () => {
    const builder = correctionListFactory({
      buildCorrection: (correction) => 'line' + correction.startLine.number,
    });

    const list = new CorrectionList([
      new Correction({ startLine: { number: 0 }, endLine: { number: 0 }}),
      new Correction({ startLine: { number: 0 }, endLine: { number: 0 }}),
      new Correction({ startLine: { number: 2 }, endLine: { number: 2 }}),
    ]);

    expect(builder(list)).toEqual([
      'line0',
      { newLine: true },
      'line0',
      { newLine: true },
      'line2',
      { newLine: true },
    ])
  })
});
