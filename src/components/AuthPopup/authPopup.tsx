import { useNavigate } from "react-router-dom";
import { supabase } from "services/supabaseClient";
import "./authPopup.scss";
import { Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faRightFromBracket, faTimes, faUser } from "@fortawesome/free-solid-svg-icons";

interface AuthPopupProps {
  onClose: () => void;
  session?: any;
}

const AuthPopup = ({ onClose, session }: AuthPopupProps) => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/callback" }
    });
    if (error) console.error(error);
  };

  const handleGoProfile = () => {
    onClose();
    navigate("/profile");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut().then(() => {
      navigate("/");
      navigate(0);
      onClose();
    });
  };

  return (
    <div className="authPopup">
      <div className="authPopup__content">
        <button className="authPopup__close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        {session ? (
          <>
            <Button className="authPopup__button" onClick={handleGoProfile}>
              <FontAwesomeIcon icon={faUser} />
              Perfil
            </Button>
            <Button className="authPopup__button" onClick={handleSignOut}>
              <FontAwesomeIcon icon={faRightFromBracket} />
              Cerrar sesión
            </Button>
          </>
        ) : (
          <Button className="authPopup__button" onClick={handleGoogleLogin}>
            <FontAwesomeIcon icon={faGoogle} /> Continuar con Google
          </Button>
        )}
      </div>
    </div>
  );
};

export default AuthPopup;