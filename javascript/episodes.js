// Episodes page: list, search, sort and a "watched" tracker saved in localStorage.
// Episodes 1-2 link to the official channel's remastered uploads (the original 4K uploads are now private).

const episodes = [
  { id: 1, title: "Meeting and Bickering", time: "1:52:54", video: "jk3UDTix5f4" },
  { id: 2, title: "Unexpected Events and Growing Feelings", time: "1:58:22", video: "6mUZjBt9k5M" },
  { id: 3, title: "Working Together for Bulut", time: "1:53:36", video: "kGhgKhbriSQ" },
  { id: 4, title: "Melting the Ice", time: "1:55:45", video: "QziQIs8N3EA" },
  { id: 5, title: "Secrets and Corners", time: "2:18:58", video: "Y01Sby32iLA" },
  { id: 6, title: "Shadows and Plans", time: "2:13:56", video: "VrJ1ALACxGc" },
  { id: 7, title: "Uncomfortable Affection", time: "2:21:09", video: "YHBCkj1CTiQ" },
  { id: 8, title: "Accepting Feelings", time: "2:10:48", video: "ByV6qm5RqyM" },
  { id: 9, title: "Caught Between Two", time: "2:02:08", video: "HuOSfTYuq1A" },
  { id: 10, title: "Running Away and Seeking Solace", time: "1:59:08", video: "eavhe068zxI" },
  { id: 11, title: "Discovering Secrets", time: "2:15:57", video: "zUpcn5LNzmI" },
  { id: 12, title: "Forced Collaboration and Growing Tension", time: "2:15:57", video: "luFzT-nrQ74" },
  { id: 13, title: "Learning the Secret", time: "2:22:28", video: "ype-4E3ABJE" },
  { id: 14, title: "Breaking Up the Couple", time: "2:38:45", video: "iRblGuLl-pc" },
  { id: 15, title: "Unexpected Decision", time: "2:09:30", video: "NNuje0uDmXA" },
  { id: 16, title: "Facing Death", time: "2:05:49", video: "QqZO9gmDj9I" },
  { id: 17, title: "Prison and Game", time: "2:18:29", video: "FhJ5mwYhAUI" },
  { id: 18, title: "Playing the Game", time: "2:21:06", video: "V7by5YazxLc" },
  { id: 19, title: "Deniz's Surprise Entry", time: "2:42:58", video: "I2HBa44Xboc" },
  { id: 20, title: "Surprise Party and Unexpected Turns", time: "2:16:10", video: "YpN9oPXlKsk" },
  { id: 21, title: "Pelin's Arrival and Nazlı's Decision", time: "2:21:44", video: "sfGkeE2GNNg" },
  { id: 22, title: "Talking and Pride", time: "2:19:11", video: "DcPsP0FQ1UM" },
  { id: 23, title: "Opening Up and Happiness", time: "2:26:55", video: "D9lfLZHYP7M" },
  { id: 24, title: "Unexpected Proposal and Struggles", time: "2:05:12", video: "FxuCqVF4Foo" },
  { id: 25, title: "Therapy and Hakan's Plans", time: "1:51:57", video: "3Nwc0AV9XWo" },
  { id: 26, title: "Love and Farewell (Finale)", time: "1:31:38", video: "ppUZhdC7DXE" }
];

const STORAGE_KEY = 'dolunay-watched';
const container = document.getElementById('episodesContainer');
const searchInput = document.getElementById('episodeSearch');
const sortSelect = document.getElementById('sortOrder');
const unwatchedOnly = document.getElementById('unwatchedOnly');

// ----- Watched list (saved in this browser) -----
function loadWatched() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch (e) {
    return new Set();
  }
}

let watched = loadWatched();

function saveWatched() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...watched]));
  } catch (e) {
    // private mode or storage blocked: the tracker still works until the page is closed
  }
}

const youtubeUrl = (ep) => `https://www.youtube.com/watch?v=${ep.video}`;

// ----- Progress bar and "continue" button -----
function updateProgress() {
  const count = watched.size;
  document.getElementById('progressText').innerHTML =
    count === episodes.length
      ? 'You have watched <b>every episode</b>. Tamam! 🌕'
      : `You have watched <b>${count}</b> of ${episodes.length} episodes.`;
  document.getElementById('progressBar').style.transform = `scaleX(${count / episodes.length})`;

  const next = episodes.find((ep) => !watched.has(ep.id));
  const button = document.getElementById('continueBtn');
  const label = next ? (count ? `Continue with episode ${next.id}` : 'Start episode 1') : 'Watch the finale again';
  button.href = youtubeUrl(next || episodes[episodes.length - 1]);
  button.lastChild.textContent = ' ' + label;
}

// ----- Episode cards -----
function render() {
  const query = searchInput.value.trim().toLowerCase();
  let list = episodes.filter((ep) =>
    String(ep.id) === query || `episode ${ep.id} ${ep.title}`.toLowerCase().includes(query)
  );
  if (unwatchedOnly.checked) list = list.filter((ep) => !watched.has(ep.id));
  if (sortSelect.value === 'desc') list = [...list].reverse();

  if (!list.length) {
    container.innerHTML = '<p class="card empty">No episodes match your search.</p>';
    return;
  }

  container.innerHTML = list.map((ep) => {
    const seen = watched.has(ep.id);
    return `
      <article class="card episode${seen ? ' is-watched' : ''}">
        <a class="episode-thumb" href="${youtubeUrl(ep)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
          <img src="https://i.ytimg.com/vi/${ep.video}/hqdefault.jpg" alt="" loading="lazy">
          <span class="badge-num">EP ${ep.id}</span>
          <span class="badge-time">${ep.time}</span>
          <span class="badge-watched">✓ Watched</span>
        </a>
        <div class="episode-body">
          <h3><a href="${youtubeUrl(ep)}" target="_blank" rel="noopener">Episode ${ep.id}: ${ep.title}</a></h3>
          <span class="muted">Opens on YouTube · Turkish audio</span>
          <div class="watch-toggle">
            <button type="button" data-id="${ep.id}" aria-pressed="${seen}">${seen ? '✓ Watched' : 'Mark as watched'}</button>
          </div>
        </div>
      </article>`;
  }).join('');
}

// One listener for all "Mark as watched" buttons
container.addEventListener('click', (event) => {
  const button = event.target.closest('.watch-toggle button');
  if (!button) return;
  const id = Number(button.dataset.id);
  if (watched.has(id)) watched.delete(id);
  else watched.add(id);
  saveWatched();
  render();
  updateProgress();
});

searchInput.addEventListener('input', render);
sortSelect.addEventListener('change', render);
unwatchedOnly.addEventListener('change', render);

render();
updateProgress();
