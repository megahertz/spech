'use strict';

const { describe, expect, it } = require('humile');
const { codeBlocks } = require('../../../__specs__/fixtures');
const Markdown = require('../Markdown');

//               0 2             12              23          34
const CROPPED = '# Header\n\n\n\nText 1\n\n\n\n\nText 2\n    Not codeblock\n';

describe('transformers/Markdown', () => {
  it('should remove multiline code blocks', () => {
    const transformer = new Markdown();

    const cropped = transformer.modifyText(codeBlocks);

    expect(cropped).toBe(CROPPED);
  });

  it('should keep correct correction position', () => {
    const transformer = new Markdown();

    transformer.modifyText(codeBlocks);

    const text1 = transformer.modifyCorrection({ position: 12 });
    expect(text1.position).toBe(54);

    const text2 = transformer.modifyCorrection({ position: 23 });
    expect(text2.position).toBe(101);

    const text3 = transformer.modifyCorrection({ position: 34 });
    expect(text3.position).toBe(112);
  });
});
