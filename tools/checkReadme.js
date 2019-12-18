'use strict';

const fs = require('fs');
const options = require('package-options');
const path = require('path');
const SpellChecker = require('../src/SpellChecker');
const { Config } = require('../src/utils/config');

main().catch(console.warn);

async function main() {
  const checker = await createChecker();
  const providerName = checker.providers[0].name;
  const pathTemplate = path.join(
    __dirname,
    'readme',
    '{project}',
    providerName + '.json'
  );

  for (const doc of checker.documents) {
    let corrections = {};
    try {
      corrections = await checker.checkDocument(doc);
    } catch (e) {
      checker.logger.warn(e);
      continue;
    }

    const filePath = pathTemplate.replace('{project}', path.dirname(doc.name));
    await fs.promises.writeFile(filePath, JSON.stringify(corrections.items));
    checker.logger.info(doc.name, 'saved');
  }

  checker.logger.info('Done');
}

/**
 * @return {Promise<SpellChecker>}
 */
async function createChecker() {
  const config = new Config(options.reset().loadCmd().default);
  config.log = 2;
  config.httpConfig.timeout = 30000;
  config.providers[0].apiKey = 'KS9C5N3Y';
  const checker = new SpellChecker(config);

  const docPath = path.join(__dirname, 'readme');
  await checker.addDocumentsByMask(docPath, config.documents);
  // await checker.addDictionariesByMask(config.path, config.dictionaries);
  checker.addProviderByConfig(config.providers[0]);

  return checker;
}
