import { useState, useCallback } from "react";
import { Tooltip } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion, faImage } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

interface ImageInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

const ImageInput = (props: ImageInputProps) => {
  const {
    label = "Imagen*",
    placeholder = "URL de la imagen (https://cdn.shopify.com/s/files/1/0040/8997/0777/files/Cute_Bunny_7d_1024x1024.jpg)",
    value,
    onChange,
  } = props;

  const [isValidImage, setIsValidImage] = useState<boolean>(true);
  const [localValue, setLocalValue] = useState<string>(value);

  function isImageUrlUsingImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    try {
      new URL(newValue);
      onChange(newValue);
      isImageUrlUsingImage(newValue).then((isValid) =>
        setIsValidImage(isValid),
      );
    } catch {
      onChange("");
    }
  };

  return (
    <>
      <label htmlFor="image">
        {label}
        <Tooltip
          title="Asegúrate que se muestra correctamente la imagen"
          className="formTab__tooltip"
        >
          <FontAwesomeIcon icon={faQuestion} />
        </Tooltip>
        {value && (
          <Link to={value} reloadDocument target="_blank">
            <Tooltip
              title={<img src={value} className="formTab__imageTooltip" />}
            >
              <FontAwesomeIcon
                icon={faImage}
                className={
                  isValidImage
                    ? "formTab__image--valid"
                    : "formTab__image--invalid"
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
        placeholder={placeholder}
        value={localValue}
        onChange={handleInputChange}
      />
    </>
  );
};

export default ImageInput;
