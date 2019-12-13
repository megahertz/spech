'use strict';

require('../../utils/polyfills');

module.exports = {
  findCutPosition,
  split,
  splitAndProcessAsync,
};

/**
 *
 * @param {string} text
 * @param {number} maxLength
 * @return {Spech.TextFragment[]}
 */
function split(text, maxLength) {
  if (!text) {
    return [];
  }

  if (text.length < maxLength) {
    return [{ text, offset: 0 }];
  }

  const fragments = [];
  let remainingText = text;
  let offset = 0;

  while (remainingText.length > maxLength) {
    const cutPosition = findCutPosition(remainingText, maxLength);

    fragments.push({
      text: remainingText.substr(0, cutPosition),
      offset,
    });

    offset += cutPosition;
    remainingText = remainingText.substr(cutPosition);
  }

  if (remainingText) {
    fragments.push({ text: remainingText, offset });
  }

  return fragments;
}

/**
 * @param {string} text
 * @param {number} maxLength
 * @param {function} asyncCallback
 * @param {*[]} fragmentArgs
 * @return {Spech.ProviderResult}
 */
async function splitAndProcessAsync(
  text,
  maxLength,
  asyncCallback,
  ...fragmentArgs
) {
  const fragments = split(text, maxLength);
  const promises = fragments.map(f => asyncCallback(f, ...fragmentArgs));
  const results = await Promise.all(promises);
  return results.flat(2);
}

function findCutPosition(text, maxLength) {
  const lastFragmentPosition = Math.floor(maxLength * 0.9);

  const lastFragment = text.substr(
    lastFragmentPosition,
    maxLength - lastFragmentPosition
  );
  const lfPosition = lastFragment.lastIndexOf('\n');
  if (lfPosition > -1) {
    return lastFragmentPosition + lfPosition + 1;
  }

  const punctuationPosition = lastIndexOfRegex(lastFragment, /[.!?]/m);
  if (punctuationPosition > -1) {
    return lastFragmentPosition + punctuationPosition + 1;
  }

  const spacePosition = lastIndexOfRegex(lastFragment, /\s/m);
  if (spacePosition > -1) {
    return lastFragmentPosition + spacePosition + 1;
  }

  return maxLength;
}

function lastIndexOfRegex(text, regExp) {
  const match = text.match(regExp);
  return match ? text.lastIndexOf(match[match.length - 1]) : -1;
}
