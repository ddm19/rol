import { Link, useLocation } from "react-router-dom";
import { NavigationLink } from "../NavBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import React from "react";

interface NavButtonProps {
  link: NavigationLink;
  toggleMenu?: () => void;
}

const isMobileDevice = () => {
  return window.innerWidth <= 768;
};

const NavButton: React.FC<NavButtonProps> = (props: NavButtonProps) => {
  const location = useLocation();
  const isActive = (path: string) => {
    if (path == "/") return location.pathname == path;
    return location.pathname.startsWith(path);
  };

  const { link, toggleMenu } = props;

  const handleMobileLinkClick = (e: any, link: NavigationLink) => {
    if (!link.sublinks) toggleMenu?.();
  };

  return (
    <li className={`navButton ${isActive(link.url) ? "activeLink" : ""}`}>
      <Link
        className="navLink link"
        to={isMobileDevice() && link.sublinks ? "#" : link.url}
        onClick={
          isMobileDevice() ? (e) => handleMobileLinkClick(e, link) : () => {}
        }
      >
        {link.name}
        {link.sublinks && link.sublinks.length > 0 ? (
          <FontAwesomeIcon icon={faCaretDown} />
        ) : null}
      </Link>
      {link.sublinks && link.sublinks.length > 0 ? (
        <ul className="dropdown">
          {link.sublinks.map((sublink: NavigationLink, subindex) => {
            return (
              <Link
                className="navLink link"
                to={link.url + sublink.url}
                onClick={toggleMenu}
              >
                <li key={subindex} className="dropdown-content">
                  {sublink.name}
                </li>
              </Link>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
};
export default NavButton;
