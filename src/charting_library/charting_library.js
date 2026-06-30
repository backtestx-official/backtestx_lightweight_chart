// charting_library.js - Main charting library entry point
(function(window) {
  if (!window.BacktestxChartCore) {
    console.error("BacktestxChartCore bundle not loaded.");
    return;
  }

  class BacktestxChart extends window.BacktestxChartCore {
    constructor(containerId, options) {
      super(containerId, options);
      // Select horizontal scale helper
      const scaleType = options.horizontalScale || 'time';
      const registeredScale = window.ChartingAPI ? window.ChartingAPI.getHorizontalScale(scaleType) : null;
      if (registeredScale) {
        this.horizontalScale = registeredScale;
      } else if (scaleType === 'yield-curve') {
        this.horizontalScale = window.YieldScale;
      } else if (scaleType === 'strike-price') {
        this.horizontalScale = window.StrikeScale;
      } else {
        this.horizontalScale = window.TimeScale;
      }

      // If using non-time series, set default display to line renderer
      if (scaleType !== 'time' && this.chartType === 'candlestick') {
        this.customDrawCandles = window.ChartingAPI ? window.ChartingAPI.getCandleRenderer('line') : null;
      }
      this._primitives = [];
      console.log(`⚖️ [BacktestxChart] Initialized with scale: ${scaleType}`);
    }

    attachPrimitive(primitive) {
      if (!this._primitives) {
        this._primitives = [];
      }
      if (!this._primitives.includes(primitive)) {
        this._primitives.push(primitive);
        if (typeof primitive.attached === 'function') {
          primitive.attached({
            chart: this,
            requestUpdate: () => this.render()
          });
        }
        this.render();
      }
    }

    detachPrimitive(primitive) {
      if (this._primitives) {
        const idx = this._primitives.indexOf(primitive);
        if (idx !== -1) {
          this._primitives.splice(idx, 1);
          if (typeof primitive.detached === 'function') {
            primitive.detached();
          }
          this.render();
        }
      }
    }

    // ── Coordinate Conversions delegated to scales ──
    barToX(i) {
      return (this.horizontalScale || window.TimeScale).barToX(this, i);
    }

    xToBar(x) {
      return (this.horizontalScale || window.TimeScale).xToBar(this, x);
    }

    priceToY(p, minPrice, maxPrice) {
      return window.DecodedScale.priceToY(this, p, minPrice, maxPrice);
    }

    yToPrice(y, minPrice, maxPrice) {
      return window.DecodedScale.yToPrice(this, y, minPrice, maxPrice);
    }

    getVisibleRange() {
      return (this.horizontalScale || window.TimeScale).getVisibleRange(this);
    }

    getVisibleMinMax() {
      return window.DecodedScale.getVisibleMinMax(this);
    }

    // ── Main Render Loop ──
    render() {
      const ctx = this.ctx;
      const W = this.logicalWidth;
      const H = this.logicalHeight;

      const chartW = W - this.paddingRight;

      // Calculate active indicators
      const activeIndicators = (this.indicators || []).map(ind => {
        const config = window.ChartingAPI ? window.ChartingAPI.getIndicator(ind.type) : null;
        return { ind, config };
      }).filter(x => x.config);

      const paneIndicators = activeIndicators.filter(x => x.config.type === 'pane');
      const overlayIndicators = activeIndicators.filter(x => x.config.type === 'overlay');

      const SUB_PANEL_H = 80;
      const numPanels = paneIndicators.length;
      const totalPanelsH = numPanels * SUB_PANEL_H;

      const chartH = Math.max(100, H - this.paddingBottom - totalPanelsH);

      ctx.clearRect(0, 0, W, H);

      // 1. Draw solid background (theme-aware)
      const isLight = document.body.classList.contains('light-theme');
      ctx.fillStyle = isLight ? '#ffffff' : '#131722';
      ctx.fillRect(0, 0, W, H);

      if (this.bars.length === 0) return;

      const { minPrice, maxPrice } = this.getVisibleMinMax();

      // 2. Draw price scale (delegated to bundles/decoded.js)
      window.DecodedScale.drawPriceScale(this, ctx, minPrice, maxPrice, chartW);

      // Draw price scale primitives
      if (this._primitives && this._primitives.length > 0) {
        this._primitives.forEach(p => {
          if (typeof p.drawPriceScale === 'function') {
            try {
              ctx.save();
              p.drawPriceScale(ctx, this.paddingRight, chartH);
              ctx.restore();
            } catch (e) {
              console.error("Error drawing price scale primitive:", e);
            }
          }
        });
      }

      // 3. Draw time scale (delegated to scales)
      (this.horizontalScale || window.TimeScale).drawTimeScale(this, ctx, chartH + totalPanelsH);

      // Draw time scale primitives
      if (this._primitives && this._primitives.length > 0) {
        this._primitives.forEach(p => {
          if (typeof p.drawTimeScale === 'function') {
            try {
              ctx.save();
              p.drawTimeScale(ctx, chartW, this.paddingBottom);
              ctx.restore();
            } catch (e) {
              console.error("Error drawing time scale primitive:", e);
            }
          }
        });
      }

      // 4. Draw Series Content (Volume, Candles, Drawings) - Clipped to main chart viewport
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, chartW, chartH);
      ctx.clip();

      // Draw background watermark
      if (window.Watermarks && typeof window.Watermarks.draw === 'function') {
        window.Watermarks.draw(this, ctx, chartW, chartH);
      }

      // Draw background primitives
      if (this._primitives && this._primitives.length > 0) {
        this._primitives.forEach(p => {
          if (typeof p.drawBackground === 'function') {
            try {
              ctx.save();
              p.drawBackground(ctx, chartW, chartH);
              ctx.restore();
            } catch (e) {
              console.error("Error drawing background primitive:", e);
            }
          }
        });
      }

      // Draw volume bars (bottom overlay)
      ctx.save();
      const { startIndex: rawStart, endIndex: rawEnd } = this.getVisibleRange();
      const len = this.bars.length;
      const startIndex = Math.max(0, Math.min(len - 1, rawStart));
      const endIndex = Math.max(0, Math.min(len - 1, rawEnd));
      let maxVolume = 0;
      for (let i = startIndex; i <= endIndex; i++) {
        if (this.bars[i].volume > maxVolume) maxVolume = this.bars[i].volume;
      }

      const volMaxH = chartH * 0.15;
      for (let i = startIndex; i <= endIndex; i++) {
        const bar = this.bars[i];
        const x = this.barToX(i) - this.candleWidth / 2;
        const volHeight = maxVolume > 0 ? (bar.volume / maxVolume) * volMaxH : 0;
        const isUp = bar.close >= bar.open;

        ctx.fillStyle = isUp ? 'rgba(38, 166, 154, 0.18)' : 'rgba(239, 83, 80, 0.18)';
        ctx.fillRect(x, chartH - volHeight, this.candleWidth, volHeight);
      }
      ctx.restore();

      // 5. Draw Candlesticks (Allow manual override via ChartingAPI)
      const cs = this.options?.chartSettings?.symbol || {};
      const T = {
        bullColor: cs.bodyBull || '#26a69a',
        bearColor: cs.bodyBear || '#ef5350'
      };

      if (this.customDrawCandles) {
        const slot = this.candleWidth + this.candleGap;
        const bodyW = this.candleWidth;
        const visibleBars = this.bars.slice(startIndex, endIndex + 1);
        const xOffset = this.barToX(startIndex) - slot / 2;
        this.customDrawCandles(
          ctx, 
          visibleBars, 
          slot, 
          bodyW, 
          chartH, 
          (p) => this.priceToY(p, minPrice, maxPrice), 
          T, 
          xOffset, 
          this
        );
      } else {
        // Default High-Performance Batch rendering supporting showWick, showBorders, showBody and custom colors
        ctx.save();
        const showBody = cs.showBody !== false;
        const showBorders = cs.showBorders !== false;
        const showWick = cs.showWick !== false;

        const bodyBull = cs.bodyBull || '#26a69a';
        const bodyBear = cs.bodyBear || '#ef5350';
        const borderBull = cs.borderBull || '#26a69a';
        const borderBear = cs.borderBear || '#ef5350';
        const wickBull = cs.wickBull || '#26a69a';
        const wickBear = cs.wickBear || '#ef5350';

        const bodyW = this.candleWidth;

        // Batch 1: Bullish Wicks (Green)
        if (showWick) {
          ctx.strokeStyle = wickBull;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.bars[i];
            if (bar.close >= bar.open) {
              const x = this.barToX(i);
              const yHigh = this.priceToY(bar.high, minPrice, maxPrice);
              const yLow = this.priceToY(bar.low, minPrice, maxPrice);
              ctx.moveTo(x, yHigh);
              ctx.lineTo(x, yLow);
            }
          }
          ctx.stroke();

          // Batch 2: Bearish Wicks (Red)
          ctx.strokeStyle = wickBear;
          ctx.beginPath();
          for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.bars[i];
            if (bar.close < bar.open) {
              const x = this.barToX(i);
              const yHigh = this.priceToY(bar.high, minPrice, maxPrice);
              const yLow = this.priceToY(bar.low, minPrice, maxPrice);
              ctx.moveTo(x, yHigh);
              ctx.lineTo(x, yLow);
            }
          }
          ctx.stroke();
        }

        // Batch 3: Bullish Bodies (Green)
        if (showBody) {
          ctx.fillStyle = bodyBull;
          ctx.beginPath();
          for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.bars[i];
            if (bar.close >= bar.open) {
              const x = this.barToX(i);
              const yOpen = this.priceToY(bar.open, minPrice, maxPrice);
              const yClose = this.priceToY(bar.close, minPrice, maxPrice);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyH = Math.max(1, Math.abs(yClose - yOpen));
              ctx.rect(x - bodyW / 2, bodyTop, bodyW, bodyH);
            }
          }
          ctx.fill();

          // Batch 4: Bearish Bodies (Red)
          ctx.fillStyle = bodyBear;
          ctx.beginPath();
          for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.bars[i];
            if (bar.close < bar.open) {
              const x = this.barToX(i);
              const yOpen = this.priceToY(bar.open, minPrice, maxPrice);
              const yClose = this.priceToY(bar.close, minPrice, maxPrice);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyH = Math.max(1, Math.abs(yClose - yOpen));
              ctx.rect(x - bodyW / 2, bodyTop, bodyW, bodyH);
            }
          }
          ctx.fill();
        }

        // Batch 5: Bullish Borders (Green)
        if (showBorders) {
          ctx.strokeStyle = borderBull;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.bars[i];
            if (bar.close >= bar.open) {
              const x = this.barToX(i);
              const yOpen = this.priceToY(bar.open, minPrice, maxPrice);
              const yClose = this.priceToY(bar.close, minPrice, maxPrice);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyH = Math.max(1, Math.abs(yClose - yOpen));
              ctx.rect(x - bodyW / 2, bodyTop, bodyW, bodyH);
            }
          }
          ctx.stroke();

          // Batch 6: Bearish Borders (Red)
          ctx.strokeStyle = borderBear;
          ctx.beginPath();
          for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.bars[i];
            if (bar.close < bar.open) {
              const x = this.barToX(i);
              const yOpen = this.priceToY(bar.open, minPrice, maxPrice);
              const yClose = this.priceToY(bar.close, minPrice, maxPrice);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyH = Math.max(1, Math.abs(yClose - yOpen));
              ctx.rect(x - bodyW / 2, bodyTop, bodyW, bodyH);
            }
          }
          ctx.stroke();
        }

        ctx.restore();
      }

      // 6. Draw Drawings (delegated to bundles/drawings.js)
      window.Drawings.drawTrendlines(this, ctx, minPrice, maxPrice);

      // 7. Draw active drawing path (delegated to bundles/drawings.js)
      window.Drawings.drawActivePreview(this, ctx, minPrice, maxPrice);

      // 7.1 Draw Active Overlay Indicators (inside clipped chart viewport)
      overlayIndicators.forEach(x => {
        try {
          const values = x.config.calculate(this.bars, x.ind.params);
          ctx.save();
          x.config.render(ctx, this, values, { startIndex, endIndex, chartW, chartH }, x.ind.color);
          ctx.restore();
        } catch (e) {
          console.error(`Error rendering overlay indicator ${x.ind.type}:`, e);
        }
      });

      // Draw foreground primitives
      if (this._primitives && this._primitives.length > 0) {
        this._primitives.forEach(p => {
          if (typeof p.draw === 'function') {
            try {
              ctx.save();
              p.draw(ctx, chartW, chartH);
              ctx.restore();
            } catch (e) {
              console.error("Error drawing foreground primitive:", e);
            }
          }
        });
      }

      ctx.restore();

      // 7.2 Draw Symbol Status Line (Symbol, Resolution, OHLC values, change)
      ctx.save();
      ctx.font = 'bold 12px Inter, Arial, sans-serif';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      
      const statusHoverBarIdx = this.isMouseOver ? this.xToBar(this.mousePos.x) : this.bars.length - 1;
      const activeBar = (statusHoverBarIdx >= 0 && statusHoverBarIdx < this.bars.length) ? this.bars[statusHoverBarIdx] : this.bars[this.bars.length - 1];

      if (activeBar) {
        const isUp = activeBar.close >= activeBar.open;
        const textColor = isLight ? '#131722' : '#d1d4dc';
        const labelColor = isLight ? '#707584' : '#9b9ba3';
        const bullColor = '#26a69a';
        const bearColor = '#ef5350';
        const ohlcColor = isUp ? bullColor : bearColor;

        let curX = 10;
        const drawText = (txt, isBold, fillStyle) => {
          ctx.font = (isBold ? 'bold ' : '') + '12px Inter, Arial, sans-serif';
          ctx.fillStyle = fillStyle;
          ctx.fillText(txt, curX, 10);
          curX += ctx.measureText(txt).width + 6;
        };

        const isStandard = activeBar.open !== undefined && activeBar.close !== undefined;
        if (isStandard) {
          // 1. Draw Symbol & Interval
          drawText(`${this.symbol} · ${this.resolution}`, true, textColor);
          curX += 4; // extra spacing

          // 2. Draw OHLC
          const fmt = (v) => v !== undefined && v !== null ? v.toFixed(2) : '—';
          drawText('O', false, labelColor);
          drawText(fmt(activeBar.open), false, ohlcColor);

          drawText('H', false, labelColor);
          drawText(fmt(activeBar.high), false, ohlcColor);

          drawText('L', false, labelColor);
          drawText(fmt(activeBar.low), false, ohlcColor);

          drawText('C', false, labelColor);
          drawText(fmt(activeBar.close), false, ohlcColor);

          // Change and Change Percent
          const change = (activeBar.close - activeBar.open);
          const changePct = (change / activeBar.open * 100);
          const sign = change >= 0 ? '+' : '';
          const changeText = `${sign}${change.toFixed(2)} (${sign}${changePct.toFixed(2)}%)`;
          drawText(changeText, false, ohlcColor);
        } else if (activeBar.yield !== undefined) {
          drawText(`${this.symbol} Yield Curve`, true, textColor);
          curX += 4;
          drawText('Maturity', false, labelColor);
          drawText(String(activeBar.maturity || activeBar.x), false, textColor);
          drawText('Yield', false, labelColor);
          drawText(`${activeBar.yield.toFixed(2)}%`, false, bullColor);
        } else if (activeBar.price !== undefined) {
          drawText(`${this.symbol} Option Strikes`, true, textColor);
          curX += 4;
          drawText('Strike', false, labelColor);
          drawText(String(activeBar.strike || activeBar.x), false, textColor);
          drawText('Price', false, labelColor);
          drawText(`$${activeBar.price.toFixed(2)}`, false, bullColor);
        } else if (activeBar.y !== undefined) {
          drawText(`${this.symbol}`, true, textColor);
          curX += 4;
          drawText('X', false, labelColor);
          drawText(String(activeBar.x), false, textColor);
          drawText('Y', false, labelColor);
          drawText(String(activeBar.y), false, bullColor);
        }
      }
      ctx.restore();

      // 7.5 Draw Live Price scale label and line
      if (window.drawPriceScaleLabel) {
        window.drawPriceScaleLabel(this, ctx, minPrice, maxPrice);
      }

      // 7.6 Draw Selected Drawing Price Scale Labels
      if (window.ChartingAPI && window.ChartingAPI.drawPriceScaleDrawingLabel) {
        window.ChartingAPI.drawPriceScaleDrawingLabel(this, ctx, minPrice, maxPrice);
      }

      // 7.7 Draw Selected Drawing Time Scale Labels
      if (window.ChartingAPI && window.ChartingAPI.drawTimescaleDrawingLabel) {
        window.ChartingAPI.drawTimescaleDrawingLabel(this, ctx, chartH + totalPanelsH);
      }

      // 7.8 Draw Active Sub-panel (Pane) Indicators
      paneIndicators.forEach((x, pIdx) => {
        try {
          const panelY = chartH + pIdx * SUB_PANEL_H;
          const values = x.config.calculate(this.bars, x.ind.params);

          // Find min/max values in the visible range to scale correctly
          let minVal = Infinity;
          let maxVal = -Infinity;
          for (let i = startIndex; i <= endIndex; i++) {
            if (i < 0 || i >= values.length) continue;
            const val = values[i];
            if (val == null) continue;

            if (Array.isArray(val)) {
              for (const v of val) {
                if (v != null && !isNaN(v)) {
                  if (v < minVal) minVal = v;
                  if (v > maxVal) maxVal = v;
                }
              }
            } else if (typeof val === 'object') {
              for (const k in val) {
                if (val[k] != null && !isNaN(val[k])) {
                  if (val[k] < minVal) minVal = val[k];
                  if (val[k] > maxVal) maxVal = val[k];
                }
              }
            } else {
              if (!isNaN(val)) {
                if (val < minVal) minVal = val;
                if (val > maxVal) maxVal = val;
              }
            }
          }

          if (minVal === Infinity || maxVal === -Infinity) {
            minVal = 0;
            maxVal = 100;
          }

          if (minVal === maxVal) {
            minVal -= 1;
            maxVal += 1;
          } else {
            const pad = (maxVal - minVal) * 0.05;
            minVal -= pad;
            maxVal += pad;
          }
          const range = maxVal - minVal;
          const toY = (val) => panelY + SUB_PANEL_H - ((val - minVal) / range) * SUB_PANEL_H;

          // Clip to panel area
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, panelY, chartW, SUB_PANEL_H);
          ctx.clip();

          // Render pane indicator
          x.config.render(ctx, this, values, { startIndex, endIndex, chartW, chartH: SUB_PANEL_H, panelY, toY }, x.ind.color);
          ctx.restore();

          // Draw levels and Y-axis text
          const levels = x.config.levels || [];
          levels.forEach(lvl => {
            const y = toY(lvl);
            if (y >= panelY && y <= panelY + SUB_PANEL_H) {
              ctx.save();
              ctx.strokeStyle = isLight ? '#e0e3eb' : '#2a2e39';
              ctx.lineWidth = 0.5;
              ctx.setLineDash([2, 4]);
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(chartW, y);
              ctx.stroke();

              ctx.fillStyle = isLight ? '#707a8a' : '#9b9ba3';
              ctx.font = '10px sans-serif';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'middle';
              ctx.fillText(lvl.toString(), chartW + 6, y);
              ctx.restore();
            }
          });

          // Draw sub-panel Y-axis divider line on the right
          ctx.save();
          ctx.strokeStyle = isLight ? '#e0e3eb' : '#2a2e39';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(chartW, panelY);
          ctx.lineTo(chartW, panelY + SUB_PANEL_H);
          ctx.stroke();
          ctx.restore();

          // Draw name/values info text at the top-left of the panel (legend style)
          ctx.save();
          ctx.fillStyle = isLight ? '#2a2e39' : '#d1d4dc';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          
          let displayValStr = '';
          const hoverIdx = this.isMouseOver ? this.xToBar(this.mousePos.x) : endIndex;
          if (hoverIdx >= 0 && hoverIdx < values.length) {
            const hVal = values[hoverIdx];
            if (hVal != null) {
              if (typeof hVal === 'number') {
                displayValStr = hVal.toFixed(2);
              } else if (Array.isArray(hVal)) {
                displayValStr = hVal.map(v => v != null ? v.toFixed(2) : '—').join(', ');
              } else if (typeof hVal === 'object') {
                displayValStr = Object.keys(hVal).map(k => `${k}: ${hVal[k] != null ? hVal[k].toFixed(2) : '—'}`).join(' ');
              }
            }
          }
          ctx.fillText(`${x.ind.name}: ${displayValStr}`, 10, panelY + 6);
          ctx.restore();

          // Draw horizontal border below this panel
          ctx.save();
          ctx.strokeStyle = isLight ? '#e0e3eb' : '#2a2e39';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, panelY + SUB_PANEL_H);
          ctx.lineTo(W, panelY + SUB_PANEL_H);
          ctx.stroke();
          ctx.restore();

        } catch (e) {
          console.error(`Error rendering sub-panel indicator ${x.ind.type}:`, e);
        }
      });

      // 8. Draw axes dividers
      ctx.strokeStyle = isLight ? '#e0e3eb' : '#2a2e39';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartW, 0);
      ctx.lineTo(chartW, chartH + totalPanelsH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, chartH + totalPanelsH);
      ctx.lineTo(chartW, chartH + totalPanelsH);
      ctx.stroke();

      // 9. Crosshair & coordinate badges
      if (this.isMouseOver && this.mousePos.x <= chartW && this.mousePos.y <= chartH + totalPanelsH) {
        ctx.save();
        ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 3]);

        // Snap X to the nearest candle center
        const hoverBarIdx = this.xToBar(this.mousePos.x);
        const snappedX = this.barToX(hoverBarIdx);

        // Draw vertical line across all chart areas
        ctx.beginPath();
        ctx.moveTo(snappedX, 0);
        ctx.lineTo(snappedX, chartH + totalPanelsH);
        ctx.stroke();

        // Draw horizontal line if in main chart
        if (this.mousePos.y <= chartH) {
          ctx.beginPath();
          ctx.moveTo(0, this.mousePos.y);
          ctx.lineTo(chartW, this.mousePos.y);
          ctx.stroke();
          ctx.restore();

          // Price Badge on Y axis (delegated to bundles/decoded.js)
          window.DecodedScale.drawPriceBadge(this, ctx, minPrice, maxPrice, chartW);
        } else {
          // Check if hovering a sub-panel, draw horizontal line inside it
          const relativeY = this.mousePos.y - chartH;
          const pIdx = Math.floor(relativeY / SUB_PANEL_H);
          if (pIdx >= 0 && pIdx < numPanels) {
            ctx.beginPath();
            ctx.moveTo(0, this.mousePos.y);
            ctx.lineTo(chartW, this.mousePos.y);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Dynamic Badge on X axis
        (this.horizontalScale || window.TimeScale).drawTimeBadge(this, ctx, chartH + totalPanelsH);
      }

      // 10. SmartLoader scrollback checks
      if (this.smartLoader) {
        this.smartLoader.check();
      }
    }
  }

  window.BacktestxChart = BacktestxChart;
})(window);
