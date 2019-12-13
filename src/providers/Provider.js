'use strict';

class Provider {
  /**
   *
   * @param {Spech.ProviderHelpers} helpers
   * @param {*} options
   */
  constructor(helpers, options) {
    /**
     * @type {string}
     */
    this.name = '';

    /**
     * @type {Spech.ProviderHelpers}
     */
    this.helpers = helpers;

    /**
     * @type {*}
     */
    this.options = options || {};

    /**
     * @type {Spech.Logger}
     */
    this.logger = helpers.logger;
  }

  /**
   * @param {string} text
   * @param {string[]} languages
   * @return {Spech.ProviderResult}
   * @abstract
   */
  check(text, languages) {
    throw new Error('check() method is not implemented');
  }

  /**
   * @param {string} language
   * @return {string | undefined}
   * @protected
   * @abstract
   */
  normalizeLanguage(language) {
    throw new Error('normalizeLanguage() method is not implemented');
  }

  /**
   * @param {string[]} languages
   * @return {string[]}
   * @protected
   */
  normalizeLanguages(languages) {
    if (!Array.isArray(languages)) {
      throw new Error('Languages are not set');
    }

    const supportedLanguages = languages
      .filter(lang => typeof lang === 'string')
      .map(this.normalizeLanguage, this)
      .filter(Boolean);

    if (supportedLanguages.length < 1) {
      const langString = languages.join(', ');
      this.logger.info(`${this.name}: Unsupported languages: ${langString}`);
      return [];
    }

    return supportedLanguages;
  }
}

module.exports = Provider;
