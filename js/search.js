document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const articles = document.querySelectorAll('.writeup');

  searchInput.addEventListener('input', function() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    articles.forEach(article => {
      const title = article.querySelector('h3').textContent.toLowerCase();
      const articleElement = article;

      if (title.includes(searchTerm)) {
        articleElement.style.display = 'block';
      } else {
        articleElement.style.display = 'none'; 
      }
    });
  });
});
