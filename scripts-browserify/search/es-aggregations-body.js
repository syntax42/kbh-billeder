const config = require('collections-online/shared/config');

/**
 * This module generates queries that can be sent to elastic search to get the
 * aggregations that are used for filter buttons.
 * TODO: Move everything that is specific to the field names configurable
 */

var elasticsearchQueryBody = require('./es-query-body');

const CREATION_INTERVAL_FROM = 1000; // Year 1000
const CREATION_INTERVAL_TO = (new Date()).getFullYear(); // Current year
const SKIP_TYPES = ['querystring', 'date-interval-range', 'geobounds'];

function buildFilter(parameters, field) {
  var independentFilters = {};
  Object.keys(parameters.filters).forEach(function(f) {
    if(f !== field) {
      independentFilters[f] = parameters.filters[f];
    }
  });
  var independentParameters = {
    filters: independentFilters
  };
  var body = elasticsearchQueryBody(independentParameters);
  return body.query || {};
}

function generateDateRanges() {
  // Let's have a bucket for all things before the intervals
  var result = [
    {to: CREATION_INTERVAL_FROM.toString()}
  ];
  // Every houndred years
  for(var y = CREATION_INTERVAL_FROM; y < 1900; y+= 100) {
    var from = y;
    var to = y + 100;
    result.push({
      from: from.toString(),
      to: to.toString() + '||-1s'
    });
  }
  // Every ten years
  var lastYear;
  for(var y = 1900; y < CREATION_INTERVAL_TO; y+= 10) {
    var from = y;
    var to = y + 10;
    lastYear = to;
    result.push({
      from: from.toString(),
      to: to.toString() + '||-1s'
    });
  }
  // And beyond.
  result.push({
    from: lastYear.toString()
  });
  return result;
}

// Generate a series of filter-buckets for multi-field dateranges.
function generateRanges (singleField, multiFromField, multiToField) {
  const hasMulti =  multiFromField && multiToField;
  var result = {};

  function getFilterEntry(fieldName, fieldValue, operator) {
    let filter = {
      'range': { }
    };
    filter.range[fieldName] =  {};
    filter.range[fieldName][operator] = fieldValue;

    // Should give us something like.
    // {
    //   'range': {
    //     'creation_time_from.year': {
    //       'gte': '1940'
    //     }
    //   }
    // }
    return filter;
  }

  function getPeriodFilterEntry (periodFrom, bucketFrom, periodTo,  bucketTo) {
    let entry = {
      'bool': {
        'should': []
      }
    };

    if (bucketTo) {
      entry.bool.should.push({
        'bool': {
          'must' : [
            getFilterEntry(periodFrom, bucketTo, 'lte'),
            getFilterEntry(periodTo, bucketTo, 'gte')
          ]
        }
      });
    }

    if (bucketFrom) {
      entry.bool.should.push({
        'bool': {
          'must' : [
            getFilterEntry(periodTo, bucketFrom, 'gte'),
            getFilterEntry(periodFrom, bucketFrom, 'lte')
          ]
        }
      });
    }

    return entry;
  }

  function getSingleFilterEntry (creation, bucketFrom, bucketTo) {
    let entry = {
      'bool': {
        'must': []
      }
    };

    if (bucketTo) {
      entry.bool.must.push(getFilterEntry(creation, bucketTo, 'lte'));
    }

    if (bucketFrom) {
      entry.bool.must.push(getFilterEntry(creation, bucketFrom, 'gte'));
    }

    return entry;
  }

  let entryTemplate = {
    'bool': {
      'should': []
    }
  };

  // Start of with a openended range for <= CREATION_INTERVAL_FROM.
  result['*-0'] = {
    'bool': {
      'should': []
    }
  };
  result['*-0'].bool.should.push(getSingleFilterEntry(singleField,false, CREATION_INTERVAL_FROM));
  if (hasMulti) {
    result['*-0'].bool.should.push(getPeriodFilterEntry(multiFromField,false, multiToField, CREATION_INTERVAL_FROM));
  }


  // Then setup a interval every 100 years up until 1900.
  for(var year = CREATION_INTERVAL_FROM; year < 1900; year+= 100) {
    let fromYear = year;
    let toYear = year + 100;
    const key = `${fromYear}-${toYear}`;
    result[key] = {
      'bool': {
        'should': []
      }
    };
    result[key].bool.should.push(getSingleFilterEntry(singleField, fromYear, toYear));
    if (hasMulti) {
      result[key].bool.should.push(getPeriodFilterEntry(multiFromField, fromYear, multiToField, toYear));
    }
  }

  // Then every ten years
  var lastYear;
  for(let year = 1900; year < CREATION_INTERVAL_TO; year+= 10) {
    let fromYear = year;
    let toYear = year + 10;
    lastYear = toYear;

    const key = `${fromYear}-${toYear}`;
    result[key] = {
      'bool': {
        'should': []
      }
    };

    result[key].bool.should.push(getSingleFilterEntry(singleField, fromYear, toYear));
    if (hasMulti) {
      result[key].bool.should.push(getPeriodFilterEntry(multiFromField, fromYear, multiToField, toYear));
    }
  }

  // Finish off with another openended range.
  result[`${lastYear}-*`] = {
    'bool': {
      'should': []
    }
  };
  result[`${lastYear}-*`].bool.should.push(getSingleFilterEntry(singleField, lastYear, false));
  if (hasMulti) {
    result[`${lastYear}-*`].bool.should.push(getPeriodFilterEntry(multiFromField, lastYear, multiToField, false));
  }

  return result;
}

module.exports.generateBody = function(parameters, body) {
  var result = {
    aggs: {}
  };

  Object.keys(config.search.filters).forEach(function(field) {
    var filter = config.search.filters[field];
    var aggs = {};
    if (SKIP_TYPES.indexOf(filter.type) !== -1) {
      // Let's not add aggregations for these types
    } else if (filter.type === 'term') {
      if(!filter.field) {
        throw new Error('Expected "field" option on filter field: ' + field);
      }
      aggs[field] = {
        terms: {
          field: filter.field,
          size: filter.size || 2147483647 // Basically any possible value
        }
      };
    } else if (filter.type === 'date-range') {
      if(!filter.field) {
        throw new Error('Expected "field" option on filter field: ' + field);
      }

      if (filter.multifield && filter.multifield.from && filter.multifield.to) {
        aggs[field] = {
          filters: {
            filters: generateRanges(filter.field, filter.multifield.from, filter.multifield.to)
          }
        };
      }

    } else if (filter.type === 'filters') {
      if(!filter.filters) {
        throw new Error('Expected "filters" option on filter field: ' + field);
      }
      // Tried the date histogram /w interval: '3650d' // Not really 10 years
      // See https://github.com/elastic/elasticsearch/issues/8939
      aggs[field] = {
        filters: {
          filters: filter.filters
        }
      };
    } else {
      throw new Error('Unexpected filter type: ' + filter.type);
    }
    // Let's only add the _independent aggregation, if aggs exists
    if(aggs[field]) {
      result.aggs[field + '_independent'] = {
        filter: buildFilter(parameters, field),
        aggs: aggs
      };
    }
  });

  return result;
};

// TODO make it work by including the right stuff as defined in asset-section.js
// and asset-layout.json
