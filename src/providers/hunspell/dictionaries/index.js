'use strict';

/* eslint-disable object-property-newline */

const Loader = require('./Loader');

const LANGUAGES = [
  'bg-bg', 'ca-es', 'cs-cz', 'da-dk', 'de-at', 'de-ch', 'de-de', 'el-gr',
  'en-au', 'en-ca', 'en-gb', 'en-us', 'es-es', 'et-ee', 'fa-ir', 'fo-fo',
  'fr-fr', 'he-il', 'hr-hr', 'hu-hu', 'it-it', 'ko', 'lt-lt', 'lv-lv',
  'nb-no', 'nl-nl', 'pl-pl', 'pt-br', 'pt-pt', 'ro-ro', 'ru-ru', 'sk-sk',
  'sl-si', 'sr-latn', 'sr', 'sv-se', 'ta-in', 'tg-tg', 'tr', 'uk-ua',
  'vi',
];

const ALIASES = {
  bg: 'bg-bg', ca: 'ca-es', cs: 'cs-cz', da: 'da-dk', de: 'de-de', el: 'el-gr',
  en: 'en-us', es: 'es-es', et: 'et-ee', fa: 'fa-ir', fo: 'fo-fo', fr: 'fr-fr',
  he: 'he-il', hr: 'hr-hr', hu: 'hu-hu', it: 'it-it', lt: 'lt-lt', lv: 'lv-lv',
  nb: 'nb-no', nl: 'nl-nl', pl: 'pl-pl', pt: 'pt-pt', ro: 'ro-ro', ru: 'ru-ru',
  sk: 'sk-sk', sl: 'sl-si', sv: 'sv-se', ta: 'ta-in', tg: 'tg-tg', uk: 'uk-ua',
};

module.exports = {
  loadDictionary,
  normalizeLanguage,
};

/**
 * @param {string} language
 * @param {HttpClient} httpClient
 * @param {boolean} useCache
 * @param {Spech.Logger} logger
 * @return {Promise<{aff: Buffer, dic: Buffer}>}
 */
async function loadDictionary(
  language,
  httpClient,
  useCache = false,
  logger = null
) {
  const exactLang = normalizeLanguage(language);
  if (!exactLang) {
    logger.warn(`hunspell: Language ${language} is not supported`);
    return null;
  }

  const loader = new Loader(exactLang, logger);
  return loader.load(httpClient, useCache);
}

function normalizeLanguage(language) {
  const lowerLanguage = language
    .toLowerCase()
    .replace('/_/g', '-');

  const langIndex = LANGUAGES.indexOf(lowerLanguage);
  if (langIndex > -1) {
    return LANGUAGES[langIndex];
  }

  if (ALIASES[lowerLanguage]) {
    return ALIASES[lowerLanguage];
  }

  return null;
}
