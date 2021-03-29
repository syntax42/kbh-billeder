module.exports = [
  require('../../collections-online-cumulus/indexing/transformations/field-names'),
  require('../../collections-online-cumulus/indexing/transformations/empty-title'),
  require('../../collections-online-cumulus/indexing/transformations/dates'),
  require('../../collections-online-cumulus/indexing/transformations/date-intervals'),
  require('../../collections-online-cumulus/indexing/transformations/relations'),
  require('../../collections-online-cumulus/indexing/transformations/dimensions'),
  require('../../collections-online-cumulus/indexing/transformations/geo-code'),
  require('../../collections-online-cumulus/indexing/transformations/latitude-longitude'),
  require('../../collections-online-cumulus/indexing/transformations/split-tags'),
  require('../../collections-online-cumulus/indexing/transformations/vision-tags'),
  require('../../collections-online-cumulus/indexing/transformations/tag-hierarchy'),
  require('./combined-address-parts')
];
