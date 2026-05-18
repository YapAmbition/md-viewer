const Viewer = (() => {
  let contentEl = null;
  let currentFilePath = null;

  function init(el) {
    contentEl = el;

    marked.setOptions({
      highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: false,
      gfm: true,
    });
  }

  async function loadFile(filePath) {
    try {
      const res = await fetch(`api/file?path=${encodeURIComponent(filePath)}`);
      if (!res.ok) {
        showError('File not found or cannot be read.');
        return;
      }
      const data = await res.json();
      currentFilePath = filePath;
      renderMarkdown(data.content, data.filename);
      window.location.hash = filePath;
    } catch (err) {
      showError('Failed to load file.');
    }
  }

  function renderMarkdown(mdContent, filename) {
    const html = marked.parse(mdContent);
    contentEl.innerHTML = `<article class="markdown-body">${html}</article>`;
  }

  function showError(msg) {
    contentEl.innerHTML = `<div class="error-message"><p>${msg}</p></div>`;
  }

  function showWelcome() {
    currentFilePath = null;
    contentEl.innerHTML = `<div class="welcome"><h2>Markdown Viewer</h2><p>Select a file from the sidebar to start reading.</p></div>`;
  }

  function getCurrentPath() {
    return currentFilePath;
  }

  return { init, loadFile, showWelcome, getCurrentPath };
})();
