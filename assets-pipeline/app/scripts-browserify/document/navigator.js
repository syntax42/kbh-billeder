const Hammer = require('hammerjs');
const helpers = require('../../../../shared/helpers');

const PAGE_SIZE = 20;
const HIDING_TIMEOUT = 3000;

const $left = $('a.document__navigator-arrow--left');
const $right = $('a.document__navigator-arrow--right');
const HIDDEN_CLASS = 'document__navigator-arrow--hidden';

const navigatorPreview = require('@views/includes/navigator-preview');

const elasticsearch = require('elasticsearch');
const es = new elasticsearch.Client({
  host: location.origin + '/api'
});

const ARROWS = {
  'right': $right,
  'left': $left
};
const DIRECTIONS = {
  2: 'right',
  4: 'left'
};

const KEYCODES = {
  'right': 39,
  'left': 37
}

const urls = {}

const navigator = {
  save: (state, isSeries) => {
    if(window.sessionStorage) {
      const searchString = JSON.stringify(state);
      if(!isSeries) {
        window.sessionStorage.setItem('search', searchString);
      } else {
        window.sessionStorage.setItem('seriesSearch', searchString);
      }
    } else {
      console.warn('Cannot save search state: sessionStorage is not supported');
    }
  },
  load: (isSeries) => {
    if(isSeries) {
      const seriesSearchString = window.sessionStorage.getItem('seriesSearch');
      return seriesSearchString ? JSON.parse(seriesSearchString) : {};
    }
    const searchString = window.sessionStorage.getItem('search');
    return searchString ? JSON.parse(searchString) : {};
  },
  initializeArrow: (direction, hit) => {
    const $arrow = ARROWS[direction];
    let url = helpers.getDocumentURL(hit.metadata);
    if(hit.metadata.isSeries) {
      url += "?is-series=true";
    }
    // Save this url such that the swipe listener can change location
    urls[direction] = url;
    const $preview = $arrow.find('.document__navigator-preview');
    $preview.html(navigatorPreview({
      helpers,
      metadata: hit.metadata
    }));
    // Listen for actions
    $arrow.on('click',()=> {
      navigator.navigate(direction);
    })
    $(window).on('keydown', (e) => {
      if(e.which === KEYCODES[direction]){
        navigator.navigate(direction);
      }
    })
    // Showing the arrow
    navigator.showArrow($arrow);
    $(window).on('mousemove', () => {
      navigator.showArrow($arrow);
    }).on('touchstart', () => {
      navigator.showArrow($arrow);
    }).on('touchmove', () => {
      navigator.showArrow($arrow);
    });
  },
  navigate: direction => {
    if(direction in urls){
      location.replace(urls[direction]);
    }
  },
  startHidingArrow: $arrow => {
    let hideTimeout = $arrow.data('hide-timeout');
    if(hideTimeout) {
      clearTimeout(hideTimeout);
    }
    // The arrows hide when the screen is not interacted with
    hideTimeout = setTimeout(() => {
      // Time is up
      $arrow.addClass(HIDDEN_CLASS);
    }, HIDING_TIMEOUT);
    $arrow.data('hide-timeout', hideTimeout);
  },
  showArrow: $arrow => {
    $arrow.removeClass(HIDDEN_CLASS);
    navigator.startHidingArrow($arrow);
  }
};

// Register a listener for the swipe gesture
$('.document__player').each((i, doc) => {
  const hammer = new Hammer(doc);
  hammer.on('swipe', (e) => {
    if(e.direction in DIRECTIONS) {
      navigator.navigate(DIRECTIONS[e.direction]);
    }
  });
});

// Check if the session storage is available
if(window.sessionStorage) {
  let currentId = $('.document').data('id');
  //Check if the id is for a series url instead
  if(typeof currentId == "undefined") {
    currentId = $('.document-content').data('id');
  }
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);

  let savedSearchResult = {};
  if(params.get("is-series")) {
    savedSearchResult = navigator.load(true);
  } else {
    savedSearchResult = navigator.load();
  }
  const { resultsLoaded, queryBody } = savedSearchResult;

  if(currentId && resultsLoaded && queryBody) {
    let resultsDesired = resultsLoaded.length;

    // Locate the current assets index in the last search result
    const currentIndex = resultsLoaded.findIndex(hit => {
      //If id is undefined, this might be a series instead of an asset
      if(typeof hit.metadata.id == "undefined") {
        return currentId == hit.metadata.url;
      }
      // The non-typed equal comparison is on purpose
      return currentId == hit.metadata.id;
    });

    const previousIndex = currentIndex - 1;
    const nextIndex = currentIndex + 1;

    if(currentIndex > -1) {
      if(previousIndex >= 0) {
        const previous = resultsLoaded[previousIndex];
        navigator.initializeArrow('left', previous);
      }

      if(nextIndex < resultsLoaded.length) {
        const next = resultsLoaded[nextIndex];
        navigator.initializeArrow('right', next);
      } else {
        // Fetch some more results
        resultsDesired += PAGE_SIZE;
        es.search({
          body: queryBody,
          from: resultsLoaded.length,
          size: resultsDesired - resultsLoaded.length
        }).then((response) => {
          response.hits.hits.forEach((hit) => {
            const item = {
              type: hit._type,
              metadata: hit._source
            };
            resultsLoaded.push(item);
          });
          // Now we might be able to display the next
          if(nextIndex < resultsLoaded.length) {
            navigator.save({
              resultsLoaded, queryBody
            });
            // Now we can initialize
            const next = resultsLoaded[nextIndex];
            navigator.initializeArrow('right', next);
          }
        });
      }
    }
  }
}

module.exports = navigator;
