'use strict';

const { describe, expect, it } = require('humile');
const Document = require('../Document');

describe('Document', () => {
  describe('addCorrection', () => {
    it('should add correction if it contains valid position', () => {
      const doc = new Document(null, 'test');

      doc.addCorrection({
        position: 0,
        length: 4,
      }, 'test');

      expect(doc.corrections.items.length).toBe(1);
    });

    it('should skip correction if it contains wrong position', () => {
      const doc = new Document(null, 'test');

      doc.addCorrection({
        position: 0,
        length: 5,
      }, 'test');

      expect(doc.corrections.items.length).toBe(0);
    });
  });
});
