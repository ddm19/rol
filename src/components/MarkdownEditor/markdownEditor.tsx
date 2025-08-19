import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBold, faItalic, faLink, faCode, faListUl, faListOl, faQuestion } from "@fortawesome/free-solid-svg-icons";
import "./markdownEditor.scss";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor = ({ value, onChange }: MarkdownEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (prefix: string, suffix = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end);
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const newText = before + prefix + selected + suffix + after;
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = end + prefix.length;
    });
  };

  const applyList = (ordered: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.slice(start, end);
    const lines = selected.split("\n");
    const formatted = lines
      .map((line, i) => (ordered ? `${i + 1}. ${line}` : `- ${line}`))
      .join("\n");
    const before = text.slice(0, start);
    const after = text.slice(end);
    const newText = before + formatted + after;
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start;
      textarea.selectionEnd = start + formatted.length;
    });
  };

  const insertLink = () => {
    const url = window.prompt("URL") || "";
    applyFormatting("[", `](${url})`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") {
        e.preventDefault();
        applyFormatting("**");
      }
      if (e.key === "i") {
        e.preventDefault();
        applyFormatting("*");
      }
      if (e.key === "k") {
        e.preventDefault();
        insertLink();
      }
    }
  };

  return (
    <div className="markdownEditor">
      <div className="markdownEditor__toolbar">
        <button type="button" onClick={() => applyFormatting("**")}> <FontAwesomeIcon icon={faBold} /> </button>
        <button type="button" onClick={() => applyFormatting("*")}> <FontAwesomeIcon icon={faItalic} /> </button>
        <button type="button" onClick={insertLink}> <FontAwesomeIcon icon={faLink} /> </button>
        <button type="button" onClick={() => applyFormatting("`")}> <FontAwesomeIcon icon={faCode} /> </button>
        <button type="button" onClick={() => applyList(false)}> <FontAwesomeIcon icon={faListUl} /> </button>
        <button type="button" onClick={() => applyList(true)}> <FontAwesomeIcon icon={faListOl} /> </button>
        <a href="https://commonmark.org/help" target="_blank" rel="noreferrer" className="markdownEditor__help"> <FontAwesomeIcon icon={faQuestion} /> </a>
      </div>
      <textarea ref={textareaRef} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={handleKeyDown} />
    </div>
  );
};

export default MarkdownEditor;

