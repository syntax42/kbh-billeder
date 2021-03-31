'use strict';

module.exports = {
  type: 'image-controller',
  module: require('../controllers/image'),
  initialize: () => {
    const config = require('../collections-online/lib/config');

    if(config.cip.client.authMechanism !== 'http-basic') {
      const cip = require('../services/cip');
      return cip.initSession().then(() => {
        // TODO: Consider creating the structure of categories (used for the menu)
        // from another API than the CIP
        // return require('./cip-categories').initialize(app)
      }).then(() => {
        setInterval(() => {
          // Consider calling close session ..
          cip.sessionRenew();
        }, config.cip.sessionRenewalRate || 60*60*1000);
        console.log('CIP session initialized');
      });
    }
  }
};
