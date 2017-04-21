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

const ds = require('collections-online/lib/services/documents');
const config = require('collections-online/lib/config');

if(!config.es || !config.es.index || typeof(config.es.index) !== 'string') {
  throw new Error('Need exactly one index for Cumulus triggers to work.');
}

const indexing = require('../indexing/modes/run');

var helpers = {
  thousandsSeparator: function(number) {
    return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
  }
};

function createAsset(catalogAlias, assetId) {
  var state = {
    context: {
      index: config.es.index,
      geocoding: {
        enabled: true
      },
      vision: {
        enabled: true
      }
    },
    es: ds,
    mode: 'single',
    reference: catalogAlias + '/' + assetId
  };
  return indexing(state);
}

function updateAsset(catalogAlias, assetId) {
  var state = {
    context: {
      index: config.es.index,
    },
    es: ds,
    mode: 'single',
    reference: catalogAlias + '/' + assetId
  };
  return indexing(state);
}

function deleteAsset(catalogAlias, assetId) {
  return ds.delete({
    index: config.es.index,
    type: 'asset',
    id: catalogAlias + '-' + assetId
  });
}

exports.asset = function(req, res, next) {
  const action = req.body.action || null;
  const catalogName = req.body.collection || null;
  let id = req.body.id || '';
  let catalogAlias = null;

  console.log('Index asset called with body: ', JSON.stringify(req.body));

  // If the catalog alias is not sat in the ID
  if(id.indexOf('-') > -1) {
    [catalogAlias, id] = id.split('-');
  } else if(catalogName) {
    // No slash in the id - the catalog should be read from .collection
    catalogAlias = Object.keys(config.cip.catalogs)
    .reduce(function(result, alias) {
      const candidateCatalogName = config.cip.catalogs[alias];
      if(candidateCatalogName === catalogName) {
        return alias;
      } else {
        return result;
      }
    }, null);
  }

  if (!catalogAlias) {
    throw new Error('Failed to determine catalog alias');
  }

  function success() {
    res.json({
      'success': true
    });
  }

  if (id && action) {
    if (action === 'asset-update') {
      updateAsset(catalogAlias, id).then(null, next);
      // Go succeed right away
      success();
    } else if (action === 'asset-create') {
      createAsset(catalogAlias, id).then(success, next);
    } else if (action === 'asset-delete') {
      deleteAsset(catalogAlias, id).then(success, next);
    } else {
      next(new Error('Unexpected action from Cumulus: ' + action));
    }
  } else {
    var requestBody = JSON.stringify(req.body);
    next(new Error('Missing an id or an action, requested: ' + requestBody));
  }
};
