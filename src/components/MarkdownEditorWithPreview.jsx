import React from 'react';
import MdEditor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';
import 'react-markdown-editor-lite/lib/index.css';
import './MarkdownEditorWithPreview.scss';

const mdParser = new MarkdownIt();

const MarkdownEditorWithPreview = ({ value, htmlValue, onChange, placeholder, height = 400 }) => {
  const safeValue = value || '';
  const safeHTML = htmlValue || '';

  const handleEditorChange = ({ text }) => {
    const renderedHTML = mdParser.render(text || '');
    if (onChange) {
      onChange(text, renderedHTML);
    }
  };

  return (
    <div className="md-editor-wrapper">
      <MdEditor
        value={safeValue}
        style={{ height: `${height}px` }}
        renderHTML={(text) => {
          const currentText = text || '';
          if (!currentText.trim() && safeHTML) {
            return safeHTML;
          }
          return mdParser.render(currentText);
        }}
        onChange={handleEditorChange}
        placeholder={placeholder}
        view={{ menu: true, md: true, html: true }}
        canView={{ menu: true, md: true, html: true, fullScreen: false, hideMenu: false }}
      />
    </div>
  );
};

export default MarkdownEditorWithPreview;
