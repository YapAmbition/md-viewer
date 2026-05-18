document.addEventListener('DOMContentLoaded', async () => {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const fileTreeEl = document.getElementById('fileTree');
  const contentEl = document.getElementById('content');
  const sortNameBtn = document.getElementById('sortName');
  const sortTimeBtn = document.getElementById('sortTime');

  Viewer.init(contentEl);

  Tree.setCallback((filePath) => {
    Viewer.loadFile(filePath);
    closeSidebar();
  });

  // Load file tree
  try {
    const res = await fetch('/api/tree');
    const treeData = await res.json();
    Tree.render(fileTreeEl, treeData);
  } catch (err) {
    fileTreeEl.innerHTML = '<p style="padding:16px;color:#cf222e;font-size:13px;">Failed to load file list.</p>';
  }

  // Sort controls
  function updateSortUI(sort, dir) {
    sortNameBtn.classList.toggle('active', sort === 'name');
    sortTimeBtn.classList.toggle('active', sort === 'time');
    const activeBtn = sort === 'name' ? sortNameBtn : sortTimeBtn;
    const inactiveBtn = sort === 'name' ? sortTimeBtn : sortNameBtn;
    const arrow = dir === 'asc' ? '\u2191' : '\u2193';
    activeBtn.querySelector('.sort-arrow').textContent = arrow;
    inactiveBtn.querySelector('.sort-arrow').textContent = '';
  }

  sortNameBtn.addEventListener('click', () => {
    const { sort, dir } = Tree.getSort();
    const newDir = sort === 'name' ? (dir === 'asc' ? 'desc' : 'asc') : 'asc';
    Tree.setSort('name', newDir);
    updateSortUI('name', newDir);
  });

  sortTimeBtn.addEventListener('click', () => {
    const { sort, dir } = Tree.getSort();
    const newDir = sort === 'time' ? (dir === 'asc' ? 'desc' : 'asc') : 'desc';
    Tree.setSort('time', newDir);
    updateSortUI('time', newDir);
  });

  // Handle URL hash for deep linking
  const hash = window.location.hash.slice(1);
  if (hash) {
    Tree.setActivePath(decodeURIComponent(hash));
    Viewer.loadFile(decodeURIComponent(hash));
  }

  // Sidebar toggle (mobile)
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('visible');
  });

  sidebarOverlay.addEventListener('click', closeSidebar);

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
  }

  // Hash change
  window.addEventListener('hashchange', () => {
    const path = decodeURIComponent(window.location.hash.slice(1));
    if (path) {
      Tree.setActivePath(path);
      Viewer.loadFile(path);
    }
  });
});
