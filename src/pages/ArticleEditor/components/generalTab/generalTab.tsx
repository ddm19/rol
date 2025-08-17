import "./generalTab.scss";
import ImageInput from "../imageInput/imageInput";
import { FormDataArticle } from "pages/ArticleEditor/articleEditorFunctions";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "@mui/material";
import { Category } from "components/Article/types";
import { addCategory, getCategories } from "pages/ArticleEditor/actions";

interface GeneralTabProps {
  formData: FormDataArticle;
  setFormData: (formData: any) => void;
}
const GeneralTab = (props: GeneralTabProps) => {
  const { formData, setFormData } = props;
  const [importedInput, setImportedInput] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data);
    });
  }, []);

  const addRelated = (relatedText: string) => {
    if (relatedText != null && relatedText != "")
      setFormData({
        ...formData,
        content: `${formData.content || ""}{${relatedText}}`,
      });
    else {
      //TODO: Alert - Toast
      document.getElementById("addRelated")?.classList.add("shake");
      const errorSpan = document.createElement("span");
      errorSpan.className = "formTab__addRelated__error";
      errorSpan.textContent = "Se requiere un ID";
      document
        .getElementById("addRelated")
        ?.parentElement?.appendChild(errorSpan);

      setTimeout(() => {
        document.getElementById("addRelated")?.classList.remove("shake");
      }, 350);
      setTimeout(() => {
        errorSpan.remove();
      }, 1000);
    }
  };

  const handleAddCategory = () => {
    const categoryName = prompt("Introduce el nombre de la nueva categoría:")?.trim() || "";

    addCategory(categoryName).then((data) => {
      setCategories([...categories, data]);
    });
  };

  return (
    <div className="formTab generalTab">
      <div className="generalTab__formDivider">
        <div className="formTab__formElement">
          <label htmlFor="title">Título*</label>
          <input
            type="text"
            value={formData.title || ""}
            id="title"
            name="title"
            required
            placeholder="Título del Artículo"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>
        <div className="formTab__formElement">
          <ImageInput
            value={formData.image || ""}
            onChange={(e) => setFormData({ ...formData, image: e })}
          />
        </div>
        <div className="formTab__formElement">
          <label htmlFor="timeToRead">Tiempo de lectura*</label>
          <input
            required
            type="text"
            value={formData.timeToRead || ""}
            id="timeToRead"
            name="timeToRead"
            placeholder="12 Minutos"
            onChange={(e) =>
              setFormData({ ...formData, timeToRead: e.target.value })
            }
          />
        </div>
        <div className="formTab__formElement">
          <label htmlFor="author">Autor*</label>
          <input
            type="text"
            value={formData.author || ""}
            required
            placeholder="Nombre del autor"
            id="author"
            name="author"
            onChange={(e) =>
              setFormData({ ...formData, author: e.target.value })
            }
          />
        </div>
        <div className="formTab__formElement">
          <label htmlFor="date">Fecha*</label>
          <input
            type="date"
            value={formData.date || ""}
            id="date"
            required
            name="date"
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="formTab__formElement">
          <label htmlFor="category">Categoría*</label>
          <select
            id="category"
            name="category"
            required
            value={formData.category?.id || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: categories.find((cat) => cat.id === e.target.value) || null,
              })
            }
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button className="formTab__formElement--short" onClick={() => handleAddCategory()}>
            <FontAwesomeIcon icon={faPlus} />
            Añadir Categoría
          </button>
        </div>
      </div>
      <div className="generalTab__formDivider">
        <div className="formTab__formElement">
          <label htmlFor="shortDescription">Descripción Corta*</label>
          <input
            value={formData.shortDescription || ""}
            id="shortDescription"
            name="shortDescription"
            placeholder="Descripción corta, se mostrará en la Página Principal"
            required
            type="text"
            onChange={(e) =>
              setFormData({ ...formData, shortDescription: e.target.value })
            }
          />
        </div>
        <div className="formTab__formElement formTab__formElement--long">
          <label htmlFor="description">Descripción Completa</label>
          <textarea
            id="description"
            value={formData.content || ""}
            placeholder="Descripción completa, mostrada dentro del Artículo"
            name="description"
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
          />
        </div>
        <div className="formTab__addRelated" id="addRelated">
          <label htmlFor="description">Añadir Importado</label>
          <Tooltip
            title="Si el import no se muestra puede que sea porque el ID no coincide, o porque no lo has añadido todavía"
            className="formTab__tooltip"
          >
            <FontAwesomeIcon icon={faQuestion} />
          </Tooltip>
          <input
            type="text"
            value={importedInput}
            placeholder="ID"
            onChange={(e) => setImportedInput(e.target.value)}
          />

          <button onClick={() => addRelated(importedInput)}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default GeneralTab;
