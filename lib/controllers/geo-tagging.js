'use strict';

var request = require('request');
var Q = require('q');
var config = require('../config');
const ds = require('../services/documents');
const _ = require('lodash');

const plugins = require('../../plugins');
const geoTagController = plugins.getFirst('geo-tag-controller');
if(!geoTagController) {
  throw new Error('Missing a geo-tag-controller plugin!');
}

function deg(w) {
  w = w % 360;
  return w < 0 ? w + 360 : w;
}

exports.save = function(req, res, next) {
  // Check with the CIP to ensure that the asset has not already been geotagged.
  var collection = req.params.collection;
  var id = req.params.id;
  var latitude = parseFloat(req.body.latitude);
  var longitude = parseFloat(req.body.longitude);
  const userId = req.user.id;
  // Checking if heading is a key in the body, as a valid heading can be 0.
  // Heading is also converted to a degree between 0 and 360
  var heading = 'heading' in req.body ?
      deg(parseFloat(req.body.heading)) :
      null;

  if (!config.features.geoTagging) {
    throw new Error('Geotagging is disabled.');
  }

  const userObject = {
    collection,
    id,
    latitude,
    longitude,
    heading,
    userId,
  };
  const assetIdentifier = collection + '-' + id;

  // Initiate our own update of the ES, as soon as the update is performed,
  // echo the update back to the user.
  const indexUpdate = geoTagController.updateIndexFromData(userObject).then(
    (result) => {
      console.log(`Successful reindex of ${assetIdentifier} after user submission`);
      res.json(result);
    },
    (error) => {
      console.warn(`Unable to reindex ${assetIdentifier} after user submission - reindex required`);
      console.warn(error);
      throw error;
    }
  );
  const cipSave = geoTagController.save(userObject);

  // Report if an error occured, and attempt to give the browser a usable reply.
  Promise.all([cipSave, indexUpdate])
    .catch(
      (error) => {
        console.warn(`Parallel update of ${assetIdentifier} in ES and CIP failed`);
        console.warn(error);

        // Attempt to fetch document again an pass the original metadata back.
        ds.getSource({
          type: 'asset',
          id: assetIdentifier
        }).then(
          (metadata) => {
            res.json(_.pick(metadata, ['collection', 'id', 'latitude', 'longitude', 'heading', 'userId']));
          }
        );
      }
    );
};
