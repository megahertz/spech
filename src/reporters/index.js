'use strict';

const Default = require('./Default');
const Texts = require('./Texts');

module.exports = {
  reporterFactory,
};

/**
 * @param {Spech.ReporterOptions} reporterOptions
 * @return {Default}
 */
function reporterFactory(reporterOptions = {}) {
  switch (reporterOptions.name) {
    case 'texts': return new Texts(reporterOptions);
    default: return new Default(reporterOptions);
  }
}
