const users = require('collections-online/lib/controllers/users');
const kbhStatsApi = require('../services/kbh-billeder-stats-api');
const auth0 = require('collections-online/lib/services/auth0');
const config = require('collections-online/shared/config');

const Service = auth0.Service

users.renderProfile = async (req, res) => {
  const { user } = req;

  console.log(await Service)

  let points = kbhStatsApi.userPoints(user.id);
  let stats = kbhStatsApi.userStats(user.id);

  try {
    [points, stats] = [await points, await stats]
  } catch(err) {
    console.log(err)
  }

  res.render('profile' + (config.features.oldProfilePage ? '' : '2'), { points , stats, user });
};

users.renderEditProfile = async (req, res) => {
  const { user } = req;
  let userCanChangePassword = user.provider === 'auth0';
  res.render('edit-profile', { user, userCanChangePassword });
};

module.exports = users;
