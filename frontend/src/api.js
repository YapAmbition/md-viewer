function getBase() {
  return window.__BASE_PATH__ || '';
}

export async function fetchTree() {
  const res = await fetch(`${getBase()}/api/tree`);
  if (!res.ok) throw new Error('Failed to fetch tree');
  return res.json();
}

export async function loadFile(path) {
  const res = await fetch(`${getBase()}/api/file?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error('Failed to load file');
  return res.json();
}

export async function uploadFile(file, password, directory) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);
  if (directory) formData.append('directory', directory);

  const res = await fetch(`${getBase()}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export async function deleteFile(path, password) {
  const res = await fetch(`${getBase()}/api/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Delete failed');
  return data;
}
