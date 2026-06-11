// App.js - Lightweight chart controller logic
// 💡 CUSTOMIZE THIS FILE: You can adjust initial settings (like default symbol or resolution) or customize toolbar event listeners here.
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize stock datafeed
  const datafeed = new window.Datafeed();
  
  // 2. Initialize chart widget with options
  const chart = new window.BacktestxChart('chart-mount', {
    symbol: 'BTCUSD',
    resolution: '30m',
    datafeed: datafeed
  });

  // Expose chart globally so top toolbar buttons can access it
  window.chart = chart;

  // 2.5 Dynamic custom drawing toolbar button generation
  if (window.ChartingAPI && window.ChartingAPI.getAvailableCustomDrawings) {
    const toolbar = document.querySelector('.toolbar');
    const resetBtn = document.getElementById('btn-reset-view');
    const customTools = window.ChartingAPI.getAvailableCustomDrawings();

    customTools.forEach(type => {
      // Check if button already exists in index.html
      let btn = document.querySelector(`.tool-btn[data-tool="${type}"]`);
      if (!btn) {
        btn = document.createElement('button');
        btn.className = 'tool-btn';
        btn.setAttribute('data-tool', type);
        
        // Pretty name for tooltip
        const prettyName = type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        btn.setAttribute('data-tooltip', `${prettyName} (Custom)`);

        // Get custom icon from config, otherwise use a default custom drawing icon
        const config = window.ChartingAPI.getCustomDrawing(type);
        btn.innerHTML = config.iconSvg || `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 3v18M3 12h18" stroke-dasharray="3 3"/>
            <circle cx="12" cy="12" r="4" fill="currentColor"/>
          </svg>
        `;

        // Insert before the reset button separator if exists
        if (resetBtn) {
          const separator = resetBtn.previousElementSibling;
          if (separator && separator.style.height === '1px') {
            toolbar.insertBefore(btn, separator);
          } else {
            toolbar.insertBefore(btn, resetBtn);
          }
        } else {
          toolbar.appendChild(btn);
        }
      }
    });
  }

  // 3. Toolbar Event Handling for all drawing tools
  const toolButtons = document.querySelectorAll('.tool-btn[data-tool]');
  toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.getAttribute('data-tool');
      
      if (chart.activeTool === tool) {
        chart.activeTool = null;
        chart.drawingPoints = [];
        btn.classList.remove('active');
      } else {
        // Deactivate other buttons first
        toolButtons.forEach(b => b.classList.remove('active'));
        
        chart.activeTool = tool;
        chart.drawingPoints = [];
        btn.classList.add('active');
      }
      chart.render();
    });
  });

  // Listen for drawing completion events
  chart.container.addEventListener('tool-deactivated', () => {
    toolButtons.forEach(b => b.classList.remove('active'));
  });

  // 4. General Actions
  document.getElementById('btn-reset-view').addEventListener('click', () => {
    chart.resetView();
  });

  document.getElementById('btn-clear-drawings').addEventListener('click', () => {
    chart.drawings = [];
    chart.drawingPoints = [];
    chart.activeTool = null;
    trendlineBtn.classList.remove('active');
    chart.render();
  });

  /*
   * 💡 DEVELOPER MANUAL RENDER INTERCEPT DEMONSTRATION:
   *
   * To change the candle rendering style manually, grab any of the registered renderers
   * from the ChartingAPI and assign it to the chart's customDrawCandles property:
   *
   * Example: Use Heikin-Ashi candles manually:
   *   chart.customDrawCandles = window.ChartingAPI.getCandleRenderer('heikin_ashi');
   *   chart.render();
   *
   * Example: Use OHLC Bars manually:
   *   chart.customDrawCandles = window.ChartingAPI.getCandleRenderer('bar');
   *   chart.render();
   *
   * Example: Reset back to standard high-performance batch rendering:
   *   chart.customDrawCandles = null;
   *   chart.render();
   */
});
