// Soundtrack page: one audio element and a custom player with a track list.
// Paths are relative (no leading "/") so they work on GitHub Pages, where the site lives in a sub-folder.

const tracks = [
  { title: "Dolunay Jenerik", note: "Opening titles", file: "audios/dolunay-jenerik.mp3" },
  { title: "Nazlı", note: "Nazlı's theme", file: "audios/nazli.mp3" },
  { title: "İnat", note: "Stubbornness", file: "audios/inat.mp3" },
  { title: "Mutfak", note: "The kitchen", file: "audios/mutfak.mp3" },
  { title: "Hayatı Sev", note: "Love life", file: "audios/hayati-sev.mp3" },
  { title: "Pozitif", note: "Positive", file: "audios/pozitif.mp3" },
  { title: "Karanlık", note: "Darkness", file: "audios/karanlik.mp3" }
];

const audio = document.getElementById('audio');
const list = document.getElementById('trackList');
const player = document.getElementById('player');
const playBtn = document.getElementById('playBtn');
const seekBar = document.getElementById('seekBar');
let current = -1;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ----- Track list -----
list.innerHTML = tracks.map((t, i) => `
  <li class="track" data-index="${i}" tabindex="0" role="button" aria-label="Play ${t.title}">
    <span class="track-num">${i + 1}</span>
    <img src="images/poster.jpg" alt="" width="48" height="48">
    <div>
      <div class="track-title">${t.title}</div>
      <div class="track-artist">${t.note} · Cem Tuncer, Ercüment Orkut</div>
    </div>
    <span class="track-time" id="time-${i}">–:––</span>
  </li>`).join('');

// Read each file's real length (only the metadata is downloaded)
tracks.forEach((t, i) => {
  const probe = new Audio();
  probe.preload = 'metadata';
  probe.src = t.file;
  probe.addEventListener('loadedmetadata', () => {
    document.getElementById(`time-${i}`).textContent = formatTime(probe.duration);
  });
});

// ----- Playback -----
function showState() {
  const playing = !audio.paused;
  player.classList.toggle('is-paused', !playing);
  playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  // SVG elements have no .hidden property, so set the attribute directly
  playBtn.querySelector('.i-play').toggleAttribute('hidden', playing);
  playBtn.querySelector('.i-pause').toggleAttribute('hidden', !playing);

  list.querySelectorAll('.track').forEach((row, i) => {
    const isCurrent = i === current;
    row.classList.toggle('is-current', isCurrent);
    row.classList.toggle('is-paused', isCurrent && !playing);
    const num = row.querySelector('.track-num');
    num.innerHTML = isCurrent ? '<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>' : String(i + 1);
  });
}

function playTrack(index) {
  current = (index + tracks.length) % tracks.length;
  audio.src = tracks[current].file;
  document.getElementById('nowTitle').textContent = tracks[current].title;
  audio.play().catch(() => {});
}

function togglePlay() {
  if (current === -1) playTrack(0);
  else if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}

list.addEventListener('click', (event) => {
  const row = event.target.closest('.track');
  if (!row) return;
  const index = Number(row.dataset.index);
  if (index === current) togglePlay();
  else playTrack(index);
});

list.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('track')) {
    event.preventDefault();
    event.target.click();
  }
});

playBtn.addEventListener('click', togglePlay);
document.getElementById('playAll').addEventListener('click', () => playTrack(0));
document.getElementById('prevBtn').addEventListener('click', () => {
  // like most players: restart the song if it has been playing for a few seconds
  if (audio.currentTime > 3) audio.currentTime = 0;
  else playTrack(current - 1);
});
document.getElementById('nextBtn').addEventListener('click', () => playTrack(current + 1));

audio.addEventListener('play', showState);
audio.addEventListener('pause', showState);

// ----- Live visualiser: bars follow the real frequencies of the song -----
// The Web Audio graph can only be created after a click, so it starts on the first play.
const canvas = document.getElementById('visualiser');
const vctx = canvas.getContext('2d');
const reduceMotionPref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let analyser = null;
let freq = null;

function setupAnalyser() {
  if (analyser || reduceMotionPref) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  const audioCtx = new Ctx();
  const source = audioCtx.createMediaElementSource(audio);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.82;
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  freq = new Uint8Array(analyser.frequencyBinCount);
  audio.addEventListener('play', () => audioCtx.resume());
}

function drawVisualiser() {
  if (!analyser) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    vctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  analyser.getByteFrequencyData(freq);
  vctx.clearRect(0, 0, w, h);

  // mirror the bars from the centre outwards, like a moon reflected on water
  const bars = 40;
  const gap = 3;
  const barW = (w / 2 - gap * bars) / bars;
  const gradient = vctx.createLinearGradient(0, h, 0, 0);
  gradient.addColorStop(0, 'rgba(201, 162, 79, 0.15)');
  gradient.addColorStop(1, 'rgba(247, 226, 168, 0.95)');
  vctx.fillStyle = gradient;
  for (let i = 0; i < bars; i++) {
    const value = freq[Math.floor((i / bars) * freq.length * 0.75)] / 255;
    const barH = Math.max(2, value * h * 0.95);
    const offset = i * (barW + gap);
    vctx.fillRect(w / 2 + offset, h - barH, barW, barH);
    vctx.fillRect(w / 2 - offset - barW, h - barH, barW, barH);
  }
  if (!audio.paused) requestAnimationFrame(drawVisualiser);
}

audio.addEventListener('play', () => {
  setupAnalyser();
  requestAnimationFrame(drawVisualiser);
});
audio.addEventListener('ended', () => playTrack(current + 1)); // continue with the next song

// ----- Seek bar -----
audio.addEventListener('loadedmetadata', () => {
  document.getElementById('duration').textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  seekBar.value = pct;
  seekBar.style.setProperty('--fill', pct + '%');
  document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
});

seekBar.addEventListener('input', () => {
  if (audio.duration) audio.currentTime = (seekBar.value / 100) * audio.duration;
});

showState();
