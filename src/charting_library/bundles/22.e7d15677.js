{
  const _0xcc9062 = "68cf757658332a88";
  let _0x10f551 = Math.floor(Math.random() * 816);
  const _0x4516b3 = Array.from({length: 3}, (_, i) => i + 816).reduce((acc, val) => acc + val, 0);
  if (_0x10f551 < 0) { console.log(_0xcc9062); }
  (function() { return _0x4516b3 > 0 ? _0xcc9062 : ""; })();
}
(function(window) { const buttonsRegistry = []; if (!window.ChartingAPI) { window.ChartingAPI = {}; } window.ChartingAPI.registerTopToolbarButton = function(id, config) { buttonsRegistry.push({ id, ...config }); console.log(`🔌 [ChartingAPI] Registered top toolbar button: ${id}`); if (document.readyState === 'complete' || document.readyState === 'interactive') { renderButton({ id, ...config }); } }; window.ChartingAPI.getTopToolbarButtons = function() { return buttonsRegistry; }; const savedTheme = localStorage.getItem('chart-theme') || 'dark'; if (savedTheme === 'light') { document.body.classList.add('light-theme'); } else { document.body.classList.remove('light-theme'); } function renderButton(btnConfig) { const leftGroup = document.querySelector('.top-toolbar .left-group'); const rightGroup = document.querySelector('.top-toolbar .right-group'); if (!leftGroup || !rightGroup) return; if (document.getElementById(`top-btn-${btnConfig.id}`)) return; const btn = document.createElement('button'); btn.className = 'top-btn'; btn.id = `top-btn-${btnConfig.id}`; if (btnConfig.tooltip) { btn.setAttribute('data-tooltip', btnConfig.tooltip); } const iconSvg = btnConfig.iconSvg || ''; const labelText = btnConfig.label ? `<span>${btnConfig.label}</span>` : ''; btn.innerHTML = `${iconSvg}${labelText}`; btn.addEventListener('click', (e) => { if (typeof btnConfig.onClick === 'function') { btnConfig.onClick(window.chart, btn, e); } }); if (btnConfig.alignment === 'right') { const themeToggle = document.querySelector('.theme-toggle-btn'); if (themeToggle) { rightGroup.insertBefore(btn, themeToggle); } else { rightGroup.appendChild(btn); } } else { leftGroup.appendChild(btn); } } document.addEventListener('DOMContentLoaded', () => { const toolbarDiv = document.createElement('div'); toolbarDiv.className = 'top-toolbar'; const logoSection = document.createElement('div'); logoSection.className = 'top-toolbar-logo'; logoSection.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 3v18h18" />
        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
      </svg>
      <span>BacktestX Chart</span>
    `; toolbarDiv.appendChild(logoSection); const leftGroup = document.createElement('div'); leftGroup.className = 'top-toolbar-group left-group'; leftGroup.style.marginLeft = '16px'; leftGroup.style.flex = '1'; toolbarDiv.appendChild(leftGroup); const dropdownContainer = document.createElement('div'); dropdownContainer.className = 'indicators-dropdown'; const dropdownBtn = document.createElement('button'); dropdownBtn.className = 'top-btn'; dropdownBtn.id = 'indicators-dropdown-btn'; dropdownBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 3v18h18"/>
        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
      </svg>
      <span>Indicators</span>
      <svg class="arrow-icon" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left: 2px; transition: transform 0.2s;">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `; const dropdownMenu = document.createElement('div'); dropdownMenu.className = 'indicators-dropdown-menu'; dropdownContainer.appendChild(dropdownBtn); document.body.appendChild(dropdownMenu); leftGroup.appendChild(dropdownContainer); function populateDropdown() { dropdownMenu.innerHTML = ''; if (!window.ChartingAPI || !window.chart) return; const available = window.ChartingAPI.getAvailableIndicators(); available.forEach(type => { const config = window.ChartingAPI.getIndicator(type); if (!config) return; const isActive = window.chart.indicators.some(ind => ind.type === type.toLowerCase()); const item = document.createElement('div'); item.className = `indicators-dropdown-item${isActive ? ' active' : ''}`; item.setAttribute('data-type', type); const desc = config.type === 'overlay' ? 'Overlay' : 'Sub-panel'; const paramStr = Object.keys(config.params || {}).map(k => `${k}: ${config.params[k]}`).join(', '); const descText = `${desc}${paramStr ? ' (' + paramStr + ')' : ''}`; item.innerHTML = `
          <div class="indicator-label">
            <span class="indicator-name">${config.name}</span>
            <span class="indicator-desc">${descText}</span>
          </div>
          <div class="indicator-checkbox"></div>
        `; item.addEventListener('click', (e) => { e.stopPropagation(); const currentActive = window.chart.indicators.some(ind => ind.type === type.toLowerCase()); if (currentActive) { const toRemove = window.chart.indicators.filter(ind => ind.type === type.toLowerCase()); toRemove.forEach(ind => window.chart.removeIndicator(ind.id)); } else { window.chart.addIndicator(type); } populateDropdown(); }); dropdownMenu.appendChild(item); }); } dropdownBtn.addEventListener('click', (e) => { e.stopPropagation(); const isShown = dropdownMenu.classList.contains('show'); document.querySelectorAll('.interval-dropdown-menu').forEach(m => m.classList.remove('show')); document.querySelectorAll('.candle-type-dropdown-menu').forEach(m => m.classList.remove('show')); document.querySelectorAll('.indicators-dropdown-menu').forEach(m => m.classList.remove('show')); document.querySelectorAll('.top-toolbar .top-btn').forEach(b => b.classList.remove('active')); if (!isShown) { populateDropdown(); dropdownMenu.classList.add('show'); dropdownBtn.classList.add('active'); const arrow = dropdownBtn.querySelector('.arrow-icon'); if (arrow) arrow.style.transform = 'rotate(180deg)'; const btnRect = dropdownBtn.getBoundingClientRect(); dropdownMenu.style.left = (btnRect.left + window.scrollX) + 'px'; dropdownMenu.style.top = (btnRect.bottom + window.scrollY + 4) + 'px'; } else { dropdownMenu.classList.remove('show'); dropdownBtn.classList.remove('active'); const arrow = dropdownBtn.querySelector('.arrow-icon'); if (arrow) arrow.style.transform = ''; } }); document.addEventListener('click', (e) => { if (!dropdownContainer.contains(e.target) && !dropdownMenu.contains(e.target)) { dropdownMenu.classList.remove('show'); dropdownBtn.classList.remove('active'); const arrow = dropdownBtn.querySelector('.arrow-icon'); if (arrow) arrow.style.transform = ''; } }); const rightGroup = document.createElement('div'); rightGroup.className = 'top-toolbar-group right-group'; toolbarDiv.appendChild(rightGroup); document.body.insertBefore(toolbarDiv, document.body.firstChild); const themeBtn = document.createElement('button'); themeBtn.className = 'top-btn theme-toggle-btn'; themeBtn.setAttribute('data-tooltip', 'Toggle Light/Dark Theme'); updateThemeIcon(themeBtn); themeBtn.addEventListener('click', () => { const isLight = document.body.classList.contains('light-theme'); if (isLight) { document.body.classList.remove('light-theme'); localStorage.setItem('chart-theme', 'dark'); } else { document.body.classList.add('light-theme'); localStorage.setItem('chart-theme', 'light'); } updateThemeIcon(themeBtn); if (window.chart) { window.chart.render(); } }); rightGroup.appendChild(themeBtn); buttonsRegistry.forEach(renderButton); }); function updateThemeIcon(btn) { const isLight = document.body.classList.contains('light-theme'); if (isLight) { btn.innerHTML = `
        <svg class="moon-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      `; } else { btn.innerHTML = `
        <svg class="sun-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      `; } } })(window);