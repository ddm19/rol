import React, { useState } from "react";
import "./NavBar.scss";
import { Link } from "react-router-dom";
import PhoneNavBar from "components/NavBar/PhoneNavbar/PhoneNavBar";
import NavigationLinksRender from "./NavigationLinksRender/NavigationLinksRender";
import { DiscordButton } from "components/NavBar/DiscordButton/DiscordButton";
import UserButton from "components/UserButton/userButton";
import VillazarcilloButton from "components/VillazarcilloButton/villazarcilloButton";

export interface NavigationLink {
  name: string;
  url: string;
  sublinks?: Array<NavigationLink>;
  isMobile?: boolean;
}
const NavBar: React.FC = () => {


  const navigationLinks: Array<NavigationLink> = [
    { name: "Inicio", url: "/" },
    {
      name: "Conoce Hispania",
      url: "/Hispania",
      sublinks: [
        { name: "Campañas", url: "/Campaigns" },
        { name: "Criaturas", url: "/Creatures" },
        { name: "Lugares", url: "/Places" },
        { name: "Objetos", url: "/Objects" }
      ],
    },
    {
      name: "Utilidades",
      url: "/Utilities",
      sublinks: [
        { name: "Ventajas y Desventajas", url: "/Advantages" },
        { name: "Creador de Personajes", url: "/PJMaker" },
        { name: "Lanzadados", url: "/DiceRoller" },
      ],
    },
    { name: "Reglas", url: "/Rules" },
    { name: "ROH", url: "/Cards" }
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

          <VillazarcilloButton />

        </ul>
        <DiscordButton></DiscordButton>

      </nav>

      {/* Dispositivos móviles */}
      <div className="mobileMenu">
        <PhoneNavBar navigationLinks={navigationLinks}></PhoneNavBar>
      </div>
      <UserButton />
    </div>
  );
};

export default NavBar;
