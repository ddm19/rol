import NavButton from "components/NavBar/NavButton/NavButton";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isVillazarcilloPlayer } from "services/profiles";

const VillazarcilloButton = () => {
    const [villazarcilloPlayer, setVillazarcilloPlayer] = useState(false);

    useEffect(() => {
        isVillazarcilloPlayer().then((result) => {
            setVillazarcilloPlayer(result);
        });
    }, []);

    return (
        villazarcilloPlayer && (
            <>
                <div className='navSeparator'></div>

                <NavButton link={{
                    name: "Villazarcillo",
                    url: "/Villazarcillo",

                }} />
            </>
        )

    )
}
export default VillazarcilloButton;