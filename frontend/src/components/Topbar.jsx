import { Button, Icon } from 'animal-island-ui';

export default function Topbar({ onToggle, onUpload }) {
  return (
    <header className="topbar">
      <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="4" y1="12" x2="20" y2="12"/>
          <line x1="4" y1="18" x2="20" y2="18"/>
        </svg>
      </button>
      <div className="topbar-brand">
        <svg className="topbar-logo" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="9" y1="13" x2="15" y2="13"/>
          <line x1="9" y1="17" x2="13" y2="17"/>
        </svg>
        <h1 className="topbar-title">Markdown Viewer</h1>
      </div>
      <div className="topbar-actions">
        <Button type="primary" onClick={onUpload} icon={<Icon name="icon-camera" size={16} />}>
          Upload
        </Button>
      </div>
    </header>
  );
}
