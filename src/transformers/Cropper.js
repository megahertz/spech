'use strict';

const Transformer = require('./Transformer');

/**
 * @abstract
 */
class Cropper extends Transformer {
  constructor() {
    super();
    this.crops = [];
    this.cropGroup = [];
  }

  /**
   * @param {Correction} correction
   * @return {Correction | void}
   * @package
   */
  modifyCorrection(correction) {
    return this.restoreCorrectionPosition(correction);
  }

  /**
   * @return {Array<{ position: number, length: number }>}
   * @protected
   */
  addCropGroup() {
    this.cropGroup = [];
    this.crops.push(this.cropGroup);
    return this.cropGroup;
  }

  /**
   * @param {number} position
   * @param {number} length
   * @protected
   */
  addCrop({ position, length }) {
    this.cropGroup.push({ position, length });
  }

  /**
   * @param {Correction} correction
   * @return {Correction}
   * @protected
   */
  restoreCorrectionPosition(correction) {
    let position = correction.position;

    for (let i = this.crops.length - 1; i >= 0; i--) {
      const crops = this.crops[i];
      position = crops
        .reduce((sum, crop) => {
          if (sum >= crop.position) {
            sum += crop.length;
          }

          return sum;
        }, position);
    }

    correction.position = position;
    return correction;
  }
}

module.exports = Cropper;
