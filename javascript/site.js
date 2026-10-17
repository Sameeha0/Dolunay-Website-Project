// Shared code for every page: mobile menu and the video player dialog.

// ----- Mobile menu -----
const menuButton = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });
}

// ----- Video dialog (used by the trailer on the home page and by the video gallery) -----
// Uses the built-in <dialog> element, so Escape, focus and the backdrop work automatically.
const videoDialog = document.getElementById('videoDialog');

function openVideo(videoId, title, note) {
  if (!videoDialog) return;
  videoDialog.querySelector('h2').textContent = title;
  videoDialog.querySelector('.dialog-foot').innerHTML = note || '';
  // youtube-nocookie.com does not set tracking cookies until the video is played
  videoDialog.querySelector('iframe').src =
    `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  videoDialog.showModal();
}

if (videoDialog) {
  videoDialog.querySelector('.dialog-close').addEventListener('click', () => videoDialog.close());

  // Clicking the dark backdrop (outside the box) closes it
  videoDialog.addEventListener('click', (event) => {
    if (event.target === videoDialog) videoDialog.close();
  });

  // Stop the video when the dialog closes
  videoDialog.addEventListener('close', () => {
    videoDialog.querySelector('iframe').src = 'about:blank';
  });
}

// Any button with data-video opens it in the dialog
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-video]');
  if (!trigger) return;
  openVideo(trigger.dataset.video, trigger.dataset.title || 'Video', trigger.dataset.note);
});

// =====================================================================
// Motion. Everything below is skipped when the visitor prefers reduced motion.
// =====================================================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ----- Sliding pill behind the active nav link or filter button -----
// One pill per group glides to the selected item instead of each item lighting up on its own.
function addSlidingPill(group, activeSelector) {
  const pill = document.createElement('span');
  pill.className = 'slider-pill';
  pill.setAttribute('aria-hidden', 'true');
  group.prepend(pill);
  group.classList.add('has-pill');

  function moveTo(item, instant) {
    if (!item || getComputedStyle(group).flexDirection === 'column') {
      pill.style.opacity = '0';
      return;
    }
    if (instant) pill.style.transition = 'none';
    pill.style.opacity = '1';
    pill.style.width = item.offsetWidth + 'px';
    pill.style.height = item.offsetHeight + 'px';
    pill.style.transform = `translate(${item.offsetLeft}px, ${item.offsetTop}px)`;
    if (instant) {
      pill.offsetWidth; // apply the position before turning the animation back on
      pill.style.transition = '';
    }
  }

  const active = () => group.querySelector(activeSelector);
  moveTo(active(), true);
  window.addEventListener('resize', () => moveTo(active(), true));
  // follow clicks on filter buttons (aria-pressed changes)
  new MutationObserver(() => moveTo(active(), false))
    .observe(group, { attributes: true, subtree: true, attributeFilter: ['aria-pressed'] });
  // fonts change the button widths once they load
  if (document.fonts) document.fonts.ready.then(() => moveTo(active(), true));
}

if (!reduceMotion) {
  if (nav) addSlidingPill(nav, 'a[aria-current="page"]');
  document.querySelectorAll('.filters').forEach((group) => addSlidingPill(group, '.filter[aria-pressed="true"]'));
}

// ----- Moonlight spotlight border on cards (follows the pointer) -----
if (finePointer && !reduceMotion) {
  document.addEventListener('pointermove', (event) => {
    const card = event.target.closest && event.target.closest('.card');
    if (!card) return;
    const box = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - box.left}px`);
    card.style.setProperty('--my', `${event.clientY - box.top}px`);
  });
}

// ----- Smooth card re-arranging when a filter changes (View Transitions API) -----
// Page scripts call this around their show/hide code; browsers without the API just switch instantly.
window.animateLayout = function (update) {
  if (reduceMotion || !document.startViewTransition) {
    update();
    return;
  }
  document.startViewTransition(update);
};

// ----- Scroll reveal: content rises in once as it scrolls into view -----
// Only elements present after the page scripts ran are marked, so cards that are
// re-rendered later (search, filters) are never left invisible.
window.addEventListener('DOMContentLoaded', () => {
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll(
    '.page-hero, .story-text, .facts, .explore .card, .section-title, .person, .supporting, ' +
    '.progress-card, .episode, .album, .tracks, .video'
  );
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  targets.forEach((el) => {
    el.dataset.reveal = '';
    // cards in the same row arrive one after another
    const siblings = el.parentElement ? [...el.parentElement.children] : [];
    el.style.setProperty('--d', `${(siblings.indexOf(el) % 4) * 90}ms`);
    observer.observe(el);
  });
  document.documentElement.classList.add('reveal-ready');
});

// ----- Hero: letter-by-letter title, starfield and 3D poster -----
const hero = document.querySelector('.hero');

if (hero && !reduceMotion) {
  // Title letters rise in one by one (plays once on page load)
  const title = hero.querySelector('.hero-title');
  title.setAttribute('aria-label', title.textContent);
  title.innerHTML = [...title.textContent]
    .map((ch, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${ch}</span>`)
    .join('');

  // Starfield: a few hundred stars that twinkle and drift slightly with the pointer
  const canvas = hero.querySelector('.starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let width = 0;
  let height = 0;
  let pointerX = 0;
  let pointerY = 0;
  let running = true;

  function resizeStars() {
    const dpr = window.devicePixelRatio || 1;
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((width * height) / 5000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.2,
      depth: Math.random() * 0.8 + 0.2,      // nearer stars move more with the pointer
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.8 + 0.3
    }));
  }

  function drawStars(time) {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);
    for (const s of stars) {
      const twinkle = 0.45 + 0.55 * Math.sin(time / 1000 * s.speed + s.phase);
      const x = s.x + pointerX * 18 * s.depth;
      const y = s.y + pointerY * 12 * s.depth;
      ctx.globalAlpha = 0.25 + twinkle * 0.6 * s.depth;
      ctx.fillStyle = s.depth > 0.75 ? '#fff3cf' : '#dfe6ff';
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(drawStars);
  }

  resizeStars();
  requestAnimationFrame(drawStars);
  window.addEventListener('resize', resizeStars);

  // Stop drawing when the hero is scrolled out of view (saves battery)
  new IntersectionObserver(([entry]) => {
    const wasRunning = running;
    running = entry.isIntersecting;
    if (running && !wasRunning) requestAnimationFrame(drawStars);
  }).observe(hero);

  // Poster tilts towards the pointer; a spring-like ease (lerp) keeps it smooth
  const poster = hero.querySelector('.poster');
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  if (finePointer) {
    hero.addEventListener('pointermove', (event) => {
      const box = hero.getBoundingClientRect();
      pointerX = (event.clientX - box.left) / box.width - 0.5;
      pointerY = (event.clientY - box.top) / box.height - 0.5;
      const pbox = poster.getBoundingClientRect();
      targetY = ((event.clientX - pbox.left) / pbox.width - 0.5) * 14;
      targetX = -((event.clientY - pbox.top) / pbox.height - 0.5) * 10;
      poster.style.setProperty('--gx', `${((event.clientX - pbox.left) / pbox.width) * 100}%`);
      poster.style.setProperty('--gy', `${((event.clientY - pbox.top) / pbox.height) * 100}%`);
    });
    hero.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
      pointerX = 0;
      pointerY = 0;
    });

    // only animate while the pointer is moving the target; stop when it has settled
    let tiltRunning = false;
    function tilt() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      poster.style.setProperty('--rx', `${currentX.toFixed(2)}deg`);
      poster.style.setProperty('--ry', `${currentY.toFixed(2)}deg`);
      if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
        requestAnimationFrame(tilt);
      } else {
        tiltRunning = false;
      }
    }
    hero.addEventListener('pointermove', () => {
      if (!tiltRunning) {
        tiltRunning = true;
        requestAnimationFrame(tilt);
      }
    });
    hero.addEventListener('pointerleave', () => {
      if (!tiltRunning) {
        tiltRunning = true;
        requestAnimationFrame(tilt);
      }
    });
  }
}
