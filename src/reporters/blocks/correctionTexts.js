'use strict';

const CorrectionList = require('../../models/CorrectionList');

module.exports = {
  alignBlockByContent,
  correctionTextsFactory,
  extractTextSegments,
  extractTextSegmentsFromLine,
  groupCorrectionsByBlock,
  groupCorrectionsByLine,
};

function correctionTextsFactory({
  buildCorrection,
  providerOrder,
  showDuplicates = false,
  blockSize = 5,
  colors = false,
}) {
  const errorColor = colors ? 'red' : undefined;
  const errorWrap = colors ? undefined : 'error-brackets';

  /**
   * @param {CorrectionList} corrections
   * @param {string} text
   * @return {Spech.PrintItem}
   */
  return function buildCorrectionTexts(corrections, text) {
    const textLines = text.split('\n');
    const numberOfLines = textLines.length;
    if (!showDuplicates && providerOrder) {
      corrections = corrections.filterUnique(providerOrder);
    }

    const blocks = groupCorrectionsByBlock(
      corrections,
      numberOfLines,
      blockSize
    );

    return blocks.reduce((printBatch, block) => {
      const startLine = alignBlockByContent(block, numberOfLines, blockSize);
      const endLine = Math.min(numberOfLines - 1, startLine + blockSize - 1);

      const textSegments = extractTextSegments(
        corrections,
        textLines,
        startLine,
        endLine
      );

      printBatch.push(textSegments.map(fragment => ({
        color: fragment.color || (fragment.isMistake ? errorColor : undefined),
        wrap: fragment.isMistake ? errorWrap : undefined,
        text: fragment.text,
        newLine: fragment.newLine,
      })));

      printBatch.push({ newLine: true });

      block.corrections.forEach((correction) => {
        printBatch.push(buildCorrection(correction), { newLine: true });
      });

      return printBatch;
    }, [{ newLine: true }]);
  };
}

/**
 * @param {CorrectionList} corrections
 * @param {number} numberOfLines
 * @param {number} blockSize
 */
function groupCorrectionsByBlock(corrections, numberOfLines, blockSize = 5) {
  const fragments = [];
  const lines = groupCorrectionsByLine(corrections);

  let block;
  for (let i = 0; i < numberOfLines; i++) {
    if (!lines[i]) {
      continue;
    }

    if (!block) {
      block = { line: i, corrections: lines[i] };
      fragments.push(block);
      continue;
    }

    if (block.line + blockSize - 1 < i) {
      block = null;
      i--;
      continue;
    }

    block.corrections = block.corrections.concat(lines[i]);
  }

  return fragments;
}

/**
 * @param {Correction[] | CorrectionList} corrections
 * @return {Object<number, Correction[]>}
 */
function groupCorrectionsByLine(corrections) {
  if (corrections instanceof CorrectionList) {
    corrections = corrections.items;
  }

  const lines = {};

  for (const correction of corrections) {
    const startLine = correction.startLine.number;
    const endLine = correction.endLine.number;
    for (let i = startLine; i <= endLine; i++) {
      lines[i] = lines[i] || [];
      lines[i].push(correction);
    }
  }

  return lines;
}

/**
 * Return new start line of the block
 * @param block
 * @param {number} numberOfLines
 * @param {number} blockSize
 * @return {number}
 */
function alignBlockByContent(block, numberOfLines, blockSize = 5) {
  let start = block.line + blockSize;
  let end = block.line;

  block.corrections.forEach((correction) => {
    start = Math.min(start, correction.startLine.number);
    end = Math.max(end, correction.endLine.number);
  });

  const correctionTopOffset = Math.floor((blockSize - (end - start + 1)) / 2);

  const blockLineNumber = start - correctionTopOffset;
  const maximumLineNumber = numberOfLines - blockSize;

  if (blockLineNumber < 0) {
    return 0;
  }

  if (blockLineNumber > maximumLineNumber) {
    return maximumLineNumber;
  }

  return blockLineNumber;
}

/**
 * @param {Correction[]} corrections
 * @param {string[]} textLines
 * @param {number} startLine
 * @param {number} endLine
 * @return {[]}
 */
function extractTextSegments(corrections, textLines, startLine, endLine) {
  const correctionLines = groupCorrectionsByLine(corrections);
  const result = [];
  for (let i = startLine; i <= endLine; i++) {
    result.push(
      makeLineNumber(i + 1, endLine + 1),
      ...extractTextSegmentsFromLine(textLines[i], correctionLines[i])
    );
    result.push({ newLine: true });
  }

  return result;
}

function makeLineNumber(line, maxLine) {
  const chars = maxLine.toString().length;
  return { text: ` ${line.toString().padStart(chars)} │ `, color: 'gray' };
}

/**
 * @param {string} lineText
 * @param {Correction[]} corrections
 * @return {Array<{text: string, isMistake: boolean}>}
 */
function extractTextSegmentsFromLine(lineText, corrections) {
  if (!corrections) {
    return [{ text: lineText, isMistake: false }];
  }

  const mistakes = Array(lineText.length).fill(false);
  corrections.forEach((correction) => {
    const position = correction.startLine.position;
    const length = correction.length;
    for (let i = position; i < position + length; i++) {
      mistakes[i] = true;
    }
  });

  const fragments = [];
  let fragment = {};
  for (let i = 0; i < mistakes.length; i++) {
    if (fragment.isMistake === mistakes[i]) {
      fragment.text += lineText[i];
      continue;
    }

    fragment = { isMistake: mistakes[i], text: lineText[i] };
    fragments.push(fragment);
  }

  return fragments;
}
