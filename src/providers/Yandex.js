'use strict';

const Provider = require('./Provider');

const API_URL = 'https://speller.yandex.net'
  + '/services/spellservice.json/checkText';
const API_SIZE_LIMIT = 10000;
const LANGUAGES = ['ru', 'en', 'uk'];

class Yandex extends Provider {
  /**
   * @param {Spech.ProviderHelpers} helpers
   * @param {object} options
   */
  constructor(helpers, options) {
    super(helpers, options);

    this.httpClient = helpers.createHttpClient({
      connectionLimit: options.connectionLimit || 2,
    });

    this.httpClient.on('error', this.logger.callback('yandex:', 'info'));

    this.name = 'yandex';
  }

  /**
   * @param {Document} document
   * @return {Promise<Spech.ProviderResult>}
   */
  async check(document) {
    const normalizedLanguages = this.normalizeLanguages(document.languages);
    if (normalizedLanguages.length < 1) {
      return [];
    }

    return this.helpers.text.splitAndProcessAsync(
      document.textForChecking,
      API_SIZE_LIMIT,
      this.checkFragment.bind(this),
      normalizedLanguages
    );
  }

  /**
   * @param {string} text
   * @param {number} offset
   * @param {string[]} languages
   * @return {Spech.ProviderResult}
   * @private
   */
  async checkFragment({ text, offset }, languages) {
    const response = await this.httpClient.postUrlEncoded(API_URL, {
      format: this.options.format,
      lang: languages.join(','),
      options: this.options.options,
      text,
    });

    return response.map((spellResult) => {
      return {
        position: offset + spellResult.pos,
        length: spellResult.len,
        suggestions: spellResult.s,
        fragment: spellResult.word,
      };
    });
  }

  /**
   * @param {string} language
   * @return {string | undefined}
   * @protected
   * @abstract
   */
  normalizeLanguage(language) {
    const shortLang = language
      .toLowerCase()
      .substr(0, 2);
    return LANGUAGES.includes(shortLang) ? shortLang : undefined;
  }
}

module.exports = Yandex;
