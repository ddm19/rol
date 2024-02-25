import React, { useEffect, useRef, useState } from "react"
import './PhoneNavBar.scss'
import { DiscordButton } from '../DiscordButton/DiscordButton';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import './PhoneNavBar.scss'
import { NavigationLink } from '../NavBar'
import NavButton from "../NavButton/NavButton";
import CloseButton from 'react-bootstrap/CloseButton';

interface Props 
{
    navigationLinks: NavigationLink[]
}
const PhoneNavBar: React.FC<Props> = (props: Props) =>
{
    const [isPhoneMenuOpen, setPhoneMenuOpen] = useState(false);
    const { navigationLinks } = props
    const toggleMenu = () =>
    {
        setPhoneMenuOpen(!isPhoneMenuOpen);
    };
    const toggleButton = () =>
    {
        return (
            <button className="buttonMenu" onClick={toggleMenu}>
                <FontAwesomeIcon icon={faBars} className="menu-icon navItem" />
            </button>)
    }
    const phoneNavBarRef = useRef<HTMLDivElement>(null);
    useEffect(() =>
    {
        const handleClickOutside = (event: MouseEvent) =>
        {
            if (phoneNavBarRef.current && !phoneNavBarRef.current.contains(event.target as Node))
            {
                setPhoneMenuOpen(false);
            }
        };

        if (isPhoneMenuOpen)
        {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () =>
        {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isPhoneMenuOpen]);
    return (
        <div className='navbar'>
            {toggleButton()}
            <nav ref={phoneNavBarRef} className={`${isPhoneMenuOpen ? 'active-menu' : ''} menu`}>
                <ul className='navContainer'>
                    <div className="mobileNav">
                        {navigationLinks.map((link: NavigationLink, index: number) =>
                        {
                            return (<NavButton link={link} toggleMenu={toggleMenu} ></NavButton>)
                        })}
                        <CloseButton></CloseButton>
                    </div>
                </ul>
            </nav>
            <DiscordButton></DiscordButton>
        </div>
    )
}
export default PhoneNavBar;