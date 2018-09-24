const users = require('collections-online/lib/controllers/users');
const kbhStatsApi = require('../services/kbh-billeder-stats-api');
const auth0 = require('collections-online/lib/services/auth0');
const config = require('collections-online/shared/config');

const Service = auth0.Service;

users.renderProfile = async (req, res) => {
  if (!req.user) {
    res.redirect('/');
    return;
  }

  const {user} = req;

  let points = kbhStatsApi.userPoints(user.id);
  let stats = kbhStatsApi.userStats(user.id);

  try {
    [points, stats] = [await points, await stats];
  } catch(err) {
    console.log(err);
  }

  res.render('profile' + (config.features.oldProfilePage ? '' : '2'), {points , stats, user});
}

module.exports = users;
