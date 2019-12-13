'use strict';

module.exports = {
  correctionListFactory,
}

function correctionListFactory({
  buildCorrection,
  providerOrder,
  showDuplicates = false
}) {
  /**
   * @param {CorrectionList} corrections
   */
  return function buildCorrectionList(corrections) {
    if (!showDuplicates && providerOrder) {
      corrections = corrections.filterUnique(providerOrder);
    }

    const lines = corrections.asLines();
    return Object.values(lines).reduce((items, line) => {
      line.forEach((correction) => {
        items.push(
          buildCorrection(correction),
          { newLine: true }
        );
      });

      return items;
    }, []);
  }
}
