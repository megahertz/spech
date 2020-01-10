'use strict';

const Collection = require('./Collection');
const Directive = require('./Directive');
const InDictionary = require('./InDictionary');
const IgnoreCamelCase = require('./IgnoreCamelCase');
const IgnoreCase = require('./IgnoreCase');
const LineNumber = require('./LineNumber');
const Markdown = require('./format/Markdown');

module.exports = {
  createTransformers,
  ignoreCamelCase,
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

  collection.addTransformer(new Directive());

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

function ignoreCamelCase(isEnabled) {
  if (!isEnabled) {
    return null;
  }

  return new IgnoreCamelCase();
}
