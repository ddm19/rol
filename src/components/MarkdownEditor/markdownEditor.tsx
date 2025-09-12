import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBold, faItalic, faLink, faListUl, faListOl, faQuestion, faQuoteRight, faHeading, faEyeLowVision, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import "./markdownEditor.scss";
import ReactMarkdown from "react-markdown";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor = ({ value, onChange }: MarkdownEditorProps) => {
  const [isEditing, setIsEditing] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (prefix: string, suffix = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end);
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const has = before.endsWith(prefix) && after.startsWith(suffix);
    const newText = has
      ? before.slice(0, before.length - prefix.length) + selected + after.slice(suffix.length)
      : before + prefix + selected + suffix + after;
    const offset = has ? -prefix.length : prefix.length;
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + offset;
      textarea.selectionEnd = end + offset;
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
    const is = ordered
      ? lines.every((line) => /^\d+\. /.test(line))
      : lines.every((line) => /^- /.test(line));
    const formatted = lines
      .map((line, i) => {
        if (ordered) return is ? line.replace(/^\d+\. /, "") : `${i + 1}. ${line}`;
        return is ? line.replace(/^- /, "") : `- ${line}`;
      })
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

  const toggleHeading = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.slice(start, end);
    const lines = selected.split("\n");
    const is = lines.every((line) => /^# /.test(line));
    const formatted = lines
      .map((line) => (is ? line.replace(/^# /, "") : `# ${line}`))
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

  const toggleQuote = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.slice(start, end);
    const lines = selected.split("\n");
    const is = lines.every((line) => /^> /.test(line));
    const formatted = lines
      .map((line) => (is ? line.replace(/^> /, "") : `> ${line}`))
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
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end);
    const linkMatch = selected.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const before = textarea.value.slice(0, start);
      const after = textarea.value.slice(end);
      const newText = before + linkMatch[1] + after;
      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start;
        textarea.selectionEnd = start + linkMatch[1].length;
      });
      return;
    }
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
        {isEditing &&
          <>
            <button type="button" title="Negrita" onClick={() => applyFormatting("**")}> <FontAwesomeIcon icon={faBold} /> </button>
            <button type="button" title="Cursiva" onClick={() => applyFormatting("*")}> <FontAwesomeIcon icon={faItalic} /> </button>
            <button type="button" title="Enlace" onClick={insertLink}> <FontAwesomeIcon icon={faLink} /> </button>
            <button type="button" title="Lista" onClick={() => applyList(false)}> <FontAwesomeIcon icon={faListUl} /> </button>
            <button type="button" title="Lista numerada" onClick={() => applyList(true)}> <FontAwesomeIcon icon={faListOl} /> </button>
            <button type="button" title="Encabezado" onClick={toggleHeading}> <FontAwesomeIcon icon={faHeading} /> </button>
            <button type="button" title="Cita" onClick={toggleQuote}> <FontAwesomeIcon icon={faQuoteRight} /> </button>
            <a href="https://commonmark.org/help" target="_blank" rel="noreferrer" className="markdownEditor__help" title="Ayuda"> <FontAwesomeIcon icon={faQuestion} /> </a>
          </>
        }
        <button type="button" title="Edit" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ?
            <><FontAwesomeIcon icon={faEyeLowVision} /> {" Ver"}</> :
            <><FontAwesomeIcon icon={faPenToSquare} /> {" Editar"}</>
          }
        </button>

      </div>
      {isEditing ?
        <textarea ref={textareaRef} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={handleKeyDown} />
        :
        //put _blank
        <ReactMarkdown components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
        }}>
          {value}
        </ReactMarkdown>
      }
    </div>
  );
};

export default MarkdownEditor;

