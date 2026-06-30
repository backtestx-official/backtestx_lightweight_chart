// custom-symbol-details.js - Developer custom symbol resolver config
(function(window) {
  if (!window.ChartingAPI) {
    window.ChartingAPI = {};
  }

  // ====================================================================
  // window.ChartingAPI.resolveCustomSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback)
  // Resolve symbol settings (session, decimals/pricescale, timezone) dynamically.
  // ====================================================================
  window.ChartingAPI.resolveCustomSymbol = function(
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback
  ) {
    const tokenSymbol = symbolName || "BTCUSD";
    const logicSymbol = tokenSymbol.toUpperCase().replace("_REPLAY", "");

    // Wrapper logger to respect custom-console-log settings
    const log = (...args) => {
      if (window.ChartingAPI.log) {
        window.ChartingAPI.log(...args);
      } else {
        console.log(...args);
      }
    };

    // ====================================================================
    // 🛠️ DEVELOPER CUSTOMIZATION AREA:
    // Only contains Crypto symbols by default. Developers can add more
    // lists or modify options (type, session, pricescale) as needed.
    // ====================================================================
    const CRYPTO_2_DECIMALS = ["BTCUSD"];

    let type = "crypto";
    let session = "24x7";
    let pricescale = 100; // Default to 2 decimals

    if (CRYPTO_2_DECIMALS.includes(logicSymbol)) {
      type = "crypto";
      session = "24x7";
      pricescale = 100; // 2 decimals (e.g. 59310.00)
    } 
    else if (CRYPTO_4_DECIMALS.includes(logicSymbol)) {
      type = "crypto";
      session = "24x7";
      pricescale = 10000; // 4 decimals (e.g. 0.5931)
    }
    else {
      // Fallback default
      type = "crypto";
      session = "24x7";
      pricescale = 100;
    }

    const symbolInfo = {
      ticker: tokenSymbol,
      name: tokenSymbol,
      description: `${logicSymbol} Backtestx Data`,
      type: type,
      session: session,
      timezone: "Etc/UTC",
      minmov: 1,
      pricescale: pricescale,
      has_intraday: true,
      intraday_multipliers: ['1','2','3','5','10','15','30','60','120','180','240'],
      supported_resolutions: ['1S', '5S', '1m', '3m', '5m', '15m', '30m', '1H', '2H', '3H', '4H', '6H', '12H', '1D', '1W', '1M', '2M'],
      has_empty_bars: false,
      has_weekly_and_monthly: true,
      volume_precision: 2,
      data_status: "streaming",
    };

    log(`🧠 resolveSymbol: ${tokenSymbol} | Type=${type} | Scale=${pricescale}`);

    setTimeout(() => {
      onSymbolResolvedCallback(symbolInfo);
    }, 0);
  };
})(window);
