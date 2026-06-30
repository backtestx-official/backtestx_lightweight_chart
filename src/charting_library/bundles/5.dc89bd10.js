{
  const _0xb56dc2 = "9441b4e9b41a8af3";
  let _0x67ee4b = Math.floor(Math.random() * 654);
  const _0x673868 = Array.from({length: 3}, (_, i) => i + 654).reduce((acc, val) => acc + val, 0);
  if (_0x67ee4b < 0) { console.log(_0xb56dc2); }
  (function() { return _0x673868 > 0 ? _0xb56dc2 : ""; })();
}
// pricescale-label-renderer.js - Renders the current live price and candle countdown timer on the price scale
(function(window) {
  function drawPriceScaleLabel(chart, ctx, minPrice, maxPrice) {
    const bars = chart.bars;
    if (!bars || bars.length === 0) return;
    
    // Ensure the chart rerenders every second to keep the countdown live
    if (!window.liveCloseTimerId) {
      window.liveCloseTimerId = setInterval(() => {
        if (window.chart) {
          window.chart.render();
        }
      }, 1000);
    }

    const livePrice = bars[bars.length - 1].close;
    const prevClose = bars.length > 1 ? bars[bars.length - 2].close : bars[bars.length - 1].open;
    const isUp = livePrice >= prevClose;
    const isLight = document.body.classList.contains('light-theme');
    const color = isUp 
      ? (isLight ? '#089981' : '#26a69a') 
      : (isLight ? '#f23645' : '#ef5350');
    const chartW = chart.logicalWidth - chart.paddingRight;
    const chartH = chart.logicalHeight - chart.paddingBottom;
    const y = chart.priceToY(livePrice, minPrice, maxPrice);
    if (y < 0 || y > chartH) return;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(chartW, y);
    ctx.stroke();
    ctx.restore();

    // Helper to resolve timeframe settings
    const resolutionToMs = (resolution) => {
      if (!resolution) return 60 * 1000;
      const map = {
        '1S': 1000, '5S': 5000, '1': 60000, '2': 120000, '3': 180000, '5': 300000, '10': 600000,
        '15': 900000, '30': 1800000, '45': 2700000, '60': 3600000, '120': 7200000,
        '180': 10800000, '240': 14400000, '360': 21600000, '720': 43200000,
        '1m': 60000, '3m': 180000, '5m': 300000, '15m': 900000, '30m': 1800000, '45m': 2700000,
        '1H': 3600000, '2H': 7200000, '3H': 10800000, '4H': 14400000, '6H': 21600000, '12H': 43200000,
        '1D': 86400000, '1W': 7 * 86400000, '1M': 30 * 86400000
      };
      if (map[resolution]) return map[resolution];
      const match = String(resolution).match(/^(\d*)([a-zA-Z]+)$/);
      if (match) {
        const val = parseInt(match[1] || '1', 10);
        const unit = match[2];
        if (unit === 's' || unit === 'S') return val * 1000;
        if (unit === 'm') return val * 60 * 1000;
        if (unit === 'H' || unit === 'h') return val * 60 * 60 * 1000;
        if (unit === 'D' || unit === 'd') return val * 24 * 60 * 60 * 1000;
        if (unit === 'W' || unit === 'w') return val * 7 * 24 * 60 * 60 * 1000;
        if (unit === 'M') return val * 30 * 24 * 60 * 60 * 1000;
      }
      return 60 * 1000;
    };

    const lastBar = bars[bars.length - 1];
    const intervalMs = resolutionToMs(chart.resolution);
    const nextCandleTime = lastBar.time + intervalMs;
    let remainingMs = nextCandleTime - Date.now();
    if (isNaN(remainingMs) || remainingMs < 0) remainingMs = 0;

    // Format Countdown String
    const totalSecs = Math.floor(remainingMs / 1000);
    const secs = totalSecs % 60;
    const totalMins = Math.floor(totalSecs / 60);
    const mins = totalMins % 60;
    const hours = Math.floor(totalMins / 60);
    const pad = (num) => String(num).padStart(2, '0');
    
    const countdownStr = (hours > 0 ? hours + ':' : '') + 
                          pad(mins) + ':' + 
                          pad(secs);

    const labelH = 18;
    const labelW = chart.paddingRight;
    const labelX = chartW + 1;
    const labelY = y - labelH / 2;

    // Draw Price Badge Background Rectangle
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(labelX, labelY, labelW - 1, labelH, [0, 3, 3, 0]);
    } else {
      ctx.rect(labelX, labelY, labelW - 1, labelH);
    }
    ctx.fill();

    // Draw Price Text (Left-aligned) Inside Badge
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10.5px Inter, Arial, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(livePrice.toFixed(2), labelX + 6, y);
    ctx.restore();

    // Draw Countdown Timer Pill BELOW the Price Badge on the Price Scale (Matches AI folder)
    const cdLabelH = 16;
    const cdLabelY = labelY + labelH + 2; // 2px gap below price pill

    ctx.save();
    // Pill background for countdown (theme-aware)
    ctx.fillStyle = isLight ? '#131722' : '#2a2e39';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(labelX, cdLabelY, labelW - 1, cdLabelH, 3);
    } else {
      ctx.rect(labelX, cdLabelY, labelW - 1, cdLabelH);
    }
    ctx.fill();

    // Countdown text (Left-aligned)
    ctx.font = '10px Inter, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(countdownStr, labelX + 6, cdLabelY + cdLabelH / 2);
    ctx.restore();
  }

  if (window.ChartingAPI) {
    window.ChartingAPI.registerPriceScaleLabel = drawPriceScaleLabel;
  }
  window.drawPriceScaleLabel = drawPriceScaleLabel;
})(window);