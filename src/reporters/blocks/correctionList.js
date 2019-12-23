'use strict';

module.exports = {
  correctionListFactory,
};

function correctionListFactory({
  buildCorrection,
  providerOrder,
  showDuplicates = false,
}) {
  /**
   * @param {CorrectionList} corrections
   * @return {Spech.PrintItem}
   */
  return function buildCorrectionList(corrections) {
    if (!showDuplicates && providerOrder) {
      corrections = corrections.filterUnique(providerOrder);
    }

    return corrections.items.reduce((list, correction) => {
      list.push(buildCorrection(correction), { newLine: true });
      return list;
    }, []);
  };
}
