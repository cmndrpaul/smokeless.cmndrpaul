// Set preferences before CSS paints. Storage may be blocked in private contexts.
try {
  document.documentElement.dataset.theme = localStorage.getItem('smokeless-theme') === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.language = localStorage.getItem('smokeless-language') === 'tag' ? 'tag' : 'en';
} catch { /* The default light/English view still works. */ }
