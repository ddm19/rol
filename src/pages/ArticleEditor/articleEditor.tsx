import CustomTabs, { TabItem } from "components/customTabs/customTabs";

const ArticleEditor = () => {
  const tabs: TabItem[] = [
    {
      title: "General",
      content: <p>This is a placeholder for the general tab content.</p>,
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
