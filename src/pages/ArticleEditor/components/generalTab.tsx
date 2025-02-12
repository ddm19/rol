import { faImage, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import "./generalTab.scss";
import { Link } from "react-router-dom";
import { useState } from "react";

interface GeneralTabProps {
  formData: any;
  setFormData: (formData: any) => void;
}
const GeneralTab = (props: GeneralTabProps) => {
  const { formData, setFormData } = props;
  const [isValidImage, setIsValidImage] = useState(false);

  function isImageUrlUsingImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      debugger;
    });
  }
  return (
    <div className="formTab generalTab">
      <div className="generalTab__formDivider">
        <div className="generalTab__formElement">
          <label htmlFor="title">Título*</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="Título del Artículo"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>
        <div className="generalTab__formElement">
          <label htmlFor="image">
            Imagen*
            <Tooltip
              title="Asegúrate que se muestra correctamente la imagen"
              className="formTab__tooltip"
            >
              <FontAwesomeIcon icon={faQuestion} />
            </Tooltip>
            {formData.image && (
              <Link to={formData.image} reloadDocument target="_blank">
                <Tooltip title={<img src={formData.image} />}>
                  <FontAwesomeIcon
                    icon={faImage}
                    className={
                      isValidImage
                        ? "generalTab__image--valid"
                        : "generalTab__image--invalid"
                    }
                  />
                </Tooltip>
              </Link>
            )}
          </label>

          <textarea
            id="image"
            required
            name="image"
            placeholder="URL de la imagen"
            onChange={(e) => {
              const newValue = e.target.value;
              try {
                new URL(newValue);
                setFormData({ ...formData, image: newValue });
                isImageUrlUsingImage(newValue).then((isValid) =>
                  setIsValidImage(isValid)
                );
              } catch (error) {
                setFormData({ ...formData, image: "" });
              }
            }}
          />
        </div>
        <div className="generalTab__formElement">
          <label htmlFor="timeToRead">Tiempo de lectura*</label>
          <input
            required
            id="timeToRead"
            name="timeToRead"
            placeholder="12 Minutos"
            onChange={(e) =>
              setFormData({ ...formData, timeToRead: e.target.value })
            }
          />
        </div>
        <div className="generalTab__formElement">
          <label htmlFor="author">Autor*</label>
          <input
            type="text"
            required
            placeholder="Nombre del autor"
            id="author"
            name="author"
            onChange={(e) =>
              setFormData({ ...formData, author: e.target.value })
            }
          />
        </div>
        <div className="generalTab__formElement">
          <label htmlFor="date">Fecha*</label>
          <input
            type="date"
            id="date"
            required
            name="date"
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
      </div>
      <div className="generalTab__formDivider">
        <div className="generalTab__formElement">
          <label htmlFor="shortDescription">Descripción Corta*</label>
          <input
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
        <div className="generalTab__formElement generalTab__formElement--long">
          <label htmlFor="description">Descripción Completa</label>
          <textarea
            id="description"
            placeholder="Descripción completa, mostrada dentro del Artículo"
            name="description"
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
