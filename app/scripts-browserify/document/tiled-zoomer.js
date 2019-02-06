/**
 * Handle tiled zoom on asset pages.
 */
// Register click listener that acts on the 'toggle-expandable' action
const DOCUMENT_SELECTOR = '.document';
const TOGGLE_TILED_ZOOM = '[data-action="toggle-tiled-zoom"]';

const tiledZoomer = {
  /**
   * @param element
   *   The element that the user click to toggle. It must be placed under main
   *   asset .document parent.
   */
  toggle: (element) => {
    // Drill up to the first parent, and then toggle all childrens visibility-
    // state. This assumes that we start in a state where the the main asset-
    // page is visible, and the zoom overlay is hidden (or vice-versa).
    $(element).parents('.document').first().children().toggle();
  },
};

// Register a click-listener on any tiled zoom button.s
$(DOCUMENT_SELECTOR).on('click', TOGGLE_TILED_ZOOM, (element) => {
  tiledZoomer.toggle(element.target);
});

module.exports = tiledZoomer;
