document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const searchCount = document.getElementById('searchCount');
  const articles = document.querySelectorAll('.writeup');
  const dividers = document.querySelectorAll('.list-divider');

  function update() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    let visible = 0;

    articles.forEach(article => {
      const text = article.textContent.toLowerCase();
      const match = text.includes(searchTerm);
      article.hidden = !match;
      if (match) visible++;
    });

    // Hide category dividers with no visible entries
    dividers.forEach(divider => {
      let el = divider.nextElementSibling;
      let hasVisible = false;
      while (el && !el.classList.contains('list-divider')) {
        if (el.classList.contains('writeup') && !el.hidden) hasVisible = true;
        el = el.nextElementSibling;
      }
      divider.hidden = !hasVisible;
    });

    if (searchCount) searchCount.textContent = visible + '/' + articles.length;
  }

  searchInput.addEventListener('input', update);
  update();
});
