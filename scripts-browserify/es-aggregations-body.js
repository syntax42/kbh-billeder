var elasticsearchQueryBody = require('es-query-body');

function buildFilter(parameters, field) {
  var independentFilters = {};
  Object.keys(parameters.filters).forEach(function(f) {
    if(f !== field) {
      independentFilters[f] = parameters.filters[f];
    }
  });
  var independentParameters = {
    q: parameters.q,
    sort: parameters.sort,
    filters: independentFilters
  };
  return elasticsearchQueryBody(independentParameters);
}

module.exports = function(parameters, body) {
  var result = {
    aggs: {
      district_independent: {
        filter: buildFilter(parameters, 'district'),
        aggs: {
          district: {
            terms: {
              field: 'district.raw',
              size: 100 // All basicly
            }
          }
        }
      },
      street_name_independent: {
        filter: buildFilter(parameters, 'street_name'),
        aggs: {
          street_name: {
            terms: {
              field: 'street_name.raw',
              size: 5
            }
          }
        }
      }
    }
  };

  return result;
};
