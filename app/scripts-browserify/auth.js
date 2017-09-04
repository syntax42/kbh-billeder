'use strict';

const config = require('collections-online/shared/config');

const RESET_PASSWORD_SELECTOR = '[data-action="reset-password"]';

/* global Auth0Lock */

$(function() {
  restrictActions([
    'login',
    'geo-tagging:start',
    'motif-tagging:start',
    'feedback:start',
  ], lock());

  function lock() {
    return new Auth0Lock(config.auth0.clientID, config.auth0.domain, {
      languageDictionary: {
        title: config.siteTitle
      },
      theme: {
        logo: '/images/favicons/favicon-96x96.png',
        labeledSubmitButton: false,
        primaryColor: config.themeColor
      },
      language: 'da',
      auth: {
        redirectUrl: config.auth0.callbackURL,
        responseType: 'code',
        params: {
          scope: 'openid name email picture'
        }
      }
    });
  }

  function restrictActions(actions, lock) {
    const authenticated = $('meta[name="authenticated"]').attr('content');

    const dataActions = actions.map(action => {
      return `[data-action="${action}"]`;
    }).join(', ');

    $(dataActions).on('click', e => {
      if(authenticated !== 'true') {
        e.stopPropagation();
        lock.show({
          auth: {
            params: {
              state: btoa(JSON.stringify({returnPath: window.location.href}))
            }
          }
        });
      }
    });
  }

  $(RESET_PASSWORD_SELECTOR).on('click', e => {
    const url = location.origin + '/reset-password';
    const element = $(e.target);
    const email = element.data('email');
    const connection = element.data('connection');

    $
    .get(url, {email, connection})
    .then(response => {
      alert('You have been sent an email');
    })
    .catch(err => alert('error'));
  });
});
