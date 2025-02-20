import CustomTabs, { TabItem } from "components/customTabs/customTabs";
import { useEffect, useState } from "react";
import GeneralTab from "./components/generalTab/generalTab";
import "./articleEditor.scss";
import RelatedTab from "./components/relatedTab/relatedTab";

const ArticleEditor = () => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    console.log(formData);
  }, [formData]);

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
      content: <p>This is a placeholder for the image tab content.</p>,
    },
  ];

  return (
    <>
      <h1>Crear un Nuevo Articulo</h1>
      <CustomTabs tabs={tabs} />
    </>
  );
};

export default ArticleEditor;
