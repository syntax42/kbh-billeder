'use strict';

const elasticsearch = require('@elastic/elasticsearch');
const config = require('../../../shared/config');
const Q = require('q');
const Agent = require('agentkeepalive');

const es = new elasticsearch.Client({
  node: `http://${config.es.host}`,
  agent: (options) => new Agent(options),
});

const indecies = Object.keys(config.types).map((type) => {
  return config.types[type].index;
});

es.scrollSearch = function(body, hitCallback) {
  return this.search({
    index: indecies,
    scroll: '30s', // Set to 30 seconds because we are calling right back
    size: 1000,
    body
  }).then(function getMoreUntilDone({body: response}) {
    // If we are still getting hits - let's iterate over them.
    if (response.hits.hits.length > 0) {
      return response.hits.hits.map(hitCallback).reduce(Q.when, null)
        .then(function() {
          // Next scroll page please.
          var scrollId = response._scroll_id;
          return es.scroll({
            scrollId: scrollId,
            scroll: '30s'
          }).then(getMoreUntilDone);
        });
    }
  });
};

module.exports = es;
