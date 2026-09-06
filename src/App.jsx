import React, { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Printer, Sparkles, FileDown, Type, RefreshCw } from 'lucide-react';

const INITIAL_MARKDOWN = `# Executive Summary: Q3 Performance

Here is an analysis of your metrics.

### Key Highlights
* **Revenue:** $2.4M (up 18% QoQ)
* **Active Nodes:** 1,240 operational instances
* **Churn Rate:** Drop to an all-time low of 1.2%

## Strategic Overview
Our multi-region redundancy architecture has resolved previous latency bottlenecks across the EU zones. 

| Region | Uptime % | Latency |
| :--- | :--- | :--- |
| US-East | 99.99% | 24ms |
| EU-Central | 99.95% | 38ms |
| AP-South | 99.90% | 65ms |

> *"The improvements implemented in early August laid the foundation for sustainable scale."*

### Next Steps
1. Scale up AP-South cache clusters.
2. Complete zero-trust migration by mid Q4.`;

export default function App() {
  const [input, setInput] = useState(INITIAL_MARKDOWN);
  const [theme, setTheme] = useState('theme-modern');

  // Strip typical Gemini conversation noise
  const cleanGeminiArtifacts = () => {
    let text = input;
    // Strip leading conversational phrases
    text = text.replace(/^(Sure|Here|Certainly|I have|Here is|Below is)[^\n]*:\n+/im, '');
    // Strip trailing conversational sign-offs
    text = text.replace(/\n+(Hope this helps|Let me know if you need|Feel free to ask)[^\n]*$/im, '');
    setInput(text.trim());
  };

  // Convert raw markdown into safe, structured HTML
  const getRenderedHTML = () => {
    const rawHTML = marked.parse(input, { breaks: true, gfm: true });
    return DOMPurify.sanitize(rawHTML);
  };

  // Fire Native Print-to-PDF Engine
  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="app-container">
      {/* Control Workspace (Will not show in the generated PDF) */}
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
            PASTE GEMINI MARKDOWN / TEXT
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your unformatted AI content here..."
          />
        </div>

        <div className="actions-pane">
          <button className="btn btn-primary" onClick={exportPDF}>
            <Printer size={16} /> Save / Print Crisp PDF
          </button>
        </div>
      </div>

      {/* Live A4 Interactive Sheet (Matches exact print engine) */}
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
