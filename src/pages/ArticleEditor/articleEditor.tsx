import CustomTabs, { TabItem } from "components/customTabs/customTabs";
import { useEffect, useState } from "react";
import GeneralTab from "./components/generalTab";
import "./articleEditor.scss";

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
      title: "Contenido",
      content: <p>This is a placeholder for the content tab content.</p>,
    },
    {
      title: "Imagen",
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
