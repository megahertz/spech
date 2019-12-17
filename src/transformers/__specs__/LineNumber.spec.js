'use strict';

const { describe, expect, it } = require('humile');
const LineNumber = require('../LineNumber');
const {
  loremIpsum,
  loremIpsumIndexes,
} = require('../../__specs__/fixtures');

describe('transformers/LineNumber', () => {
  describe('modifyText', () => {
    it('returns empty array for empty texts', () => {
      expect(create('').index).toEqual([0]);
    });

    it('returns on item for single line text', () => {
      expect(create('test').index).toEqual([0]);
    });

    it('returns correct index for loreIpsum with LF in the end', () => {
      expect(create().index).toEqual(loremIpsumIndexes);
    });

    it('returns correct index for text', () => {
      expect(create(loremIpsum + '~').index)
        .toEqual(loremIpsumIndexes.concat(2317));
    });
  });

  describe('getFragmentLines', () => {
    it('returns null if fragment is out of range', () => {
      expect(create('test').getFragmentLines(0, 5)).toEqual(null);
    });

    describe('should calculate for single-line text', () => {
      it('when start from 0', () => {
        expect(create('test').getFragmentLines(0, 2)).toEqual({
          startLine: { number: 0, position: 0 },
          endLine: { number: 0, position: 2 },
        });
      });

      it('when start from the middle', () => {
        expect(create('test').getFragmentLines(1, 2)).toEqual({
          startLine: { number: 0, position: 1 },
          endLine: { number: 0, position: 3 },
        });
      });

      it('when in the end', () => {
        expect(create('test').getFragmentLines(2, 2)).toEqual({
          startLine: { number: 0, position: 2 },
          endLine: { number: 0, position: 4 },
        });
      });
    });

    describe('should calculate for multi-line text', () => {
      // f i r s t \n s e c o n  d
      // 0 1 2 3 4 5  6 7 8 9 10 11
      it('when fragment is only on the first line', () => {
        expect(create('first\nsecond').getFragmentLines(0, 5)).toEqual({
          startLine: { number: 0, position: 0 },
          endLine: { number: 0, position: 5 },
        });
      });

      it('when fragment is only on the second line', () => {
        expect(create('first\nsecond').getFragmentLines(6, 6)).toEqual({
          startLine: { number: 1, position: 0 },
          endLine: { number: 1, position: 6 },
        });
      });

      it('when fragment is between lines', () => {
        expect(create('first\nsecond').getFragmentLines(3, 6)).toEqual({
          startLine: { number: 0, position: 3 },
          endLine: { number: 1, position: 3 },
        });
      });

      it('when fragment is in the end', () => {
        expect(create('first\nsecond').getFragmentLines(8, 4)).toEqual({
          startLine: { number: 1, position: 2 },
          endLine: { number: 1, position: 6 },
        });
      });
    });
  });
});

/**
 *
 * @param {string} text
 * @return {LineNumber}
 */
function create(text = loremIpsum) {
  const transformer = new LineNumber();
  transformer.modifyText(text);
  return transformer;
}
