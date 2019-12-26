'use strict';

const Cropper = require('../Cropper');

class Markdown extends Cropper {
  /**
   * @param {Document} document
   * @return {Document}
   * @package
   */
  modifyDocument(document) {
    document.textForChecking = this.removeMarkdownBlocks(
      document.textForChecking
    );
    return document;
  }

  /**
   * @param {string} text
   * @return {string}
   * @private
   */
  removeMarkdownBlocks(text) {
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
      this.addCropGroup();
      return result.replace(regExp, (match, ...rest) => {
        this.addCrop({
          position: rest[rest.length - 2],
          length: match.length - replacementLength,
        });

        return replacement;
      });
    }, text);
  }
}

module.exports = Markdown;
