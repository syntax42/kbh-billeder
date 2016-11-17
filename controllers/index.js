'use strict';

/**
 * This controller handles trigger requests from the Cumulus system that fires
 * when assets are updated, inserted or deleted.
 *
 * An example request is:
 *
 * req.body = {
 *   id: 'FHM-25757',
 *   action: 'asset-update',
 *   collection: 'Frihedsmuseet',
 *   apiKey: ''
 * }
 */

const runIndexing = require('../indexing/modes/run');
const es = require('collections-online/lib/services/elasticsearch');
const config = require('collections-online/lib/config');

var helpers = {
  thousandsSeparator: function(number) {
    return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
  }
};

function updateAsset(catalogs, categories, assetId) {
  var state = {
    'es': es,
    'index': config.types.asset.index,
    'catalogs': catalogs,
    'categories': categories,
    'mode': 'single',
    'reference': assetId
  };

  return runIndexing(state);
}

function deleteAsset(req, assetId) {
  return es.delete({
    index: config.types.asset.index,
    type: 'asset',
    id: assetId
  });
}

exports.asset = function(req, res, next) {
  var id = req.body.id || '';
  var action = req.body.action || null;
  var collection = req.body.collection || null;
  var catalogs = req.app.get('catalogs');
  var categories = req.app.get('categories');

  console.log('Index asset called with body =', req.body);

  // If the catalog alias is not sat in the ID
  if(id.indexOf('/') === -1) {
    // No slash in the id - the catalog should be read from .collection
    var catalogAlias = catalogs.reduce(function(result, catalog) {
      if(catalog.name === collection) {
        return catalog.alias;
      } else {
        return result;
      }
    }, null);
    // If the catalog alias was found, let's prepend it to the id
    if(catalogAlias) {
      id = catalogAlias + '/' + id;
    }
  }

  function success() {
    res.json({
      'success': true
    });
  }

  if (id && action) {
    if (action === 'asset-update') {
      updateAsset(catalogs, categories, id).then(success, next);
    } else if (action === 'asset-create') {
      updateAsset(catalogs, categories, id).then(success, next);
    } else if (action === 'asset-delete') {
      deleteAsset(req, id).then(success, next);
    } else {
      next(new Error('Unexpected action from Cumulus: ' + action));
    }
  } else {
    var requestBody = JSON.stringify(req.body);
    next(new Error('Missing an id or an action, requested: ' + requestBody));
  }
};
