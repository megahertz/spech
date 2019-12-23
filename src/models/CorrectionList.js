'use strict';

class CorrectionList {
  /**
   * @param {Correction[]} corrections
   */
  constructor(corrections = []) {
    if (corrections instanceof this.constructor) {
      this.items = corrections.items;
    } else {
      this.items = corrections;
    }
  }

  get length() {
    return this.items.length;
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
   * @param {CorrectionList | Correction[]} corrections
   * @return {this}
   */
  concat(corrections) {
    let items = corrections;
    if (corrections instanceof this.constructor) {
      items = corrections.items;
    }

    return new this.constructor(this.items.concat(items));
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
