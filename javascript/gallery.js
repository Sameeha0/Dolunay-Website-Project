// Video gallery: clips from the official Dolunay channel that allow embedding,
// so they play in the dialog on this page (see openVideo in site.js).

const videos = [
  { id: "bC7eo40C_2w", title: "The long-awaited confession of love", tr: "Beklenen Aşk İlanı Geldi", length: "11:03", tags: ["romance"] },
  { id: "LTlMjPm-hdA", title: "Nazlı & Ferit: romantic scenes", tr: "Nazlı & Ferit Romantik Sahneler 1", length: "15:12", tags: ["romance"] },
  { id: "JziKHHwGEXM", title: "\"I can't share the woman I love\"", tr: "Sevdiğim Kadını Kimseyle Paylaşamam Anlaşıldı Mı?", length: "9:00", tags: ["romance", "drama"] },
  { id: "WAhNw6lmi_Y", title: "She won him over with her cooking", tr: "Nefis Yemekleriyle Adamı Kendine Aşık Etti", length: "11:06", tags: ["romance", "comedy"] },
  { id: "Ty6ja1TjWBM", title: "\"Your hand is like a baker's paddle\"", tr: "Senin Elin De Fırıncı Küreği Gibiymiş", length: "10:31", tags: ["comedy"] },
  { id: "BBiGhxG3_Go", title: "From high society to a corner diner", tr: "Sosyeteden Halk Lokantasına Geçiş", length: "3:52", tags: ["comedy"] },
  { id: "7TQGwoWOffM", title: "The girls' karaoke night (Episode 5)", tr: "Kızların Karaoke Gecesi", length: "2:54", tags: ["comedy"] },
  { id: "eDSzwEa5W6k", title: "\"Your boyfriend turned out to be a good man\"", tr: "Nazlı Sen Çok İyi Birisin Ama Sevgilin De Adam Çıktı", length: "8:48", tags: ["comedy"] },
  { id: "yxhl94lE3Ow", title: "Bulut sees Nazlı as his mother", tr: "Bulut, Nazlı'yı Annesi Yerine Koydu", length: "6:45", tags: ["bulut", "drama"] },
  { id: "1dWZ3S_eFTk", title: "A little boy who lost his family", tr: "Ailesini Kaybeden Çocuğun Acı Feryadı", length: "5:27", tags: ["bulut", "drama"] },
  { id: "gAqMrSaMCs0", title: "Ferit and Nazlı win the custody case", tr: "Velayet Davasını Ferit ve Nazlı Kazandı", length: "9:38", tags: ["bulut", "drama"] },
  { id: "zH7l0NL1860", title: "Time to put the villains in their place", tr: "Kötü Adamlara Had Bildirme Vakti Geldi", length: "10:26", tags: ["drama"] }
];

const grid = document.getElementById('videoGrid');
const filterButtons = document.querySelectorAll('#videoFilters .filter');

function escapeAttr(text) {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

grid.innerHTML = videos.map((v) => `
  <article class="card video" data-tags="${v.tags.join(' ')}">
    <button class="video-btn" data-video="${v.id}" data-title="${escapeAttr(v.title)}"
      data-note="${escapeAttr(`<a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">Open on YouTube</a> · Original title: ${v.tr}`)}"
      aria-label="Play: ${escapeAttr(v.title)}">
      <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy">
      <span class="play-badge" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M6 4l10 6-10 6z" fill="currentColor"/></svg></span>
      <span class="badge-time">${v.length}</span>
    </button>
    <div class="video-body">
      <h3>${v.title}</h3>
      <p lang="tr">${v.tr}</p>
    </div>
  </article>`).join('');

// Each card gets its own name so the browser can morph it to its new place when the filter changes
grid.querySelectorAll('.video').forEach((card, i) => {
  card.style.viewTransitionName = `video-${i}`;
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const tag = button.dataset.filter;
    filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    window.animateLayout(() => {
      grid.querySelectorAll('.video').forEach((card) => {
        card.hidden = tag !== 'all' && !card.dataset.tags.split(' ').includes(tag);
      });
    });
  });
});
