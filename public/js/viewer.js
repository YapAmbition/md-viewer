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
    const deleteBtn = `<button class="content-delete-btn" id="contentDeleteBtn" title="Delete this file">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
      <span>Delete</span>
    </button>`;
    contentEl.innerHTML = `<div class="content-toolbar">${deleteBtn}</div><article class="markdown-body">${html}</article>`;

    const btn = document.getElementById('contentDeleteBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (typeof window._onDeleteFile === 'function') {
          window._onDeleteFile(currentFilePath);
        }
      });
    }
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
