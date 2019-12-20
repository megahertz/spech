'use strict';

const { loadModule } = require('hunspell-asm');
const AbstractProvider = require('../Provider');
const { loadDictionary, normalizeLanguage } = require('./dictionaries');


class Provider extends AbstractProvider {
  /**
   * @param {Spech.ProviderHelpers} helpers
   * @param {object} options
   */
  constructor(helpers, options) {
    super(helpers, options);
    this.httpClient = helpers.createHttpClient();
    this.httpClient.on('error', this.logger.callback('hunspell:', 'info'));

    if (this.options.splitCamelCaseWords === undefined) {
      this.options.splitCamelCaseWords = true;
    }

    this.name = 'hunspell';

    this.hunspellInstances = {};
  }

  /**
   * @param {string} text
   * @param {string[]} languages
   * @return {Spech.ProviderResult}
   */
  async check(text, languages) {
    const normalizedLanguages = this.normalizeLanguages(languages);
    if (normalizedLanguages.length < 1) {
      return [];
    }

    const hunspell = await this.getHunspell(languages[0]);
    const words = splitText(text, this.options.splitCamelCaseWords);

    return words.reduce((warnings, { word, position }) => {
      if (hunspell.spell(word)) {
        return warnings;
      }

      const suggestions = hunspell.suggest(word);

      warnings.push({
        position,
        length: word.length,
        fragment: word,
        suggestions,
      });

      return warnings;
    }, []);
  }

  /**
   * @param {string} language
   * @return {string | undefined}
   * @protected
   * @abstract
   */
  normalizeLanguage(language) {
    return normalizeLanguage(language);
  }

  /**
   * @param {string} language
   * @return {Promise<Hunspell>}
   * @private
   */
  async getHunspell(language) {
    if (!this.hunspellInstances[language]) {
      this.hunspellInstances[language] = await this.createHunspell(language);
    }

    return this.hunspellInstances[language];
  }

  /**
   * @param {string} language
   * @return {Promise<Hunspell>}
   * @private
   */
  async createHunspell(language) {
    const dictionary = await loadDictionary(
      language,
      this.httpClient,
      true,
      this.logger
    );

    const hunspellFactory = await loadModule();
    const paths = {
      aff: hunspellFactory.mountBuffer(dictionary.aff, `${language}.aff`),
      dic: hunspellFactory.mountBuffer(dictionary.dic, `${language}.dic`),
    };

    return hunspellFactory.create(paths.aff, paths.dic);
  }
}

function splitText(text, splitCamelCase = true) {
  let words = [];
  const wordRegExp = /\p{L}+/ug;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { index: position = -1, '0': word } = wordRegExp.exec(text) || {};
    if (position === -1) {
      break;
    }

    if (splitCamelCase) {
      words = words.concat(splitCamelCaseWord(word, position));
      continue;
    }

    words.push({ word, position });
  }

  return words;
}

function splitCamelCaseWord(word, position) {
  const parts = word.split(/(?=[A-Z])/);
  let offset = position;

  return parts.map((part) => {
    const result = { word: part, position: offset };
    offset += word.length;
    return result;
  });
}

module.exports = Provider;
