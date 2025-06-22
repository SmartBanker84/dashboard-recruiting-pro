// theme.js
(function () {
  try {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = storedTheme || (prefersDark ? 'dark' : 'light');

    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  } catch (error) {
    console.error('Error applying theme:', error);
  }
})();
