// custom-crosshair.js - Users can configure the crosshair settings here
(function(window) {
  if (!window.ChartingAPI) {
    console.error("🔌 [custom-crosshair.js] ChartingAPI not found. Make sure api.js is loaded first.");
    return;
  }

  /*
   * 💡 HOW USERS CUSTOMIZE THE CROSSHAIR:
   * 
   * Call the ChartingAPI to configure crosshair settings:
   * 
   * window.ChartingAPI.setCrosshairSettings({
   *   color: 'rgba(239, 83, 80, 0.4)', // Crosshair line color (e.g., transparent red)
   *   width: 0.8,                     // Line width
   *   dashArray: [3, 3],              // Dash style [dashLength, gapLength]
   *   showPriceBadge: true,           // Toggle Y-axis price badge visibility
   *   showTimeBadge: true,            // Toggle X-axis time badge visibility
   *   badgeBgColor: '#2962ff',        // Custom background color for coordinate badges (e.g. blue)
   *   badgeTextColor: '#ffffff'       // Custom text color for coordinate badges
   * });
   */

  // Apply default custom crosshair configuration
  window.ChartingAPI.setCrosshairSettings({
    color: '', // Leave empty to automatically use theme-aware colors (light vs dark)
    width: 0.8,
    dashArray: [3, 3],
    showPriceBadge: true,
    showTimeBadge: true,
    badgeBgColor: '', // Leave empty to automatically use theme-aware colors (light vs dark)
    badgeTextColor: '#ffffff'
  });

  console.log("🔌 [custom-crosshair.js] Loaded and registered custom crosshair settings successfully.");
})(window);
