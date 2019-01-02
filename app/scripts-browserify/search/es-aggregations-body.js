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
function generateRangeRanges (fromField, toField) {
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

  function getEntry (fromValue, toValue) {
    let entry = {
      'bool': {
        'must': []
      }
    };

    if (fromValue) {
      entry.bool.must.push(getFilterEntry(fromField, fromValue, 'gte'));
    }

    if (toValue) {
      entry.bool.must.push(getFilterEntry(toField, toValue, 'lt'));
    }

    return entry;
  }

  // Start of with a openended range for <= CREATION_INTERVAL_FROM.
  result['0'] = getEntry(false, CREATION_INTERVAL_FROM);

  // Then setup a interval every 100 years up until 1900.
  for(var y = CREATION_INTERVAL_FROM; y < 1900; y+= 100) {
    let from = y;
    let to = y + 100;

    result[y] = getEntry(from, to);
  }

  // Then every ten years
  var lastYear;
  for(let y = 1900; y < CREATION_INTERVAL_TO; y+= 10) {
    let from = y;
    let to = y + 10;
    lastYear = to;
    result[from] = getEntry(from, to);
  }

  // Finish off with another openended range.
  result[lastYear] = getEntry(lastYear, false);
  return result;
}

/**
 * Post-process a range-filter field.
 *
 * @param field
 */
function postProcessRangeField (field, aggregationResult) {
  // We've identified that field is of type date-range. Date-range filters can
  // work with a single date-field (default) and a "multi" date fields
  // (to/from)
  // The Aggregation Result will have a
  // aggregations.<fieldname>_independent.<fieldname> entry pr. single-field
  // date-range field.
  // If the filter is also setup with a multi-field range its result can be
  // found under
  // aggregations.<fieldname>_independent.<fieldname>_range
  // We now go and find any multi-field results, and then augment the
  // corresponding single-field results.

  // Ensure we have all the data we need.
  if (
    !aggregationResult['aggregations']
    || !aggregationResult['aggregations'][field + '_independent']
    || !aggregationResult['aggregations'][field + '_independent'][field]
    || !aggregationResult['aggregations'][field + '_independent'][field]['buckets']
    || !aggregationResult['aggregations'][field + '_independent'][field]['buckets'].length
    || !aggregationResult['aggregations'][field + '_independent'][`${field}_range`]
    || !aggregationResult['aggregations'][field + '_independent'][`${field}_range`]['buckets']) {
    return;
  }

  // We've verified we have results for the main date-range aggregation and
  // the multi-field range, now go trough each single-field range and look up
  // any multi-field range results and augment.
  const singleFieldRanges = aggregationResult['aggregations'][field + '_independent'][field].buckets;
  const multiFieldRanges = aggregationResult['aggregations'][field + '_independent'][`${field}_range`].buckets;

  singleFieldRanges.forEach(function(rangeBucket, index) {
    // Pick out the year for the range.
    let fromYear;
    if (rangeBucket['from_as_string']) {
      fromYear = rangeBucket['from_as_string'];
    }
    else {
      // Allow the initial (open-ended range bucket) not to have a from.
      if (index === 0) {
        fromYear = 0;
      }
      else {
        return;
      }
    }

    // Add the multi-field counts to the singlefield if found.
    if (!multiFieldRanges[fromYear]
      || !multiFieldRanges[fromYear]['doc_count']) {
      return;
    }
    rangeBucket['doc_count'] += multiFieldRanges[fromYear]['doc_count'];
  });
}


// The post-processing step lets us modify the various filter results.
module.exports.postProcess = function (aggregationResult) {

  // Go trough the filteres and identify date-ranges.
  Object.keys(config.search.filters).forEach(function(field) {
    const filter = config.search.filters[field];
    if (
      filter.type === 'date-range' &&
      filter.range &&
      filter.range.from &&
      filter.range.to) {
      postProcessRangeField(field, aggregationResult);
    }

  });

  return aggregationResult;
};

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
      // Tried the date histogram /w interval: '3650d' // Not really 10 years
      // See https://github.com/elastic/elasticsearch/issues/8939
      aggs[field] = {
        date_range: {
          field: filter.field,
          format: 'yyy',
          ranges: generateDateRanges()
        }
      };
      if (filter.range && filter.range.from &&filter.range.to) {
        aggs[field + '_range'] = {
          filters: {
            filters: generateRangeRanges(filter.range.from, filter.range.to)
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
