'use strict';

const options = require('package-options');
const path = require('path');

function getConfig() {
  options.help(`
Usage: spech [Path patterns]
General options:
  -l, --languages     Used language/languages, default 'en-us'
  -d, --dictionaries  Dictionary file patterns
      --path          Current path
  -p, --providers     Add provider/providers
  
Appearance options:
      --colors           Force turn on colors in spec output
      --log              Verbosity, from 0 (only errors) to 3 (debug)
  -c, --ignore-case      Ignore incorrect usage of letter case
      --show-duplicates  Show duplicate corrections
      --show-provider    Display provider name in results
      --show-rule        Display correction rule if provider supports
      
Misc options:
      --detect-ci       Run only in the first CI task
      --show-config     Show the current config object and exit
      --show-documents  Show a list of all found documents files and exit
      --timeout         Connection timeout for providers 
      --version         Show version
      --help            Show this help message
  `);

  return new Config(options);
}

class Config {
  /**
   * @param {PackageOptions || *} opts
   */
  constructor(opts) {
    // General options

    /**
     * @type {string[]}
     */
    this.documents = asStringArray([opts._, opts.documents], ['**/*.md']);
    this.documents.push('!**/node_modules/**');

    /**
     * @type {string[]}
     */
    this.languages = asStringArray([opts.languages], ['en-us']);

    /**
     * @type {string[]}
     */
    this.dictionaries = asStringArray([opts.dictionaries], ['*.dic']);
    this.dictionaries.push('!**/node_modules/**');
    this.dictionaries.push(path.join(__dirname, '../common.dic'));

    /**
     * @type {string}
     */
    this.path = opts.path || process.cwd();

    /**
     * @type {*[]}
     */
    this.providers = initProviders(opts.providers, [
      { name: 'hunspell' },
      { name: 'grammarBot' },
    ]);

    // Appearance options

    /**
     * @type {boolean}
     */
    this.colors = onUndefined(opts.colors, process.stdout.isTTY);

    /**
     * @type {number}
     */
    this.log = onUndefined(opts.log, 0);

    /**
     * @type {boolean}
     */
    this.ignoreCase = onUndefined(opts.ignoreCase, true);

    /**
     * @type {Spech.ReporterOptions}
     */
    this.reporterConfig = {
      showDuplicates: onUndefined(opts.showDuplicates, this.log > 1),
      showProvider: onUndefined(opts.showProvider, this.log > 0),
      showRule: onUndefined(opts.showRule, this.log > 1),
      providerOrder: this.providers.map(p => p.name),
    };

    // Misc options

    /**
     * @type {boolean}
     */
    this.detectCi = onUndefined(opts.detectCi, true);

    /**
     @type {object}
     */
    this.httpConfig = {
      connectionLimit: opts.connectionLimit || 10,
      timeout: opts.timeout || 10000,
      retryCount:  opts.retryCount || 5,
    };

    /**
     * @type { 'main' | 'showConfig' | 'showDocuments' }
     */
    this.action = 'main';
    if (opts.showConfig) {
      this.action = 'showConfig';
    } else if (opts.showDocuments) {
      this.action = 'showDocuments';
    }

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
  if (typeof providers === 'string') {
    providers = [providers];
  }

  if (!Array.isArray(providers)) {
    return defaults;
  }

  return providers.map(p => typeof p === 'string' ? { name: p } : p);
}
