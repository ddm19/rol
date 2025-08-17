import CustomTabs, { TabItem } from "components/customTabs/customTabs";
import { useEffect, useState } from "react";
import GeneralTab from "./components/generalTab/generalTab";
import "./articleEditor.scss";
import RelatedTab from "./components/relatedTab/relatedTab";
import ImportsTab from "./components/importsTab/importsTab";
import {
  FormDataArticle,
  generateArticleJSON,
  validateFormData,
  mapArticleToFormData,
} from "./articleEditorFunctions";
import SectionEditor from "./components/sectionTab/sectionTab";
import Article from "components/Article/article";
import { useLocalStorageState } from "hooks/useLocalStorageState";
import { deleteArticle, updateArticle, uploadNewArticle } from "./actions";
import { fetchArticleById } from "components/Article/actions";
import { useNavigate } from "react-router-dom";
import { faExternalLink, faQuestion, faQuestionCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const DRAFT_KEY = "articleDraft";

const ArticleEditor = () => {

  const [formData, setFormData, resetDraft] = useLocalStorageState<FormDataArticle>(
    DRAFT_KEY,
    { sections: [] }
  );
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  useEffect(() => {
    if (!articleId) return;
    fetchArticleById(articleId).then((res: any) => {
      if (!res) return;
      const loaded = res || res;
      const mapped = mapArticleToFormData(loaded, res.id || articleId);
      setFormData(mapped);
    });
  }, [articleId]);

  const navigate = useNavigate();

  const handleSend = () => {
    if (validateFormData(formData)) {
      const articleJSON = generateArticleJSON(formData);
      const password = prompt("Introduce una contraseña para el artículo:")?.trim() || "";
      const request = articleId
        ? updateArticle(articleId, articleJSON, password)
        : uploadNewArticle(articleJSON, password);
      request
        .then(() => {
          alert("Artículo guardado con éxito.");
          resetDraft();
          navigate("/");
        })
        .catch((error) => {
          const msg = error?.response?.data?.error || error?.message || String(error);
          alert("Error al guardar el artículo: " + msg);
        });
    }
  };
  const handleDelete = () => {
    if (articleId) {
      const password = prompt("Introduce la contraseña para eliminar el artículo:")?.trim() || "";

      deleteArticle(articleId, password).then(() => {
        alert("Artículo eliminado con éxito.");
        navigate("/");
      }).catch((error) => {
        alert("Error al eliminar el artículo: " + error.response.data.error);
      });
    }
    else {
      alert("No se pudo obtener el ID del artículo.");
    }
  };

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
    ...(articleId ? [{
      title: "Eliminar Artículo",
      content: <button onClick={handleDelete}><FontAwesomeIcon icon={faTrash} /> Eliminar Artículo</button>,
    }] : [])
  ];

  return (
    <>
      <h1>Crear un Nuevo Articulo</h1>
      <CustomTabs tabs={tabs} />
      <div className="articleEditorContainer">
        <h3>Vista Previa del Artículo</h3>
        <Article articleContent={generateArticleJSON(formData)} />
        <button onClick={() => handleSend()}>Guardar</button>
        <button onClick={resetDraft}>Descartar Cambios</button>
      </div>
      <button className="articleEditorContainer__helpButton"><a target="_blank" href="/Cómo Crear un Artículo.pdf"><FontAwesomeIcon icon={faExternalLink} />Necesitas ayuda? <FontAwesomeIcon icon={faQuestionCircle} /></a></button>
    </>
  );
};

export default ArticleEditor;
