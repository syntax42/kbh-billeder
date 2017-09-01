'use strict';
const request = require('request');
const config = require('collections-online/shared/config');
const assert = require('assert');
const mailgun = require('collections-online/lib/services/mailgun');

// Pull in configuration and verify that all required values are present.
const {baseUrl, fallbackEmailTo, fallbackEmailFrom} = config.kbhBillederStatsApi;
assert.ok(baseUrl, 'KBH Billeder stat api url');
assert.ok(fallbackEmailTo, 'Fallback email to undefined');
assert.ok(fallbackEmailFrom, 'Fallback email from undefined');

// Setup urls for each endpoint.
const POST_TAGS = baseUrl + '/tags';
const POST_GEOLOCATIONS = baseUrl + '/geolocations';
const GET_USERS_POINTS = baseUrl + '/users/points';
const GET_USERS = baseUrl + '/users';

// The API integration.
const kbhStatsApi = {
  // Current score for the user.
  usersPoints: function() {
    return this._doGet(GET_USERS_POINTS);
  },

  // Number of tags on assets.
  userStats: function(id) {
    // Path: /users/{id}
    return this._doGet(GET_USERS + '/' + id).then(function(body) {
      const result = JSON.parse(body);
      // Override the response for now.
      return {
        geotags: {
          numberOfTags: result.geolocations || 0,
          numberOfAssets: 999,
        },
        motifTags: {
          numberOfAssets: 999,
          numberOfTags: result.tags || 0,
        },
        totalNumberOfAssets: 999,
      };
    });
  },

  // Store a user-submitted geotag.
  saveGeoTag: function(metadata) {
    const id = metadata.id;
    const collection = metadata.collection;
    const assetId = collection + '-' + id;
    const userId = metadata.userId;
    const latitude = metadata.latitude;
    const longitude = metadata.longitude;
    const heading = metadata.heading;

    return this._doPost(POST_GEOLOCATIONS, {
      'user_id': userId,
      'asset_id': assetId,
      'geolocation': {
        'latitude': latitude,
        'longitude': longitude,
        'direction': heading
      }
    }).then(() => {
      // Log success.
      console.log('Reported geotag on asset ' + assetId + ' for user ' + userId);
      // Successive entries in the promise-chain expects the metadata to passed
      // along.
      return metadata;
    }, () => {
      // Log error.
      console.error('Error while reporting geotag on asset ' + assetId + ' for user ' + userId);
    });
  },

  // Store a number of tags for a user on a asset.
  saveTags: function({id, collection, userTags, userId}) {
    const assetId = collection + '-' + id;
    return this._doPost(POST_TAGS, {
      'user_id': userId,
      'asset_id': assetId,
      'tags': userTags,
    }).then(() => {
      // Log success.
      console.log('Reported ' + userTags.length + ' tags on asset ' + assetId + ' for user ' + userId);
    }, () => {
      // Log error.
      console.error('Error while reporting ' + userTags.length + ' tags on asset ' + assetId + ' for user ' + userId);
    });
  },

  // Perform a GET request, returns a promise.
  _doGet: function(path)  {
    return new Promise((resolve, reject) => {
      request.get(path, (error, response, body) => {
        if (error || (response.errorCode < 200 || response.errorCode > 299)) {
          const errorString = response.statusCode + ': ' + response.statusMessage;
          console.log('Failed call to API ' + path);
          console.log('Error: ' + errorString);
          reject(response.statusMessage);
        } else {
          resolve(body);
        }
      });
    });
  },
  // Perform a POST request, returns a promise.
  _doPost: function(path, object)  {
    return new Promise((resolve, reject) => {
      console.log("Posting to " + path);
      request.post(path, {form: object}, (error, response, body) => {
        console.log("Request done - erro " + error);
        console.log(response.statusCode + ': ' + response.statusMessage);
        if (error || (response.errorCode < 200 || response.errorCode > 299)) {
          const payload = JSON.stringify(object);
          const errorString = response.statusCode + ': ' + response.statusMessage;

          // Log the error.
          console.log('Failed call to API ' + path);
          console.log('Error: ' + errorString);
          console.log('Payload: \n' + payload);

          // Send an error-mail.
          let mailBody = '';
          mailBody += 'Endpoint: ' + path + '<br>--<br>';
          mailBody += 'Response: ' + errorString + '<br>--<br>';
          mailBody += 'Response body: <br>' + body + '<br>--<br>';
          mailBody += 'Attempted Payload:<br>' + payload + '<br>--<br>';

          mailgun.sendMessage(fallbackEmailFrom, fallbackEmailTo, 'Failed API Request', mailBody);
          reject(response.statusMessage, body);
        } else {
          console.log("response");
          console.log(response);
          resolve(response, body);
        }
      });
    });
  },
};

// Perform an initial request to ensure we have connectivity.
kbhStatsApi.usersPoints().then(() => {
  console.log('API connectivity OK');
}, (err) => {
  console.log('Could not connect to the KBH Billeder Stats API error: ' + err);
});

module.exports = kbhStatsApi;
