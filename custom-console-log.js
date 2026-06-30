// custom-console-log.js - Developer logging controller for BacktestX Chart
const CONSOLE_LOG = true; // Set to true to show chart logs in the browser console, or false to hide them

(function(window) {
  // Capture original console methods
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;

  // Intercept browser console methods if logging is disabled
  if (!CONSOLE_LOG) {
    console.log = function() {};
    console.error = function() {};
    console.warn = function() {};
    console.info = function() {};
  }

  if (!window.ChartingAPI) {
    window.ChartingAPI = {};
  }

  // Custom log wrapper for charting components
  window.ChartingAPI.log = function(...args) {
    if (CONSOLE_LOG) {
      originalLog(...args);
    }
  };

  // Custom error wrapper for charting components
  window.ChartingAPI.error = function(...args) {
    if (CONSOLE_LOG) {
      originalError(...args);
    }
  };
})(window);
