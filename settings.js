// Settings drawer: per-theme colour + font-size overrides, persisted in localStorage.
(() => {
  const root = document.documentElement;
  const tab = document.querySelector('.hero__tab');
  const panel = document.getElementById('settings-panel');
  const overlay = document.querySelector('.settings-overlay');
  const closeBtn = panel && panel.querySelector('.settings-panel__close');
  const colorGrid = document.getElementById('color-grid');
  const fontGrid = document.getElementById('font-grid');
  const colorReset = panel && panel.querySelector('[data-reset="colors"]');
  const fontReset = panel && panel.querySelector('[data-reset="fonts"]');
  if (!tab || !panel || !overlay || !closeBtn || !colorGrid || !fontGrid || !colorReset || !fontReset) return;

  const COLOR_KEY = 'color-overrides';
  const FONT_KEY = 'font-overrides';

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

  // Coefficients used as calc(N * var(--u)) in style.css
  // defLarge mirrors the ≥1600px CSS bump for --fs-h1
  const FONTS = [
    { key: '--fs-nav', label: 'Nav', min: 4, max: 14, step: 0.1, def: 6.8 },
    { key: '--fs-brand', label: 'Brand', min: 4, max: 16, step: 0.1, def: 7 },
    { key: '--fs-tiny', label: 'Tiny', min: 5, max: 16, step: 0.1, def: 8.4 },
    { key: '--fs-small', label: 'Small', min: 5, max: 18, step: 0.1, def: 8.6 },
    { key: '--fs-tab', label: 'Tab', min: 5, max: 16, step: 0.1, def: 9 },
    { key: '--fs-label', label: 'Label', min: 6, max: 20, step: 0.1, def: 11.2 },
    { key: '--fs-lead', label: 'Lead', min: 8, max: 24, step: 0.1, def: 13.5 },
    { key: '--fs-h2', label: 'Heading 2', min: 10, max: 28, step: 0.1, def: 16 },
    { key: '--fs-statement', label: 'Statement', min: 14, max: 40, step: 0.1, def: 25.5 },
    { key: '--fs-h1', label: 'Heading 1', min: 28, max: 72, step: 0.5, def: 46, defLarge: 58 }
  ];

  const largeScreen = () => matchMedia('(min-width: 1600px)').matches;
  const fontDefault = (font) => (font.defLarge && largeScreen() ? font.defLarge : font.def);

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

  const formatCoeff = (n) => {
    const rounded = Math.round(Number(n) * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  };

  const fontCss = (n) => `calc(${formatCoeff(n)} * var(--u))`;

  const currentColor = (key) => {
    const stored = (load(COLOR_KEY)[theme()] || {})[key];
    return stored || COLOR_DEFAULTS[theme()][key];
  };

  const currentFont = (key) => {
    const stored = load(FONT_KEY)[key];
    const fallback = FONTS.find((f) => f.key === key);
    return stored != null ? Number(stored) : fontDefault(fallback);
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

  const syncFontInputs = () => {
    fontGrid.querySelectorAll('.font-row').forEach((row) => {
      const key = row.dataset.key;
      const value = currentFont(key);
      const slider = row.querySelector('.font-row__slider');
      const out = row.querySelector('.font-row__value');
      if (slider) slider.value = value;
      if (out) out.textContent = formatCoeff(value);
    });
  };

  const applyColorOverrides = () => {
    COLORS.forEach(({ key }) => root.style.removeProperty(key));
    const overrides = load(COLOR_KEY)[theme()] || {};
    Object.entries(overrides).forEach(([key, value]) => root.style.setProperty(key, value));
    syncColorInputs();
  };

  const applyFontOverrides = () => {
    FONTS.forEach(({ key }) => root.style.removeProperty(key));
    const overrides = load(FONT_KEY);
    Object.entries(overrides).forEach(([key, value]) => {
      root.style.setProperty(key, fontCss(value));
    });
    // Keep H1 line-height in proportion when H1 size is overridden
    if (overrides['--fs-h1'] != null) {
      const h1 = Number(overrides['--fs-h1']);
      root.style.setProperty('--lh-h1', fontCss(h1 * (52 / 46)));
    } else {
      root.style.removeProperty('--lh-h1');
    }
    syncFontInputs();
  };

  const setPageInert = (on) => {
    [...document.body.children].forEach((el) => {
      if (el === panel || el === overlay) return;
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

  FONTS.forEach((font) => {
    const { key, label, min, max, step } = font;
    const row = document.createElement('label');
    row.className = 'font-row';
    row.dataset.key = key;

    const name = document.createElement('span');
    name.className = 'font-row__label';
    name.textContent = label;

    const out = document.createElement('span');
    out.className = 'font-row__value';
    out.textContent = formatCoeff(currentFont(key));

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'font-row__slider';
    slider.min = String(min);
    slider.max = String(max);
    slider.step = String(step);
    slider.value = String(currentFont(key));
    slider.setAttribute('aria-label', `${label} font size`);

    const onChange = () => {
      const value = Number(slider.value);
      out.textContent = formatCoeff(value);
      root.style.setProperty(key, fontCss(value));
      if (key === '--fs-h1') {
        root.style.setProperty('--lh-h1', fontCss(value * (52 / 46)));
      }
      const all = load(FONT_KEY);
      if (value === fontDefault(font)) delete all[key];
      else all[key] = value;
      save(FONT_KEY, all);
    };

    slider.addEventListener('input', onChange);
    row.append(name, out, slider);
    fontGrid.append(row);
  });

  matchMedia('(min-width: 1600px)').addEventListener('change', () => {
    if (load(FONT_KEY)['--fs-h1'] == null) syncFontInputs();
  });

  applyColorOverrides();
  applyFontOverrides();

  tab.addEventListener('click', () => (open ? closePanel() : openPanel()));
  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);

  colorReset.addEventListener('click', () => {
    const all = load(COLOR_KEY);
    delete all[theme()];
    save(COLOR_KEY, all);
    applyColorOverrides();
  });

  fontReset.addEventListener('click', () => {
    save(FONT_KEY, {});
    applyFontOverrides();
  });

  document.addEventListener('keydown', (e) => {
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
