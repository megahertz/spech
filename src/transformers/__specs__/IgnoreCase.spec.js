'use strict';

const { describe, expect, it } = require('humile');
const IgnoreCase = require('../IgnoreCase');

describe('transformers/IgnoreCase', () => {
  it('should reject a correction if a suggestion is in another case', () => {
    const transformer = new IgnoreCase();

    const correction = {
      fragment: 'TEST',
      suggestions: ['test'],
    };

    expect(transformer.modifyCorrection(correction)).toBe(null);
  });
});
