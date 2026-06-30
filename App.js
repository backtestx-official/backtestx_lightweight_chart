// App.js - Lightweight chart controller logic
// 💡 CUSTOMIZE THIS FILE: You can adjust initial settings (like default symbol or resolution) or customize toolbar event listeners here.
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize stock datafeed
  const datafeed = new window.Datafeed();
  
  // 1.2 Parse URL query parameters for dynamic dashboard customisation
  const urlParams = new URLSearchParams(window.location.search);
  const isShowcase = urlParams.get('showcase') === 'true';

  let showTopToolbar = true;
  let showDrawingToolbar = true;
  let showAddCustomInterval = false;

  if (urlParams.has('showTopToolbar')) {
    showTopToolbar = urlParams.get('showTopToolbar') === 'true';
  } else if (isShowcase) {
    showTopToolbar = false;
  }

  if (urlParams.has('showDrawingToolbar')) {
    showDrawingToolbar = urlParams.get('showDrawingToolbar') === 'true';
  } else if (isShowcase) {
    showDrawingToolbar = false;
  }

  if (urlParams.has('showAddCustomInterval')) {
    showAddCustomInterval = urlParams.get('showAddCustomInterval') === 'true';
  } else if (isShowcase) {
    showAddCustomInterval = false;
  }

  // Apply visibility overrides before chart instantiation for correct initial sizing
  if (showTopToolbar === false) {
    const style = document.createElement('style');
    style.id = 'hide-top-toolbar-style';
    style.textContent = '.top-toolbar { display: none !important; }';
    document.head.appendChild(style);
  }
  if (showDrawingToolbar === false) {
    const style = document.createElement('style');
    style.id = 'hide-drawing-toolbar-style';
    style.textContent = '.toolbar { display: none !important; }';
    document.head.appendChild(style);
  }

  // Build features lists based on URL queries/toggles
  const enabled_features = [
    "header_indicators",
    "header_chart_type",
    "header_resolutions",
  ];
  const disabled_features = [];

  if (showTopToolbar) {
    enabled_features.push("header_widget");
  } else {
    disabled_features.push("header_widget");
  }

  if (showDrawingToolbar) {
    enabled_features.push("left_toolbar");
  } else {
    disabled_features.push("left_toolbar");
  }

  if (showAddCustomInterval) {
    enabled_features.push("add_custom_interval");
  } else {
    disabled_features.push("add_custom_interval");
  }

  // 2. Initialize chart widget with options using the widget class wrapper
  const tvWidget = new window.widget({
    symbol: 'BTCUSD',
    interval: 1, // 1m
    datafeed: datafeed,
    container: 'chart-mount',
    timezone: localStorage.getItem("backtestx_tv_timezone") || "Etc/UTC",
    library_path: "/src/charting_library/",
    locale: "en",
    theme: localStorage.getItem("backtestx_theme") === "light" ? "Light" : "Dark",
    autosize: true,
    supported_resolutions: ['1', '2', '3', '5', '10', '15', '30', '60', '120', '180', '240', '1D'],
    enabled_features: enabled_features,
    disabled_features: disabled_features
  });

  // Expose chart globally so top toolbar buttons can access it
  const chart = tvWidget.chartInstance;
  window.chart = chart;

  // 3. Attach example primitives (Series and Pane primitives) to demonstrate support
  if (window.CustomTextOverlayPrimitive && window.CustomPriceLinePrimitive) {
    // Attach a pane primitive (draws background watermark text)
    const textOverlay = new window.CustomTextOverlayPrimitive("BACKTESTX SANDBOX", "rgba(255, 255, 255, 0.08)", { x: 25, y: 25 });
    chart.attachPrimitive(textOverlay);

    // Attach a series primitive (draws a blue horizontal line at 25000 with a Y-axis label)
    const priceLine = new window.CustomPriceLinePrimitive(25000, "#2962ff", "Target Level");
    chart.attachPrimitive(priceLine);
  }

  // 4. Set up Message communication handler (to support Showcase control interaction)
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || !window.chart) return;

    if (data.action === 'setChartType') {
      const type = data.type; // 'Candle', 'Area', 'Line'
      if (type === 'Candle' || type === 'Candles') {
        window.chart.setChartType('candlestick');
      } else if (type === 'Area') {
        window.chart.setChartType('area');
      } else if (type === 'Line') {
        window.chart.setChartType('line');
      }
    }

    if (data.action === 'setTheme') {
      const theme = data.theme; // 'Dark', 'Light'
      if (theme === 'Light') {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
      window.chart.render();
    }
  });
});
