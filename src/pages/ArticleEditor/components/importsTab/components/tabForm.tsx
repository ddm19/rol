import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ImageInput from "../../imageInput/imageInput";

const tabForm = (
  index: number,
  onFieldChange: (field: string, value: any) => void,
  values: {
    id?: string;
    title?: string;
    subtitle?: string;
    link?: string;
    image?: string;
    shortDescription?: string;
    width?: number;
  } = {},
  key: number,
  removeTab: (index: number) => void,
) => {
  return (
    <>
      <button
        className="relatedTab__removeButton"
        onClick={() => removeTab(index)}
      >
        Eliminar
        <FontAwesomeIcon icon={faTrash} />
      </button>
      <div className="relatedTab__formContainer">
        <div className="formTab__formElement">
          <label htmlFor={`id-${index}`}>Identificador*</label>
          <input
            type="text"
            id={`id-${index}`}
            name="id"
            required
            placeholder="ImagenQuelsor1 (Debe ser único!)"
            value={values.id || ""}
            onChange={(e) => {
              //replace spaces and '{' '}'
              const newValue = e.target.value
                .replace(/ /g, "_")
                .replace(/{/g, "")
                .replace(/}/g, "");
              onFieldChange("id", newValue);
            }}
          />
        </div>
        <div className="formTab__formElement">
          <label htmlFor={`title-${index}`}>Título</label>
          <input
            type="text"
            id={`title-${index}`}
            name="title"
            placeholder="Título del Artículo"
            value={values.title || ""}
            onChange={(e) => {
              onFieldChange("title", e.target.value);
            }}
          />
        </div>
        <div className="formTab__formElement">
          <label htmlFor={`subtitle-${index}`}>Subtítulo</label>
          <input
            type="text"
            id={`subtitle-${index}`}
            name="subtitle"
            placeholder="Subtítulo del Artículo"
            value={values.subtitle || ""}
            onChange={(e) => {
              onFieldChange("subtitle", e.target.value);
            }}
          />
        </div>

        <div className="formTab__formElement">
          <label htmlFor={`link-${index}`}>Enlace</label>
          <input
            type="text"
            id={`link-${index}`}
            name="link"
            placeholder="Enlace del Artículo"
            value={values.link || ""}
            onChange={(e) => {
              onFieldChange("link", e.target.value);
            }}
          />
        </div>
        <div className="formTab__formElement">
          <ImageInput
            value={values.image || ""}
            onChange={(value: string) => onFieldChange("image", value)}
            key={key}
            required={false}
          />
        </div>
        <div className="formTab__formElement">
          <label htmlFor={`width-${index}`}>Tamaño</label>
          <input
            type="number"
            id={`width-${index}`}
            name="width"
            max={1000}
            value={values.width ?? ""}
            onChange={(e) => {
              onFieldChange("width", e.target.value === "" ? undefined : Math.min(Number(e.target.value), 1000));
            }}
          />
        </div>
        <div className="formTab__formElement">
          <label htmlFor={`shortDescription-${index}`}>Descripción Corta</label>
          <textarea
            id={`shortDescription-${index}`}
            name="shortDescription"
            placeholder="Un texto que acompañará al importado"
            value={values.shortDescription || ""}
            onChange={(e) => {
              onFieldChange("shortDescription", e.target.value);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default tabForm;
