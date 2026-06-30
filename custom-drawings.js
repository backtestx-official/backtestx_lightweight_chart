// custom-drawings.js - Users can add their own drawing tools here
(function(window) {
  if (!window.ChartingAPI) {
    console.error("🔌 [custom-drawings.js] ChartingAPI not found. Make sure api.js is loaded first.");
    return;
  }

  // ====================================================================
  // EXAMPLE 1: Buy Marker ("buy_marker") - 1-Click Drawing Tool
  // Draws a green up-triangle pointing to the price, with "BUY" label
  // ====================================================================
  window.ChartingAPI.registerCustomDrawing('buy_marker', {
    clicks: 1,
    render: function(chart, ctx, d, minPrice, maxPrice, isSelected) {
      const x = chart.barToX(d.p1.idx);
      const y = chart.priceToY(d.p1.price, minPrice, maxPrice);

      ctx.save();
      ctx.fillStyle = isSelected ? '#ff9800' : '#26a69a';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;

      // Draw triangle pointing up
      ctx.beginPath();  
      ctx.moveTo(x, y);
      ctx.lineTo(x - 8, y + 12);
      ctx.lineTo(x + 8, y + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw Text Label below triangle
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BUY', x, y + 22);
      ctx.restore();
    },
    hitTest: function(chart, mouseX, mouseY, d, minPrice, maxPrice) {
      const x = chart.barToX(d.p1.idx);
      const y = chart.priceToY(d.p1.price, minPrice, maxPrice);
      
      // Clicked within the triangle/label region (width 16px, height 25px)
      if (mouseX >= x - 8 && mouseX <= x + 8 && mouseY >= y && mouseY <= y + 25) {
        return 'p1'; // returning 'p1' allows dragging it
      }
      return null;
    }
  });

  // ====================================================================
  // EXAMPLE 2: Highlight Zone ("zone") - 2-Click Drawing Tool
  // Draws a semi-transparent band across the Y-axis between two prices
  // ====================================================================
  window.ChartingAPI.registerCustomDrawing('zone', {
    clicks: 2,
    render: function(chart, ctx, d, minPrice, maxPrice, isSelected) {
      const y1 = chart.priceToY(d.p1.price, minPrice, maxPrice);
      const y2 = chart.priceToY(d.p2.price, minPrice, maxPrice);
      const chartW = chart.logicalWidth - chart.paddingRight;

      ctx.save();
      // Draw horizontal zone spanning across the entire chart area
      ctx.fillStyle = isSelected ? 'rgba(255, 152, 0, 0.15)' : 'rgba(233, 30, 99, 0.1)';
      ctx.fillRect(0, Math.min(y1, y2), chartW, Math.abs(y2 - y1));

      // Draw dashed horizontal boundaries
      ctx.strokeStyle = isSelected ? '#ff9800' : '#e91e63';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, y1); ctx.lineTo(chartW, y1);
      ctx.moveTo(0, y2); ctx.lineTo(chartW, y2);
      ctx.stroke();
      ctx.restore();
    },
    renderPreview: function(chart, ctx, p1, mousePos, minPrice, maxPrice) {
      const y1 = chart.priceToY(p1.price, minPrice, maxPrice);
      const y2 = mousePos.y;
      const chartW = chart.logicalWidth - chart.paddingRight;

      ctx.save();
      ctx.fillStyle = 'rgba(233, 30, 99, 0.05)';
      ctx.fillRect(0, Math.min(y1, y2), chartW, Math.abs(y2 - y1));
      ctx.strokeStyle = 'rgba(233, 30, 99, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, y1); ctx.lineTo(chartW, y1);
      ctx.moveTo(0, y2); ctx.lineTo(chartW, y2);
      ctx.stroke();
      ctx.restore();
    },
    hitTest: function(chart, mouseX, mouseY, d, minPrice, maxPrice) {
      const y1 = chart.priceToY(d.p1.price, minPrice, maxPrice);
      const y2 = chart.priceToY(d.p2.price, minPrice, maxPrice);
      const chartW = chart.logicalWidth - chart.paddingRight;

      // Hit if click is inside the vertical price band
      if (mouseX >= 0 && mouseX <= chartW && mouseY >= Math.min(y1, y2) && mouseY <= Math.max(y1, y2)) {
        return 'line'; // returning 'line' allows dragging/moving the whole zone
      }
      return null;
    }
  });
  
  /*
   * 💡 HOW USERS ADD CUSTOM DRAWINGS MANUALLY:
   * 
   * 1. Register the tool:
   *    window.ChartingAPI.registerCustomDrawing('my_tool', {
   *       clicks: 1 or 2,
   *       render: function(chart, ctx, d, minPrice, maxPrice, isSelected) {
   *          // draw custom elements using chart.barToX and chart.priceToY
   *       },
   *       renderPreview: function(chart, ctx, p1, mousePos, minPrice, maxPrice) {
   *          // (optional for 2-clicks) draw preview line/box during drag
   *       },
   *       hitTest: function(chart, mouseX, mouseY, d, minPrice, maxPrice) {
   *          // return 'p1', 'p2', 'line' if hit, or null if missed
   *       }
   *    });
   * 
   * 2. In index.html, add a toolbar button with data-tool="my_tool".
   * 
   * 3. Enjoy! The App.js generic toolbar controller will automatically toggle it.
   */
  // Dynamic custom drawing toolbar button generation & drawing controller
  document.addEventListener('DOMContentLoaded', () => {
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

    // 1. Toolbar Event Handling for all drawing tools
    const toolButtons = document.querySelectorAll('.tool-btn[data-tool]');
    toolButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const chart = window.chart;
        if (!chart) return;
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

    // 2. Listen for drawing completion events (using a slight delay to ensure chart initializes)
    setTimeout(() => {
      const chartInstance = window.chart;
      if (chartInstance && chartInstance.container) {
        chartInstance.container.addEventListener('tool-deactivated', () => {
          const toolButtonsInner = document.querySelectorAll('.tool-btn[data-tool]');
          toolButtonsInner.forEach(b => b.classList.remove('active'));
        });
      }
    }, 100);

    // 3. Reset View Action
    const resetBtnEl = document.getElementById('btn-reset-view');
    if (resetBtnEl) {
      resetBtnEl.addEventListener('click', () => {
        if (window.chart) {
          window.chart.resetView();
        }
      });
    }

    // 4. Clear Drawings Action
    const clearBtnEl = document.getElementById('btn-clear-drawings');
    if (clearBtnEl) {
      clearBtnEl.addEventListener('click', () => {
        const chart = window.chart;
        if (chart) {
          chart.drawings = [];
          chart.drawingPoints = [];
          chart.activeTool = null;
          const toolButtonsInner = document.querySelectorAll('.tool-btn[data-tool]');
          toolButtonsInner.forEach(b => b.classList.remove('active'));
          chart.render();
        }
      });
    }
  });
})(window);
