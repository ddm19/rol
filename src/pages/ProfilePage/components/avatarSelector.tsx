import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@mui/material";
import { AVATARS } from "services/avatars";

interface AvatarSelectorProps {
    avatarKey: string | undefined;
    onPick: (key: string) => void;
    onClose: () => void;
    onSave: () => void;
}

const AvatarSelector = (props: AvatarSelectorProps) => {
    const { avatarKey, onPick, onClose, onSave } = props;

    const closeAvatarEditor = () => onClose();
    const handlePickAvatar = (key: string) => onPick(key);
    const handleSaveAvatar = () => onSave();

    return (
        <div className="profilePage__avatarModal">
            <div className="profilePage__avatarPanel">
                <h2 className="profilePage__sectionTitle">Elige tu avatar</h2>
                <Button className="profilePage__closeBtn">
                    <FontAwesomeIcon icon={faXmark} onClick={closeAvatarEditor} />
                </Button>
                <div className="profilePage__avatarGrid">
                    {AVATARS.map((a) => {
                        const selected = a.key === avatarKey;
                        return (

                            <img
                                src={a.url}
                                alt={a.key}
                                key={a.key}
                                className="profilePage__avatarThumb"

                                onClick={() => handlePickAvatar(a.key)}
                            />
                        );
                    })}
                </div>
                <div className="profilePage__actions">
                    <button
                        className="profilePage__btn profilePage__btn--ghost"
                        onClick={closeAvatarEditor}
                    >
                        Cancelar
                    </button>
                    <button
                        className="profilePage__btn profilePage__btn--primary"
                        onClick={handleSaveAvatar}
                    >
                        Guardar avatar
                    </button>
                </div>
            </div>
        </div>
    )
}
export default AvatarSelector;
