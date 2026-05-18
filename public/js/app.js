document.addEventListener('DOMContentLoaded', async () => {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const fileTreeEl = document.getElementById('fileTree');
  const contentEl = document.getElementById('content');
  const sortNameBtn = document.getElementById('sortName');
  const sortTimeBtn = document.getElementById('sortTime');
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');

  Viewer.init(contentEl);

  Tree.setCallback((filePath) => {
    Viewer.loadFile(filePath);
    closeMobileSidebar();
  });

  // Load file tree
  try {
    const res = await fetch('api/tree');
    const treeData = await res.json();
    Tree.render(fileTreeEl, treeData);
  } catch (err) {
    fileTreeEl.innerHTML = '<p style="padding:16px;color:#e05a5a;font-size:13px;">Failed to load file list.</p>';
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

  // Search
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    Tree.setFilter(query);
    searchClear.classList.toggle('visible', query.length > 0);
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    Tree.setFilter('');
    searchClear.classList.remove('visible');
    searchInput.focus();
  });

  // Sidebar collapse (desktop)
  sidebarCollapseBtn.addEventListener('click', () => {
    sidebar.classList.add('collapsed');
    document.body.classList.add('sidebar-collapsed');
  });

  // Sidebar toggle (mobile) / expand collapsed sidebar (desktop)
  sidebarToggle.addEventListener('click', () => {
    if (window.innerWidth > 768 && sidebar.classList.contains('collapsed')) {
      sidebar.classList.remove('collapsed');
      document.body.classList.remove('sidebar-collapsed');
    } else {
      sidebar.classList.toggle('open');
      sidebarOverlay.classList.toggle('visible');
    }
  });

  sidebarOverlay.addEventListener('click', closeMobileSidebar);

  function closeMobileSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
  }

  // Handle URL hash for deep linking
  const hash = window.location.hash.slice(1);
  if (hash) {
    Tree.setActivePath(decodeURIComponent(hash));
    Viewer.loadFile(decodeURIComponent(hash));
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
