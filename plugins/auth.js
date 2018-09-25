
const passport = require('passport');
const helpers = require('../shared/helpers');
const auth0 = require('../lib/services/auth0');
const Auth = auth0.Auth;
const plugins = require('../plugins');
const users = plugins.getFirst('users-controller');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

module.exports = {
  type: 'authentication',
  module: auth0,
  initialize: (app) => {
    passport.use(auth0.strategy);

    passport.serializeUser(function(user, done) {
      done(null, user);
    });

    passport.deserializeUser(function(user, done) {
      done(null, user);
    });

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function(req, res, next) {
      res.locals.user = req.user;
      next();
    });
  },

  registerRoutes: app => {
    app.get('/login',
      function(req, res, next) {
        req.session["auth_redirect"] = req.query.state;
        next();
      },
      passport.authenticate('auth0',auth0.passportConfig),
      function(req, res) {
        res.redirect('/');
      }
    );

    app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
    });

    // Most user facing routes are danish, so let's keep it that way.
    app.get('/min-side', users.renderProfile);
    app.get('/rediger-min-side', users.renderEditProfile);

    app.post('/update-user', [
      check('password').exists(),
      check('passwordConfirmation', 'passwordConfirmation field must have the same value as the password field')
        .exists()
        .custom((value, { req }) => value === req.body.password)
    ], async (req, res) => {
      let status;

      try {
        await auth0.getManagementService().users.update(
          { id: req.user.user_id }, { password: req.body.password }
        );
        status = 200;
        res.redirect('/rediger-min-side');
      }
      catch(err) {
        console.log(err.message);
        status = 500;
      }

      res.redirect('/rediger-min-side');
    });

    app.get('/reset-password', async (req, res) => {
      const {email, connection} = req.query;
      let status;

      try {
        await Auth.requestChangePasswordEmail({email, connection});
        status = 200;
      }
      catch(err) {
        console.log(err.message);
        status = 500;
      }

      res.status(status).json({});
    });

    app.get('/delete-account', async (req, res) => {
      try {
        await auth0.getManagementService().users.delete({ id: req.user.user_id });
        status = 200;
        res.redirect('/logout');
      }
      catch (err) {
        console.log(err.message);
        status = 500;
      }
    });

    app.get('/auth/callback', passport.authenticate('auth0', {
      failureRedirect: '/'
    }), function(req, res) {
      const serializedState = req.session["auth_redirect"];

      if(typeof(serializedState) === 'string') {
        const returnPath = helpers.decodeReturnState(serializedState);
        res.redirect(returnPath);
      } else {
        res.redirect('/');
      }
    });
  }
};
