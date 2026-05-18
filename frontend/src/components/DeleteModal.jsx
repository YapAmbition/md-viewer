import { useState } from 'react';
import { Modal, Button, Input } from 'animal-island-ui';
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
    <Modal
      open={open}
      title="Delete File"
      onClose={handleClose}
      onOk={handleSubmit}
      typewriter
      typeSpeed={20}
      footer={
        <>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="primary" danger onClick={handleSubmit} disabled={submitting || !password}>
            Delete
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
          This file will be moved to the trash directory, not permanently deleted.
        </p>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          padding: '10px 14px',
          background: '#f7f3df',
          border: '2px solid #c4b89e',
          borderRadius: 12,
          wordBreak: 'break-all',
        }}>
          {filePath}
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block' }}>Password</label>
          <Input type="password" placeholder="Enter password to confirm" value={password} onChange={(e) => setPassword(e.target.value)} />
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
