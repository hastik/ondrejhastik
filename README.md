# Osobní webové stránky Ondřeje Hastíka

Statická webová prezentace obsahující úvodní stránku pro osobní portfolio digitálního produktového stratéga a poradce.

## Struktura souborů

### Hlavní soubory (v kořenovém adresáři)

- **`index.html`** – hlavní HTML stránka s obsahem a strukturou webu
- **`style.css`** – kompletní CSS styly využívající CSS custom properties (CSS proměnné)
- **`theme.js`** – JavaScript pro přepínání mezi světlým a tmavým motivem
- **`me.png`** – profilová fotografie (780×860 px)

### Náhledové obrázky

Ukázky vzhledu webu jsou uloženy v `docs/previews/`:

- `light-1440.png` – světlý motiv, desktop (1440px široký)
- `dark-1440.png` – tmavý motiv, desktop (1440px široký)
- `light-mobile.png` – světlý motiv, mobilní zařízení
- `dark-mobile.png` – tmavý motiv, mobilní zařízení

## Ukázky vzhledu

### Desktop verze

**Světlý motiv:**

![Světlý motiv – desktop](docs/previews/light-1440.png)

**Tmavý motiv:**

![Tmavý motiv – desktop](docs/previews/dark-1440.png)

### Mobilní verze

**Světlý motiv:**

![Světlý motiv – mobil](docs/previews/light-mobile.png)

**Tmavý motiv:**

![Tmavý motiv – mobil](docs/previews/dark-mobile.png)

## Architektura CSS

Styly jsou organizovány pomocí **CSS custom properties** (proměnných), které umožňují:

### 1. Barevné schéma

Všechny barvy jsou definovány jako proměnné v `:root`:

```css
:root {
  --c-bg: #ffffff;           /* barva pozadí */
  --c-text: #000000;         /* hlavní text */
  --c-text-soft: #444444;    /* změkčený text */
  --c-accent-1: #3f5a2a;     /* akcent 1 (lesní zelená) */
  --c-accent-2: #a8502f;     /* akcent 2 (terakota) */
  /* ... další barvy */
}
```

Pro tmavý motiv jsou přepsány pomocí:

```css
:root[data-theme="dark"] {
  --c-bg: #1d1a17;
  --c-text: #f1ebe4;
  /* ... další barvy pro tmavý režim */
}
```

### 2. Typografie

Velikosti písma a řádkování jsou škálovatelné pomocí jednotky `--u` (fluid unit):

```css
:root {
  --u: calc(100vw / 1024);   /* škáluje s viewportem */
  --fs-h1: calc(46 * var(--u));
  --lh-h1: calc(52 * var(--u));
  --font-sans: "Helvetica Neue", Helvetica, Arial, sans-serif;
}
```

### 3. Layout a spacing

Rozměry a mezery jsou také škálovatelné:

```css
:root {
  --hero-h: calc(488 * var(--u));
  --space-1: calc(10 * var(--u));
  --space-4: calc(58 * var(--u));
  /* ... další rozměry */
}
```

### 4. Responsive design

Pro mobilní zařízení (max-width: 700px) jsou hodnoty přepsány na pevné jednotky:

```css
@media (max-width: 700px) {
  :root {
    --u: 1px;
    --fs-h1: 40px;
    /* ... další přepsání */
  }
}
```

## Přepínání světlého/tmavého motivu

### Jak funguje `theme.js`

1. **Načtení při startu** – ještě před prvním vykreslením stránky (v `<head>`) se:
   - Načte uložená preference z `localStorage`
   - Pokud není uložená, detekuje se preference OS pomocí `prefers-color-scheme`
   - Nastaví se atribut `data-theme="light"` nebo `data-theme="dark"` na `<html>`

2. **Přepínání** – po kliknutí na tlačítko:
   - Změní se hodnota atributu `data-theme`
   - Preference se uloží do `localStorage`
   - Aktualizuje se `aria-pressed` a `aria-label` na tlačítku (přístupnost)

3. **Reaktivita na OS** – pokud uživatel nemá uloženou preferenci:
   - Při změně systémového nastavení se automaticky změní motiv

### Technické detaily

```javascript
// Inline skript v <head> – zabrání bliknutí při načtení
(function () {
  var t; try { t = localStorage.getItem('theme'); } catch (e) {}
  if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = t;
})();
```

- **Žádné blikání** – motiv je nastaven před vykreslením
- **Fallback** – pokud localStorage selže, použije se detekce OS
- **Přístupnost** – tlačítko má správné ARIA atributy
- **Persistence** – volba se ukládá mezi návštěvami

## Technické vlastnosti

- **Čistý HTML, CSS, JavaScript** – žádné závislosti na frameworcích
- **Fluid typography** – škáluje s velikostí viewportu
- **Responsive** – optimalizováno pro desktop i mobil
- **Přístupné** – ARIA labels, focus states, prefers-reduced-motion
- **Moderní CSS** – custom properties, grid, flexbox
- **Lehké** – minimální JavaScript, žádné externe knihovny

## Licence a použití

Tento kód je součástí osobní prezentace Ondřeje Hastíka.
