const users = require('collections-online/lib/controllers/users');
const kbhStatsApi = require('../services/kbh-billeder-stats-api');

users.renderProfile = async (req, res) => {
  const { user } = req;

  let points = kbhStatsApi.userPoints(user.id);
  let stats = kbhStatsApi.userStats(user.id);

  try {
    [points, stats] = [await points, await stats]
  } catch(err) {
    console.log(err)
  }

  res.render('profile', {points , stats, user})
}

module.exports = users;
