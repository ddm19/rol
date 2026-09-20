// ProfilePage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./profilePage.scss";
import { supabase } from "services/supabaseClient";
import { AVATARS } from "services/avatars";
import { getMyProfile, saveMyProfile } from "services/profiles";
import Loading from "components/Loading/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faPencil, faXmark } from "@fortawesome/free-solid-svg-icons";
import AvatarSelector from "./components/avatarSelector";
import SheetsList from "components/SheetList/sheetsList";
import { Button, Tooltip } from "@mui/material";
import { display } from "html2canvas/dist/types/css/property-descriptors/display";
import { generateROHCode } from "services/roh";



type Profile = { id: string; username?: string; avatar_key?: string };

const ProfilePage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [username, setUsername] = useState("");
    const [avatarKey, setAvatarKey] = useState<string | undefined>();
    const [editingAvatar, setEditingAvatar] = useState(false);
    const [rohCode, setRohCode] = useState("");
    const [loadingRohCode, setLoadingRohCode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data }) => {
            if (!data.session) {
                navigate("/login", { replace: true });
                return;
            }
            const p = await getMyProfile();
            setProfile(p);
            setUsername(p.username ?? "");
            setAvatarKey(p.avatar_key ?? undefined);
            setLoading(false);
        });
    }, [navigate]);

    const handleSaveUsername = async () => {
        if (!username.trim()) return;
        const saved = await saveMyProfile({ username, avatar_key: avatarKey });
        setProfile(saved);
        alert("Cambios Guardados.");
        navigate("/");
        navigate(0);
    };

    const openAvatarEditor = () => setEditingAvatar(true);
    const closeAvatarEditor = () => setEditingAvatar(false);

    const handlePickAvatar = (key: string) => {
        setAvatarKey(key);
        closeAvatarEditor();
    };

    const handleSaveAvatar = async () => {
        const saved = await saveMyProfile({ avatar_key: avatarKey });
        setProfile(saved);
        setEditingAvatar(false);
    };

    if (loading) return <div className="profilePage__loading"><Loading /></div>;

    const currentAvatarUrl =
        AVATARS.find((a) => a.key === avatarKey)?.url || AVATARS[0]?.url;

    return (
        <div className="profilePage">
            <div className="profilePage__card">
                <div className="profilePage__header">
                    <h1 className="profilePage__title">Mi perfil</h1>
                </div>

                <div className="profilePage__body">
                    <div className="profilePage__avatar">
                        <img
                            className="profilePage__avatarImg"
                            src={currentAvatarUrl}
                            alt="avatar"
                        />
                        <button
                            className="profilePage__avatarEditBtn"
                            onClick={openAvatarEditor}
                        >
                            Editar
                            <FontAwesomeIcon icon={faPencil} />
                        </button>
                    </div>

                    <div className="profilePage__field">
                        <label className="profilePage__label">Nombre de usuario</label>
                        <div className="profilePage__inputRow">
                            <input
                                className="profilePage__input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Tu nombre"
                            />
                            <button
                                className="profilePage__saveBtn"
                                onClick={handleSaveUsername}
                                disabled={!username.trim()}
                            >
                                Guardar
                            </button>

                        </div>
                        {loadingRohCode ?
                            <Loading /> :
                            (
                                <>
                                    <span id="copiedMessage" >¡Copiado al portapapeles!</span>

                                    <p className="profilePage__rohCode" onClick={() => {
                                        navigator.clipboard.writeText(rohCode)
                                        document.getElementById("copiedMessage")!.style.display = "inline";
                                        setTimeout(() => {
                                            document.getElementById("copiedMessage")!.style.display = "none";
                                        }, 2000);
                                    }}>
                                        {rohCode}
                                        {rohCode.length > 0 && <FontAwesomeIcon icon={faCopy} />}
                                    </p>
                                    <button onClick={() => {
                                        setLoadingRohCode(true);
                                        generateROHCode().then((code) => { setRohCode(code), setLoadingRohCode(false) })
                                    }
                                    }
                                    >
                                        Generar Código ROH
                                    </button>
                                </>
                            )}
                    </div>
                </div>
            </div>

            {editingAvatar && (
                <AvatarSelector
                    avatarKey={avatarKey}
                    onPick={handlePickAvatar}
                    onClose={closeAvatarEditor}
                    onSave={handleSaveAvatar}
                />
            )}
            <SheetsList />
        </div>
    );
};

export default ProfilePage;
