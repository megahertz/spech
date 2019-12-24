'use strict';

const InDictionary = require('./InDictionary');
const IgnoreCase = require('./IgnoreCase');
const LineNumber = require('./LineNumber');
const Collection = require('./Collection');
const Markdown = require('./format/Markdown');

module.exports = {
  createTransformers,
  ignoreCase,
  inDictionary,
  format,
};

const FORMATS = {
  markdown: Markdown,
};

function createTransformers(additionalTransformers = []) {
  const collection = new Collection();
  collection.addTransformer(new LineNumber());

  additionalTransformers
    .filter(Boolean)
    .forEach(collection.addTransformer, collection);

  return collection;
}

/**
 * @param {Document.Format} documentFormat
 */
function format(documentFormat) {
  const Formatter = FORMATS[documentFormat] || Markdown;
  return new Formatter();
}

function inDictionary(dictionary) {
  return new InDictionary(dictionary);
}

function ignoreCase(isEnabled) {
  if (!isEnabled) {
    return null;
  }

  return new IgnoreCase();
}
