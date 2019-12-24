'use strict';

const { describe, expect, it } = require('humile');
const {
  alignBlockByContent,
  correctionTextsFactory,
  extractTextSegments,
  extractTextSegmentsFromLine,
  groupCorrectionsByBlock,
  groupCorrectionsByLine,
} = require('../correctionTexts');
const Correction = require('../../../models/Correction');
const CorrectionList = require('../../../models/CorrectionList');

describe('reporters/correctionTexts', () => {
  it('should print each correction', () => {
    const builder = correctionTextsFactory({
      buildCorrection: correction => 'line' + correction.startLine.number,
      colors: true,
    });

    const list = new CorrectionList([
      newCorrection({ line: 0 }),
      newCorrection({ line: 2 }),
      newCorrection({ line: 2, linePosition: 1 }),
    ]);

    expect(builder(list, 'line 1\nline 2\nline 3')).toEqual([
      { newLine: true },
      [
        { color: 'gray', newLine: undefined, text: ' 1 │ ', wrap: undefined },
        { color: 'red', newLine: undefined, text: 'line ', wrap: undefined },
        { color: undefined, newLine: undefined, text: '1', wrap: undefined },
        { color: undefined, newLine: true, text: undefined, wrap: undefined },
        { color: 'gray', newLine: undefined, text: ' 2 │ ', wrap: undefined },
        {
          color: undefined,
          newLine: undefined,
          text: 'line 2',
          wrap: undefined,
        },
        { color: undefined, newLine: true, text: undefined, wrap: undefined },
        { color: 'gray', newLine: undefined, text: ' 3 │ ', wrap: undefined },
        { color: 'red', newLine: undefined, text: 'line 3', wrap: undefined },
        { color: undefined, newLine: true, text: undefined, wrap: undefined },
      ],
      { newLine: true },
      'line0', { newLine: true },
      'line2', { newLine: true },
      'line2', { newLine: true },
      { newLine: true },
    ]);
  });

  describe('groupCorrectionsByBlock', () => {
    it('when one suggestion per block', () => {
      const corrections = newCorrList([2]);

      const blocks = groupCorrectionsByBlock(corrections, 10);

      expect(blocks.length).toBe(1);
      expect(blocks[0].line).toBe(2);
      expect(blocks[0].corrections.length).toBe(1);
    });

    it('when multiple suggestions block', () => {
      const corrections = newCorrList([2, 4, 6]);

      const blocks = groupCorrectionsByBlock(corrections, 10);

      expect(blocks.length).toBe(1);
      expect(blocks[0].line).toBe(2);
      expect(blocks[0].corrections.length).toBe(3);
    });

    it('when multiple blocks', () => {
      const corrections = newCorrList([2, 4, 6, 7]);

      const blocks = groupCorrectionsByBlock(corrections, 10);

      expect(blocks.length).toBe(2);
      expect(blocks[0].line).toBe(2);
      expect(blocks[1].line).toBe(7);
    });
  });

  it('groupCorrectionsByLine', () => {
    const list = newCorrList([0, 0, 2]);

    const lines = groupCorrectionsByLine(list);

    expect(Object.keys(lines).length).toBe(2);
    expect(lines[0].length).toBe(2);
    expect(lines[2].length).toBe(1);
  });

  describe('alignBlockByContent', () => {
    it('when correction in the text start than do not change', () => {
      const block = newBlock(0, 0);
      expect(alignBlockByContent(block, 10)).toBe(0);
    });

    it('when correction in the start of the block ', () => {
      const block = newBlock(3, 3);
      expect(alignBlockByContent(block, 10)).toBe(1);
    });

    it('when correction in the middle then keep the same position', () => {
      const block = newBlock(2, 4);
      expect(alignBlockByContent(block, 10)).toBe(2);
    });

    it('when correction in the end of the block ', () => {
      const block = newBlock(3, 7);
      expect(alignBlockByContent(block, 10)).toBe(5);
    });

    it('when correction in the end of the text ', () => {
      const block = newBlock(9, 9);
      expect(alignBlockByContent(block, 10)).toBe(5);
    });

    function newBlock(line, correctionLines) {
      if (!Array.isArray(correctionLines)) {
        correctionLines = [correctionLines];
      }

      return {
        line,
        corrections: correctionLines.map(l => newCorrection({ line: l })),
      };
    }
  });

  it('extractTextSegments', () => {
    const text = [
      'line 1',
      'line 2',
      'line 3',
    ];
    const corrections = [
      newCorrection({ line: 0 }),
      newCorrection({ line: 2 }),
      newCorrection({ line: 2, linePosition: 1 }),
    ];

    const printItems = extractTextSegments(corrections, text, 0, 2);

    expect(printItems).toEqual([
      { color: 'gray', text: ' 1 │ ' },
      { isMistake: true, text: 'line ' },
      { isMistake: false, text: '1' },
      { newLine: true },
      { color: 'gray', text: ' 2 │ ' },
      { isMistake: false, text: 'line 2' },
      { newLine: true },
      { color: 'gray', text: ' 3 │ ' },
      { isMistake: true, text: 'line 3' },
      { newLine: true },
    ]);
  });

  describe('extractTextSegmentsFromLine', () => {
    const text = 'abcdefghijklmnopqrstuvwxyz';

    it('should return a single fragment if no corrections', () => {
      const fragments = extractTextSegmentsFromLine(text, []);

      expect(fragments).toEqual([
        { text, isMistake: false },
      ]);
    });

    it('should split into mistake/correct fragments', () => {
      const corrections = [
        newCorrection({ linePosition: 0 }),
        newCorrection({ linePosition: 3 }),
        newCorrection({ linePosition: 15 }),
      ];

      const fragments = extractTextSegmentsFromLine(text, corrections);

      expect(fragments).toEqual([
        { text: 'abcdefgh', isMistake: true },
        { text: 'ijklmno', isMistake: false },
        { text: 'pqrst', isMistake: true },
        { text: 'uvwxyz', isMistake: false },
      ]);
    });
  });
});

function newCorrection({ length = 5, line = 0, linePosition = 0 }) {
  return new Correction({
    length,
    startLine: { number: line, position: linePosition },
    endLine: { number: line, position: linePosition },
  });
}

function newCorrList(lines) {
  return new CorrectionList(lines.map(l => newCorrection({ line: l })));
}
