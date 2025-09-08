import { useState } from "react"
import { Link } from "react-router-dom";
import "./utilitiesPage.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiceD20, faGem, faSkull } from "@fortawesome/free-solid-svg-icons";
import { faDAndD } from "@fortawesome/free-brands-svg-icons";

type UtilityLink = {
    title: string;
    url: string;
    content?: React.ReactNode;
}
const UtilitiesPage = () => {

    const [links,] = useState<UtilityLink[]>([{
        title: "Ventajas y Desventajas",
        url: "/Utilities/Advantages",
        content: <div><FontAwesomeIcon icon={faGem} /> — <FontAwesomeIcon icon={faSkull} /></div>

    },
    {
        title: "Lanzador de Dados",
        url: "/Utilities/DiceRoller",
        content: <div><FontAwesomeIcon icon={faDAndD} /> <FontAwesomeIcon icon={faDiceD20} /></div>
    },
    ]);


    return (
        <>
            <h1>Utilidades</h1>
            <div className="utilitiesPageContainer">
                {links.map((link, index) => (
                    <Link key={index} to={link.url} className="utilitiesPageContainer__link">
                        {link.title}
                        {link.content}

                    </Link>
                ))}
            </div>
        </>
    )
}

export default UtilitiesPage;
