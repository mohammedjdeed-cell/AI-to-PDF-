import React, { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Printer, Sparkles, FileDown, Type } from 'lucide-react';

const INITIAL_MARKDOWN = `# Executive Summary: Q3 Performance

Here is an analysis of your metrics.

### Key Highlights
* **Revenue:** $2.4M (up 18% QoQ)
* **Active Nodes:** 1,240 operational instances
`;

export default function App() {
  const [input, setInput] = useState(INITIAL_MARKDOWN);
  const [theme, setTheme] = useState('theme-modern');

  // Strip conversational noise
  const cleanGeminiArtifacts = () => {
    let text = input;
    text = text.replace(/^(Sure|Here|Certainly|I have|Here is|Below is)[^\n]*:\n+/im, '');
    text = text.replace(/\n+(Hope this helps|Let me know if you need|Feel free to ask)[^\n]*$/im, '');
    setInput(text.trim());
  };

  // Safely extract and process content (handles both HTML & Markdown)
  const getRenderedHTML = () => {
    let contentToProcess = input;

    // Check if input is a complete HTML document
    if (/<html[\s\S]*>/i.test(input) || /<body[\s\S]*>/i.test(input)) {
      // Extract only what's inside <body>...</body>
      const bodyMatch = input.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      if (bodyMatch && bodyMatch[1]) {
        contentToProcess = bodyMatch[1];
      }
      // Sanitize pure HTML (allow safe inline styles and tables)
      return DOMPurify.sanitize(contentToProcess, {
        ADD_TAGS: ['style'],
        ADD_ATTR: ['style', 'target', 'border', 'cellpadding', 'cellspacing']
      });
    }

    // Otherwise, parse as Markdown
    const rawHTML = marked.parse(contentToProcess, { breaks: true, gfm: true });
    return DOMPurify.sanitize(rawHTML);
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="app-container">
      {/* Sidebar Controls */}
      <div className="sidebar no-print">
        <div className="sidebar-header">
          <h1><FileDown size={20} color="#38bdf8" /> DocuCraft AI</h1>
          <button className="btn btn-secondary" onClick={cleanGeminiArtifacts} title="Clean AI filler phrases">
            <Sparkles size={14} color="#f59e0b" /> Clean Text
          </button>
        </div>

        <div className="controls-pane">
          <button 
            className={`btn ${theme === 'theme-modern' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTheme('theme-modern')}
          >
            <Type size={14} /> Modern
          </button>
          <button 
            className={`btn ${theme === 'theme-academic' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTheme('theme-academic')}
          >
            <Type size={14} /> Academic
          </button>
        </div>

        <div className="editor-wrapper">
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
            PASTE GEMINI HTML / MARKDOWN
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw markdown or HTML code here..."
          />
        </div>

        <div className="actions-pane">
          <button className="btn btn-primary" onClick={exportPDF}>
            <Printer size={16} /> Save / Print Crisp PDF
          </button>
        </div>
      </div>

      {/* Live A4 Viewport */}
      <div className="preview-viewport">
        <div className={`paper-sheet ${theme}`}>
          <div 
            className="document-content"
            dangerouslySetInnerHTML={{ __html: getRenderedHTML() }} 
          />
        </div>
      </div>
    </div>
  );
}
