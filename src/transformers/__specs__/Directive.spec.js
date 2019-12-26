'use strict';

const { describe, expect, it } = require('humile');

const Directive = require('../Directive');
const { createDirectiveDoc } = require('./fixtures');

describe('transformers/Directive', () => {
  it('should remove directive blocks', () => {
    const transformer = new Directive();

    const document = transformer.modifyDocument(createDirectiveDoc());

    expect(document.textForChecking).toBe([
      'Before directives',
      '',
      '',
      'After directives',
      '',
    ].join('\n'));
  });

  it('should fill document by directive values', () => {
    const transformer = new Directive();

    const document = transformer.modifyDocument(createDirectiveDoc());

    expect(document.languages).toEqual(['en', 'es']);
    expect(document.dictionary.includes('word')).toBe(true);
    expect(document.isExcluded).toBe(false);
  });
});
