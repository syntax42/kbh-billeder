'use strict';
const _ = require('lodash');
const kbhStatsApi = require('../services/kbh-billeder-stats-api');
const auth0 = require('collections-online/lib/services/auth0');
const Service = auth0.getManagementService;
const PLACEHOLDER = '{{STAT}}';

const renderer = {
  render: async (next, locals, req) => {
    // Get the current content that is about be rendered.
    let pageContent = _.get(locals, 'data.page.content', '');

    // Bail out if the content does not contain our placeholder.
    if(pageContent.indexOf(PLACEHOLDER) === -1) {
      next();
      return;
    }

    // Prepare fetching all statistics we need.
    let motiftagsWeek = kbhStatsApi.motifTags('week');
    let geotagsWeek = kbhStatsApi.geotags('week');
    let motiftagsTotal = kbhStatsApi.motifTags();
    let geotagsTotal = kbhStatsApi.geotags();
    let usersWeek = kbhStatsApi.allUsersPoints('week');
    let usersTotal = kbhStatsApi.allUsersPoints();

    // Prepare a function that maps auth0 user_ids to human-readable names.
    const mapUsers = async (data) => {
      // No error-handling here - if it fails we want it to fail hard.
      let management = await Service();

      // We load the users in separate calls for now, eventually we'll
      // hopefully figure out how to load them in bulk.
      let loadedUsers = await Promise.all(data.map(async (item) => {
        try{
          return await management.getUser({'id': item.user_id});
        } catch(err) {
          console.warn("Unable to look up user with id " + item.user_id);
          console.warn(err);
          return {};
        }
    }));

      // Map the scoreEntries we got from the API to new entries with a name
      // property added.
      return data.map((scoreEntry) => {

        // Default in case we cant map the name.
        scoreEntry.name = 'Ukendt';
        if (scoreEntry.user_id) {
          // Lookup the user we got from Auth0 by user_id.
          let loadedUser = _.find(loadedUsers, {'user_id': scoreEntry.user_id});
          if (loadedUser) {
            if (loadedUser.name) {
              // We have a name, so far so good.
              // In situations where Auth0 don't really have the name they fall
              // back to the email.  In that situation the "nickname" field might
              // give us a better name.
              if (loadedUser.name === loadedUser.email && loadedUser.nickname) {
                scoreEntry.name = loadedUser.nickname;
              } else {
                scoreEntry.name = loadedUser.name;
              }
            } else if (loadedUser.nickname) {
              // If we don't have a name but do have nickname, use it.
              scoreEntry.name = loadedUser.nickname;
            }
          }
        }
        return scoreEntry;
      });
    };

    // Resolve all promises and process the data.
    try {
      usersWeek = await usersWeek;
      usersTotal = await usersTotal;
      [
        motiftagsWeek,
        geotagsWeek,
        motiftagsTotal,
        geotagsTotal,
        usersWeek,
        usersTotal
      ] =  [
        await motiftagsWeek,
        await geotagsWeek,
        await motiftagsTotal,
        await geotagsTotal,
        await mapUsers(usersWeek),
        await mapUsers(usersTotal)
      ];
    } catch(err) {
      console.warn('Error while gathering user statistics');
      console.warn(err);
      pageContent = pageContent.replace(PLACEHOLDER, '');
      next();
      return;
    }

    // We got all the data we needed, now prepare data for the template.
    const stats = {
      'week': {
        'geotags': geotagsWeek.length,
        'motiftagged': _.uniqBy(motiftagsWeek, 'asset_id').length,
        'motiftags': motiftagsWeek.length
      },
      'total': {
        'geotags': geotagsTotal.length,
        'motiftagged': _.uniqBy(motiftagsTotal, 'asset_id').length,
        'motiftags': motiftagsTotal.length
      },
      'leaders': {
        'week': usersWeek,
        'total': usersTotal
      }
    };

    // Render our data via an internal request.
    req.app.render('stat/top10', {'stats': stats}, (error, html) => {
      if (error) {
        console.warn('Error while fetching user statistics for top 10');
        console.warn(error);
        pageContent = pageContent.replace(PLACEHOLDER, '');
      } else {
        locals.data.page.content = pageContent.replace(PLACEHOLDER, html);
      }

      // Async processing done, pass the control on to the next pre-renderer.
      next();
    });
  }
};

module.exports = renderer;
