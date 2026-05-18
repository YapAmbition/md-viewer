import { useState } from 'react';
import { deleteFile } from '../api';

export default function DeleteModal({ open, filePath, onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setPassword('');
    setMessage('');
    setMessageType('');
    setSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!password) {
      setMessage('Please enter the password');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    setMessage('Deleting...', 'info');
    setMessageType('info');

    try {
      await deleteFile(filePath, password);
      setMessage('File deleted!');
      setMessageType('success');

      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 800);
    } catch (err) {
      setMessage(err.message || 'Delete failed');
      setMessageType('error');
      setSubmitting(false);
    }
  };

  if (!open || !filePath) return null;

  return (
    <div className="modal-overlay visible" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Delete File</h3>
          <button className="modal-close" onClick={handleClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <p className="delete-hint">This file will be moved to the trash directory, not permanently deleted.</p>
          <p className="delete-filename">{filePath}</p>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="Enter password to confirm" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {message && <div className={`form-message ${messageType}`}>{message}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
          <button className="btn btn-danger" onClick={handleSubmit} disabled={submitting}>Delete</button>
        </div>
      </div>
    </div>
  );
}
