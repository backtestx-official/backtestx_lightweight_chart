{
  const _0x042fe2 = "0f83a9926f09814a";
  let _0xe7ed1c = Math.floor(Math.random() * 695);
  const _0x7b1bd5 = Array.from({length: 3}, (_, i) => i + 695).reduce((acc, val) => acc + val, 0);
  if (_0xe7ed1c < 0) { console.log(_0x042fe2); }
  (function() { return _0x7b1bd5 > 0 ? _0x042fe2 : ""; })();
}
(function(window) { const timezoneRegistry = []; const TimeZone = { defaultTimezone: 'UTC', registerTimezone: function(label, tz) { if (!timezoneRegistry.some(item => item.tz === tz)) { timezoneRegistry.push({ label, tz }); console.log(`🔌 [TimeZone] Registered timezone: ${label} (${tz})`); } }, getTimezones: function() { return [...timezoneRegistry]; }, getDateParts: function(chart, date) { const tz = (chart && typeof chart.getTimezone === 'function') ? chart.getTimezone() : 'UTC'; const dtfOpts = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz === 'local' ? undefined : tz }; let dtf; try { dtf = new Intl.DateTimeFormat('en-US', dtfOpts); } catch (e) { dtf = new Intl.DateTimeFormat('en-US', { ...dtfOpts, timeZone: 'UTC' }); } const dateObj = (date instanceof Date) ? date : new Date(date); const parts = dtf.formatToParts(dateObj); const map = {}; parts.forEach(p => map[p.type] = p.value); return map; } }; window.TimeZone = TimeZone; function injectPrototypeMethods() { if (window.BacktestxChartCore) { window.BacktestxChartCore.prototype.setTimezone = function(tz) { this.timezone = tz; const btn = document.getElementById('top-btn-timezone'); if (btn) { const span = btn.querySelector('span'); if (span) { const tzObj = window.TimeZone.getTimezones().find(item => item.tz === tz); span.textContent = tzObj ? tzObj.label : tz; } } this.render(); console.log(`⚖️ [BacktestxChart] Timezone updated to: ${tz}`); }; window.BacktestxChartCore.prototype.getTimezone = function() { return this.timezone || (this.options && this.options.timezone) || window.TimeZone.defaultTimezone || 'UTC'; }; } else { console.warn("⚠️ [TimeZone] BacktestxChartCore not found during prototype injection."); } } function injectStyles() { if (document.getElementById('cl-tz-dropdown-styles')) return; const style = document.createElement('style'); style.id = 'cl-tz-dropdown-styles'; style.textContent = `
      .timezone-dropdown-menu {
        position: absolute;
        background: var(--panel-bg, #151821);
        border: 1px solid var(--border-color, #242835);
        border-radius: 6px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        padding: 4px 0;
        width: 200px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 2000;
        display: none;
        font-family: 'Inter', sans-serif;
      }
      body.light-theme .timezone-dropdown-menu {
        background: #ffffff;
        border-color: #e0e3eb;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }
      .timezone-dropdown-item {
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-main, #f5f6f9);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: background-color 0.15s ease, color 0.15s ease;
      }
      body.light-theme .timezone-dropdown-item {
        color: #131722;
      }
      .timezone-dropdown-item:hover {
        background-color: var(--border-color, #242835);
      }
      body.light-theme .timezone-dropdown-item:hover {
        background-color: #f0f3fa;
      }
      .timezone-dropdown-item.active {
        background-color: rgba(38, 166, 154, 0.15) !important;
        color: #26a69a !important;
        font-weight: 600;
      }
      body.light-theme .timezone-dropdown-item.active {
        background-color: rgba(8, 153, 129, 0.1) !important;
        color: #089981 !important;
      }
    `; document.head.appendChild(style); } let menuDiv; function toggleTimezonePopup(btn, chart) { if (!menuDiv) { menuDiv = document.createElement('div'); menuDiv.className = 'timezone-dropdown-menu'; document.body.appendChild(menuDiv); document.addEventListener('click', (ev) => { if (menuDiv && !menuDiv.contains(ev.target) && !btn.contains(ev.target)) { menuDiv.style.display = 'none'; btn.classList.remove('active'); } }); } const isShown = menuDiv.style.display === 'block'; document.querySelectorAll('.interval-dropdown-menu').forEach(m => m.classList.remove('show')); document.querySelectorAll('.indicators-dropdown-menu').forEach(m => m.classList.remove('show')); document.querySelectorAll('.indicators-dropdown .top-btn').forEach(b => b.classList.remove('active')); document.querySelectorAll('.top-btn').forEach(b => { if (b !== btn) b.classList.remove('active'); }); if (!isShown) { menuDiv.innerHTML = ''; const currentTz = chart ? chart.getTimezone() : 'UTC'; const list = window.TimeZone.getTimezones(); list.forEach(item => { const row = document.createElement('div'); const isActive = (item.tz === currentTz); row.className = `timezone-dropdown-item${isActive ? ' active' : ''}`; row.textContent = item.label; row.addEventListener('click', (e) => { e.stopPropagation(); if (chart) { chart.setTimezone(item.tz); } menuDiv.style.display = 'none'; btn.classList.remove('active'); }); menuDiv.appendChild(row); }); const btnRect = btn.getBoundingClientRect(); menuDiv.style.left = (btnRect.left + window.scrollX) + 'px'; menuDiv.style.top = (btnRect.bottom + window.scrollY + 4) + 'px'; menuDiv.style.display = 'block'; btn.classList.add('active'); } else { menuDiv.style.display = 'none'; btn.classList.remove('active'); } } injectPrototypeMethods(); document.addEventListener('DOMContentLoaded', () => { injectPrototypeMethods(); injectStyles(); if (window.ChartingAPI && typeof window.ChartingAPI.registerTopToolbarButton === 'function') { const initialTz = (window.chart && typeof window.chart.getTimezone === 'function') ? window.chart.getTimezone() : (window.TimeZone.defaultTimezone || 'UTC'); const tzObj = window.TimeZone.getTimezones().find(item => item.tz === initialTz); window.ChartingAPI.registerTopToolbarButton('timezone', { label: tzObj ? tzObj.label : initialTz, tooltip: 'Select Chart Timezone', iconSvg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 2px;">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>`, onClick: function(chart, btn, e) { e.stopPropagation(); toggleTimezonePopup(btn, chart); } }); } setTimeout(() => { const chart = window.chart; if (chart && typeof chart.getTimezone === 'function') { const currentTz = chart.getTimezone(); const btn = document.getElementById('top-btn-timezone'); if (btn) { const span = btn.querySelector('span'); if (span) { const tzObj = window.TimeZone.getTimezones().find(item => item.tz === currentTz); span.textContent = tzObj ? tzObj.label : currentTz; } } } }, 500); }); })(window);