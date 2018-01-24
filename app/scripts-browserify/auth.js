'use strict';

const config = require('collections-online/shared/config');

const RESET_PASSWORD_SELECTOR = '[data-action="reset-password"]';
const RESET_PASSWORD_SUCCESS_ELEMENT = '<p>Check din mail for videre instruktioner.</p>';
const RESET_PASSWORD_FAILURE_ELEMENT = '<p>Der skete en fejl, prøv igen senere.</p>';

/* global Auth0Lock */

$(function() {
  restrictActions({
    'login': 'authenticated',
    'geo-tagging:start': 'verified',
    'motif-tagging:start': 'verified',
    'feedback:start': 'verified',
  }, lock(), verify());

  function lock() {
    let languageDictionary = {
      title: config.siteTitle
    };

    if (config.auth0.acceptTermsText) {
      languageDictionary.signUpTerms = config.auth0.acceptTermsText;
    }

    return new Auth0Lock(config.auth0.clientID, config.auth0.domain, {
      languageDictionary: languageDictionary,
      // If we've been configured with a path to the terms, we'll require the
      // user to accept the terms.
      mustAcceptTerms: !!config.auth0.acceptTermsText,
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

  function verify() {
    // Define a function that can be used to show and hide the overlay.
    const overlayHandler = function(show = true) {
      var OVERLAY_ACTIVE_CLASS = 'overlay__container--active';
      var OVERLAY_ANIM_IN_CLASS = 'overlay__container--anim-in';
      var $el = $('[data-content="auth-verification"]');
      if (show === true) {
        $el.addClass(OVERLAY_ACTIVE_CLASS);
        $el.addClass(OVERLAY_ANIM_IN_CLASS);
      }
      else if (show === false) {
        $el.removeClass(OVERLAY_ANIM_IN_CLASS);
        // Animate the removal.
        setTimeout(function () {
          $el.removeClass(OVERLAY_ACTIVE_CLASS);
        }, 300);
      }
    };

    // When requested we assume that the handler will be used right away so we
    // bind the hide-call to the now visible overlay.
    $('[data-content="auth-verification"]')
      .on('click', overlayHandler.bind({}, false));

    return overlayHandler;
  }

  function restrictActions(actions, lock, verify) {
    const authenticated = $('meta[name="authenticated"]').attr('content');
    const verified = authenticated ? $('meta[name="verified"]').attr('content') : 'false';
    const dataActions = Object.keys(actions).map(action => {
      return `[data-action="${action}"]`;
    }).join(', ');

    $(dataActions).on('click', e => {
      const requirement = actions[e.target.getAttribute('data-action')];

      // If the user is not authenticated, block the use of the action and
      // display the logon overlay.
      if (authenticated !== 'true' && (requirement === 'authenticated' ||  requirement === 'verified')) {
        e.stopPropagation();
        lock.show({
          auth: {
            params: {
              state: btoa(JSON.stringify({returnPath: window.location.href}))
            }
          }
        });
      }

      // If the user is authenticated but not verified, show the verification
      // overlay if it is required.
      if (config.features.requireEmailVerification &&
        authenticated === 'true' &&
        requirement === 'verified' && verified !== 'true') {
        e.stopPropagation();
        verify();
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
    .done(response => element.replaceWith(RESET_PASSWORD_SUCCESS_ELEMENT))
    .fail(err => element.replaceWith(RESET_PASSWORD_FAILURE_ELEMENT));
  });
});
