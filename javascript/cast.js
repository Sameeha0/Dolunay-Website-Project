// Cast page: filter the character cards (Everyone / Leads / Family / Friends)

const castFilters = document.querySelectorAll('.filter');
const castCards = document.querySelectorAll('#castGrid .person');

// Each card gets its own name so the browser can morph it to its new place when the filter changes
castCards.forEach((card, i) => {
  card.style.viewTransitionName = `person-${i}`;
});

castFilters.forEach((button) => {
  button.addEventListener('click', () => {
    const group = button.dataset.filter;
    castFilters.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    window.animateLayout(() => {
      castCards.forEach((card) => {
        card.hidden = group !== 'all' && card.dataset.group !== group;
      });
    });
  });
});
