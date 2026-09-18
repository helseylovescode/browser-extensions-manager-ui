/* =========================================================
   Browser extensions manager — behaviour
   ========================================================= */

const html = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const filterButtons = document.querySelectorAll('.filter-btn');
const list = document.querySelector('.extensions-list');

let currentFilter = 'all';

/* ---------------------------------------------------------
   Theme
   --------------------------------------------------------- */
function applyTheme(theme) {
  html.dataset.theme = theme;
  localStorage.setItem('theme', theme);
  themeToggle.setAttribute(
    'aria-label',
    theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
  );
}

// If the inline head script already set a theme, respect it.
applyTheme(html.dataset.theme || localStorage.getItem('theme') || 'dark');

themeToggle.addEventListener('click', () => {
  applyTheme(html.dataset.theme === 'light' ? 'dark' : 'light');
});

/* ---------------------------------------------------------
   Filtering
   --------------------------------------------------------- */
function matchesFilter(card, filter) {
  const isActive = card.dataset.active === 'true';
  if (filter === 'active') return isActive;
  if (filter === 'inactive') return !isActive;
  return true;
}

function applyFilter() {
  const cards = list.querySelectorAll('.extension-card');
  let visible = 0;

  cards.forEach((card) => {
    const shown = matchesFilter(card, currentFilter);
    card.hidden = !shown;
    if (shown) visible += 1;
  });

  renderEmptyState(visible === 0);
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((other) => {
      const active = other === button;
      other.classList.toggle('is-active', active);
      other.setAttribute('aria-pressed', String(active));
    });

    applyFilter();
  });

  // Reflect initial state for assistive tech
  button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));
});

/* ---------------------------------------------------------
   Empty state
   --------------------------------------------------------- */
function renderEmptyState(show) {
  let message = document.querySelector('.empty-state');

  if (!show) {
    message?.remove();
    return;
  }

  if (!message) {
    message = document.createElement('p');
    message.className = 'empty-state';
    message.setAttribute('role', 'status');
    list.insertAdjacentElement('afterend', message);
  }

  message.textContent =
    currentFilter === 'active'
      ? 'No extensions are switched on right now.'
      : currentFilter === 'inactive'
        ? 'Every extension is switched on.'
        : 'No extensions left. Reload the page to start over.';
}

/* ---------------------------------------------------------
   Card actions (switches + remove), handled by delegation
   so they keep working for any card added later
   --------------------------------------------------------- */
list.addEventListener('click', (event) => {
  const toggle = event.target.closest('.toggle');
  if (toggle) return handleToggle(toggle);

  const removeButton = event.target.closest('.remove-btn');
  if (removeButton) return handleRemove(removeButton);
});

function handleToggle(toggle) {
  const card = toggle.closest('.extension-card');
  const nowActive = toggle.getAttribute('aria-checked') !== 'true';

  toggle.setAttribute('aria-checked', String(nowActive));
  card.dataset.active = String(nowActive);

  // A card can switch itself out of the current filter
  applyFilter();
}

function handleRemove(removeButton) {
  const card = removeButton.closest('.extension-card');
  const name = card.querySelector('h2')?.textContent ?? 'Extension';

  // Move focus somewhere sensible before the card disappears
  const nextCard = card.nextElementSibling ?? card.previousElementSibling;
  card.remove();

  (nextCard?.querySelector('.remove-btn') ?? filterButtons[0])?.focus();

  announce(`${name} removed.`);
  applyFilter();
}

/* ---------------------------------------------------------
   Screen-reader announcements
   --------------------------------------------------------- */
const liveRegion = document.createElement('div');
liveRegion.className = 'visually-hidden';
liveRegion.setAttribute('role', 'status');
liveRegion.setAttribute('aria-live', 'polite');
document.body.append(liveRegion);

function announce(text) {
  liveRegion.textContent = '';
  // Re-setting on the next frame makes repeat messages announce again
  requestAnimationFrame(() => {
    liveRegion.textContent = text;
  });
}

/* Set the correct initial visibility */
applyFilter();