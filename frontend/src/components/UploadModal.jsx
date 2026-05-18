import { useState, useRef } from 'react';
import { Modal, Button, Input, Card, Typewriter } from 'animal-island-ui';
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

  return (
    <Modal
      open={open}
      title="Upload Markdown File"
      onClose={handleClose}
      onOk={handleSubmit}
      typewriter
      typeSpeed={20}
      width={480}
      footer={
        <>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} disabled={submitting || !selectedFile || !password}>
            Upload
          </Button>
        </>
      }
    >
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>File</div>
          <Card
            type="dashed"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]); }}
            style={{ cursor: 'pointer', textAlign: 'center', padding: '18px 16px' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p style={{ margin: '6px 0 0', fontSize: 13 }}>Click or drag .md file here</p>
            {selectedFile && <p style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 700 }}>{selectedFile.name}</p>}
            <input type="file" ref={fileInputRef} accept=".md,.markdown" hidden onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])} />
          </Card>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Directory (optional)</div>
          <Input placeholder="e.g. notes/2024" value={directory} onChange={(e) => setDirectory(e.target.value)} />
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Password</div>
          <Input type="password" placeholder="Enter upload password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {message && (
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: messageType === 'error' ? '#e05a5a' : messageType === 'success' ? '#19c8b9' : '#9f927d' }}>
            {message}
          </p>
        )}
      </div>
    </Modal>
  );
}
