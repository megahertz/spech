'use strict';

class CorrectionList {
  /**
   * @param {Correction[]} corrections
   */
  constructor(corrections = []) {
    this.items = corrections;
  }

  get length() {
    return this.items.length;
  }

  /**
   * @param {Correction} correction
   */
  add(correction) {
    this.items.push(correction);
  }

  /**
   * @param {Dictionary} dictionary
   * @return {this}
   */
  filterByDictionary(dictionary) {
    const corrections = this.items.filter((correction) => {
      return !dictionary.includes(correction.fragment);
    });

    return new this.constructor(corrections);
  }

  /**
   * @param {string[]} providerOrder
   * @return {this}
   */
  filterUnique(providerOrder) {
    const priority = providerOrder.reduce((obj, providerName, index) => {
      obj[providerName] = providerOrder.length - index;
      return obj;
    }, {});

    const collection = this.items.reduce((processed, corr) => {
      if (!processed[corr.id]) {
        processed[corr.id] = corr;
        return processed;
      }

      processed[corr.id] = chooseHigherWarning(processed[corr.id], corr);
      return processed;
    }, {});

    return new this.constructor(Object.values(collection));

    function chooseHigherWarning(warn1, warn2) {
      if (priority[warn1.provider] >= priority[warn2.provider]) {
        return warn1;
      }

      return warn2;
    }
  }

  /**
   * @return {Object<number, Correction[]>}
   */
  asLines() {
    const lines = {};

    this.items.forEach((correction) => {
      const startLine = correction.startLine.number;
      const endLine = correction.endLine.number;
      for (let i = startLine; i <= endLine; i++) {
        lines[i] = lines[i] || [];
        lines[i].push(correction);
      }
    });

    return lines;
  }

  /**
   * @param {function} callback
   * @param {*} thisArg
   * @return {*[]}
   */
  map(callback, thisArg = undefined) {
    return this.items.map(callback, thisArg);
  }
}

module.exports = CorrectionList;
