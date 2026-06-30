// custom-interval.js - Developer-customizable script to add custom intervals to the chart
(function(window) {
  // Ensure the ChartingAPI is registered on window before using
  if (!window.ChartingAPI) {
    console.error("ChartingAPI not loaded yet.");
    return;
  }

  // Examples: Add custom intervals to the dropdown menu groups.
  // The format should be a number followed by:
  // - 'm' for Minutes (e.g., '2m', '10m', '45m')
  // - 'H' for Hours (e.g., '2H', '3H', '12H')
  // - 'D' for Days (e.g., '1D', '2D', '3D')
  // - 'W' for Weeks (e.g., '1W', '2W')
  // - 'M' for Months (e.g., '1M', '3M')
  // - 'S' for Seconds (e.g., '10S', '30S')
  
  // Registering custom developer intervals (exactly 3 intervals):
  window.ChartingAPI.registerCustomInterval('1m');
  window.ChartingAPI.registerCustomInterval('5m');
  window.ChartingAPI.registerCustomInterval('30m');
  window.ChartingAPI.registerCustomInterval('1D');
  console.log("🔌 [ChartingAPI] Loaded custom developer intervals successfully.");
})(window);
