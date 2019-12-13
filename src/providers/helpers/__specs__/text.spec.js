'use strict';

const { describe, expect, it, jasmine } = require('humile');
const { loremIpsum } = require('../../../__specs__/texts.fixture');
const text = require('../text');

describe('helpers/text', () => {
  describe('findCutPosition', () => {
    it('should break by new line', () => {
      const cutPosition = text.findCutPosition(loremIpsum, 100);
      expect(getLoremFragment(cutPosition)).toMatch(/industry\.\n$/m);
    });

    it('should break by dot', () => {
      const cutPosition = text.findCutPosition(loremIpsum, 95);
      expect(getLoremFragment(cutPosition)).toMatch(/tting industry\./m);
    });

    it('should break by space', () => {
      const cutPosition = text.findCutPosition(loremIpsum, 94);
      expect(getLoremFragment(cutPosition)).toMatch(/typesetting $/m);
    });

    function getLoremFragment(length) {
      return loremIpsum.substr(length - 15, 15);
    }
  });

  describe('split', () => {
    it('should return empty array on wrong input', () => {
      expect(text.split('', 10)).toEqual([]);
    });

    it('should return simple item if length does not exceed limit', () => {
      expect(text.split('test', 10)).toEqual([{ text: 'test', offset: 0 }]);
    });

    it('should break text by new line', () => {
      expect(text.split(loremIpsum, 22).slice(0, 2)).toEqual([
        {
          offset: 0,
          text: 'What is Lorem Ipsum?\n',
        },
        {
          offset: 21,
          text: 'Lorem Ipsum is simply ',
        },
      ]);
    });

    it('should break text by dot', () => {
      expect(text.split(loremIpsum, 290).slice(1, 2)).toEqual([
        {
          offset: 266,
          text: jasmine.stringMatching(/^ It has survived/),
        },
      ]);
    });

    it('should break text by space if there are no better symbols', () => {
      expect(text.split(loremIpsum, 28).slice(0, 2)).toEqual([
        {
          offset: 0,
          text: 'What is Lorem Ipsum?\nLorem ',
        },
        {
          offset: 27,
          text: 'Ipsum is simply dummy text ',
        },
      ]);
    });

    it('should return all fragments, event if the latest if short', () => {
      expect(text.split(loremIpsum, 700).length).toBe(4);
    });
  });

  it('splitAndProcessAsync', async () => {
    const suggestions = await text.splitAndProcessAsync(
      loremIpsum,
      700,
      callback
    );

    expect(suggestions).toEqual([{}, {}, {}, {}]);

    async function callback() {
      return [{}];
    }
  });
});
