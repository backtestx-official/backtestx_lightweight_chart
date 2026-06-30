// drawing-floting-toolbar.js - Users can add their own drawing floating toolbar buttons here
(function(window) {
  if (!window.ChartingAPI || !window.ChartingAPI.registerFloatingToolbarButton) {
    console.error("🔌 [drawing-floting-toolbar.js] registerFloatingToolbarButton API not found. Make sure api.js and drawings.js are loaded.");
    return;
  }

  // ====================================================================
  // BUTTON 1: Lock / Unlock Drawing
  // Prevents the selected drawing from being dragged or modified
  // ====================================================================
  window.ChartingAPI.registerFloatingToolbarButton('lock_toggle', {
    tooltip: 'Lock / Unlock Drawing',
    iconSvg: `
      <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <!-- Will show padlock -->
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path class="padlock-shackle" d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    `,
    onClick: function(chart, drawing, btn) {
      drawing.locked = !drawing.locked;
      
      // Update visual active state of the button
      if (drawing.locked) {
        btn.classList.add('active');
        btn.querySelector('.padlock-shackle').setAttribute('d', 'M7 11V7a5 5 0 0 1 10 0v4'); // Locked/closed shackle
      } else {
        btn.classList.remove('active');
        btn.querySelector('.padlock-shackle').setAttribute('d', 'M7 11V7a5 5 0 0 1 9.9-1'); // Unlocked/open shackle
      }
      
      chart.render();
    },
    // Customize button appearance immediately upon toolbar render
    visible: function(drawing) {
      // Return true to show it for all drawings
      return true;
    }
  });

  // ====================================================================
  // BUTTON 2: Clone Drawing
  // Duplicates the drawing with a slight index and price offset
  // ====================================================================
  window.ChartingAPI.registerFloatingToolbarButton('clone_drawing', {
    tooltip: 'Clone Drawing',
    iconSvg: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    `,
    onClick: function(chart, drawing) {
      if (!chart) return;
      
      // Create a deep copy clone of the selected drawing
      const clone = {
        type: drawing.type,
        color: drawing.color,
        p1: { idx: drawing.p1.idx + 3, price: drawing.p1.price * 1.008 },
        visibilityInterval: drawing.visibilityInterval || chart.resolution
      };
      
      if (drawing.p2) {
        clone.p2 = { idx: drawing.p2.idx + 3, price: drawing.p2.price * 1.008 };
      }
      
      if (drawing.text) {
        clone.text = drawing.text;
      }
      
      chart.drawings.push(clone); if (window.ChartingAPI && typeof window.ChartingAPI.saveCustomDrawings === 'function') { window.ChartingAPI.saveCustomDrawings(chart, chart.drawings); }
      
      // Focus on the newly created clone
      chart.selectedDrawingIdx = chart.drawings.length - 1;
      chart.render();
      
      // Relocate the floating toolbar to be near the clone
      if (window.DrawingFloatingToolbar) {
        window.DrawingFloatingToolbar.show(chart);
      }
    }
  });

  // ====================================================================
  // BUTTON 3: Delete Drawing (Trash Bin)
  // Removes the selected drawing instantly
  // ====================================================================
  window.ChartingAPI.registerFloatingToolbarButton('delete_drawing', {
    tooltip: 'Remove (Delete)',
    iconSvg: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    `,
    onClick: function(chart) {
      if (chart.selectedDrawingIdx !== null && chart.selectedDrawingIdx !== undefined) {
        chart.drawings.splice(chart.selectedDrawingIdx, 1);
        chart.selectedDrawingIdx = null;
        chart.render();
        if (window.ChartingAPI && typeof window.ChartingAPI.saveCustomDrawings === 'function') {
          window.ChartingAPI.saveCustomDrawings(chart, chart.drawings);
        }
        if (window.DrawingFloatingToolbar) {
          window.DrawingFloatingToolbar.hide();
        }
      }
    }
  });

  /*
   * 💡 HOW USERS ADD CUSTOM FLOATING TOOLBAR BUTTONS MANUALLY:
   * 
   * 1. Register the button:
   *    window.ChartingAPI.registerFloatingToolbarButton('my_button_id', {
   *       tooltip: 'My custom tooltip',
   *       iconSvg: '<svg viewBox="0 0 24 24" ...>', // SVG icon string
   *       onClick: function(chart, drawing, buttonElement, event) {
   *          // Define your custom action here!
   *          // Example: alert(`You clicked drawing type: ${drawing.type}`);
   *       },
   *       visible: function(drawing) {
   *          // (Optional) Determine if the button should display for this drawing type
   *          // Example: return drawing.type === 'rect'; // Only show on rectangles
   *       }
   *    });
   * 
   * 2. Enjoy! The DrawingFloatingToolbar manager will automatically render it.
   */
})(window);
