// custom-candle-type.js - Developer-customizable script to register custom candle types/renderers
(function(window) {
  // Ensure the ChartingAPI is registered on window before using
  if (!window.ChartingAPI) {
    console.error("ChartingAPI not loaded yet.");
    return;
  }
  
  // Example: Register a custom candle type.
  // Developers can define their custom renderer function here.
  // The function takes the following arguments:
  // - ctx: CanvasRenderingContext2D
  // - visibleBars: Array of bar objects: { time, open, high, low, close, volume }
  // - slot: Total width allocated per candle (including gap)
  // - bodyW: Calculated candle body width
  // - chartH: Total height of the price scale clip area
  // - priceToY: Helper function to convert price to Y coordinate
  // - themeColors: Active theme colors: { bullColor, bearColor }
  // - xOffset: Starting X position on the canvas for the visible bars
  // - chartInstance: The chart widget context
  
  function drawAreaSeries(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, xOffset = 0, state) {
    if (!visible || visible.length === 0) return;

    ctx.save();
    
    // Draw the gradient fill first
    ctx.beginPath();
    const isLight = document.body.classList.contains('light-theme');
    
    let firstX = 0;
    let lastX = 0;
    
    visible.forEach((bar, index) => {
      const x = xOffset + index * candleSlot + candleSlot / 2;
      const price = bar.close !== undefined ? bar.close : (bar.yield !== undefined ? bar.yield : (bar.price !== undefined ? bar.price : (bar.y !== undefined ? bar.y : 0)));
      const y = priceToY(price);

      if (index === 0) {
        firstX = x;
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      if (index === visible.length - 1) {
        lastX = x;
      }
    });
    
    // Complete the path down to the bottom of the main chart pane (chartH)
    ctx.lineTo(lastX, chartH);
    ctx.lineTo(firstX, chartH);
    ctx.closePath();
    
    // Create area gradient (premium green/blue matching backtestx theme)
    const gradient = ctx.createLinearGradient(0, 0, 0, chartH);
    gradient.addColorStop(0, 'rgba(38, 166, 154, 0.45)');
    gradient.addColorStop(1, 'rgba(38, 166, 154, 0.00)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Now draw the line stroke on top
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#26a69a'; // Premium Brand Green
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    visible.forEach((bar, index) => {
      const x = xOffset + index * candleSlot + candleSlot / 2;
      const price = bar.close !== undefined ? bar.close : (bar.yield !== undefined ? bar.yield : (bar.price !== undefined ? bar.price : (bar.y !== undefined ? bar.y : 0)));
      const y = priceToY(price);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw vertex circles for style
    visible.forEach((bar, index) => {
      const x = xOffset + index * candleSlot + candleSlot / 2;
      const price = bar.close !== undefined ? bar.close : (bar.yield !== undefined ? bar.yield : (bar.price !== undefined ? bar.price : (bar.y !== undefined ? bar.y : 0)));
      const y = priceToY(price);

      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = isLight ? '#ffffff' : '#1b1b1d';
      ctx.fill();
      ctx.strokeStyle = '#26a69a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.restore();
  }

  window.ChartingAPI.registerCandleType('area', drawAreaSeries);

  console.log("🔌 [ChartingAPI] Loaded custom developer candle types successfully.");
})(window);
