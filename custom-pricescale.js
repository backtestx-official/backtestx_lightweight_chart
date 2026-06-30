// custom-pricescale.js - Users can configure the Y-axis price scale settings here
(function(window) {
  if (!window.ChartingAPI) {
    console.error("🔌 [custom-pricescale.js] ChartingAPI not found. Make sure api.js is loaded first.");
    return;
  }

  /*
   * 💡 HOW USERS CUSTOMIZE THE PRICE SCALE:
   * 
   * Call the ChartingAPI to configure price scale settings:
   * 
   * window.ChartingAPI.setPriceScaleSettings({
   *   textColor: '#707584',           // Text color of labels
   *   lineColor: 'rgba(0, 0, 0, 0.08)', // Grid/border line color
   *   lineWidth: 0.5,                 // Grid/border line width
   *   lineDash: [4, 4],               // Grid dash style [dashLength, gapLength]
   *   fontSize: '10.5px',             // Label font size
   *   fontFamily: 'Inter, Arial, sans-serif', // Label font family
   *   axisBackgroundColor: '#1a1a24'  // Custom Y-axis column background color
   * });
   */

  // Apply default custom price scale configuration
  window.ChartingAPI.setPriceScaleSettings({
    textColor: '', // Leave empty to automatically use theme-aware colors (light vs dark)
    lineColor: '', // Leave empty to automatically use theme-aware colors (light vs dark)
    lineWidth: 0.5,
    lineDash: [4, 4],
    fontSize: '10.5px',
    fontFamily: 'Inter, Arial, sans-serif',
    axisBackgroundColor: '' // Leave empty to automatically use theme-aware colors (light vs dark)
  });

  console.log("🔌 [custom-pricescale.js] Loaded and registered custom price scale settings successfully.");
})(window);
