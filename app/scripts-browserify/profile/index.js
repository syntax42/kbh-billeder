/**
 * This module handles all clientside searching
 */

const config = require('collections-online/shared/config');
const helpers = require('../../../shared/helpers');

const SELECTOR_USER_CONTRIBUTIONS_SECTIONS = '#user-contributions .user-contributions__section[data-section]';
const SELECTOR_USER_CONTRIBUTIONS_TABS = '#user-contributions .user-contributions__header-tab[data-section]';
const SELECTOR_DEFAULT_USER_CONTRIBUTIONS_TAB = '#user-contributions .user-contributions__header-tab[data-section=tag]';

/**
 * Sets up a controller that can retrive user contributions and add them to a
 * profile page.
 *
 * @constructor
 */
function UserContributionsLoader({$sectionElement, fetchEndpoint}) {
  // Keep track of which page we'll fetch next.
  // Notice: The endpoint is 1-indexed, and the page-size is determined on the
  // backend.
  let nextPage = 1;
  let firstFetchAttempted = false;
  let hasMore = true;

  let lastSection = undefined;
  const templates = {
    contributionSection: require('views/includes/profile/user-contributions-section')
  };

  function getContributionDate (timeString) {
    const date = new Date(timeString);
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDay();
  }

  const _sectionBuilder = (sections, item) => {
    // Breakers in image proxy and points loader

    item.contribution_date = getContributionDate(item.contribution_time);

    const currentSectionIndex = sections.length - 1;
    // Append to current section if it as the same date as the current item.
    if (sections.length > 0 && sections[currentSectionIndex].date === item.contribution_date) {
      sections[currentSectionIndex].items.push(item);
    } else {
      // Create a new section with the current item in it.
      sections.push(
        {
          time: item.contribution_time,
          date: item.contribution_date,
          id: item.contribution_date,
          items: [item]
        }
      );

    }
    return sections;
  };

  /**
   * Fetch data from the backend.
   */
  const doFetch = () => {
    if (!hasMore) {
      return;
    }

    $sectionElement.addClass('is-loading');
    fetch(`${fetchEndpoint}/${nextPage}`)
      .then(function (response) {
        return response.json();
      })
      .then(function (jsonData) {
        // Process data if it is available.
        if (jsonData.length > 0) {
          nextPage++;
          load(jsonData);
          if (!firstFetchAttempted) {
            firstFetchAttempted = true;
          }
        } else if (firstFetchAttempted) {
          // We saw at least one page before we ran out.
          hasMore = false;
        } else {
          // We where never able to fetch any data for this section, add a class
          // saying so.
          hasMore = false;
          $sectionElement.addClass('is-empty');
        }
      })
      .catch(error => {
        console.warn('Error while fetching contributions');
        console.warn(error);
      })
      .finally(() => {
        // Remove any loaders.
        $sectionElement.removeClass('is-loading');
      });

  };

  // Function for loading contributions into an element.
  const load = (items) => {

    // See if we should start off with the last section.
    let initialList = [];
    if (lastSection && lastSection.date === getContributionDate(items[0].contribution_time)) {
      initialList = lastSection;
    }
    // Convert list of items to list of sections with items
    const sections = items.reduce(_sectionBuilder, initialList);

    // TODO - at this point we could start storing results into the browsers
    // history in order to be able to return to the same resultset.
    // Render each section and add it to the region.
    sections.forEach(
      (section) => {
        $sectionElement.append(templates.contributionSection({section}));
        lastSection = section;
      }
    );
  };

  // Return a handler object the caller can use to load more elments.
  return {
    doFetch,
    // Returns true if we either have not attempted to fetch any data, or
    // we've yet to hit the last page.
    hasMore: () => { return !firstFetchAttempted || hasMore; },
    firstFetchAttempted: () =>  {return firstFetchAttempted; },

  };
}

function initialize($) {
  const _handleTabClick = (event) => {
    const $tabElement = $(event.currentTarget);
    const sectionNameSelector = '.user-contributions__section-' + $tabElement.data('section');
    const sectionController = $(sectionNameSelector).data('controller');

    // Reset all sections and tabs.
    $(SELECTOR_USER_CONTRIBUTIONS_SECTIONS).removeClass('is-active');
    $(SELECTOR_USER_CONTRIBUTIONS_TABS).removeClass('is-active');


    // Enable the new section and tab.
    $(sectionNameSelector).addClass('is-active');
    $tabElement.addClass('is-active');

    // Populate it if this is our first hit.
    if (!sectionController.firstFetchAttempted()) {
      sectionController.doFetch();
    }
  };

  $(SELECTOR_USER_CONTRIBUTIONS_TABS).on('click', _handleTabClick);

  let fetchEndpointBase = location.origin + '/min-side/contributions';

  $(SELECTOR_USER_CONTRIBUTIONS_SECTIONS).each((index, section) => {
    const $sectionElement = $(section);
    const fetchEndpoint = fetchEndpointBase + '/' + $sectionElement.data('section');
    // TODO - We could initialize from the browsers history if we have it
    // available.
    const controller = UserContributionsLoader({
      $sectionElement, fetchEndpoint
    });
    $sectionElement.data('controller', controller);
    // TODO - trigger click on default section.

    // TODO - only do fetch on active element
    // - wire up on-scroll.
  });

  $(SELECTOR_DEFAULT_USER_CONTRIBUTIONS_TAB).click();
}

// If the path is right - let's initialize
if(decodeURIComponent(location.pathname) === '/min-side') {
  $(initialize);
}
