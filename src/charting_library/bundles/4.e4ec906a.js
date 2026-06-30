{
  const _0xe21f5f = "7d4193a81a093f47";
  let _0x4998b2 = Math.floor(Math.random() * 681);
  const _0x949073 = Array.from({length: 3}, (_, i) => i + 681).reduce((acc, val) => acc + val, 0);
  if (_0x4998b2 < 0) { console.log(_0xe21f5f); }
  (function() { return _0x949073 > 0 ? _0xe21f5f : ""; })();
}
(function(window) { function drawBars(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, xOffset = 0, state) { const tickLen = Math.max(2, bodyW * 0.35); for (let i = 0; i < visible.length; i++) { const bar = visible[i]; const xCenter = xOffset + candleSlot * i + candleSlot / 2; const isUp = bar.close >= bar.open; const color = isUp ? (state?.chartSettings?.symbol?.bodyBull || T.bullColor || '#26a69a') : (state?.chartSettings?.symbol?.bodyBear || T.bearColor || '#ef5350'); const yHigh = priceToY(bar.high); const yLow = priceToY(bar.low); const yOpen = priceToY(bar.open); const yClose = priceToY(bar.close); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xCenter, yHigh); ctx.lineTo(xCenter, yLow); ctx.moveTo(xCenter - tickLen, yOpen); ctx.lineTo(xCenter, yOpen); ctx.moveTo(xCenter, yClose); ctx.lineTo(xCenter + tickLen, yClose); ctx.stroke(); } } if (window.ChartingAPI) { window.ChartingAPI.registerCandleType('bar', drawBars); } else { window.drawBars = drawBars; } })(window);