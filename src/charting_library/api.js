// api.js - Public Charting API for custom candle renderers and drawing tools
(function(window) {
  // Registries
  const candleRegistry = {};
  const drawingsRegistry = {};
  const indicatorsRegistry = {};
  const scalesRegistry = {};
  const customIntervals = [];
  let pendingWatermarkSettings = null;
  let pendingCrosshairSettings = {
    color: '',
    width: 0.8,
    dashArray: [3, 3],
    showPriceBadge: true,
    showTimeBadge: true,
    badgeBgColor: '',
    badgeTextColor: '#ffffff'
  };
  let pendingWatermarkLogoSettings = {
    show: true,
    logoUrl: 'https://backtestx.in/logo.png',
    clickUrl: 'https://backtestx.in',
    text: 'Chart by BacktestX'
  };
  const ChartingAPI = {
    /**
     * Register a new candle renderer
     * @param {string} type - Name of the candle type
     * @param {function} renderFn - Renderer function
     */
    registerCandleType: function(type, renderFn) {
      candleRegistry[type.toLowerCase()] = renderFn;
      console.log(`🔌 [ChartingAPI] Registered candle renderer: ${type}`);
    },
    /**
     * Retrieve a candle renderer function by name
     * @param {string} type - Name of the candle type
     * @returns {function|null} - The renderer function or null if not found
     */
    getCandleRenderer: function(type) {
      return candleRegistry[type.toLowerCase()] || null;
    },
    /**
     * Get a list of all registered candle types
     * @returns {string[]}
     */
    getAvailableCandleTypes: function() {
      return Object.keys(candleRegistry);
    },
    /**
     * Register a custom drawing tool configuration
     * @param {string} type - Name of the custom drawing
     * @param {object} config - Configuration object: { clicks, render, renderPreview, hitTest }
     */
    registerCustomDrawing: function(type, config) {
      drawingsRegistry[type.toLowerCase()] = config;
      console.log(`🔌 [ChartingAPI] Registered custom drawing tool: ${type}`);
    },
    /**
     * Retrieve a custom drawing configuration by name
     * @param {string} type - Name of the drawing tool
     * @returns {object|null} - The configuration object or null
     */
    getCustomDrawing: function(type) {
      return drawingsRegistry[type.toLowerCase()] || null;
    },
    /**
     * Get list of all registered custom drawing types
     * @returns {string[]}
     */
    getAvailableCustomDrawings: function() {
      return Object.keys(drawingsRegistry);
    },
    /**
     * Save the drawings of the chart to LocalStorage
     * @param {object} chart - Chart instance
     * @returns {boolean} - True if successful
     */
    saveDrawings: function(chart) {
      if (!chart || !chart.symbol) return false;
      try {
        const data = JSON.stringify(chart.drawings || []);
        localStorage.setItem(`cl_drawings_${chart.symbol.toLowerCase()}`, data);
        console.log(`💾 [ChartingAPI] Saved ${chart.drawings.length} drawings for ${chart.symbol}`);
        return true;
      } catch (e) {
        console.error("Failed to save drawings to LocalStorage", e);
        return false;
      }
    },
    /**
     * Load drawings for the chart's current symbol from LocalStorage
     * @param {object} chart - Chart instance
     * @returns {array} - Array of loaded drawings
     */
    loadDrawings: function(chart) {
      if (!chart || !chart.symbol) return [];
      try {
        const data = localStorage.getItem(`cl_drawings_${chart.symbol.toLowerCase()}`);
        const loaded = data ? JSON.parse(data) : [];
        chart.drawings = loaded;
        chart.selectedDrawingIdx = null;
        chart.render();
        console.log(`📂 [ChartingAPI] Loaded ${loaded.length} drawings for ${chart.symbol}`);
        return loaded;
      } catch (e) {
        console.error("Failed to load drawings from LocalStorage", e);
        return [];
      }
    },
    /**
     * Register a Y-axis price scale drawing label renderer
     * @param {function} renderFn - Renderer function
     */
    registerPriceScaleDrawingLabel: function(renderFn) {
      ChartingAPI.drawPriceScaleDrawingLabel = renderFn;
      console.log("🔌 [ChartingAPI] Registered price scale drawing label renderer");
    },
    /**
     * Register a X-axis timescale drawing label renderer
     * @param {function} renderFn - Renderer function
     */
    registerTimescaleDrawingLabel: function(renderFn) {
      ChartingAPI.drawTimescaleDrawingLabel = renderFn;
      console.log("🔌 [ChartingAPI] Registered timescale drawing label renderer");
    },
    /**
     * Register a technical indicator renderer
     * @param {string} type - Name of the indicator
     * @param {object} config - Configuration object: { name, type, params, calculate, render }
     */
    registerIndicator: function(type, config) {
      indicatorsRegistry[type.toLowerCase()] = config;
      console.log(`🔌 [ChartingAPI] Registered technical indicator: ${type}`);
    },
    /**
     * Retrieve a technical indicator by name
     * @param {string} type - Name of the indicator
     * @returns {object|null}
     */
    getIndicator: function(type) {
      return indicatorsRegistry[type.toLowerCase()] || null;
    },
    /**
     * Get list of all registered technical indicators
     * @returns {string[]}
     */
    getAvailableIndicators: function() {
      return Object.keys(indicatorsRegistry);
    },
    /**
     * Add an indicator to an active chart instance
     * @param {object} chart - Chart instance (usually window.chart)
     * @param {string} type - Name/type of the indicator (e.g. 'sma')
     * @param {object} [params] - Optional parameters to override defaults
     * @param {string} [color] - Optional color string override
     * @returns {object|null} - The added indicator object or null
     */
    addIndicatorToChart: function(chart, type, params, color) {
      if (chart && typeof chart.addIndicator === 'function') {
        return chart.addIndicator(type, params, color);
      }
      return null;
    },
    /**
     * Remove an indicator from an active chart instance by its unique id
     * @param {object} chart - Chart instance
     * @param {string} id - The unique id of the active indicator instance
     * @returns {boolean} - True if successfully removed
     */
    removeIndicatorFromChart: function(chart, id) {
      if (chart && typeof chart.removeIndicator === 'function') {
        return chart.removeIndicator(id);
      }
      return false;
    },
    /**
     * Get list of all active indicators on a chart instance
     * @param {object} chart - Chart instance
     * @returns {array} - Array of active indicator configurations on the chart
     */
    getActiveIndicatorsOnChart: function(chart) {
      return chart ? chart.indicators || [] : [];
    },
    /**
     * Register a custom interval for the resolution picker dropdown
     * @param {string} resolution
     */
    registerCustomInterval: function(resolution) {
      if (!customIntervals.includes(resolution)) {
        customIntervals.push(resolution);
        console.log(`🔌 [ChartingAPI] Registered custom interval: ${resolution}`);
      }
    },
    /**
     * Get all developer-registered custom intervals
     * @returns {string[]}
     */
    getCustomIntervals: function() {
      return customIntervals;
    },
    /**
     * Get the SmartLoader class
     * @returns {class|null}
     */
    getSmartLoader: function() {
      return window.SmartLoader || null;
    },
    /**
     * Set watermark settings dynamically and trigger a chart re-render
     * @param {object} settings
     */
    setWatermark: function(settings) {
      if (window.Watermarks) {
        window.Watermarks.settings = {
          ...window.Watermarks.settings,
          ...settings
        };
      } else {
        pendingWatermarkSettings = {
          ...pendingWatermarkSettings,
          ...settings
        };
      }
      if (window.chart && typeof window.chart.render === 'function') {
        window.chart.render();
      }
      console.log("🔌 [ChartingAPI] Watermark settings updated:", settings);
    },
    /**
     * Get current watermark settings
     * @returns {object}
     */
    getWatermark: function() {
      return window.Watermarks ? window.Watermarks.settings : (pendingWatermarkSettings || {});
    },
    /**
     * Get pending watermark settings (used internally by water-marks.js)
     * @returns {object|null}
     */
    getPendingWatermarkSettings: function() {
      return pendingWatermarkSettings;
    },
    /**
     * Set watermark logo settings dynamically and trigger a chart re-render
     * @param {object} settings
     */
    setWatermarkLogoSettings: function(settings) {
      pendingWatermarkLogoSettings = {
        ...pendingWatermarkLogoSettings,
        ...settings
      };
      if (window.chart && typeof window.chart.render === 'function') {
        window.chart.render();
      }
      console.log("🔌 [ChartingAPI] Watermark logo settings updated:", settings);
    },
    /**
     * Get current watermark logo settings
     * @returns {object}
     */
    getWatermarkLogoSettings: function() {
      return pendingWatermarkLogoSettings;
    },
    /**
     * Register a new custom horizontal scale helper
     * @param {string} type - Name of the scale (e.g. 'yield-curve')
     * @param {object} scaleObj - Scale helper object: { barToX, xToBar, getVisibleRange, drawTimeScale, drawTimeBadge }
     */
    registerHorizontalScale: function(type, scaleObj) {
      scalesRegistry[type.toLowerCase()] = scaleObj;
      console.log(`🔌 [ChartingAPI] Registered horizontal scale: ${type}`);
    },
    /**
     * Retrieve a horizontal scale helper by name
     * @param {string} type - Name of the scale
     * @returns {object|null} - The scale helper object or null
     */
    getHorizontalScale: function(type) {
      return scalesRegistry[type.toLowerCase()] || null;
    },
    /**
     * Get a list of all registered horizontal scales
     * @returns {string[]}
     */
    getAvailableHorizontalScales: function() {
      return Object.keys(scalesRegistry);
    },
    /**
     * Set crosshair settings dynamically and trigger a chart re-render
     * @param {object} settings
     */
    setCrosshairSettings: function(settings) {
      pendingCrosshairSettings = {
        ...pendingCrosshairSettings,
        ...settings
      };
      if (window.chart && typeof window.chart.render === 'function') {
        window.chart.render();
      }
      console.log("🔌 [ChartingAPI] Crosshair settings updated:", settings);
    },
    /**
     * Get current crosshair settings
     * @returns {object}
     */
    getCrosshairSettings: function() {
      return pendingCrosshairSettings;
    }
  };
  // Attach to window
  window.ChartingAPI = ChartingAPI;
})(window);
