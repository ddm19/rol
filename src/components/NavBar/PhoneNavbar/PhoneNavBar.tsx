import React, { useEffect, useRef, useState } from "react";
import "./PhoneNavBar.scss";
import { NavigationLink } from "../NavBar";
import NavButton from "../NavButton/NavButton";
import CloseButton from "components/CloseButton/closeButton";
import PhoneMenuButton from "./components/PhoneMenuButton/PhoneMenuButton";
import { DiscordButton } from "components/NavBar/DiscordButton/DiscordButton";
import VillazarcilloButton from "components/VillazarcilloButton/villazarcilloButton";

interface Props {
  navigationLinks: NavigationLink[];
}
const PhoneNavBar: React.FC<Props> = (props: Props) => {
  const [isPhoneMenuOpen, setPhoneMenuOpen] = useState(false);
  const { navigationLinks } = props;
  const closeMenu = () => {
    setPhoneMenuOpen(false);
  };

  const toggleMenu = () => {
    setPhoneMenuOpen(!isPhoneMenuOpen);
  };

  const phoneNavBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        phoneNavBarRef.current &&
        !phoneNavBarRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    if (isPhoneMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPhoneMenuOpen]);

  return (
    <div className="navbar">
      <PhoneMenuButton toggleMenu={toggleMenu}></PhoneMenuButton>
      <nav
        ref={phoneNavBarRef}
        className={`${isPhoneMenuOpen ? "active-menu" : ""} menu`}
      >
        <ul className="navContainer">
          <div className="mobileNav">
            {navigationLinks.map((link: NavigationLink, index: number) => {
              return (
                <NavButton link={link} toggleMenu={toggleMenu}></NavButton>
              );
            })}
              <VillazarcilloButton toggleMenu={toggleMenu}/>

            <CloseButton onCloseEvent={closeMenu}></CloseButton>
          </div>
          
        </ul>

      </nav>
      <DiscordButton></DiscordButton>
    </div>
  );
};
export default PhoneNavBar;
