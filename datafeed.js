// datafeed.js - Data Feed helper fetching historical and live crypto data from public Binance API
(function(window) {
  class BinanceDatafeed {
    constructor() {
      this._subs = {};
      this._ws = null;
    }

    // ─── Symbol Resolution ───────────────────────────────────────────────────
    async resolveSymbol(symbolName) {
      if (window.ChartingAPI && typeof window.ChartingAPI.resolveCustomSymbol === 'function') {
        return new Promise((resolve, reject) => {
          window.ChartingAPI.resolveCustomSymbol(symbolName, resolve, reject);
        });
      }

      const name = symbolName.toUpperCase();
      const mapped = this._mapSymbol(name);
      
      return {
        name: name,
        description: `${name} / USDT (${mapped})`,
        type: 'crypto',
        exchange: 'BINANCE',
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        supported_resolutions: ['1S', '5S', '1m', '3m', '5m', '15m', '30m', '1H', '2H', '3H', '4H', '6H', '12H', '1D', '1W', '1M', '2M'],
      };
    }

    // ─── Historical Bars ──────────────────────────────────────────────────────
    async getBars(symbolName, resolution, from, to, onResult) {
      const symbol = this._mapSymbol(symbolName);
      const interval = this._resolutionToBinance(resolution);
      const startTime = from * 1000;
      const endTime = to * 1000;

      // Binance allows max 1000 klines per request
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=1000`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.code) {
          console.error("Binance API Error:", data.msg);
          onResult({ bars: [], noData: true });
          return;
        }

        const bars = data.map(item => ({
          time: item[0], // Open time
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
          volume: parseFloat(item[5])
        }));

        onResult({ bars, noData: bars.length === 0 });
      } catch (e) {
        console.error("Failed to fetch historical klines from Binance:", e);
        onResult({ bars: [], noData: true });
      }
    }

    // ─── Real-time Streaming Subscription ────────────────────────────────────
    subscribeBars(symbolName, resolution, onRealtimeCallback, subscriberUID) {
      console.log(`📡 [Subscription] Subscribing to: ${symbolName} (${resolution}) with UID ${subscriberUID}`);
      
      const symbol = this._mapSymbol(symbolName).toLowerCase();
      const interval = this._resolutionToBinance(resolution);
      const streamName = `${symbol}@kline_${interval}`;

      // Check if we are already subscribed to this stream on the WS server
      const isAlreadySubscribed = Object.values(this._subs).some(s => s.streamName === streamName);

      this._subs[subscriberUID] = {
        symbol,
        interval,
        streamName,
        onRealtimeCallback
      };

      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        if (!isAlreadySubscribed) {
          console.log(`🔌 [WebSocket] Sending SUBSCRIBE for new stream: ${streamName}`);
          const payload = {
            method: "SUBSCRIBE",
            params: [streamName],
            id: Date.now()
          };
          this._ws.send(JSON.stringify(payload));
        } else {
          console.log(`🔌 [WebSocket] Already subscribed to stream: ${streamName}. Reusing existing stream.`);
        }
      } else {
        this._connectWebSocket();
      }
    }

    unsubscribeBars(subscriberUID) {
      console.log(`🔌 [Subscription] Unsubscribing from subscription UID: ${subscriberUID}`);
      const sub = this._subs[subscriberUID];
      if (!sub) return;

      delete this._subs[subscriberUID];

      // Check if any other subscriber still needs this stream
      const stillNeeded = Object.values(this._subs).some(s => s.streamName === sub.streamName);

      if (!stillNeeded && this._ws && this._ws.readyState === WebSocket.OPEN) {
        console.log(`🔌 [WebSocket] No other subscribers need ${sub.streamName}. Sending UNSUBSCRIBE.`);
        const payload = {
          method: "UNSUBSCRIBE",
          params: [sub.streamName],
          id: Date.now()
        };
        this._ws.send(JSON.stringify(payload));
      } else if (stillNeeded) {
        console.log(`🔌 [WebSocket] Stream ${sub.streamName} is still needed by other subscribers. Keeping subscription active.`);
      }
    }

    // ─── WebSocket Connections ────────────────────────────────────────────────
    _connectWebSocket() {
      if (this._ws && (this._ws.readyState === WebSocket.CONNECTING || this._ws.readyState === WebSocket.OPEN)) {
        if (this._ws.readyState === WebSocket.OPEN) {
          this._subscribeAllActive();
        }
        return;
      }

      console.log("🔌 [WebSocket] Connecting to Binance WebSocket...");
      this._ws = new WebSocket("wss://stream.binance.com:9443/ws");

      this._ws.onopen = () => {
        console.log("🔌 [WebSocket] Binance WebSocket connected.");
        this._subscribeAllActive();
      };

      this._ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg && msg.result !== undefined) {
            console.log(`🔌 [WebSocket] Subscription response received:`, msg);
            return;
          }
          if (msg && msg.e === "kline") {
            const k = msg.k;
            const bar = {
              time: k.t,
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v)
            };

            const symbol = msg.s.toLowerCase();
            const interval = k.i;
            
            let matched = false;
            for (const uid in this._subs) {
              const sub = this._subs[uid];
              if (sub.symbol === symbol && sub.interval === interval) {
                sub.onRealtimeCallback(bar);
                matched = true;
              }
            }
            if (!matched) {
              console.log(`⚠️ [WebSocket] Kline tick received for ${symbol} (${interval}) but no matching active subscriber found in:`, Object.keys(this._subs));
            }
          } else {
            console.log("🔌 [WebSocket] Unknown message type:", msg);
          }
        } catch (e) {
          console.error("[WebSocket] Error parsing message:", e);
        }
      };

      this._ws.onerror = (e) => {
        console.error("🔌 [WebSocket] Binance WebSocket error:", e);
      };

      this._ws.onclose = () => {
        console.log("🔌 [WebSocket] Binance WebSocket closed. Reconnecting in 5 seconds...");
        setTimeout(() => this._connectWebSocket(), 5000);
      };
    }

    _subscribeAllActive() {
      if (!this._ws || this._ws.readyState !== WebSocket.OPEN) return;
      
      const streams = [...new Set(Object.values(this._subs).map(s => s.streamName))];
      if (streams.length === 0) return;

      console.log("🔌 [WebSocket] Subscribing to all active streams:", streams);
      const payload = {
        method: "SUBSCRIBE",
        params: streams,
        id: Date.now()
      };
      this._ws.send(JSON.stringify(payload));
    }

    // ─── Utilities ────────────────────────────────────────────────────────────
    _mapSymbol(symbolName) {
      let sym = symbolName.toUpperCase();
      if (sym === 'AAPL' || sym === 'TSLA' || sym === 'GOOGL') {
        return 'BTCUSDT'; // Fallback to BTCUSDT since stocks aren't available on Binance
      }
      if (sym === 'BTC' || sym === 'BTCUSD') return 'BTCUSDT';
      if (sym === 'ETH' || sym === 'ETHUSD') return 'ETHUSDT';
      
      if (!sym.endsWith('USDT') && !sym.endsWith('BTC') && !sym.endsWith('ETH')) {
        sym += 'USDT';
      }
      return sym;
    }

    _resolutionToBinance(res) {
      const map = {
        '1S': '1s', '5S': '1s',
        '1m': '1m', '1': '1m',
        '3m': '3m', '3': '3m',
        '5m': '5m', '5': '5m',
        '15m': '15m', '15': '15m',
        '30m': '30m', '30': '30m',
        '1H': '1h', '2H': '2h', '3H': '2h', '4H': '4h', '6H': '6h', '12H': '12h',
        '60': '1h', '120': '2h', '240': '4h', '720': '12h',
        '1D': '1d', '1W': '1w', '1M': '1M'
      };
      
      if (map[res]) return map[res];

      // Custom interval resolution mapping
      const match = res.match(/^(\d+)([a-zA-Z]*)$/);
      if (!match) return '1h';

      const value = parseInt(match[1], 10);
      const suffix = match[2] || 'm';

      if (suffix === 'S' || suffix === 's') {
        return '1s';
      }
      if (suffix === 'm') {
        // Convert to hours or days if value is large
        if (value >= 1440) {
          const days = Math.round(value / 1440);
          if (days < 3) return '1d';
          return '3d';
        }
        if (value >= 60) {
          const hours = Math.round(value / 60);
          if (hours < 2) return '1h';
          if (hours < 4) return '2h';
          if (hours < 6) return '4h';
          if (hours < 8) return '6h';
          if (hours < 12) return '8h';
          return '12h';
        }
        if (value < 3) return '1m';
        if (value < 5) return '3m';
        if (value < 15) return '5m';
        if (value < 30) return '15m';
        return '30m';
      }
      if (suffix === 'H' || suffix === 'h') {
        if (value < 2) return '1h';
        if (value < 4) return '2h';
        if (value < 6) return '4h';
        if (value < 8) return '6h';
        if (value < 12) return '8h';
        return '12h';
      }
      if (suffix === 'D' || suffix === 'd') {
        if (value < 3) return '1d';
        return '3d';
      }
      if (suffix === 'W' || suffix === 'w') {
        return '1w';
      }
      if (suffix === 'M') {
        return '1M';
      }
      return '1h';
    }
  }

  // Expose to window using the original identifier so App.js remains unmodified
  window.Datafeed = BinanceDatafeed;
})(window);
