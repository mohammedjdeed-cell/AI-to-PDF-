import React, { useState, useRef, useEffect } from 'react';
import { Printer, Sparkles, FileText, Eye, Edit3, Smartphone } from 'lucide-react';

const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #1e293b; }
  .card { border: 2px solid #3b82f6; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #eff6ff; }
  .tag { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #1d4ed8; letter-spacing: 1px; }
  .title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
  th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
  th { background-color: #f1f5f9; }
</style>
</head>
<body>
  <div class="card">
    <div class="tag">Situationskarte</div>
    <div class="title">Thema: Einkaufen & Wohnen</div>
    <p>Sie möchten eine neue Wohnung einrichten. Sprechen Sie mit Ihrem Partner über Möbel und Preise.</p>
  </div>
  <table>
    <tr><th>Frage</th><th>Richtig</th><th>Falsch</th></tr>
    <tr><td>Das Sofa ist modern und billig.</td><td>[ ]</td><td>[ ]</td></tr>
  </table>
</body>
</html>`;

export default function App() {
  const [input, setInput] = useState(SAMPLE_HTML);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const iframeRef = useRef(null);

  // Strip conversational noise from Gemini
  const cleanGeminiArtifacts = () => {
    let text = input;
    // Strip markdown code fences if Gemini wrapped everything in ```html ... ```
    text = text.replace(/^```html\s*/i, '').replace(/```\s*$/, '');
    text = text.replace(/^(Sure|Here|Certainly|Below is)[^\n]*:\n+/im, '');
    text = text.replace(/\n+(Hope this helps|Let me know if you need)[^\n]*$/im, '');
    setInput(text.trim());
  };

  // Prepares the HTML document with strict print-color-adjust rules
  const buildPrintReadyDoc = (rawHtml) => {
    // Ensure background colors and borders are preserved in the PDF
    const printStyles = `
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        table, tr, td, th, .card, img {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      </style>
    `;

    if (rawHtml.includes('<head>')) {
      return rawHtml.replace('<head>', `<head>${printStyles}`);
    } else {
      return `<!DOCTYPE html><html><head>${printStyles}</head><body>${rawHtml}</body></html>`;
    }
  };

  // Sync content with the sandboxed iframe
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      doc.open();
      doc.write(buildPrintReadyDoc(input));
      doc.close();
    }
  }, [input, activeTab]);

  // Vector Print Engine (works seamlessly on Android & Desktop)
  const handlePrint = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
      } catch (e) {
        // Fallback for strict mobile browsers
        const printWindow = window.open('', '_blank');
        printWindow.document.write(buildPrintReadyDoc(input));
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <div className="layout">
      {/* Mobile Tab Switcher */}
      <div className="mobile-nav">
        <button 
          className={`nav-btn ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          <Edit3 size={16} /> Code Input
        </button>
        <button 
          className={`nav-btn ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <Eye size={16} /> View & Print
        </button>
      </div>

      {/* Editor Panel */}
      <section className={`pane editor-pane ${activeTab === 'editor' ? 'mobile-visible' : ''}`}>
        <header className="pane-header">
          <div className="title-group">
            <FileText size={20} color="#38bdf8" />
            <h2>Gemini Code Input</h2>
          </div>
          <button className="tool-btn" onClick={cleanGeminiArtifacts}>
            <Sparkles size={14} color="#f59e0b" /> Clean AI Text
          </button>
        </header>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste Gemini HTML or Markdown code here..."
          spellCheck={false}
        />

        <footer className="pane-footer">
          <button className="export-btn" onClick={handlePrint}>
            <Printer size={18} /> Export Vector PDF
          </button>
        </footer>
      </section>

      {/* Sandboxed Live Preview Panel */}
      <section className={`pane preview-pane ${activeTab === 'preview' ? 'mobile-visible' : ''}`}>
        <div className="sheet-stage">
          <iframe
            ref={iframeRef}
            title="Document Renderer"
            className="isolated-sheet"
            sandbox="allow-same-origin allow-modals"
          />
        </div>
      </section>
    </div>
  );
}
