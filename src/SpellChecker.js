'use strict';

const fs = require('fs');
const Dictionary = require('./models/Dictionary');
const Document = require('./models/Document');
const { createProvider, createProviderHelpers } = require('./providers');
const Provider = require('./providers/Provider');
const FileFinder = require('./utils/FileFinder');
const Logger = require('./utils/Logger');
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
   *
   * @param {string} searchPath
   * @param {string[]} masks
   * @param {string[]} exclusionMasks
   * @return {Promise<Document[]>}
   */
  async addDocumentsByMask(
    searchPath,
    masks = ['**/*.md'],
    exclusionMasks = ['**/node_modules/**']
  ) {
    const finder = new FileFinder(searchPath, masks, exclusionMasks);
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
   * @return {Promise<CorrectionList>}
   */
  async checkText(text) {
    const document = new Document(null, text);
    return this.checkDocument(document);
  }

  /**
   * @param {Document} document
   * @return {Promise<CorrectionList>}
   */
  async checkDocument(document) {
    if (!(document instanceof Document)) {
      throw new Error('document should have type Document');
    }

    const promises = this.providers.map(async (provider) => {
      const corrections = await provider.check(document.text, this.languages);

      corrections.forEach((correction) => {
        document.addCorrection(correction, provider.name);
      });
    });

    await Promise.all(promises);

    document.removeDictionaryCorrections(this.dictionary);

    return document.corrections;
  }

  /**
   * Return true if there are no errors
   * @return {Promise<boolean>}
   */
  async checkDocuments() {
    const promises = this.documents.map(this.checkDocument, this);
    await Promise.all(promises);

    return !this.documents.some(doc => doc.hasErrors());
  }
}

module.exports = SpellChecker;
