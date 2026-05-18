const Tree = (() => {
  let activeItem = null;
  let onFileSelect = null;
  let onDeleteFile = null;
  let currentData = null;
  let currentSort = 'name';
  let currentDir = 'asc';
  let containerEl = null;
  let currentFilter = '';

  const ICONS = {
    chevronRight: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
    chevronDown: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
    folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>`,
    delete: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`,
  };

  function setCallback(cb) {
    onFileSelect = cb;
  }

  function setDeleteCallback(cb) {
    onDeleteFile = cb;
  }

  function setSort(sort, dir) {
    currentSort = sort;
    currentDir = dir;
    if (currentData && containerEl) {
      const activePath = activeItem ? activeItem.dataset.path : null;
      render(containerEl, currentData);
      if (activePath) setActivePath(activePath);
    }
  }

  function getSort() {
    return { sort: currentSort, dir: currentDir };
  }

  function render(container, treeData) {
    containerEl = container;
    currentData = treeData;
    container.innerHTML = '';
    const sorted = sortTree(treeData);
    const filtered = currentFilter ? filterTree(sorted, currentFilter) : sorted;
    if (filtered.children.length === 0 && currentFilter) {
      container.innerHTML = '<div class="search-empty">No matching files</div>';
      return;
    }
    const ul = buildList(filtered.children);
    container.appendChild(ul);
  }

  function filterTree(node, query) {
    if (node.type === 'file') {
      const match = node.name.toLowerCase().includes(query.toLowerCase());
      return match ? node : null;
    }
    const children = node.children
      .map(child => filterTree(child, query))
      .filter(Boolean);
    if (children.length === 0) return null;
    return { ...node, children };
  }

  function setFilter(query) {
    currentFilter = query;
    if (currentData && containerEl) {
      const activePath = activeItem ? activeItem.dataset.path : null;
      render(containerEl, currentData);
      if (activePath) setActivePath(activePath);
    }
  }

  function sortTree(node) {
    if (node.type !== 'directory') return node;

    const children = node.children.map(child => sortTree(child));

    const dirs = children.filter(c => c.type === 'directory');
    const files = children.filter(c => c.type === 'file');

    dirs.sort((a, b) => a.name.localeCompare(b.name));

    if (currentSort === 'time') {
      files.sort((a, b) => (a.mtime || 0) - (b.mtime || 0));
    } else {
      files.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (currentDir === 'desc') {
      files.reverse();
    }

    return { ...node, children: [...dirs, ...files] };
  }

  function buildList(items) {
    const ul = document.createElement('ul');
    for (const item of items) {
      const li = document.createElement('li');
      if (item.type === 'directory') {
        li.appendChild(buildDirectory(item));
      } else {
        li.appendChild(buildFile(item));
      }
      ul.appendChild(li);
    }
    return ul;
  }

  function buildDirectory(item) {
    const frag = document.createDocumentFragment();

    const row = document.createElement('div');
    row.className = 'tree-item';
    row.innerHTML = `<span class="tree-item-chevron">${ICONS.chevronRight}</span><span class="tree-item-icon">${ICONS.folder}</span><span class="tree-item-name">${escapeHtml(item.name)}</span>`;

    const childrenDiv = document.createElement('div');
    childrenDiv.className = 'tree-dir-children';
    childrenDiv.appendChild(buildList(item.children));

    row.addEventListener('click', (e) => {
      e.stopPropagation();
      const collapsed = childrenDiv.classList.toggle('collapsed');
      row.querySelector('.tree-item-chevron').innerHTML = collapsed ? ICONS.chevronRight : ICONS.chevronDown;
    });

    frag.appendChild(row);
    frag.appendChild(childrenDiv);
    return frag;
  }

  function buildFile(item) {
    const row = document.createElement('div');
    row.className = 'tree-item';
    row.dataset.path = item.path;

    let timeStr = '';
    if (item.mtime) {
      timeStr = `<span class="tree-item-time">${formatTime(item.mtime)}</span>`;
    }

    row.innerHTML = `<span class="tree-item-chevron invisible"></span><span class="tree-item-icon">${ICONS.file}</span><span class="tree-item-name">${escapeHtml(item.name)}</span>${timeStr}<button class="tree-item-delete" title="Delete file" data-path="${escapeHtml(item.path)}">${ICONS.delete}</button>`;

    row.addEventListener('click', (e) => {
      e.stopPropagation();
      setActive(row);
      if (onFileSelect) onFileSelect(item.path);
    });

    // Delete button click handler
    const deleteBtn = row.querySelector('.tree-item-delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onDeleteFile) onDeleteFile(item.path);
    });

    return row;
  }

  function formatTime(mtime) {
    const date = new Date(mtime);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  }

  function setActive(el) {
    if (activeItem) activeItem.classList.remove('active');
    el.classList.add('active');
    activeItem = el;
  }

  function setActivePath(path) {
    const container = document.getElementById('fileTree');
    const items = container.querySelectorAll('.tree-item[data-path]');
    for (const item of items) {
      if (item.dataset.path === path) {
        setActive(item);
        break;
      }
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { render, setCallback, setDeleteCallback, setActivePath, setSort, getSort, setFilter };
})();
