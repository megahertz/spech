'use strict';

require('./utils/polyfills');

const fs = require('fs');
const Dictionary = require('./models/Dictionary');
const Correction = require('./models/Correction');
const CorrectionList = require('./models/CorrectionList');
const Document = require('./models/Document');
const { createProvider, createProviderHelpers } = require('./providers');
const Provider = require('./providers/Provider');
const FileFinder = require('./utils/FileFinder');
const Logger = require('./utils/Logger');
const transformers = require('./transformers');
const { shortenPath } = require('./utils/path');

class SpellChecker {
  /**
   * @param {Config} config
   * @param {number} config.log
   */
  constructor(config) {
    /**
     * @type {Document[]}
     */
    this.documents = [];

    /**
     * @type {Provider[]}
     */
    this.providers = [];

    this.dictionary = new Dictionary();

    /**
     * @type {Logger}
     */
    this.logger = new Logger(config.log);

    /**
     * @type {Spech.ProviderHelpers}
     */
    this.providerHelpers = createProviderHelpers(config, {
      logger: this.logger,
    });

    /**
     * @type {string[]}
     */
    this.languages = config.languages;

    /**
     * @type {boolean}
     */
    this.ignoreCamelCase = config.ignoreCamelCase;

    /**
     * @type {boolean}
     */
    this.ignoreCase = config.ignoreCase;
  }

  /**
   * @param {Document} document
   */
  addDocument(document) {
    if (!(document instanceof Document)) {
      throw new Error('document should have type Document');
    }

    if (!document.text) {
      throw new Error('document is empty');
    }

    if (!document.name) {
      throw new Error('document name is empty');
    }

    this.documents.push(document);
  }

  /**
   * @param {string} filePath
   * @param {string} [projectRoot]
   * @return {Promise<Document>}
   */
  async addDocumentFromFile(filePath, projectRoot = undefined) {
    const content = await fs.promises.readFile(filePath, 'utf8');

    const document = new Document(
      projectRoot ? shortenPath(projectRoot, filePath) : filePath,
      content
    );

    this.addDocument(document);
    return document;
  }

  /**
   * @param {string} name
   * @param {string} content
   * @param {Document.Format} format
   * @return {Document}
   */
  addDocumentFromString(name, content, format = undefined) {
    const document = new Document(name, content, format);
    this.addDocument(document);
    return document;
  }

  /**
   *
   * @param {string} searchPath
   * @param {string[]} masks
   * @return {Promise<Document[]>}
   */
  async addDocumentsByMask(searchPath, masks = ['**/*.md']) {
    const finder = new FileFinder(searchPath, masks);
    const promises = finder.find().map((filePath) => {
      return this.addDocumentFromFile(filePath, searchPath);
    }, this);

    return Promise.all(promises);
  }

  /**
   * @param {Spech.Provider} provider
   */
  addProvider(provider) {
    if (!(provider instanceof Provider)) {
      throw new Error('provider should have type Provider');
    }

    if (!provider.name) {
      throw new Error('provider name is not set');
    }

    this.providers.push(provider);
  }

  /**
   * @param {object} providerConfig
   */
  addProviderByConfig(providerConfig) {
    const provider = createProvider(this.providerHelpers, providerConfig);
    this.addProvider(provider);
  }

  /**
   * @param {string} phrase
   */
  addDictionaryPhrase(phrase) {
    if (!phrase || typeof phrase !== 'string') {
      throw new Error('Wrong dictionary phrase');
    }

    this.dictionary.add(phrase);
  }

  /**
   * @param {string} filePath
   */
  async addDictionaryFromFile(filePath) {
    const content = await fs.promises.readFile(filePath, 'utf8');

    content
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .forEach(this.addDictionaryPhrase, this);
  }

  /**
   *
   * @param {string} searchPath
   * @param {string[]} masks
   */
  async addDictionariesByMask(searchPath, masks = ['*.dic']) {
    const finder = new FileFinder(searchPath, masks);
    const promises = finder.find().map(this.addDictionaryFromFile, this);
    await Promise.all(promises);
  }

  /**
   * @param {string} text
   * @param {Document.Format} format
   * @return {Promise<CorrectionList>}
   */
  async checkText(text, format = null) {
    return this.checkDocument(new Document(null, text, format));
  }

  /**
   * @param {Document} document
   * @return {Promise<CorrectionList>}
   */
  async checkDocument(document) {
    const transforms = transformers.createTransformers([
      transformers.format(document.format),
      transformers.inDictionary(this.dictionary),
      transformers.ignoreCase(this.ignoreCase),
      transformers.ignoreCamelCase(this.ignoreCamelCase),
    ]);

    document = transforms.modifyDocument(document);
    if (document.languages.length < 1) {
      document.languages = this.languages;
    }

    const promises = this.providers.map(async (provider) => {
      const corrections = await provider.check(document);

      return corrections.filter(Boolean).map((correction) => {
        return transforms.modifyCorrection(new Correction({
          ...correction,
          provider: provider.name,
        }));
      });
    });

    const corrections = await Promise.all(promises);
    document.corrections = new CorrectionList(
      corrections.flat(2).filter(Boolean)
    );

    return document.corrections;
  }

  /**
   * Return true if there are no errors
   * @return {Promise<boolean>}
   */
  async checkDocuments() {
    const count = this.documents.length;
    this.logger.debug(
      `Start checking ${count} document${count === 1 ? '' : 's'}`
    );

    const promises = this.documents.map(this.checkDocument, this);
    await Promise.all(promises);

    return !this.documents.some(doc => doc.hasErrors());
  }
}

module.exports = SpellChecker;
