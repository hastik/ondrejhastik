// Settings drawer: colours + live Utopia type/space/container controls.
// Save / Load presets in localStorage; Export a pasteable block for chat → code defaults.
(() => {
  const root = document.documentElement;
  const tab = document.querySelector('.hero__tab');
  const panel = document.getElementById('settings-panel');
  const overlay = document.querySelector('.settings-overlay');
  const closeBtn = panel && panel.querySelector('.settings-panel__close');
  const colorGrid = document.getElementById('color-grid');
  const utopiaGrid = document.getElementById('utopia-grid');
  const colorReset = panel && panel.querySelector('[data-reset="colors"]');
  const utopiaReset = panel && panel.querySelector('[data-reset="utopia"]');
  const statusEl = document.getElementById('settings-status');
  const saveBtn = panel && panel.querySelector('[data-action="save"]');
  const loadBtn = panel && panel.querySelector('[data-action="load"]');
  const exportBtn = panel && panel.querySelector('[data-action="export"]');
  const loadDialog = document.getElementById('settings-load-dialog');
  const exportDialog = document.getElementById('settings-export-dialog');
  const presetSelect = document.getElementById('settings-preset-select');
  const exportText = document.getElementById('settings-export-text');
  const exportCopyBtn = document.getElementById('settings-export-copy');
  if (
    !tab || !panel || !overlay || !closeBtn || !colorGrid || !utopiaGrid ||
    !colorReset || !utopiaReset || !saveBtn || !loadBtn || !exportBtn ||
    !loadDialog || !exportDialog || !presetSelect || !exportText || !exportCopyBtn
  ) return;

  const COLOR_KEY = 'color-overrides';
  const UTOPIA_KEY = 'utopia-overrides';
  const PRESETS_KEY = 'settings-presets';
  const EXPORT_KIND = 'ondrejhastik-settings';
  const EXPORT_VERSION = 1;

  const COLORS = [
    { key: '--c-bg', label: 'Background' },
    { key: '--c-text', label: 'Text' },
    { key: '--c-text-soft', label: 'Text soft' },
    { key: '--c-text-strong', label: 'Text strong' },
    { key: '--c-text-muted', label: 'Text muted' },
    { key: '--c-accent-1', label: 'Accent 1' },
    { key: '--c-accent-2', label: 'Accent 2' },
    { key: '--c-accent-3', label: 'Accent 3' },
    { key: '--c-accent-4', label: 'Accent 4' },
    { key: '--c-line-start', label: 'Line start' },
    { key: '--c-hero-top', label: 'Hero top' },
    { key: '--c-hero-bottom', label: 'Hero bottom' },
    { key: '--c-tab-bg', label: 'Tab background' },
    { key: '--c-tab-text', label: 'Tab text' }
  ];

  const COLOR_DEFAULTS = {
    light: {
      '--c-bg': '#ffffff',
      '--c-text': '#000000',
      '--c-text-soft': '#444444',
      '--c-text-strong': '#222222',
      '--c-text-muted': '#555555',
      '--c-accent-1': '#3f5a2a',
      '--c-accent-2': '#a8502f',
      '--c-accent-3': '#916f56',
      '--c-accent-4': '#dab8a3',
      '--c-line-start': '#353221',
      '--c-hero-top': '#e9e4dd',
      '--c-hero-bottom': '#fbf9f6',
      '--c-tab-bg': '#000000',
      '--c-tab-text': '#ffffff'
    },
    dark: {
      '--c-bg': '#1d1a17',
      '--c-text': '#f1ebe4',
      '--c-text-soft': '#c4b9ad',
      '--c-text-strong': '#d9d0c6',
      '--c-text-muted': '#b5aa9e',
      '--c-accent-1': '#a3b982',
      '--c-accent-2': '#df9670',
      '--c-accent-3': '#b08a6e',
      '--c-accent-4': '#e9d2c3',
      '--c-line-start': '#33371b',
      '--c-hero-top': '#262119',
      '--c-hero-bottom': '#1d1a17',
      '--c-tab-bg': '#f1ebe4',
      '--c-tab-text': '#1d1a17'
    }
  };

  const UTOPIA_DEFAULTS = {
    minWidth: 360,
    maxWidth: 1920,
    minFont: 16,
    maxFont: 20,
    minScale: 1.21,
    maxScale: 1.31,
    multNormal: 80,
    multWide: 100,
    photoScale: 0.9
  };

  const UTOPIA_FIELDS = [
    { key: 'minWidth', label: 'Min viewport (px)', min: 280, max: 600, step: 10 },
    { key: 'maxWidth', label: 'Max viewport (px)', min: 1024, max: 4000, step: 20 },
    { key: 'minFont', label: 'Base size @min (px)', min: 12, max: 22, step: 0.5 },
    { key: 'maxFont', label: 'Base size @max (px)', min: 14, max: 32, step: 0.5 },
    { key: 'minScale', label: 'Type scale @min', min: 1.1, max: 1.4, step: 0.01 },
    { key: 'maxScale', label: 'Type scale @max', min: 1.15, max: 1.5, step: 0.01 },
    { key: 'multNormal', label: 'Container × normal', min: 60, max: 110, step: 1 },
    { key: 'multWide', label: 'Container × wide', min: 80, max: 140, step: 1 },
    { key: 'photoScale', label: 'Photo size', min: 0.5, max: 1.15, step: 0.01 }
  ];

  const SPACE_MULT = {
    '3xs': 0.25, '2xs': 0.5, xs: 0.75, s: 1, m: 1.5, l: 2, xl: 3,
    '2xl': 4, '3xl': 6, '4xl': 8, '5xl': 12, '6xl': 16
  };
  const SPACE_PAIRS = [
    ['xs', 's'], ['s', 'm'], ['s', 'l'], ['m', 'l'], ['l', 'xl'], ['xl', '2xl']
  ];
  const TYPE_STEPS = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7];

  let lastFocus = null;
  let open = false;

  const theme = () => (root.dataset.theme === 'dark' ? 'dark' : 'light');

  const load = (key) => {
    try { return JSON.parse(localStorage.getItem(key)) || {}; }
    catch (e) { return {}; }
  };

  const save = (key, all) => {
    try { localStorage.setItem(key, JSON.stringify(all)); } catch (e) {}
  };

  const round = (n, d = 4) => {
    const p = 10 ** d;
    return Math.round(n * p) / p;
  };

  const utopiaParams = () => ({ ...UTOPIA_DEFAULTS, ...load(UTOPIA_KEY) });

  // Utopia clamp: px sizes/viewports → rem + vw preferred
  // preferred = (yPx/16)rem + (slope*100)vw  — do NOT divide slope by 16
  const fluidClamp = (minSize, maxSize, minW, maxW) => {
    const slope = (maxSize - minSize) / (maxW - minW);
    const y = (-minW) * slope + minSize;
    const mn = round(minSize / 16);
    const mx = round(maxSize / 16);
    const yi = round(y / 16);
    const sl = round(slope * 100);
    return `clamp(${mn}rem, ${yi}rem + ${sl}vw, ${mx}rem)`;
  };

  const stepName = (step) => (step < 0 ? `--step--${-step}` : `--step-${step}`);

  const applyUtopia = (params = utopiaParams()) => {
    const {
      minWidth, maxWidth, minFont, maxFont, minScale, maxScale, multNormal, multWide, photoScale
    } = params;

    TYPE_STEPS.forEach((step) => {
      const minSize = minFont * (minScale ** step);
      const maxSize = maxFont * (maxScale ** step);
      root.style.setProperty(stepName(step), fluidClamp(minSize, maxSize, minWidth, maxWidth));
    });

    Object.entries(SPACE_MULT).forEach(([name, mult]) => {
      root.style.setProperty(
        `--space-${name}`,
        fluidClamp(minFont * mult, maxFont * mult, minWidth, maxWidth)
      );
    });

    SPACE_PAIRS.forEach(([a, b]) => {
      root.style.setProperty(
        `--space-${a}-${b}`,
        fluidClamp(minFont * SPACE_MULT[a], maxFont * SPACE_MULT[b], minWidth, maxWidth)
      );
    });

    root.style.setProperty('--container-mult-normal', String(multNormal));
    root.style.setProperty('--container-mult-wide', String(multWide));
    root.style.setProperty('--photo-scale', String(photoScale));
    // Ensure aliases still point at steps (in case something cleared them)
    root.style.setProperty('--myrem', 'var(--step-0)');
    root.style.setProperty('--wrapper-normal', 'calc(var(--myrem) * var(--container-mult-normal))');
    root.style.setProperty('--wrapper-wide', 'calc(var(--myrem) * var(--container-mult-wide))');

    syncUtopiaInputs(params);
  };

  const clearUtopiaInline = () => {
    TYPE_STEPS.forEach((step) => root.style.removeProperty(stepName(step)));
    Object.keys(SPACE_MULT).forEach((name) => root.style.removeProperty(`--space-${name}`));
    SPACE_PAIRS.forEach(([a, b]) => root.style.removeProperty(`--space-${a}-${b}`));
    [
      '--container-mult-normal', '--container-mult-wide', '--photo-scale',
      '--myrem', '--wrapper-normal', '--wrapper-wide'
    ].forEach((k) => root.style.removeProperty(k));
  };

  const currentColor = (key) => {
    const stored = (load(COLOR_KEY)[theme()] || {})[key];
    return stored || COLOR_DEFAULTS[theme()][key];
  };

  const syncColorInputs = () => {
    colorGrid.querySelectorAll('.color-row').forEach((row) => {
      const key = row.dataset.key;
      const value = currentColor(key);
      const picker = row.querySelector('.color-row__picker');
      const hex = row.querySelector('.color-row__value');
      if (picker) picker.value = value;
      if (hex) hex.textContent = value;
    });
  };

  const applyColorOverrides = () => {
    COLORS.forEach(({ key }) => root.style.removeProperty(key));
    const overrides = load(COLOR_KEY)[theme()] || {};
    Object.entries(overrides).forEach(([key, value]) => root.style.setProperty(key, value));
    syncColorInputs();
  };

  const formatVal = (key, n) => {
    if (key === 'photoScale') return `${Math.round(Number(n) * 100)}%`;
    if (key.includes('Scale')) return Number(n).toFixed(2);
    if (key.includes('Font')) return String(Number(n));
    return String(Math.round(Number(n)));
  };

  const syncUtopiaInputs = (params = utopiaParams()) => {
    utopiaGrid.querySelectorAll('.font-row').forEach((row) => {
      const key = row.dataset.key;
      const slider = row.querySelector('.font-row__slider');
      const out = row.querySelector('.font-row__value');
      const value = params[key];
      if (slider) slider.value = value;
      if (out) out.textContent = formatVal(key, value);
    });
  };

  const setPageInert = (on) => {
    [...document.body.children].forEach((el) => {
      if (el === panel || el === overlay || el === loadDialog || el === exportDialog) return;
      if (on) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    });
  };

  const focusables = () => [...panel.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )].filter((el) => !el.disabled && el.offsetParent !== null);

  const openPanel = () => {
    if (open) return;
    open = true;
    lastFocus = document.activeElement;
    if (!lastFocus || lastFocus === document.body || panel.contains(lastFocus) || overlay.contains(lastFocus)) {
      lastFocus = tab;
    }
    panel.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.classList.add('settings-open');
    panel.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    tab.setAttribute('aria-expanded', 'true');
    tab.setAttribute('aria-label', 'Close settings');
    setPageInert(true);
    (closeBtn || panel).focus();
  };

  const closePanel = () => {
    if (!open) return;
    open = false;
    panel.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.classList.remove('settings-open');
    panel.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    tab.setAttribute('aria-expanded', 'false');
    tab.setAttribute('aria-label', 'Open settings');
    setPageInert(false);
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  };

  COLORS.forEach(({ key, label }) => {
    const row = document.createElement('label');
    row.className = 'color-row';
    row.dataset.key = key;

    const picker = document.createElement('input');
    picker.type = 'color';
    picker.className = 'color-row__picker';
    picker.value = currentColor(key);
    picker.setAttribute('aria-label', label);

    const name = document.createElement('span');
    name.className = 'color-row__label';
    name.textContent = label;

    const hex = document.createElement('span');
    hex.className = 'color-row__value';
    hex.textContent = picker.value;

    picker.addEventListener('input', () => {
      root.style.setProperty(key, picker.value);
      hex.textContent = picker.value;
      const all = load(COLOR_KEY);
      const current = theme();
      all[current] = { ...(all[current] || {}), [key]: picker.value };
      save(COLOR_KEY, all);
    });

    row.append(picker, name, hex);
    colorGrid.append(row);
  });

  const note = document.createElement('p');
  note.className = 'utopia-note';
  note.textContent = 'Live Utopia controls (utopia.fyi). Type + space + container scale together.';
  utopiaGrid.append(note);

  UTOPIA_FIELDS.forEach((field) => {
    const row = document.createElement('label');
    row.className = 'font-row';
    row.dataset.key = field.key;

    const name = document.createElement('span');
    name.className = 'font-row__label';
    name.textContent = field.label;

    const out = document.createElement('span');
    out.className = 'font-row__value';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'font-row__slider';
    slider.min = String(field.min);
    slider.max = String(field.max);
    slider.step = String(field.step);
    slider.setAttribute('aria-label', field.label);

    const onChange = () => {
      const value = Number(slider.value);
      out.textContent = formatVal(field.key, value);
      const all = { ...utopiaParams(), [field.key]: value };
      // Keep max > min where it matters
      if (field.key === 'minWidth' && all.minWidth >= all.maxWidth) all.maxWidth = all.minWidth + 100;
      if (field.key === 'maxWidth' && all.maxWidth <= all.minWidth) all.minWidth = all.maxWidth - 100;
      if (field.key === 'minFont' && all.minFont > all.maxFont) all.maxFont = all.minFont;
      if (field.key === 'maxFont' && all.maxFont < all.minFont) all.minFont = all.maxFont;
      if (field.key === 'minScale' && all.minScale > all.maxScale) all.maxScale = all.minScale;
      if (field.key === 'maxScale' && all.maxScale < all.minScale) all.minScale = all.maxScale;
      if (field.key === 'multNormal' && all.multNormal > all.multWide) all.multWide = all.multNormal;
      if (field.key === 'multWide' && all.multWide < all.multNormal) all.multNormal = all.multWide;

      const cleaned = {};
      Object.keys(UTOPIA_DEFAULTS).forEach((k) => {
        if (all[k] !== UTOPIA_DEFAULTS[k]) cleaned[k] = all[k];
      });
      save(UTOPIA_KEY, cleaned);
      applyUtopia({ ...UTOPIA_DEFAULTS, ...cleaned });
    };

    slider.addEventListener('input', onChange);
    row.append(name, out, slider);
    utopiaGrid.append(row);
  });

  applyColorOverrides();
  applyUtopia();

  const setStatus = (msg) => {
    if (statusEl) statusEl.textContent = msg || '';
  };

  const loadPresets = () => {
    const raw = load(PRESETS_KEY);
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  };

  const effectiveColors = (mode) => {
    const defaults = COLOR_DEFAULTS[mode] || {};
    const overrides = (load(COLOR_KEY)[mode] || {});
    const out = {};
    COLORS.forEach(({ key }) => {
      out[key] = overrides[key] || defaults[key];
    });
    return out;
  };

  const currentSnapshot = () => ({
    version: EXPORT_VERSION,
    kind: EXPORT_KIND,
    utopia: utopiaParams(),
    colors: {
      light: effectiveColors('light'),
      dark: effectiveColors('dark')
    }
  });

  const applySnapshot = (snapshot) => {
    if (!snapshot || snapshot.kind !== EXPORT_KIND) {
      throw new Error('Unknown settings format');
    }
    const utopia = { ...UTOPIA_DEFAULTS, ...(snapshot.utopia || {}) };
    const cleaned = {};
    Object.keys(UTOPIA_DEFAULTS).forEach((k) => {
      if (utopia[k] !== UTOPIA_DEFAULTS[k]) cleaned[k] = utopia[k];
    });
    save(UTOPIA_KEY, cleaned);
    applyUtopia({ ...UTOPIA_DEFAULTS, ...cleaned });

    const nextColors = {};
    ['light', 'dark'].forEach((mode) => {
      const incoming = (snapshot.colors && snapshot.colors[mode]) || {};
      const defaults = COLOR_DEFAULTS[mode] || {};
      const overrides = {};
      COLORS.forEach(({ key }) => {
        if (incoming[key] && incoming[key] !== defaults[key]) overrides[key] = incoming[key];
      });
      if (Object.keys(overrides).length) nextColors[mode] = overrides;
    });
    save(COLOR_KEY, nextColors);
    applyColorOverrides();
  };

  const exportBlock = () => {
    const payload = {
      ...currentSnapshot(),
      exportedAt: new Date().toISOString(),
      note: 'Paste this whole block into chat. Agent should update UTOPIA_DEFAULTS and COLOR_DEFAULTS in settings.js to match.'
    };
    return [
      '```ondrejhastik-settings-v1',
      JSON.stringify(payload, null, 2),
      '```'
    ].join('\n');
  };

  const fillPresetSelect = () => {
    const presets = loadPresets();
    const names = Object.keys(presets).sort((a, b) => a.localeCompare(b));
    presetSelect.innerHTML = '';
    names.forEach((name) => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      presetSelect.append(opt);
    });
    return names;
  };

  saveBtn.addEventListener('click', () => {
    const name = window.prompt('Preset name');
    if (name == null) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setStatus('Name required');
      return;
    }
    const presets = loadPresets();
    if (presets[trimmed] && !window.confirm(`Overwrite “${trimmed}”?`)) return;
    presets[trimmed] = {
      ...currentSnapshot(),
      name: trimmed,
      savedAt: new Date().toISOString()
    };
    save(PRESETS_KEY, presets);
    setStatus(`Saved “${trimmed}”`);
  });

  loadBtn.addEventListener('click', () => {
    const names = fillPresetSelect();
    if (!names.length) {
      setStatus('No saved presets');
      return;
    }
    if (typeof loadDialog.showModal === 'function') loadDialog.showModal();
    else setStatus('Dialog not supported');
  });

  loadDialog.addEventListener('close', () => {
    const action = loadDialog.returnValue;
    const name = presetSelect.value;
    if (!name || action === 'cancel' || !action) return;

    const presets = loadPresets();
    if (action === 'delete') {
      if (!window.confirm(`Delete “${name}”?`)) return;
      delete presets[name];
      save(PRESETS_KEY, presets);
      setStatus(`Deleted “${name}”`);
      return;
    }
    if (action === 'load') {
      try {
        applySnapshot(presets[name]);
        setStatus(`Loaded “${name}”`);
      } catch (e) {
        setStatus('Could not load preset');
      }
    }
  });

  exportBtn.addEventListener('click', async () => {
    const block = exportBlock();
    exportText.value = block;
    if (typeof exportDialog.showModal === 'function') exportDialog.showModal();
    try {
      await navigator.clipboard.writeText(block);
      setStatus('Exported — copied to clipboard');
    } catch (e) {
      setStatus('Exported — copy from the dialog');
      exportText.focus();
      exportText.select();
    }
  });

  exportCopyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(exportText.value);
      setStatus('Copied to clipboard');
    } catch (e) {
      exportText.focus();
      exportText.select();
      setStatus('Select and copy manually');
    }
  });

  tab.addEventListener('click', () => (open ? closePanel() : openPanel()));
  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);

  colorReset.addEventListener('click', () => {
    const all = load(COLOR_KEY);
    delete all[theme()];
    save(COLOR_KEY, all);
    applyColorOverrides();
  });

  utopiaReset.addEventListener('click', () => {
    save(UTOPIA_KEY, {});
    clearUtopiaInline();
    applyUtopia(UTOPIA_DEFAULTS);
  });

  document.addEventListener('keydown', (e) => {
    if (loadDialog.open || exportDialog.open) return;
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closePanel();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  root.addEventListener('themechange', applyColorOverrides);
})();
