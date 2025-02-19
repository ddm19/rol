import React from "react";
import "./NavBar.scss";
import { Link } from "react-router-dom";
import PhoneNavBar from "components/NavBar/PhoneNavbar/PhoneNavBar";
import NavigationLinksRender from "./NavigationLinksRender/NavigationLinksRender";
import { DiscordButton } from "components/NavBar/DiscordButton/DiscordButton";

export interface NavigationLink {
  name: string;
  url: string;
  sublinks?: Array<NavigationLink>;
  isMobile?: boolean;
}
const NavBar: React.FC = () => {
  const navigationLinks: Array<NavigationLink> = [
    { name: "Inicio", url: "/" },
    { name: "Campañas", url: "/Campaigns" },
    {
      name: "Conoce Hispania",
      url: "/Hispania",
      sublinks: [
        { name: "Criaturas", url: "/Creatures" },
        { name: "Lugares", url: "/Places" },
        { name: "Objetos", url: "/Objects" },
      ],
    },
    {
      name: "Utilidades",
      url: "/Utilities",
      sublinks: [
        { name: "Ventajas y Desventajas", url: "/PerksFlaws" },
        { name: "Creador de Personajes", url: "/PJMaker" },
        { name: "Lanzadados", url: "/DiceRoller" },
      ],
    },
  ];

  return (
    <div className="navbar">
      <div className="logoContainer">
        <Link className="navLink" to="/">
          <img
            className="logo"
            alt="WebLogo"
            src={"/Logo.png"}
          />
        </Link>
      </div>
      <nav className="parentNav">
        <ul className="navContainer">
          <NavigationLinksRender
            navigationLinks={navigationLinks}
          ></NavigationLinksRender>
        </ul>
        <DiscordButton></DiscordButton>
      </nav>
      {/* Dispositivos móviles */}
      <div className="mobileMenu">
        <PhoneNavBar navigationLinks={navigationLinks}></PhoneNavBar>
      </div>
    </div>
  );
};

export default NavBar;
