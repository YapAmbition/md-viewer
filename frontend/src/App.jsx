import { useState, useEffect, useCallback } from 'react';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import MarkdownViewer from './components/MarkdownViewer';
import UploadModal from './components/UploadModal';
import DeleteModal from './components/DeleteModal';
import { fetchTree, loadFile } from './api';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [treeData, setTreeData] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [sort, setSort] = useState({ sort: 'name', dir: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Load tree
  const refreshTree = useCallback(async () => {
    try {
      const data = await fetchTree();
      setTreeData(data);
    } catch (err) {
      console.error('Failed to load tree:', err);
    }
  }, []);

  useEffect(() => {
    refreshTree();
  }, [refreshTree]);

  // Handle file selection
  const handleFileSelect = useCallback((filePath) => {
    setCurrentFile(filePath);
    window.location.hash = filePath;
    if (window.innerWidth <= 768) setMobileOpen(false);
  }, []);

  // Handle delete request
  const handleDeleteRequest = useCallback((filePath) => {
    setDeleteTarget(filePath);
    setDeleteOpen(true);
  }, []);

  // Handle successful delete
  const handleDeleteSuccess = useCallback(() => {
    setCurrentFile(null);
    window.location.hash = '';
    refreshTree();
  }, [refreshTree]);

  // Handle successful upload
  const handleUploadSuccess = useCallback((filePath) => {
    refreshTree();
    if (filePath) {
      setCurrentFile(filePath);
      window.location.hash = filePath;
    }
  }, [refreshTree]);

  // Handle sidebar toggle
  const handleSidebarToggle = useCallback(() => {
    if (window.innerWidth > 768) {
      setSidebarCollapsed((prev) => !prev);
    } else {
      setMobileOpen((prev) => !prev);
    }
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((newSort, newDir) => {
    setSort({ sort: newSort, dir: newDir });
  }, []);

  // Handle deep linking
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setCurrentFile(hash);
    }
  }, []);

  // Manage body class for sidebar collapsed state
  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  return (
    <div className="app">
      <Topbar onToggle={handleSidebarToggle} onUpload={() => setUploadOpen(true)} />
      <div className="layout">
        <Sidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          treeData={treeData}
          sort={sort}
          searchQuery={searchQuery}
          currentFile={currentFile}
          onFileSelect={handleFileSelect}
          onDelete={handleDeleteRequest}
          onSortChange={handleSortChange}
          onSearchChange={setSearchQuery}
          onOverlayClick={() => setMobileOpen(false)}
        />
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
        <main className="content">
          <MarkdownViewer filePath={currentFile} />
        </main>
      </div>
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
      <DeleteModal
        open={deleteOpen}
        filePath={deleteTarget}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

export default App;
