// custom-timescale.js - Users can configure the X-axis timescale settings here
(function(window) {
  if (!window.ChartingAPI) {
    console.error("🔌 [custom-timescale.js] ChartingAPI not found. Make sure api.js is loaded first.");
    return;
  }

  /*
   * 💡 HOW USERS CUSTOMIZE THE TIME SCALE:
   * 
   * Call the ChartingAPI to configure timescale settings:
   * 
   * window.ChartingAPI.setTimeScaleSettings({
   *   textColor: '#707584',           // Text color of labels
   *   lineColor: 'rgba(0, 0, 0, 0.08)', // Grid/border line color
   *   lineWidth: 0.5,                 // Grid/border line width
   *   lineDash: [4, 4],               // Grid dash style [dashLength, gapLength]
   *   fontSize: '10px',               // Label font size
   *   fontFamily: 'Inter, Arial, sans-serif', // Label font family
   *   axisBackgroundColor: '#1a1a24'  // Custom X-axis row background color
   * });
   */

  // Apply default custom timescale configuration
  window.ChartingAPI.setTimeScaleSettings({
    textColor: '', // Leave empty to automatically use theme-aware colors (light vs dark)
    lineColor: '', // Leave empty to automatically use theme-aware colors (light vs dark)
    lineWidth: 0.5,
    lineDash: [4, 4],
    fontSize: '10px',
    fontFamily: 'Inter, Arial, sans-serif',
    axisBackgroundColor: '' // Leave empty to automatically use theme-aware colors (light vs dark)
  });

  console.log("🔌 [custom-timescale.js] Loaded and registered custom timescale settings successfully.");
})(window);
