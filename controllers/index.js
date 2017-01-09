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
 *   catalog: 'Frihedsmuseet',
 *   apiKey: ''
 * }
 */

const ds = require('collections-online/lib/services/documents');
const config = require('collections-online/lib/config');

if(!config.es || !config.es.index || typeof(config.es.index) !== 'string') {
  throw new Error('Need exactly one index for Cumulus triggers to work.');
}

const indexing = require('../indexing/run');

var helpers = {
  thousandsSeparator: function(number) {
    return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
  }
};

function updateAsset(categories, assetId) {
  var state = {
    'es': ds,
    'index': config.es.index,
    'categories': categories,
    'mode': 'single',
    'reference': assetId
  };
  return indexing(state);
}

function deleteAsset(req, assetId) {
  return ds.delete({
    index: config.es.index,
    type: 'asset',
    id: assetId
  });
}

exports.asset = function(req, res, next) {
  var id = req.body.id || '';
  var action = req.body.action || null;
  var catalogName = req.body.catalog || null;
  // These categories are probably no longer needed
  var categories = req.app.get('categories');

  console.log('Index asset called with body =', req.body);

  // If the catalog alias is not sat in the ID
  if(id.indexOf('/') === -1 && catalogName) {
    // No slash in the id - the catalog should be read from .collection
    var catalogAlias = Object.keys(config.cip.catalogs)
    .reduce(function(result, alias) {
      const candidateCatalogName = config.cip.catalogs[alias];
      console.log('trying', candidateCatalogName);
      if(candidateCatalogName === catalogName) {
        return alias;
      } else {
        return result;
      }
    }, null);
    // If the catalog alias was found, let's prepend it to the id
    if(catalogAlias) {
      id = catalogAlias + '/' + id;
    } else {
      throw new Error('id didn´t entail catalog and the provided value was: ' +
                      catalogName);
    }
  }

  console.log('id', id);

  function success() {
    res.json({
      'success': true
    });
  }

  if (id && action) {
    if (action === 'asset-update') {
      updateAsset(categories, id).then(success, next);
    } else if (action === 'asset-create') {
      updateAsset(categories, id).then(success, next);
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
