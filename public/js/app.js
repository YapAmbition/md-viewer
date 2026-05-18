document.addEventListener('DOMContentLoaded', async () => {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
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

  Tree.setDeleteCallback((filePath) => {
    openDeleteModal(filePath);
  });

  // Load file tree
  async function refreshTree() {
    try {
      const res = await fetch('api/tree');
      const treeData = await res.json();
      Tree.render(fileTreeEl, treeData);
    } catch (err) {
      fileTreeEl.innerHTML = '<p style="padding:16px;color:#e05a5a;font-size:13px;">Failed to load file list.</p>';
    }
  }

  await refreshTree();

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

  // Sidebar toggle: desktop toggle collapse, mobile toggle overlay
  sidebarToggle.addEventListener('click', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-collapsed');
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

  // ===== Upload Modal =====
  const uploadModal = document.getElementById('uploadModal');
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadModalClose = document.getElementById('uploadModalClose');
  const uploadCancelBtn = document.getElementById('uploadCancelBtn');
  const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
  const fileDropZone = document.getElementById('fileDropZone');
  const fileInput = document.getElementById('fileInput');
  const fileDropName = document.getElementById('fileDropName');
  const uploadDir = document.getElementById('uploadDir');
  const uploadPassword = document.getElementById('uploadPassword');
  const uploadMessage = document.getElementById('uploadMessage');

  let selectedFile = null;

  function openUploadModal() {
    uploadModal.classList.add('visible');
    resetUploadForm();
  }

  function closeUploadModal() {
    uploadModal.classList.remove('visible');
    resetUploadForm();
  }

  function resetUploadForm() {
    selectedFile = null;
    fileInput.value = '';
    fileDropName.textContent = '';
    fileDropZone.classList.remove('has-file');
    uploadDir.value = '';
    uploadPassword.value = '';
    uploadMessage.textContent = '';
    uploadMessage.className = 'form-message';
    uploadSubmitBtn.disabled = false;
  }

  uploadBtn.addEventListener('click', openUploadModal);
  uploadModalClose.addEventListener('click', closeUploadModal);
  uploadCancelBtn.addEventListener('click', closeUploadModal);
  uploadModal.addEventListener('click', (e) => {
    if (e.target === uploadModal) closeUploadModal();
  });

  fileDropZone.addEventListener('click', () => fileInput.click());

  fileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropZone.classList.add('dragover');
  });

  fileDropZone.addEventListener('dragleave', () => {
    fileDropZone.classList.remove('dragover');
  });

  fileDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFileSelect(fileInput.files[0]);
  });

  function handleFileSelect(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'md' && ext !== 'markdown') {
      showUploadMessage('Only .md or .markdown files are allowed', 'error');
      return;
    }
    selectedFile = file;
    fileDropName.textContent = file.name;
    fileDropZone.classList.add('has-file');
    uploadMessage.textContent = '';
    uploadMessage.className = 'form-message';
  }

  function showUploadMessage(msg, type) {
    uploadMessage.textContent = msg;
    uploadMessage.className = `form-message ${type}`;
  }

  uploadSubmitBtn.addEventListener('click', async () => {
    if (!selectedFile) {
      showUploadMessage('Please select a file', 'error');
      return;
    }
    if (!uploadPassword.value) {
      showUploadMessage('Please enter the password', 'error');
      return;
    }

    uploadSubmitBtn.disabled = true;
    showUploadMessage('Uploading...', 'info');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('password', uploadPassword.value);
    if (uploadDir.value.trim()) {
      formData.append('directory', uploadDir.value.trim());
    }

    try {
      const res = await fetch('api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        showUploadMessage(data.error || 'Upload failed', 'error');
        uploadSubmitBtn.disabled = false;
        return;
      }

      showUploadMessage('Upload successful!', 'success');
      await refreshTree();

      setTimeout(() => {
        closeUploadModal();
        if (data.path) {
          Tree.setActivePath(data.path);
          Viewer.loadFile(data.path);
        }
      }, 800);
    } catch (err) {
      showUploadMessage('Network error', 'error');
      uploadSubmitBtn.disabled = false;
    }
  });

  // ===== Delete Modal =====
  const deleteModal = document.getElementById('deleteModal');
  const deleteModalClose = document.getElementById('deleteModalClose');
  const deleteCancelBtn = document.getElementById('deleteCancelBtn');
  const deleteSubmitBtn = document.getElementById('deleteSubmitBtn');
  const deleteFilename = document.getElementById('deleteFilename');
  const deletePassword = document.getElementById('deletePassword');
  const deleteMessage = document.getElementById('deleteMessage');

  let deleteTargetPath = null;

  function openDeleteModal(filePath) {
    deleteTargetPath = filePath;
    deleteFilename.textContent = filePath;
    deletePassword.value = '';
    deleteMessage.textContent = '';
    deleteMessage.className = 'form-message';
    deleteSubmitBtn.disabled = false;
    deleteModal.classList.add('visible');
  }

  function closeDeleteModal() {
    deleteModal.classList.remove('visible');
    deleteTargetPath = null;
  }

  deleteModalClose.addEventListener('click', closeDeleteModal);
  deleteCancelBtn.addEventListener('click', closeDeleteModal);
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  deleteSubmitBtn.addEventListener('click', async () => {
    if (!deletePassword.value) {
      deleteMessage.textContent = 'Please enter the password';
      deleteMessage.className = 'form-message error';
      return;
    }

    deleteSubmitBtn.disabled = true;
    deleteMessage.textContent = 'Deleting...';
    deleteMessage.className = 'form-message info';

    try {
      const res = await fetch('api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: deleteTargetPath, password: deletePassword.value }),
      });
      const data = await res.json();

      if (!res.ok) {
        deleteMessage.textContent = data.error || 'Delete failed';
        deleteMessage.className = 'form-message error';
        deleteSubmitBtn.disabled = false;
        return;
      }

      deleteMessage.textContent = 'File deleted!';
      deleteMessage.className = 'form-message success';
      await refreshTree();
      window.location.hash = '';

      setTimeout(() => {
        closeDeleteModal();
        Viewer.showWelcome();
      }, 800);
    } catch (err) {
      deleteMessage.textContent = 'Network error';
      deleteMessage.className = 'form-message error';
      deleteSubmitBtn.disabled = false;
    }
  });

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
