// ══════════════════════════════════════════════════════════════════════════
// 1. TEMA RETRO LIGHT / DARK
// ══════════════════════════════════════════════════════════════════════════
const themeBtn = document.getElementById('theme-btn');
const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  try {
    localStorage.setItem('retro_theme', theme);
  } catch (e) {}
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem('retro_theme');
} catch (e) {}
setTheme(savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

themeBtn.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// ══════════════════════════════════════════════════════════════════════════
// 2. MENU MOBILE (DRAWER)
// ══════════════════════════════════════════════════════════════════════════
const menuBtn = document.getElementById('menu-btn');
const navLinks = document.getElementById('nav-links');

menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.textContent = open ? '✕' : '☰';
  menuBtn.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.textContent = '☰';
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 3. FILTER KATEGORI SKILL
// ══════════════════════════════════════════════════════════════════════════
const filterBtns = document.querySelectorAll('.filter-btn');
const skillCards = document.querySelectorAll('.skill-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    skillCards.forEach(card => {
      card.hidden = cat !== 'semua' && card.dataset.category !== cat;
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 4. TABS FAVORIT (BOOKS, SONGS, TOOLS)
// ══════════════════════════════════════════════════════════════════════════
const favTabs = document.querySelectorAll('.fav-tab-btn');
const favPanels = document.querySelectorAll('.fav-panel');

favTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    favTabs.forEach(t => t.classList.remove('active'));
    favPanels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const targetId = 'tab-' + tab.dataset.tab;
    const panel = document.getElementById(targetId);
    if (panel) panel.classList.add('active');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 5. SCROLL REVEAL, METER BARS & SCROLLSPY NAV
// ══════════════════════════════════════════════════════════════════════════
function animateMeters(container) {
  container.querySelectorAll('.retro-meter-fill[data-level]').forEach(fill => {
    fill.style.width = fill.dataset.level + '%';
  });
}

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        animateMeters(entry.target);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-reveal]').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // Scrollspy untuk active link navbar
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-35% 0px -55% 0px' });

  sections.forEach(s => spyObserver.observe(s));
} else {
  // Fallback untuk browser lawas
  document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('visible'));
  animateMeters(document);
}

// ══════════════════════════════════════════════════════════════════════════
// 6. TAHUN COPYRIGHT DINAMIS
// ══════════════════════════════════════════════════════════════════════════
document.getElementById('tahun').textContent = new Date().getFullYear();
