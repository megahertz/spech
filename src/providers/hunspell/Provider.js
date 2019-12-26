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

    if (this.options.useCache === undefined) {
      this.options.useCache = !process.env.CI;
    }

    this.name = 'hunspell';

    /**
     * @type {Promise<Hunspell>}
     */
    this.hunspellInstances = {};
  }

  /**
   * @param {Document} document
   * @return {Promise<Spech.ProviderResult>}
   */
  async check(document) {
    const hunspellInstances = await this.getHunspellForAllLanguages(
      document.languages
    );
    const words = splitText(document.textForChecking);

    return words.reduce((warnings, { word, position }) => {
      const suggestions = this.checkWord(word, hunspellInstances);
      if (!suggestions) {
        return warnings;
      }

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
   *
   * @param {string} word
   * @param {Hunspell[]} instances
   * @return {null | string[]}
   */
  checkWord(word, instances) {
    let suggestions = [];

    for (const hunspell of instances) {
      if (hunspell.spell(word)) {
        return null;
      }
    }

    for (const hunspell of instances) {
      suggestions = suggestions.concat(hunspell.suggest(word));
    }

    return suggestions;
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
   * @param languages
   * @return {Promise<Hunspell[]>}
   * @private
   */
  async getHunspellForAllLanguages(languages) {
    const normalizedLanguages = this.normalizeLanguages(languages);
    if (normalizedLanguages.length < 1) {
      return [];
    }

    const instances = [];
    for (const lang of normalizedLanguages) {
      instances.push(await this.getHunspell(lang));
    }

    return instances;
  }

  /**
   * @param {string} language
   * @return {Promise<Hunspell>}
   * @private
   */
  async getHunspell(language) {
    if (!this.hunspellInstances[language]) {
      this.hunspellInstances[language] = this.createHunspell(language);
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
      !process.env.CI,
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

function splitText(text) {
  const words = [];
  const wordRegExp = /\p{L}+['’]?\p{L}+/ug;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { index: position = -1, '0': word } = wordRegExp.exec(text) || {};
    if (position === -1) {
      break;
    }

    words.push({ word, position });
  }

  return words;
}

module.exports = Provider;
