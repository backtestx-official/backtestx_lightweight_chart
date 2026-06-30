// custom-load-drawings.js - Users can add their own logic to load and save drawings (e.g. database, localStorage)
(function(window) {
  if (!window.ChartingAPI) {
    window.ChartingAPI = {};
  }

  const log = (msg, ...args) => {
    if (window.ChartingAPI.log) {
      window.ChartingAPI.log(msg, ...args);
    } else {
      console.log(msg, ...args);
    }
  };

  const error = (msg, ...args) => {
    if (window.ChartingAPI.error) {
      window.ChartingAPI.error(msg, ...args);
    } else {
      console.error(msg, ...args);
    }
  };

  // ====================================================================
  // Hook 1: loadCustomDrawings(chart)
  // Called once when the chart initializes.
  // ====================================================================
  window.ChartingAPI.loadCustomDrawings = function(chart) {
    log("🔌 [custom-load-drawings.js] loadCustomDrawings hook triggered.");
    
    // Example: Load drawings from localStorage
    const key = `backtestx_drawings_${chart.symbol || 'default'}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        const drawings = JSON.parse(saved);
        if (Array.isArray(drawings)) {
          chart.drawings = drawings;
          log(`✅ Loaded ${drawings.length} drawings from localStorage.`);
        }
      } catch (e) {
        error("❌ Failed to parse saved drawings from localStorage:", e);
      }
    }
  };

  // ====================================================================
  // Hook 2: saveCustomDrawings(chart, drawings)
  // Called whenever drawings are created, moved, or deleted.
  // ====================================================================
  window.ChartingAPI.saveCustomDrawings = function(chart, drawings) {
    log("🔌 [custom-load-drawings.js] saveCustomDrawings hook triggered.");
    
    // Example: Save drawings to localStorage
    const key = `backtestx_drawings_${chart.symbol || 'default'}`;
    try {
      localStorage.setItem(key, JSON.stringify(drawings));
      log(`💾 Saved ${drawings.length} drawings to localStorage.`);
    } catch (e) {
      error("❌ Failed to save drawings to localStorage:", e);
    }
  };

})(window);
