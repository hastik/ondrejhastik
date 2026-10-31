// Settings drawer: per-theme colour overrides, persisted in localStorage.
(() => {
  const root = document.documentElement;
  const tab = document.querySelector('.hero__tab');
  const panel = document.getElementById('settings-panel');
  const overlay = document.querySelector('.settings-overlay');
  const closeBtn = panel && panel.querySelector('.settings-panel__close');
  const resetBtn = panel && panel.querySelector('.settings-section__reset');
  const grid = document.getElementById('color-grid');
  if (!tab || !panel || !overlay || !closeBtn || !resetBtn || !grid) return;

  const STORAGE_KEY = 'color-overrides';

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

  const DEFAULTS = {
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

  let lastFocus = null;
  let open = false;

  const theme = () => (root.dataset.theme === 'dark' ? 'dark' : 'light');

  const load = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  };

  const save = (all) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch (e) {}
  };

  const currentValue = (key) => {
    const stored = (load()[theme()] || {})[key];
    return stored || DEFAULTS[theme()][key];
  };

  const applyOverrides = () => {
    COLORS.forEach(({ key }) => root.style.removeProperty(key));
    const overrides = load()[theme()] || {};
    Object.entries(overrides).forEach(([key, value]) => root.style.setProperty(key, value));
    syncInputs();
  };

  const syncInputs = () => {
    grid.querySelectorAll('.color-row').forEach((row) => {
      const key = row.dataset.key;
      const value = currentValue(key);
      const picker = row.querySelector('.color-row__picker');
      const hex = row.querySelector('.color-row__value');
      if (picker) picker.value = value;
      if (hex) hex.textContent = value;
    });
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
    picker.value = currentValue(key);
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
      const all = load();
      const current = theme();
      all[current] = { ...(all[current] || {}), [key]: picker.value };
      save(all);
    });

    row.append(picker, name, hex);
    grid.append(row);
  });

  applyOverrides();

  tab.addEventListener('click', () => (open ? closePanel() : openPanel()));
  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);

  resetBtn.addEventListener('click', () => {
    const all = load();
    delete all[theme()];
    save(all);
    applyOverrides();
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

  root.addEventListener('themechange', applyOverrides);
})();
