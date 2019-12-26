'use strict';

const Provider = require('./Provider');

const API_URL = 'http://api.grammarbot.io/v2/check';
const API_SIZE_LIMIT = 40000;
const LANGUAGES = { 'en': 'en-US', 'en-us': 'en-US', 'en-gb': 'en-GB' };

const DISABLED_RULES = {
  markdown: [
    'COMMA_PARENTHESIS_WHITESPACE',
    'DOUBLE_PUNCTUATION',
    'PUNCTUATION_PARAGRAPH_END',
    'UNLIKELY_OPENING_PUNCTUATION',
    'WHITESPACE_RULE',
  ],
};

class GrammarBot extends Provider {
  /**
   * @param {Spech.ProviderHelpers} helpers
   * @param {object} options
   */
  constructor(helpers, options) {
    super(helpers, options);

    this.httpClient = helpers.createHttpClient({
      connectionLimit: options.connectionLimit || 2,
    });

    this.httpClient.on('error', this.logger.callback('hunspell:', 'info'));

    this.name = 'grammarBot';
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
      normalizedLanguages,
      document.format
    );
  }

  /**
   * @param {string} text
   * @param {number} offset
   * @param {string[]} languages
   * @param {Document.Format} format
   * @return {Spech.ProviderResult}
   * @private
   */
  async checkFragment({ text, offset }, languages, format) {
    const response = await this.httpClient.postUrlEncoded(API_URL, {
      api_key: this.options.apiKey,
      language: languages[0],
      text,
    });

    const matches = response && response.matches;
    if (!Array.isArray(matches)) {
      return [];
    }

    return matches.map((match) => {
      if (this.isRuleDisabled(match.rule.id, format)) {
        return undefined;
      }

      const suggestions = match.replacements.map(rep => rep.value);
      return {
        fragment: text.substr(match.offset, match.length),
        length: match.length,
        message: match.message,
        position: offset + match.offset,
        rule: match.rule.id,
        suggestions,
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
      .replace('/_/g', '-');

    if (shortLang === 'en') {
      return 'en-US';
    }

    if (LANGUAGES[shortLang]) {
      return LANGUAGES[shortLang];
    }
  }

  /**
   * @param {string} rule
   * @param {Document.Format} format
   * @return {boolean|*}
   */
  isRuleDisabled(rule, format) {
    const disabledForFormat = DISABLED_RULES[format];
    if (disabledForFormat && disabledForFormat.includes(rule)) {
      return true;
    }

    if (!Array.isArray(this.options.disabledRules)) {
      return false;
    }

    return this.options.disabledRules.includes(rule);
  }
}

module.exports = GrammarBot;
