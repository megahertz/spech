'use strict';

const { describe, expect, it } = require('humile');
const { correctionFactory } = require('../correction');

describe('correction', () => {
  it('should return full representation if all properties exists', () => {
    const builder = correctionFactory({ showProvider: true });
    const correction = {
      message: 'Wrong word',
      fragment: 'tast',
      provider: 'test',
      suggestions: ['test', 'taste'],
      startLine: { number: 0, position: 10 },
    };

    expect(builder(correction)).toEqual([
      {
        color: 'gray',
        text: '   1:11   ',
      },
      {
        color: 'gray',
        text: '[test] ',
      },
      {
        color: 'red',
        text: 'tast',
      },
      {
        color: 'red',
        text: ': ',
      },
      {
        text: 'Wrong word',
      },
      {
        color: 'gray',
        text: ' → [ ',
      },
      {
        color: 'green',
        text: 'test, taste',
      },
      {
        color: 'gray',
        text: ' ]',
      },
    ]);
  })
});
