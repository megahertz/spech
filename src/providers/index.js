'use strict';

const { createHelpers: createProviderHelpers } = require('./helpers');

/* eslint-disable global-require */
const providers = {
  grammarBot: require('./GrammarBot'),
  hunspell: require('./hunspell/Provider'),
  yandex: require('./Yandex'),
};

module.exports = {
  createProviderHelpers,
  createProvider,
};

function createProvider(helpers, providersConfig = []) {
  const name = providersConfig.name;

  const Constructor = providers[name];
  if (!Constructor) {
    throw new Error(`Unknown provider ${name}`);
  }

  return new Constructor(helpers, providersConfig);
}
