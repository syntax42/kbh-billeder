const request = require('request');
const helpers = require('collections-online/lib/helpers');

const config = require('collections-online/lib/config');
const API_KEY = config.googleMapsAPIKey;

const querystring = require('querystring');

const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json'

module.exports = function(state, metadata) {
  if(!API_KEY) {
    console.log('A Google Maps API key is required to geocode.');
    return metadata;
  };
  if(metadata.street_name){
    const address = helpers.geoTagging.getAddress(metadata);
    const query = querystring.stringify({
      address: address,
      key: API_KEY
    });

    const url = GEOCODING_URL + '?' + query;

    const options = {
      url: url,
      headers: {
        'Referer': 'http://kbh-billeder.dk'
      }
    }

    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if(error) reject(error);
        else resolve(body);
      });
    }).then((response) => {
      console.log(response);
    });
  }
  return metadata;
}
