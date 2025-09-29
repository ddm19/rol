import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "services/supabaseClient";
import AuthPopup from "components/AuthPopup/authPopup";
import { getMyProfile } from "services/profiles";
import { AVATARS } from "services/avatars";
import "./userButton.scss";

const UserButton = () => {
    const [showAuthPopup, setShowAuthPopup] = useState(false);
    const [session, setSession] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);


    useEffect(() => {
        const fetchSessionAndProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) {
                const p = await getMyProfile();
                setProfile(p);
            }
        };
        fetchSessionAndProfile();
    }, []);

    const toggleAuthPopup = () => {
        setShowAuthPopup((prev) => !prev);
    };

    let avatarUrl = "";
    let displayName = "";
    if (profile) {
        avatarUrl = (AVATARS.find(a => a.key === profile.avatar_key)?.url) || AVATARS[0].url;
        displayName = profile.username || session?.user.email;
    }


    return (
        <>
            {showAuthPopup && (
                <AuthPopup onClose={() => setShowAuthPopup(false)} session={session} />
            )}
            {session ? (
                <Button id="loginButton" onClick={toggleAuthPopup}>
                    <img
                        src={avatarUrl}
                        alt="avatar"
                        className="userButton__avatar"
                    />
                    <span className="userButton__username">
                        {displayName}
                    </span>
                </Button>
            ) : (
                <Button onClick={toggleAuthPopup} id="loginButton">
                    Inicia Sesión
                    <FontAwesomeIcon icon={faUser} />
                </Button>
            )}
        </>
    );
};

export default UserButton;