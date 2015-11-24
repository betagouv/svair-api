var _ = require('lodash');


function getYearFromReferenceAvis(referenceAvis) {
  return _.parseInt('20' + (referenceAvis +"").substring(0, 2))
}

module.exports = getYearFromReferenceAvis
