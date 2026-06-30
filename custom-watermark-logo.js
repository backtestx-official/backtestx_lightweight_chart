// custom-watermark-logo.js - Configure interactive watermark logo properties
(function(window) {
  if (!window.ChartingAPI) {
    console.error("🔌 [custom-watermark-logo.js] ChartingAPI not found. Make sure api.js is loaded first.");
    return;
  }

  /*
   * 💡 HOW DEVELOPERS CUSTOMIZE THE WATERMARK LOGO:
   * 
   * Call the ChartingAPI to configure settings:
   * 
   * window.ChartingAPI.setWatermarkLogoSettings({
   *   show: true,                             // Toggle visibility of the branding pill badge
   *   logoUrl: 'https://backtestx.in/logo.png', // URL/path to the logo image
   *   clickUrl: 'https://backtestx.in',       // Target URL when user clicks/taps the badge
   *   text: 'Chart by BacktestX'              // Text displayed next to the logo on expansion
   * });
   */

  // Apply default custom watermark configuration
  window.ChartingAPI.setWatermarkLogoSettings({
    show: true,
    logoUrl: 'https://backtestx.in/logo.png',
    clickUrl: 'https://backtestx.in',
    text: 'Chart by BacktestX'
  });

  console.log("🔌 [custom-watermark-logo.js] Loaded and registered custom watermark logo successfully.");
})(window);
