// Page transition engine
const overlay = document.getElementById('overlay');

// Fade in on load — always restore opacity when page becomes visible
function fadeIn() {
  document.body.style.opacity = '1';
  document.body.style.transition = 'opacity 0.3s ease';
  document.body.classList.add('ready');
}

window.addEventListener('DOMContentLoaded', fadeIn);

// Also handle back/forward navigation (bfcache)
window.addEventListener('pageshow', (e) => {
  document.body.style.opacity = '1';
  document.body.style.transition = 'opacity 0.3s ease';
});

// Intercept all [data-link] clicks
document.addEventListener('click', e => {
  const link = e.target.closest('[data-link]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href === '#' || href.startsWith('http') || href.startsWith('mailto')) return;

  e.preventDefault();

  // Fade out
  document.body.style.transition = 'opacity 0.3s ease';
  document.body.style.opacity = '0';

  setTimeout(() => {
    window.location.href = href;
  }, 320);
});

// Scroll reveal
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.07 });

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
});
