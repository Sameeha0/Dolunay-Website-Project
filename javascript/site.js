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
