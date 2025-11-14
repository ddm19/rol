import NavButton from "components/NavBar/NavButton/NavButton";
import { useEffect, useState } from "react";
import { isVillazarcilloPlayer } from "services/profiles";

interface VillazarcilloButtonProps {
    toggleMenu?: () => void;
}

const VillazarcilloButton = (props: VillazarcilloButtonProps) => {
    const [villazarcilloPlayer, setVillazarcilloPlayer] = useState(false);
    const { toggleMenu } = props;

    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        isVillazarcilloPlayer().then((result) => {
            setVillazarcilloPlayer(result);
        });
    }, []);

    return (
        villazarcilloPlayer ? (
            <>
                {!isMobile && 
                <div className='navSeparator'></div> 
                }

                <NavButton link={{
                    name: "Villazarcillo",
                    url: "/Villazarcillo",

                }}
                    toggleMenu={toggleMenu}
               />
            </>
        ) : null

    )
}
export default VillazarcilloButton;