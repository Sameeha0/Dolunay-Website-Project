// Cast page: filter the character cards (Everyone / Leads / Family / Friends)

const castFilters = document.querySelectorAll('.filter');
const castCards = document.querySelectorAll('#castGrid .person');

castFilters.forEach((button) => {
  button.addEventListener('click', () => {
    const group = button.dataset.filter;
    castFilters.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    castCards.forEach((card) => {
      card.hidden = group !== 'all' && card.dataset.group !== group;
    });
  });
});
