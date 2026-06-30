// custom-primitives.js - Developer-customizable script to create and register custom series and pane primitives
(function(window) {
  // ====================================================================
  // EXAMPLE 1: Pane Primitive (e.g. background text / watermark overlay)
  // ====================================================================
  class CustomTextOverlayPrimitive {
    constructor(text, color, position) {
      this.text = text || "Backtestx Sandbox Mode";
      this.color = color || "rgba(255, 255, 255, 0.12)";
      this.position = position || { x: 20, y: 20 };
    }

    attached({ chart, requestUpdate }) {
      this.chart = chart;
      this.requestUpdate = requestUpdate;
      console.log("🔌 [Primitive] CustomTextOverlayPrimitive attached to chart.");
    }

    detached() {
      this.chart = null;
      this.requestUpdate = null;
      console.log("🔌 [Primitive] CustomTextOverlayPrimitive detached from chart.");
    }

    // Draws on the background layer behind candles/volume
    drawBackground(ctx, chartW, chartH) {
      ctx.save();
      const isLight = document.body.classList.contains('light-theme');
      ctx.fillStyle = isLight ? "rgba(19, 23, 34, 0.08)" : this.color;
      ctx.font = "bold 24px Inter, Arial, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(this.text, this.position.x, this.position.y);
      ctx.restore();
    }
  }

  // ====================================================================
  // EXAMPLE 2: Series Primitive (e.g. horizontal line with labels on Y scale)
  // ====================================================================
  class CustomPriceLinePrimitive {
    constructor(price, color, label) {
      this.price = price;
      this.color = color || "#ff9800";
      this.label = label || "Target Price";
    }

    attached({ chart, requestUpdate }) {
      this.chart = chart;
      this.requestUpdate = requestUpdate;
      console.log("🔌 [Primitive] CustomPriceLinePrimitive attached to chart.");
    }

    detached() {
      this.chart = null;
      this.requestUpdate = null;
      console.log("🔌 [Primitive] CustomPriceLinePrimitive detached from chart.");
    }

    // Draws on the foreground layer above candles/volume
    draw(ctx, chartW, chartH) {
      if (!this.chart || this.chart.bars.length === 0) return;
      const minMax = this.chart.getVisibleMinMax();
      if (!minMax) return;
      
      const y = this.chart.priceToY(this.price, minMax.minPrice, minMax.maxPrice);
      
      // Draw horizontal line across the main pane
      ctx.save();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartW, y);
      ctx.stroke();
      ctx.restore();
    }

    // Draws on the price scale (Y-axis)
    drawPriceScale(ctx, priceScaleW, chartH) {
      if (!this.chart || this.chart.bars.length === 0) return;
      const minMax = this.chart.getVisibleMinMax();
      if (!minMax) return;
      
      const y = this.chart.priceToY(this.price, minMax.minPrice, minMax.maxPrice);
      const chartW = this.chart.logicalWidth - this.chart.paddingRight;

      ctx.save();
      ctx.fillStyle = this.color;
      
      // Draw tag background box on price scale
      const boxH = 18;
      const boxW = priceScaleW - 10;
      ctx.fillRect(chartW + 2, y - boxH / 2, boxW, boxH);

      // Draw price text label
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px Inter, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.price.toFixed(2), chartW + 2 + boxW / 2, y);
      ctx.restore();
    }
  }

  // Expose primitives globally
  window.CustomTextOverlayPrimitive = CustomTextOverlayPrimitive;
  window.CustomPriceLinePrimitive = CustomPriceLinePrimitive;

  console.log("🔌 [custom-primitives.js] Loaded custom primitive templates.");
})(window);
