import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import "./closeButton.scss";

interface CloseButtonProps
{
    onCloseEvent: () => void;
}
const CloseButton = (props: CloseButtonProps) =>
{
    const { onCloseEvent } = props;

    return (
        <FontAwesomeIcon className="navPhoneCloseButton" icon={faXmark} onClick={onCloseEvent} />
    );
};
export default CloseButton;