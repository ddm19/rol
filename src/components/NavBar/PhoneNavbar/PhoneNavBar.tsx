import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./PhoneNavBar.scss";
import { NavigationLink } from "../NavBar";
import NavButton from "../NavButton/NavButton";
import CloseButton from "components/CloseButton/closeButton";
import PhoneMenuButton from "./components/PhoneMenuButton/PhoneMenuButton";
import { DiscordButton } from "components/NavBar/DiscordButton/DiscordButton";
import VillazarcilloButton from "components/VillazarcilloButton/villazarcilloButton";
import { OrdersButton } from "components/Orders";

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
      // Check also not menuButton
      if (
        phoneNavBarRef.current &&
        !phoneNavBarRef.current.contains(event.target as Node) && !(event.target as Element).closest(".buttonMenu")
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
      <OrdersButton variant="mobile" />

      {createPortal(
        <div className="navbar mobileMenu">
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
                <VillazarcilloButton toggleMenu={toggleMenu} />

                <CloseButton onCloseEvent={closeMenu}></CloseButton>
              </div>

            </ul>

          </nav>
        </div>,
        document.body
      )}
      <DiscordButton></DiscordButton>
    </div>
  );
};
export default PhoneNavBar;
