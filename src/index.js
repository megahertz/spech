#!/usr/bin/env node

'use strict';

const ciJobNumber = require('ci-job-number');
const SpellChecker = require('./SpellChecker');
const { reporterFactory } = require('./reporters');
const { Config, getConfig } = require('./utils/config');
const FileFinder = require('./utils/FileFinder');
const Printer = require('./utils/Printer');

module.exports = {
  Config,
  SpellChecker,
};

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(2);
  });
}

async function main() {
  const config = getConfig();

  if (config.detectCi && ciJobNumber() !== 1) {
    actionCiSecondJob();
  }

  switch (config.action) {
    case 'showConfig': return actionShowConfig(config);
    case 'showDocuments': return actionShowDocuments(config);
    default: return actionMain(config);
  }
}

function actionCiSecondJob() {
  console.info('spech is enabled only for the first CI job');
  process.exit(0);
}

/**
 * @param {Config} config
 * @return {Promise<void>}
 */
async function actionMain(config) {
  const checker = new SpellChecker(config);

  const stdinDoc = await checker.addDocumentFromStream();
  if (!stdinDoc) {
    await checker.addDocumentsByMask(config.path, config.documents);
  }

  await checker.addDictionariesByMask(config.path, config.dictionaries);
  if (config.dictionary.length > 0) {
    config.dictionary.forEach(checker.addDictionaryPhrase, checker);
  }

  config.providers.forEach(cfg => checker.addProviderByConfig(cfg));

  const noErrors = await checker.checkDocuments();

  const reporter = reporterFactory(config.reporterConfig);
  const printer = new Printer();

  printer.batch(reporter.print(checker.documents));

  process.exitCode = noErrors ? 0 : 1;
}

/**
 * @param {Config} config
 * @return {Promise<void>}
 */
function actionShowConfig(config) {
  console.info(config);
}

/**
 * @param {Config} config
 * @return {Promise<void>}
 */
function actionShowDocuments(config) {
  const finder = new FileFinder(config.path, config.documents);
  console.info(finder.find());
}
