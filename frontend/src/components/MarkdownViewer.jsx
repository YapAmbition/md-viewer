import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.min.css';
import { loadFile } from '../api';

marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: false,
  gfm: true,
});

export default function MarkdownViewer({ filePath }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filePath) {
      setContent(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    loadFile(filePath)
      .then((data) => {
        if (!cancelled) {
          const html = marked.parse(data.content);
          setContent(html);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError('File not found or cannot be read.');
          setContent(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [filePath]);

  if (!filePath) {
    return (
      <div className="welcome">
        <div className="welcome-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="13" y2="17"/>
          </svg>
        </div>
        <h2>Markdown Viewer</h2>
        <p>Select a document from the sidebar to start reading</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="welcome">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
      </div>
    );
  }

  return <article className="markdown-body" dangerouslySetInnerHTML={{ __html: content }} />;
}
