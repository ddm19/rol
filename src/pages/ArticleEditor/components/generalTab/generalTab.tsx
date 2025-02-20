import { faImage, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import "./generalTab.scss";
import { Link } from "react-router-dom";
import { useState } from "react";
import ImageInput from "../imageInput/imageInput";

interface GeneralTabProps {
  formData: any;
  setFormData: (formData: any) => void;
}
const GeneralTab = (props: GeneralTabProps) => {
  const { formData, setFormData } = props;

  return (
    <div className="formTab generalTab">
      <div className="generalTab__formDivider">
        <div className="formTab__formElement">
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
        <div className="formTab__formElement">
          <ImageInput
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e })}
          />
        </div>
        <div className="formTab__formElement">
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
        <div className="formTab__formElement">
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
        <div className="formTab__formElement">
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
        <div className="formTab__formElement">
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
        <div className="formTab__formElement formTab__formElement--long">
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
