// custom-indicator.js - Users can configure and add their own technical indicators here
(function(window) {
  if (!window.ChartingAPI) {
    console.error("🔌 [custom-indicator.js] ChartingAPI not found. Make sure api.js is loaded first.");
    return;
  }

  /*
   * 💡 HOW USERS REGISTER CUSTOM INDICATORS:
   * 
   * Call the ChartingAPI to register a technical indicator:
   * 
   * window.ChartingAPI.registerIndicator('indicator_id', {
   *   name: 'Display Name',                             // User-facing name shown in the popup
   *   type: 'overlay' | 'pane',                        // 'overlay' renders on the main chart area, 'pane' creates a new sub-panel at the bottom
   *   params: { period: 14 },                           // Default parameter settings
   *   defaultColor: '#ff0000',                          // Default color for plots
   *   levels: [30, 70],                                 // (Optional, for 'pane' only) horizontal line bounds (e.g., oversold/overbought levels)
   * 
   *   // Calculate is passed all bars (OHLCV) and parameters, and must return an array of values of the same length
   *   calculate: function(bars, params) { ... },
   * 
   *   // Render is passed the HTML5 canvas context, the chart engine context, calculated values, viewport bounds, and color
   *   render: function(ctx, chart, values, bounds, color) { ... }
   * });
   */

  // ─── 1. EXAMPLE: Custom Simple Moving Average (Overlay Indicator) ───
  window.ChartingAPI.registerIndicator('custom_sma', {
    name: 'Custom SMA (User)',
    type: 'overlay',
    params: { period: 20 },
    defaultColor: '#E040FB', // Bright purple/pink
    calculate: function(bars, params) {
      const period = params.period || 20;
      const sma = new Array(bars.length).fill(null);

      for (let i = period - 1; i < bars.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += bars[i - j].close;
        }
        sma[i] = sum / period;
      }
      return sma;
    },
    render: function(ctx, chart, values, bounds, color) {
      const { startIndex, endIndex } = bounds;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = color || '#E040FB';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';

      let started = false;
      for (let i = startIndex; i <= endIndex; i++) {
        if (i >= chart.bars.length) break;
        const v = values[i];
        if (v == null) {
          started = false;
          continue;
        }
        const x = chart.barToX(i);
        const y = chart.priceToY(v);

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.restore();
    }
  });

  // ─── 2. EXAMPLE: Custom Rate of Change / Momentum Oscillator (Pane Indicator) ───
  window.ChartingAPI.registerIndicator('custom_momentum', {
    name: 'Custom Momentum (User)',
    type: 'pane',
    levels: [-10, 0, 10], // Horizontal baseline guides in the sub-panel
    params: { period: 10 },
    defaultColor: '#FF9800', // Amber orange
    calculate: function(bars, params) {
      const period = params.period || 10;
      const momentum = new Array(bars.length).fill(null);

      for (let i = period; i < bars.length; i++) {
        const pastBar = bars[i - period];
        if (pastBar && pastBar.close > 0) {
          // Calculate percentage momentum change
          momentum[i] = ((bars[i].close - pastBar.close) / pastBar.close) * 100;
        }
      }
      return momentum;
    },
    render: function(ctx, chart, values, bounds, color) {
      const { startIndex, endIndex, chartW, toY } = bounds;
      const themeColor = color || '#FF9800';

      // 1. Draw shade around the 0-level bounds (-10 to 10)
      ctx.save();
      ctx.fillStyle = themeColor;
      ctx.globalAlpha = 0.05;
      const y10 = toY(10);
      const yNegative10 = toY(-10);
      ctx.fillRect(0, y10, chartW, yNegative10 - y10);
      ctx.restore();

      // 2. Draw Momentum Line
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';

      let started = false;
      for (let i = startIndex; i <= endIndex; i++) {
        if (i >= chart.bars.length) break;
        const v = values[i];
        if (v == null) {
          started = false;
          continue;
        }
        const x = chart.barToX(i);
        const y = toY(v);

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.restore();
    }
  });

  console.log("🔌 [custom-indicator.js] Loaded and registered custom user indicators successfully.");
})(window);
