'use strict';

const { describe, expect, it } = require('humile');
const Dictionary = require('../../models/Dictionary');
const InDictionary = require('../InDictionary');

describe('transformers/InDictionary', () => {
  it('should return a correction if it is not in the dictionary', () => {
    const transformer = new InDictionary(new Dictionary(['example']));

    const correction = {
      fragment: 'TEST',
    };

    expect(transformer.modifyCorrection(correction)).toBe(correction);
  });

  it('should reject a correction if it is in the dictionary', () => {
    const transformer = new InDictionary(new Dictionary(['test']));

    const correction = {
      fragment: 'TEST',
    };

    expect(transformer.modifyCorrection(correction)).toBe(null);
  });
});
