import CustomTabs, { TabItem } from "components/customTabs/customTabs";
import { useState } from "react";
import GeneralTab from "./components/generalTab/generalTab";
import "./articleEditor.scss";
import RelatedTab from "./components/relatedTab/relatedTab";
import ImportsTab from "./components/importsTab/importsTab";
import {
  FormDataArticle,
  generateArticleJSON,
  validateFormData,
} from "./articleEditorFunctions";
import SectionEditor from "./components/sectionTab/sectionTab";
import Article from "components/Article/article";
import test from "./1.json";

const ArticleEditor = () => {
  const [formData, setFormData] = useState<FormDataArticle>({ sections: [] });

  const tabs: TabItem[] = [
    {
      title: "General",
      content: <GeneralTab formData={formData} setFormData={setFormData} />,
    },
    {
      title: "Relacionados",
      content: <RelatedTab formData={formData} setFormData={setFormData} />,
    },
    {
      title: "Importados",
      content: <ImportsTab formData={formData} setFormData={setFormData} />,
    },
    {
      title: "Secciones",
      content: (
        <SectionEditor
          formData={formData}
          setFormData={setFormData}
        />
      ),
    },
  ];

  return (
    <>
      <h1>Crear un Nuevo Articulo</h1>
      <CustomTabs tabs={tabs} />
      <div className="articleEditorContainer">
        <h3>Vista Previa del Artículo</h3>
        <Article articleContent={generateArticleJSON(formData)} />
        <button onClick={() => validateFormData(formData)}>Guardar</button>
      </div>
    </>
  );
};

export default ArticleEditor;
