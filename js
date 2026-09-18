const themeToggle = document.querySelector('.theme-toggle');
const storedTheme = localStorage.getItem('theme');

if (storedTheme === 'dark') {
  document.body.classList.add('dark-theme');
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});