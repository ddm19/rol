import { useEffect, useState } from "react";
import { Section } from "components/Article/types";
import { FormDataArticle } from "pages/ArticleEditor/articleEditorFunctions";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./sectionTab.scss";
import RichTextEditor from "components/RichTextEditor/richTextEditor";

interface SectionsTabProps {
  formData: FormDataArticle;
  setFormData: (formData: FormDataArticle) => void;
}

const createEmptySection = (): Section => ({
  id: Date.now().toString(36) + Math.random().toString(36).slice(2),
  title: "",
  content: "",
  isNumbered: false,
});

const SectionForm = ({
  section,
  onChange,
  onRemove,
}: {
  section: Section;
  onChange: (section: Section) => void;
  onRemove?: () => void;
}) => {
  const updateField = (field: keyof Section, value: any) => {
    onChange({ ...section, [field]: value });
  };

  const updateSub = (index: number, sub: Section) => {
    const subs = section.subSections ? [...section.subSections] : [];
    subs[index] = sub;
    onChange({ ...section, subSections: subs });
  };

  const addSub = () => {
    const subs = section.subSections ? [...section.subSections] : [];
    subs.push(createEmptySection());
    onChange({ ...section, subSections: subs });
  };

  const removeSub = (index: number) => {
    const subs = section.subSections ? [...section.subSections] : [];
    subs.splice(index, 1);
    onChange({ ...section, subSections: subs });
  };

  return (
    <div className="sectionForm">
      <label className="sectionForm__title" htmlFor={section.id}>
        <span className="sectionForm__title--text">{section.title || "Nueva Sección"}</span>
      </label>
      {onRemove ? (
        <button className="sectionsTab__removeButton" onClick={onRemove}><FontAwesomeIcon icon={faTrash} />
        </button>

      ) : null}
      <div className="formTab__formElement">
        <label className="formTab__formElement" htmlFor="title">Título</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </div>
      <div className="formTab__formElement">
        <label htmlFor="subtitle">Subtítulo</label>
        <input
          type="text"
          value={section.subtitle || ""}
          onChange={(e) => updateField("subtitle", e.target.value)}
        />
      </div>
      <div className="formTab__formElement sectionsTab__editable--long" >
        <label htmlFor="content">Contenido</label>
        <RichTextEditor
          value={section.content}
          onChange={(val) => updateField("content", val)}
        />
      </div>
      <div className="formTab__formElement formTab__formElement--inline">
        <input
          type="checkbox"
          checked={section.isNumbered}
          onChange={(e) => updateField("isNumbered", e.target.checked)}
          className="formTab__tick"
        />
        <label htmlFor="isNumbered">¿Enumerar?</label>
      </div>
      {section.subSections &&
        section.subSections.map((sub, i) => (
          <>
            <label className="formTab__formElement" key={sub.id}>
              <span>Sub-sección {i + 1} | {section.title}</span>
            </label>
            <SectionForm
              key={sub.id}
              section={sub}
              onChange={(s) => updateSub(i, s)}
              onRemove={() => removeSub(i)}
            />
          </>
        ))}
      <button className="sectionsTab__addButton" onClick={addSub}><FontAwesomeIcon icon={faPlus} />Agregar Sub-sección</button>
    </div>
  );
};

const SectionTab = (props: SectionsTabProps) => {
  const { formData, setFormData } = props;
  const [sections, setSections] = useState<Section[]>(formData.sections || []);

  useEffect(() => {
    setFormData({ ...formData, sections });
  }, [sections]);

  const updateSection = (index: number, section: Section) => {
    const newSections = [...sections];
    newSections[index] = section;
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, createEmptySection()]);
  };

  const removeSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  return (
    <div className="formTab">
      {sections.map((section, index) => (
        <SectionForm
          key={section.id + index}
          section={section}
          onChange={(s) => updateSection(index, s)}
          onRemove={() => removeSection(index)}
        />
      ))}
      <button className="sectionsTab__addButton" onClick={addSection}>
        <FontAwesomeIcon icon={faPlus} /> Agregar Sección
      </button>
    </div>
  );
};

export default SectionTab;