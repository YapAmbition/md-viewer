import { useState, useRef } from 'react';
import { uploadFile } from '../api';

export default function UploadModal({ open, onClose, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [directory, setDirectory] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const resetForm = () => {
    setSelectedFile(null);
    setDirectory('');
    setPassword('');
    setMessage('');
    setMessageType('');
    setSubmitting(false);
    setDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileSelect = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'md' && ext !== 'markdown') {
      setMessage('Only .md or .markdown files are allowed');
      setMessageType('error');
      return;
    }
    setSelectedFile(file);
    setMessage('');
    setMessageType('');
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setMessage('Please select a file');
      setMessageType('error');
      return;
    }
    if (!password) {
      setMessage('Please enter the password');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    setMessage('Uploading...', 'info');
    setMessageType('info');

    try {
      const result = await uploadFile(selectedFile, password, directory.trim());
      setMessage('Upload successful!', 'success');
      setMessageType('success');

      setTimeout(() => {
        onSuccess(result.path);
        handleClose();
      }, 800);
    } catch (err) {
      setMessage(err.message || 'Upload failed', 'error');
      setMessageType('error');
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay visible" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Upload Markdown File</h3>
          <button className="modal-close" onClick={handleClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">File</label>
            <div
              className={`file-drop-zone${selectedFile ? ' has-file' : ''}${dragOver ? ' dragover' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]); }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p className="file-drop-text">Click or drag .md file here</p>
              {selectedFile && <p className="file-drop-name">{selectedFile.name}</p>}
              <input type="file" ref={fileInputRef} accept=".md,.markdown" hidden onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Directory (optional)</label>
            <input type="text" className="form-input" placeholder="e.g. notes/2024" value={directory} onChange={(e) => setDirectory(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="Enter upload password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {message && <div className={`form-message ${messageType}`}>{message}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>Upload</button>
        </div>
      </div>
    </div>
  );
}
