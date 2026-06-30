// custom-buttons.js - Users can add their own top toolbar buttons here
(function(window) {
  if (!window.ChartingAPI) {
    console.error("🔌 [custom-buttons.js] ChartingAPI not found. Make sure api.js is loaded first.");
    return;
  }

  /*
   * 💡 HOW USERS ADD CUSTOM TOOLBAR BUTTONS MANUALLY:
   * 
   * 1. Register the button:
   *    window.ChartingAPI.registerTopToolbarButton('my_action_id', {
   *       label: 'My Button Text',                      // Display text
   *       tooltip: 'Hover text helper',                 // (Optional) tooltip text
   *       alignment: 'left' | 'right',                  // Placement side ('left' is default)
   *       iconSvg: '<svg width="14" height="14" ...>',  // (Optional) inline SVG icon string
   *       onClick: function(chart, buttonElement, event) {
   *          // Define your action here using the 'chart' instance!
   *          // Example: chart.drawings = []; chart.render(); // Clear drawings
   *       }
   *    });
   * 
   * 2. Enjoy! The top-toolbar.js module will automatically detect it,
   *    render it, and wire the action handlers.
   */
})(window);
