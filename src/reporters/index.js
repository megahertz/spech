'use strict';

const Default = require('./Default');

module.exports = {
  reporterFactory,
};

/**
 * @param {Spech.ReporterOptions} reporterOptions
 * @return {Default}
 */
function reporterFactory(reporterOptions = {}) {
  return new Default(reporterOptions);
}
