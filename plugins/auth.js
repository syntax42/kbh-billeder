const passport = require('passport');
const auth0 = require('../../lib/services/auth0');
const Auth = auth0.Auth;
const plugins = require('../../plugins');
const users = plugins.getFirst('users-controller');

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
    app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
    });

    // Most user facing routes are danish, so let's keep it that way.
    app.get('/min-side', users.renderProfile);

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

    app.get('/auth/callback', passport.authenticate('auth0', {
      failureRedirect: '/'
    }), function(req, res) {
      const serializedState = req.query.state;

      if(typeof(serializedState) === 'string') {
        const state = JSON.parse(Buffer.from(serializedState, 'base64'));
        res.redirect(state.returnPath);
      } else {
        res.redirect('/');
      }
    });
  }
};
