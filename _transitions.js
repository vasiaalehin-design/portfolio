// ── SCROLL REVEAL ──
const revealedEls = new WeakSet();

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.07 });

function initReveal(root) {
  (root || document).querySelectorAll('.reveal').forEach(el => {
    if (revealedEls.has(el)) {
      el.classList.add('visible');
      return;
    }
    revealedEls.add(el);
    revealObs.observe(el);
  });
}

// ── FADE IN ON LOAD ──
window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => document.body.classList.add('ready'));
  initReveal();
});

// ── OVERLAY NAVIGATION ──
const isIndex = () => !!document.getElementById('works-grid');

let projectLayer = null;
let savedScrollY = 0;

function createLayer() {
  const layer = document.createElement('div');
  layer.id = 'project-layer';
  layer.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 500;
    background: var(--bg, #faf9f7);
    overflow-y: auto;
    transform: translateY(100%);
    transition: transform 0.55s cubic-bezier(0.16,1,0.3,1);
    will-change: transform;
  `;
  document.body.appendChild(layer);
  return layer;
}

function openProject(href) {
  if (!isIndex()) return false;

  savedScrollY = window.scrollY;

  if (!projectLayer) projectLayer = createLayer();
  const layer = projectLayer;

  layer.innerHTML = '';
  layer.style.transition = 'none';
  layer.style.transform = 'translateY(100%)';
  layer.scrollTop = 0;

  fetch(href)
    .then(r => r.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      doc.querySelectorAll('link[rel="stylesheet"], style').forEach(el => {
        const id = el.href || 'inline-' + Math.random();
        if (!document.querySelector(`[data-layer-style="${id}"]`)) {
          const clone = el.cloneNode(true);
          clone.setAttribute('data-layer-style', id);
          document.head.appendChild(clone);
        }
      });

      layer.innerHTML = doc.body.innerHTML;
      history.pushState({ project: href }, '', href);

      layer.querySelectorAll('script').forEach(oldScript => {
        const s = document.createElement('script');
        if (oldScript.src) {
          s.src = oldScript.src;
        } else {
          let code = oldScript.textContent;
          code = code.replace(/window\.location\.href\s*=\s*['"]index\.html['"]/g, 'window.__closeProject && window.__closeProject()');
          s.textContent = code;
        }
        oldScript.parentNode.replaceChild(s, oldScript);
      });

      initReveal(layer);

      requestAnimationFrame(() => {
        layer.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)';
        layer.style.transform = 'translateY(0)';
      });

      setupLayerScroll(layer);
    })
    .catch(() => {
      window.location.href = href;
    });

  return true;
}

function closeProject() {
  if (!projectLayer) return;
  const layer = projectLayer;

  layer.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)';
  layer.style.transform = 'translateY(100%)';

  history.pushState({}, '', 'index.html');

  setTimeout(() => {
    window.scrollTo(0, savedScrollY);
    layer.innerHTML = '';
  }, 560);
}

window.__closeProject = closeProject;

function setupLayerScroll(layer) {
  let overscroll = 0;
  const THRESHOLD = 350;
  let closing = false;

  const hint = document.createElement('div');
  hint.style.cssText = `
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: linear-gradient(to top, var(--bg, #faf9f7) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    margin-top: -120px;
  `;
  layer.appendChild(hint);

  layer.addEventListener('scroll', () => {
    const atBottom = layer.scrollHeight - layer.scrollTop - layer.clientHeight < 2;
    if (!atBottom) { overscroll = 0; hint.style.opacity = '0'; }
  }, { passive: true });

  layer.addEventListener('wheel', e => {
    const atBottom = layer.scrollHeight - layer.scrollTop - layer.clientHeight < 2;
    if (!atBottom || closing) { if (!atBottom) overscroll = 0; return; }
    overscroll += e.deltaY;
    const progress = Math.max(0, Math.min(overscroll / THRESHOLD, 1));
    hint.style.opacity = progress;
    if (overscroll >= THRESHOLD) {
      closing = true;
      closeProject();
    }
  }, { passive: true });
}

// ── INTERCEPT CLICKS ──
document.addEventListener('click', e => {
  const link = e.target.closest('[data-link]');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || href === '#' || href.startsWith('http') || href.startsWith('mailto')) return;

  if (isIndex() && href.startsWith('project.html')) {
    e.preventDefault();
    openProject(href);
    return;
  }

  if (!isIndex() && (href === 'index.html' || href.startsWith('index'))) {
    e.preventDefault();
    if (window.__closeProject) {
      window.__closeProject();
    } else {
      window.location.href = href;
    }
    return;
  }

  e.preventDefault();
  document.body.style.transition = 'opacity 0.3s ease';
  document.body.style.opacity = '0';
  setTimeout(() => { window.location.href = href; }, 320);
});

// ── BROWSER BACK BUTTON ──
window.addEventListener('popstate', e => {
  if (!e.state || !e.state.project) {
    if (projectLayer && projectLayer.style.transform !== 'translateY(100%)') {
      closeProject();
    }
  }
});
