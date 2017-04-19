const request = require('request');
const helpers = require('collections-online/lib/helpers');
const cip = require('../../services/cip');

const config = require('collections-online/lib/config');
const API_KEY = config.google.keys.unrestricted;

const querystring = require('querystring');

const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

const saveApproximateCoordinates = (metadata, coordinates) => {
  const values = {};
  values[config.geoTagging.approximateCoordinatesField] = coordinates;
  return cip.setFieldValues(metadata.collection, metadata.id, values)
  .then((response) => {
    if (response.statusCode !== 200) {
      console.error(response.body);
      throw new Error('Failed to set the field values');
    }
  });
};

module.exports = (state, metadata) => {
  const hasApproximateLocation = !!metadata.google_maps_coordinates_approximate;

  if(API_KEY && metadata.street_name && !hasApproximateLocation) {
    const address = helpers.geoTagging.getAddress(metadata);
    const query = querystring.stringify({
      address: address,
      key: API_KEY
    });

    const url = GEOCODING_URL + '?' + query;

    return new Promise((resolve, reject) => {
      request({
        url: url,
        json: true
      }, (error, response, body) => {
        if(error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    }).then(response => {
      if(response.results && response.results.length > 0) {
        const result = response.results[0];
        return result.geometry.location;
      } else {
        return null;
      }
    }).then(location => {
      if(location) {
        metadata.google_maps_coordinates_approximate = [
          location.lat,
          location.lng
        ].join(', ');
      }
      return metadata;
    }).then(metadata => {
      // Save these new approximate coordinates to the CIP.
      const coordinates = metadata.google_maps_coordinates_approximate;
      if(coordinates) {
        return saveApproximateCoordinates(metadata, coordinates)
        .then(() => {
          return metadata;
        });
      } else {
        return metadata;
      }
    });
  } else if(!API_KEY) {
    console.log('A Google Maps API key is required to geocode.');
    return metadata;
  } else if(hasApproximateLocation) {
    console.log('Skipping geocoding, as the approximate location was sat');
    return metadata;
  } else {
    return metadata;
  }
}
