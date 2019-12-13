'use strict';

const { describe, expect, it } = require('humile');
const Dictionary = require('../Dictionary');

describe('Dictionary', () => {
  describe('addItem', () => {
    it('should not add wrong values', () => {
      const dic = new Dictionary();

      dic.add('');
      dic.add(null);
      dic.add('# test');

      expect(dic.stringItems.size).toBe(0);
    });

    it('should add string values', () => {
      const dic = new Dictionary();

      dic.add('test');
      dic.add('test 2');
      dic.add('/likeRegexp');

      expect(dic.stringItems.size).toBe(3);
    });

    it('should add regexp values', () => {
      const dic = new Dictionary();

      dic.add('/test/');
      dic.add('/test/u');
      dic.add('/\\/test/iu');

      expect(dic.stringItems.size).toBe(0);
      expect(dic.regexpItems.length).toBe(3);
    });
  });

  describe('includes', () => {
    it('returns true for string match', () => {
      const dic = new Dictionary();
      dic.add(' test ');
      expect(dic.includes(' test')).toBe(true);
    });

    it('returns false if not includes', () => {
      const dic = new Dictionary();
      dic.add(' test ');
      expect(dic.includes('not-exists')).toBe(false);
    });

    it('returns true for regexp', () => {
      const dic = new Dictionary();
      dic.add('/\\d-\\d-\\d/');
      expect(dic.includes('1-2-3')).toBe(true);
    });
  });
});
