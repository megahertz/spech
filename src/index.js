#!/usr/bin/env node

'use strict';

const ciJobNumber = require('ci-job-number');
const SpellChecker = require('./SpellChecker');
const { reporterFactory } = require('./reporters');
const { Config, getConfig } = require('./utils/config');
const Printer = require('./utils/Printer');

module.exports = {
  Config,
  SpellChecker,
};

if (require.main === module) {
  main().catch(console.error);
}

async function main() {
  const config = getConfig();

  if (config.detectCI && ciJobNumber() !== 1) {
    console.info('spech is enabled only for the first CI job');
    return;
  }

  const checker = new SpellChecker(config);

  await checker.addDocumentsByMask(config.path, config.documents);
  await checker.addDictionariesByMask(config.path, config.dictionaries);
  config.providers.forEach(cfg => checker.addProviderByConfig(cfg));

  const noErrors = await checker.checkDocuments();

  const reporter = reporterFactory(config.reporterConfig);
  const printer = new Printer();

  printer.batch(reporter.print(checker.documents));

  process.exitCode = noErrors ? 0 : 1;
}
