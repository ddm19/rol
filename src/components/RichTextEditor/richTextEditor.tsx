import { useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor = ({ value, onChange }: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const format = (cmd: string) => {
    document.execCommand(cmd);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  return (
    <div>
      <div>
        <button type="button" onClick={() => format("bold")}>B</button>
        <button type="button" onClick={() => format("italic")}>I</button>
        <button type="button" onClick={() => format("underline")}>U</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{ border: "1px solid #ccc", minHeight: "100px", padding: "8px" }}
      />
    </div>
  );
};

export default RichTextEditor;
