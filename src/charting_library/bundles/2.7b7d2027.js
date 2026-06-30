{
  const _0x9e0d00 = "1482b4de79691846";
  let _0x6d0491 = Math.floor(Math.random() * 564);
  const _0x3d4961 = Array.from({length: 3}, (_, i) => i + 564).reduce((acc, val) => acc + val, 0);
  if (_0x6d0491 < 0) { console.log(_0x9e0d00); }
  (function() { return _0x3d4961 > 0 ? _0x9e0d00 : ""; })();
}
(function(window) { function drawHollowCandle(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, xOffset = 0, state) { const drawCandlestick = window.ChartingAPI ? window.ChartingAPI.getCandleRenderer('candlestick') : window.drawCandlestick; if (drawCandlestick) { drawCandlestick(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, true, xOffset, state); } } if (window.ChartingAPI) { window.ChartingAPI.registerCandleType('hollow_candle', drawHollowCandle); } else { window.drawHollowCandle = drawHollowCandle; } })(window);