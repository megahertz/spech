'use strict';

const path = require('path');
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
  md: Markdown,
};

function createTransformers(additionalTransformers = []) {
  const collection = new Collection();
  collection.addTransformer(new LineNumber());

  additionalTransformers
    .filter(Boolean)
    .forEach(collection.addTransformer, collection);

  return collection;
}

function format(formatOrFileName) {
  if (typeof formatOrFileName !== 'string') {
    return null;
  }

  let formatType = formatOrFileName;

  if (formatOrFileName.match(/.*?\.\w+/)) {
    formatType = path.extname(formatOrFileName).substr(1).toLowerCase();
  }

  const Formatter = FORMATS[formatType];

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
