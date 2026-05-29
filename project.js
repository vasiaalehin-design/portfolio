function render(id) {
  const keys = Object.keys(projects);
  const idx = keys.indexOf(id);
  const p = projects[id];
  if (!p) return;

  document.title = p.title.toUpperCase() + ' — Vasily Alekhin';

  let blocks = '';
  p.blocks.forEach(b => {
    if (b.type === 'full') {
      blocks += `<div class="block-full reveal"><img src="/${b.imgs[0]}" loading="lazy"></div>`;
    } else if (b.type === 'carousel') {
      const dots = b.imgs.map((_,i) => `<button class="carousel-dot${i===0?' active':''}" data-index="${i}"></button>`).join('');
      const imgs = b.imgs.map(s => `<img src="/${s}" loading="lazy">`).join('');
      blocks += `<div class="block-carousel reveal"><div class="carousel-track">${imgs}</div><button class="carousel-btn prev">&#8249;</button><button class="carousel-btn next">&#8250;</button><div class="carousel-dots">${dots}</div></div>`;
    } else if (b.type === 'grid2x2') {
      blocks += `<div class="block-grid2x2 reveal">${b.imgs.map(s=>`<img src="/${s}" loading="lazy">`).join('')}</div>`;
    } else if (b.type === '2col') {
      blocks += `<div class="block-2col reveal">${b.imgs.map(s=>`<img src="/${s}" loading="lazy">`).join('')}</div>`;
    } else if (b.type === '3col') {
      blocks += `<div class="block-3col reveal">${b.imgs.map(s=>`<img src="/${s}" loading="lazy">`).join('')}</div>`;
    }
  });

  document.getElementById('c').innerHTML = `
    <div class="project-intro reveal">
      <a href="/" class="back-link" data-link>&#8592; BACK</a>
      <div class="project-intro-inner">
        <h1 class="project-title" style="flex:1">${p.title.toUpperCase()} (${p.year})</h1>
        <div class="project-tags" style="flex-direction:column;align-items:flex-end;gap:4px"><span>${p.cat}</span><span>${p.sub}</span><span>Client: ${p.client}</span></div>
      </div>
    </div>
    <div class="divider reveal"></div>
    <div class="project-meta reveal">
      <p class="meta-label">ABOUT THE PROJECT</p>
      <p class="meta-text">${p.desc || ''}</p>
    </div>
    <div class="divider reveal"></div>
    ${blocks}
    <div class="scroll-hint reveal">&#8595;</div>
  `;

  const prevId = keys[idx - 1];
  const nextId = keys[idx + 1];
  const prev = prevId ? projects[prevId] : null;
  const next = nextId ? projects[nextId] : null;
  let nav = '';
  nav += prev ? `<div class="project-nav-prev"><p class="nav-proj-label">PREV PROJECT</p><a href="/${prev.url}" class="nav-proj-title" data-link>&#8592; ${prev.title.toUpperCase()} (${prev.year})</a></div>` : '<div></div>';
  nav += next ? `<div class="project-nav-next"><p class="nav-proj-label">NEXT PROJECT</p><a href="/${next.url}" class="nav-proj-title" data-link>${next.title.toUpperCase()} (${next.year}) &#8594;</a></div>` : '<div></div>';
  document.getElementById('n').innerHTML = nav;

  // Запускаем _transitions.js вручную после рендера
  setTimeout(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 70);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  }, 0);
}

// Carousel
document.addEventListener('click', e => {
  const btn = e.target.closest('.carousel-btn');
  if (!btn) return;
  const carousel = btn.closest('.block-carousel');
  const track = carousel.querySelector('.carousel-track');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const total = track.children.length;
  let cur = [...dots].findIndex(d => d.classList.contains('active'));
  if (btn.classList.contains('next')) cur = (cur + 1) % total;
  else cur = (cur - 1 + total) % total;
  track.style.transform = `translateX(-${cur * 100}%)`;
  dots.forEach((d,i) => d.classList.toggle('active', i === cur));
});

document.addEventListener('mousedown', e => {
  const carousel = e.target.closest('.block-carousel');
  if (!carousel) return;
  const track = carousel.querySelector('.carousel-track');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const total = track.children.length;
  let startX = e.clientX;
  let cur = [...dots].findIndex(d => d.classList.contains('active'));
  const onMove = ev => { track.style.transition='none'; track.style.transform=`translateX(calc(-${cur*100}% + ${ev.clientX-startX}px))`; };
  const onUp = ev => {
    track.style.transition='transform 0.4s ease';
    const diff = ev.clientX - startX;
    if (diff < -50) cur = Math.min(cur+1, total-1);
    else if (diff > 50) cur = Math.max(cur-1, 0);
    track.style.transform=`translateX(-${cur*100}%)`;
    dots.forEach((d,i) => d.classList.toggle('active', i===cur));
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
});

document.addEventListener('touchstart', e => {
  const carousel = e.target.closest('.block-carousel');
  if (!carousel) return;
  const track = carousel.querySelector('.carousel-track');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const total = track.children.length;
  let startX = e.touches[0].clientX;
  let cur = [...dots].findIndex(d => d.classList.contains('active'));
  const onMove = ev => { track.style.transition='none'; track.style.transform=`translateX(calc(-${cur*100}% + ${ev.touches[0].clientX-startX}px))`; };
  const onEnd = ev => {
    track.style.transition='transform 0.4s ease';
    const diff = ev.changedTouches[0].clientX - startX;
    if (diff < -50) cur = Math.min(cur+1, total-1);
    else if (diff > 50) cur = Math.max(cur-1, 0);
    track.style.transform=`translateX(-${cur*100}%)`;
    dots.forEach((d,i) => d.classList.toggle('active', i===cur));
    carousel.removeEventListener('touchmove', onMove);
    carousel.removeEventListener('touchend', onEnd);
  };
  carousel.addEventListener('touchmove', onMove, {passive:true});
  carousel.addEventListener('touchend', onEnd);
}, {passive:true});
