'use strict';

const Cropper = require('./Cropper');

class Directive extends Cropper {
  constructor() {
    super();

    /**
     * @type {Document}
     */
    this.document = null;

    this.latestDisableCoordinates = null;
  }

  /**
   * @param {Document} document
   * @return {Document}
   * @package
   */
  modifyDocument(document) {
    /**
     * @type {Document}
     */
    this.document = document;

    document.textForChecking = this.parseDirectives(
      document.textForChecking
    );
    return document;
  }

  /**
   * @param {string} text
   * @return {string}
   * @private
   */
  parseDirectives(text) {
    const regexp = /<!--(.*?)-->/gm;
    let croppedText = '';
    let lastPosition = 0;

    this.addCropGroup();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const {
        index: position = -1,
        '0': string,
        '1': content,
      } = regexp.exec(text) || {};
      if (position === -1) {
        break;
      }

      const coordinates = {
        position,
        length: string.length,
      };
      this.addCrop(coordinates);
      this.processDirectiveBlock(content, coordinates);

      if (!this.latestDisableCoordinates && lastPosition < position) {
        croppedText += text.substring(lastPosition, position);
      }

      lastPosition = position + string.length;
    }

    croppedText += text.substring(lastPosition);

    return croppedText;
  }

  processDirectiveBlock(content, coordinates) {
    content.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('spech'))
      .forEach(line => this.processDirective(line, coordinates));
  }

  processDirective(text, coordinates) {
    const [directiveText, ...args] = text.split(' ');
    const name = directiveText.replace('spech-', '');

    switch (name) {
      case 'disable': {
        this.latestDisableCoordinates = coordinates;
        this.document.isDisabled = true;
        return;
      }

      case 'enable': {
        this.document.isDisabled = false;
        const disableCoordinates = this.latestDisableCoordinates;
        if (!disableCoordinates) {
          return;
        }

        disableCoordinates.length = coordinates.position
          - disableCoordinates.position + coordinates.length;

        return;
      }

      case 'dictionary': {
        const content = args.join(' ');
        this.document.dictionary.add(content);
        break;
      }

      case 'languages': {
        this.document.languages = args;
        break;
      }

      default: {
        break;
      }
    }
  }
}

module.exports = Directive;
