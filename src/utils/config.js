'use strict';

const options = require('package-options');

function getConfig() {
  options.help(`
Usage: speck [Path patterns]
General options:
  -l, --languages    Used language/languages, default 'en-us'
  -d, --dictionaries Dictionary file patterns
      --path STRING  Current path
  -p, --providers    Add provider
  
Appearance options:
      --colors          Force turn on colors in spec output 
      --no-colors       Force turn off colors in spec output
      --show-duplicates Show duplicate corrections from different providers
      --show-provider   Display provider name in results
      --log NUMBER      From 0 (only errors) to 3 (debug)
     
Misc options:            
      --version Show version
      --help    Show this help message
  `);

  return new Config(options);
}

class Config {
  /**
   * @param {PackageOptions || *} opts
   */
  constructor(opts) {
    /** @type {string[]} */
    this.languages = asStringArray([opts.languages], ['en-us']);

    /** @type {string[]} */
    this.documents = asStringArray([opts._, opts.documents], ['**/*.md']);
    this.documents.push('!**/node_modules/**');

    /** @type {string[]} */
    this.dictionaries = asStringArray([opts.dictionaries], ['*.dic']);
    this.dictionaries.push('!**/node_modules/**');

    /** @type {string} */
    this.path = opts.path || process.cwd();

    /** @type {boolean} */
    this.colors = onUndefined(opts.colors, process.stdout.isTTY);

    /** @type {number} */
    this.log = onUndefined(opts.log, 2);

    /** @type {object} */
    this.httpConfig = {
      connectionLimit: opts.connectionLimit || 10,
      timeout: opts.timeout || 10000,
      retryCount:  opts.retryCount || 5,
    };

    /** {*[]} */
    this.providers = initProviders(opts.providers, [
      { name: 'hunspell' },
      { name: 'grammarBot' },
    ]);

    /** @type {Spech.ReporterOptions} */
    this.reporterConfig = {
      showDuplicates: onUndefined(opts.showDuplicates, this.log > 1),
      showProvider: onUndefined(opts.showProvider, this.log > 0),
      providerOrder: this.providers.map(p => p.name),
    };

    if (!(opts instanceof options.PackageOptions)) {
      Object.assign(this, opts);
    }
  }
}

module.exports = {
  Config,
  getConfig,
};

/**
 * @param {string[][]} arrays
 * @param {string[]} defaultArray
 * @return {string[]}
 */
function asStringArray(arrays, defaultArray = []) {
  if (!Array.isArray(arrays)) {
    throw new Error('Wrong arrays argument');
  }

  const values = arrays
    .flat(2)
    .filter(item => typeof item === 'string');

  return values.length > 0 ? [...new Set(values)] : defaultArray;
}

function onUndefined(value, alternative) {
  if (value !== undefined) {
    return value;
  }

  return alternative;
}

function initProviders(providers, defaults) {
  if (!Array.isArray(providers)) {
    return defaults;
  }

  return providers.map(p => typeof p === 'string' ? { name: p } : p);
}
