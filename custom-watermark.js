// custom-watermark.js - Users can configure the background watermark settings here
(function(window) {
  if (!window.ChartingAPI) {
    console.error("🔌 [custom-watermark.js] ChartingAPI not found. Make sure api.js is loaded first.");
    return;
  }

  /*
   * 💡 HOW USERS CUSTOMIZE THE CHART WATERMARK:
   * 
   * Call the ChartingAPI to configure settings:
   * 
   * window.ChartingAPI.setWatermark({
   *   show: true,                                      // Toggles overall visibility
   *   watermarkMode: 'always' | 'replay' | 'none',     // Display conditions ('always' by default)
   *   watermarkColor: 'rgba(255, 255, 255, 0.08)',     // Custom color (adapted automatically by theme)
   *   showWatermarkTicker: true,                       // Toggle symbol ticker
   *   showWatermarkDescription: true,                  // Toggle symbol description
   *   showWatermarkInterval: true,                     // Toggle interval
   *   showWatermarkReplay: true,                       // Toggle replay mode warning active
   * 
   *   // ─── Overrides & Fallbacks ───
   *   // By default, the watermark automatically displays the active chart symbol, description and resolution (e.g. "BTCUSD", "30m").
   *   // 1. To explicitly FORCE the watermark to display a specific symbol name (e.g. "BTC") regardless of the loaded chart symbol:
   *   symbol: 'BTC',
   *   // 2. To explicitly FORCE a custom description:
   *   description: 'Bitcoin / U.S. Dollar',
   *   // 3. To explicitly FORCE a custom interval/timeframe (e.g. "1h"):
   *   interval: '1h',
   * 
   *   // 4. Fallbacks (used ONLY if there is no active chart symbol/interval loaded):
   *   defaultSymbol: 'BTCUSD',
   *   defaultDescription: 'Bitcoin / U.S. Dollar',
   *   defaultInterval: '30m'
   * });
   */

  // Apply default custom watermark configuration
  window.ChartingAPI.setWatermark({
    show: true,
    watermarkMode: 'always',
    showWatermarkTicker: true,
    showWatermarkDescription: true,
    showWatermarkInterval: true,
    showWatermarkReplay: true,
    symbol: 'BTC', // Explicit override so the watermark shows "BTC" instead of "BTCUSD"
    interval: '3m', // Explicit override so the watermark shows "30m" instead of the chart's timeframe if desired
    defaultSymbol: 'BTC',
    defaultDescription: 'Bitcoin / U.S. Dollar',
    defaultInterval: '3'
  });
})(window);
