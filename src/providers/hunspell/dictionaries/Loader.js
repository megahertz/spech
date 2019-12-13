'use strict';

const fs = require('fs');
const { createCacheDir, getCachePath } = require('./cache')
const path = require('path');

class Loader {
  /**
   * @param {string} language
   * @param {Spech.Logger} logger
   */
  constructor(language, logger = null) {
    this.language = language;
    this.logger = logger;
  }

  /**
   * @param {HttpClient} httpClient
   * @param {boolean} useCache
   */
  async load(httpClient, useCache = false) {
    if (this.language === 'en-us') {
      const enPath = path.join(__dirname, 'hunspell-dict-en-us');
      const dictionary = await this.loadFromDir(enPath);
      if (dictionary) {
        return dictionary;
      }
    }

    if (useCache) {
      const dictionary = await this.loadFromCache();
      if (dictionary) {
        return dictionary;
      }
    }

    const dictionary = await this.loadFromHttp(httpClient);
    if (dictionary && useCache) {
      this.saveCache(dictionary);
    }

    return dictionary;
  }

  async loadFromDir(dirPath, logErrors = true) {
    try {
      const [aff, dic] = await Promise.all([
        fs.promises.readFile(path.join(dirPath, this.language + '.aff')),
        fs.promises.readFile(path.join(dirPath, this.language + '.dic')),
      ]);

      if (!this.checkDictionary({ aff, dic })) {
        logErrors && this.logWarn(`Can't load dictionary from ${dirPath}`);
        return null;
      }

      this.logInfo(`Loading dictionary ${this.language} from ${dirPath}`);

      return { aff, dic };
    } catch (e) {
      logErrors && this.logWarn(`Can't load dictionary from ${dirPath}`, e)
      return null;
    }
  }

  async loadFromCache() {
    const dictPath = getCachePath(
      path.join('dictionaries', 'hunspell-dict-' + this.language)
    );

    return this.loadFromDir(dictPath, false);
  }

  /**
   * @param {string} language
   * @param {HttpClient} httpClient
   * @return {Promise<{aff: Buffer, dic: Buffer}>}
   */
  async loadFromHttp(httpClient) {
    const lang = this.language;
    const packageUrl = `https://unpkg.com/hunspell-dict-${lang}/${lang}`;

    this.logInfo(`Downloading dictionary ${packageUrl}`);

    try {
      const [aff, dic] = await Promise.all([
        httpClient.getBuffer(`${packageUrl}/${lang}.aff`),
        httpClient.getBuffer(`${packageUrl}/${lang}.dic`),
      ]);

      if (!this.checkDictionary({ aff, dic })) {
        this.logWarn(`Can't load dictionary from ${packageUrl}`);
        return null;
      }

      return { aff, dic };
    } catch (e) {
      this.logWarn(`Can't load dictionary from ${packageUrl}`, e);
      return null;
    }
  }

  /**
   *
   * @param {{ aff: Buffer, dic: Buffer }} dict
   * @return {Promise<[void, void]>}
   */
  async saveCache( dict) {
    const lang = this.language;
    let dictPath = '';

    try {
      dictPath = createCacheDir(
        path.join('dictionaries', `hunspell-dict-${lang}`)
      );

      await Promise.all([
        fs.promises.writeFile(path.join(dictPath, `${lang}.aff`), dict.aff),
        fs.promises.writeFile(path.join(dictPath, `${lang}.dic`), dict.dic),
      ]);

      this.logDebug(`Dictionary saved to cache ${dictPath}`);

      return dictPath;
    } catch (e) {
      this.logWarn(`Can't save cache ${dictPath}`, e);
    }
  }

  /**
   * @param {{ aff: Buffer, dic: Buffer }} dict
   * @return {boolean}
   */
  checkDictionary(dict) {
    return dict.aff instanceof Buffer && dict.dic instanceof Buffer;
  }

  logInfo(...args) {
    this.logger && this.logger.info('hunspell:', ...args);
  }

  logDebug(...args) {
    this.logger && this.logger.debug('hunspell:', ...args);
  }

  logWarn(...args) {
    this.logger && this.logger.warn('hunspell:', ...args);
  }
}

module.exports = Loader;
