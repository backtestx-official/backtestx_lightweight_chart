{
  const _0x5936ca = "aa62da527f069247";
  let _0x6bdc52 = Math.floor(Math.random() * 734);
  const _0x76168b = Array.from({length: 3}, (_, i) => i + 734).reduce((acc, val) => acc + val, 0);
  if (_0x6bdc52 < 0) { console.log(_0x5936ca); }
  (function() { return _0x76168b > 0 ? _0x5936ca : ""; })();
}
(function(window) { let overlay, modal, typeSelect, intervalInput, errorText, addBtn; const CreateIntervalPopup = { init: function() { if (overlay) return;  const container = document.body; const D = getThemeColors(); const $ = (tag, css, extras) => { const el = document.createElement(tag); if (css) el.style.cssText = css; if (extras) Object.assign(el, extras); return el; }; overlay = $('div', `
        position: fixed; inset: 0; background: ${D.overlayBg}; z-index: 10005;
        display: none; align-items: center; justify-content: center;
        backdrop-filter: blur(4px); font-family: Inter, Arial, sans-serif;
        opacity: 0; transition: opacity 0.2s ease;
      `); modal = $('div', `
        background: ${D.modalBg}; border: 1px solid ${D.border};
        border-radius: 8px; width: 340px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        display: flex; flex-direction: column;
        transform: scale(0.95); transition: transform 0.2s ease;
      `); const header = $('div', `
        display: flex; justify-content: space-between; align-items: center;
        padding: 16px 20px; border-bottom: 1px solid ${D.border};
      `); const title = $('div', `font-size: 16px; font-weight: 600; color: ${D.text};`); title.textContent = 'Add custom interval'; const closeBtn = $('button', `
        background: transparent; border: none; color: ${D.textMuted}; cursor: pointer;
        display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 4px;
      `); closeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l12 12m0-12L1 13"/></svg>`; closeBtn.onclick = () => CreateIntervalPopup.close(); header.appendChild(title); header.appendChild(closeBtn); const body = $('div', `padding: 20px; display: flex; flex-direction: column; gap: 16px;`); const typeRow = $('div', `display: flex; align-items: center;`); const typeLabel = $('div', `width: 80px; font-size: 13px; color: ${D.text};`); typeLabel.textContent = 'Type'; const typeSelectWrap = $('div', `flex: 1; position: relative;`); typeSelect = $('select', `
        width: 100%; background: ${D.inputBg}; border: 1px solid ${D.inputBorder};
        color: ${D.text}; padding: 8px 12px; border-radius: 4px; font-size: 13px;
        outline: none; appearance: none; cursor: pointer; font-family: inherit;
      `); typeSelect.innerHTML = `
        <option value="S">seconds</option>
        <option value="m">minutes</option>
        <option value="H">hours</option>
        <option value="D">days</option>
        <option value="W">weeks</option>
        <option value="M">months</option>
      `; const selectArrow = $('div', `
        position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
        pointer-events: none; color: ${D.textMuted};
      `); selectArrow.innerHTML = `<svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l4 4 4-4"/></svg>`; typeSelectWrap.appendChild(typeSelect); typeSelectWrap.appendChild(selectArrow); typeRow.appendChild(typeLabel); typeRow.appendChild(typeSelectWrap); const intervalRow = $('div', `display: flex; align-items: flex-start;`); const intervalLabel = $('div', `width: 80px; font-size: 13px; color: ${D.text}; margin-top: 8px;`); intervalLabel.textContent = 'Interval'; const intervalInputWrap = $('div', `flex: 1; display: flex; flex-direction: column; gap: 6px;`); intervalInput = $('input', `
        width: 100%; background: ${D.inputBg}; border: 1px solid ${D.inputBorder};
        color: ${D.text}; padding: 8px 12px; border-radius: 4px; font-size: 13px;
        outline: none; font-family: inherit; box-sizing: border-box;
      `, { type: 'number', min: '1' }); errorText = $('div', `font-size: 11px; color: ${D.errorText}; display: none; line-height: 1.4;`); errorText.innerHTML = 'Interval already exists'; intervalInputWrap.appendChild(intervalInput); intervalInputWrap.appendChild(errorText); intervalRow.appendChild(intervalLabel); intervalRow.appendChild(intervalInputWrap); body.appendChild(typeRow); body.appendChild(intervalRow); const footer = $('div', `
        display: flex; justify-content: flex-end; align-items: center; gap: 8px;
        padding: 16px 20px; border-top: 1px solid ${D.border};
      `); const cancelBtn = $('button', `
        background: transparent; border: 1px solid ${D.inputBorder}; color: ${D.text};
        padding: 8px 16px; border-radius: 4px; font-size: 13px; font-weight: 500;
        cursor: pointer; transition: background 0.15s;
      `); cancelBtn.textContent = 'Cancel'; cancelBtn.onclick = () => CreateIntervalPopup.close(); addBtn = $('button', `
        background: ${D.accent}; border: none; color: #fff;
        padding: 8px 16px; border-radius: 4px; font-size: 13px; font-weight: 500;
        cursor: pointer; transition: background 0.15s;
      `); addBtn.textContent = 'Add'; footer.appendChild(cancelBtn); footer.appendChild(addBtn); modal.appendChild(header); modal.appendChild(body); modal.appendChild(footer); overlay.appendChild(modal); container.appendChild(overlay); intervalInput.addEventListener('input', validate); typeSelect.addEventListener('change', validate); addBtn.onclick = submit; overlay.addEventListener('click', e => { if (e.target === overlay) CreateIntervalPopup.close(); }); }, open: function() { CreateIntervalPopup.init(); updateColors(); overlay.style.display = 'flex'; intervalInput.value = '1'; typeSelect.value = 'm'; validate(); setTimeout(() => { overlay.style.opacity = '1'; modal.style.transform = 'scale(1)'; }, 10); setTimeout(() => { intervalInput.focus(); intervalInput.select(); }, 50); }, close: function() { if (!overlay) return; overlay.style.opacity = '0'; modal.style.transform = 'scale(0.95)'; setTimeout(() => { overlay.style.display = 'none'; }, 200); } }; function getThemeColors() { const isLight = document.body.classList.contains('light-theme'); return isLight ? { overlayBg:    'rgba(255, 255, 255, 0.45)', modalBg:      '#ffffff', border:       '#e0e3eb', text:         '#131722', textMuted:    '#787b86', accent:       '#2962ff', inputBg:      '#f0f3fa', inputBorder:  '#d1d4dc', errorText:    '#f23645', } : { overlayBg:    'rgba(0, 0, 0, 0.65)', modalBg:      '#1e222d', border:       '#2a2e39', text:         '#d1d4dc', textMuted:    '#787b86', accent:       '#2962ff', inputBg:      '#131722', inputBorder:  '#363c4e', errorText:    '#f23645', }; } function updateColors() { const D = getThemeColors(); overlay.style.background = D.overlayBg; modal.style.backgroundColor = D.modalBg; modal.style.borderColor = D.border; intervalInput.style.backgroundColor = D.inputBg; intervalInput.style.borderColor = D.inputBorder; intervalInput.style.color = D.text; typeSelect.style.backgroundColor = D.inputBg; typeSelect.style.borderColor = D.inputBorder; typeSelect.style.color = D.text; errorText.style.color = D.errorText; addBtn.style.backgroundColor = D.accent; } function validate() { const val = parseInt(intervalInput.value.trim(), 10); const type = typeSelect.value; const D = getThemeColors(); if (!val || isNaN(val) || val <= 0) { addBtn.style.opacity = '0.5'; addBtn.style.pointerEvents = 'none'; errorText.style.display = 'none'; intervalInput.style.borderColor = D.inputBorder; return false; } let normRes = val.toString(); if (type === 'm') { normRes += 'm'; } else { normRes += type; } const custom = JSON.parse(localStorage.getItem('cl_custom_intervals') || '[]'); const defaultRes = ['1S', '5S', '1m', '5m', '15m', '1H', '4H', '1D']; const existing = [...new Set([...defaultRes, ...custom])]; if (existing.includes(normRes)) { addBtn.style.opacity = '0.5'; addBtn.style.pointerEvents = 'none'; errorText.style.display = 'block'; intervalInput.style.borderColor = D.errorText; return false; } else { addBtn.style.opacity = '1'; addBtn.style.pointerEvents = 'auto'; errorText.style.display = 'none'; intervalInput.style.borderColor = D.inputBorder; return normRes; } } function submit() { const res = validate(); if (res) { const custom = JSON.parse(localStorage.getItem('cl_custom_intervals') || '[]'); if (!custom.includes(res)) { custom.push(res); localStorage.setItem('cl_custom_intervals', JSON.stringify(custom)); } CreateIntervalPopup.close(); if (window.TopToolbarInterval && window.TopToolbarInterval.refresh) { window.TopToolbarInterval.refresh(); } if (window.chart) { window.chart.setResolution(res); } } } window.CreateIntervalPopup = CreateIntervalPopup; })(window);