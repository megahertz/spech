'use strict';

const Transformer = require('../Transformer');

class Markdown extends Transformer {
  constructor() {
    super();

    this.crops = [];
  }

  /**
   * @param {string} text
   * @return {string}
   * @package
   */
  modifyText(text) {
    return this.removeCodeBlocks(text);
  }

  /**
   * @param {Correction} correction
   * @return {Correction | void}
   * @package
   */
  modifyCorrection(correction) {
    let position = correction.position;

    for (let i = this.crops.length - 1; i >= 0; i--) {
      const crops = this.crops[i];
      position = crops
        .reduce((sum, crop) => {
          if (sum >= crop.position) {
            sum += crop.length;
          }

          return sum;
        }, position);
    }

    correction.position = position;
    return correction;
  }

  /**
   * @param {string} text
   * @return {string}
   * @private
   */
  removeCodeBlocks(text) {
    const replacement = '\n';
    const replacementLength = replacement.length;

    const regexps = [
      // Code blocks quoted by one or many "`"
      /(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/gm,

      // Code blocks started by tab/4 spaces with blank line before
      // eslint-disable-next-line no-useless-escape
      /(\n\n|\A\n?)((( {4}|\t).*\n)+)/gm,

      // Links
      /\[.*]\((.*?(?<!\\))\)/gm,

      // Plain Hyperlinks
      // eslint-disable-next-line max-len
      /\(?([\w]+:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)\)?/gm,
    ];

    return regexps.reduce((result, regExp) => {
      const crops = [];
      this.crops.push(crops);

      return result.replace(regExp, (match, ...rest) => {
        const position = rest[rest.length - 2];
        const length = match.length - replacementLength;

        crops.push({
          position,
          length,
        });

        return replacement;
      });
    }, text);
  }
}

module.exports = Markdown;
