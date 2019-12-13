'use strict';

const { request } = require('./http/http.js');
const HttpClient = require('./http/HttpClient');
const text = require('./text');

module.exports = {
  createHelpers,
};

/**
 * @param {Config} config
 * @param {Logger} logger
 * @return {Spech.ProviderHelpers}
 */
function createHelpers(config, { logger }) {
  return {
    /**
     * @param {Spech.HttpOptions} [httpOptions]
     * @return {HttpClient}
     */
    createHttpClient(httpOptions = {}) {
      const options = {
        ...config.httpConfig,
        ...httpOptions,
      };

      if (config.log >= 3) {
        options.debugFn = logger.debug;
      }

      return new HttpClient(request, options);
    },

    logger,
    text,
  };
}
