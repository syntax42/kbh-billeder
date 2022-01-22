'use strict';

const ds = require('../services/elasticsearch');
const config = require('../../../shared/config');

// Autosuggest for search field
exports.suggest = function suggest(req, res, next) {
  const text = req.query.text;
  const query = {
    index: [config.es.assetIndex, config.es.seriesIndex],
    body: {
      suggest: {
        text,
        completion: {
          field: 'suggest',
          fuzzy: {fuzziness: 1},
        },
      },
    },
  };

  ds.suggest(query).then(function(resp) {
    res.header('Content-type', 'application/json; charset=utf-8');
    if (resp.suggest && resp.suggest.length >= 1) {
      var suggestions = resp.suggest[0].options;
      res.json(suggestions);
    } else {
      next(new Error('Empty suggestion result from Elasticsearch.'));
    }
  }, function(err) {
    next(new Error('Error getting suggestions from Elasticsearch: ' + err));
  });
};
