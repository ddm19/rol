import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ImageInput from "../../imageInput/imageInput";

const tabForm = (
  index: number,
  onFieldChange: (field: string, value: any) => void,
  values: {
    title?: string;
    subtitle?: string;
    image?: string;
    link?: string;
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
          <label htmlFor={`title-${index}`}>Título*</label>
          <input
            type="text"
            id={`title-${index}`}
            name="title"
            required
            placeholder="Título del Artículo"
            value={values.title || ""}
            onChange={(e) => {
              onFieldChange("title", e.target.value);
            }}
          />
        </div>
        <div className="formTab__formElement">
          <label htmlFor={`subtitle-${index}`}>Subtítulo*</label>
          <input
            type="text"
            id={`subtitle-${index}`}
            name="subtitle"
            required
            placeholder="Subtítulo del Artículo"
            value={values.subtitle || ""}
            onChange={(e) => {
              onFieldChange("subtitle", e.target.value);
            }}
          />
        </div>

        <div className="formTab__formElement">
          <label htmlFor={`link-${index}`}>Enlace*</label>
          <input
            type="text"
            id={`link-${index}`}
            name="link"
            required
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
          />
        </div>
      </div>
    </>
  );
};

export default tabForm;
