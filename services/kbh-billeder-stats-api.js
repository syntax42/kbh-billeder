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
const GET_USERS_POINTS = baseUrl + '/users/points';

// The API integration.
const kbhStatsApi = {
  // Current score for the user.
  usersPoints: function() {
    return this._doGet(GET_USERS_POINTS);
  },

  // Number of tags on assets.
  userStats: function(id) {
    return {
      geotags: {
        numberOfTags: 5,
        numberOfAssets: 5,
      },
      motifTags: {
        numberOfAssets: 4,
        numberOfTags: 20,
      },
      totalNumberOfAssets: 8,
    };
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
        if (error || response.statusCode !== 200) {
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
      request.post(path, {form: object}, (error, response, body) => {
        if (error) {
          console.log(response);
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
