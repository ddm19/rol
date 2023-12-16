import React, { useState } from "react"
import './PhoneNavBar.scss'
import { DiscordButton } from '../DiscordButton/DiscordButton';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import './PhoneNavBar.scss'
import { NavigationLink } from '../NavBar'
import NavButton from "../NavButton/NavButton";

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
    return (
        <div className='navbar'>
            {toggleButton()}
            <nav className={`${isPhoneMenuOpen ? 'active-menu' : ''} menu`}>
                <ul className='navContainer'>
                    <div className="mobileNav">
                        {navigationLinks.map((link: NavigationLink, index: number) =>
                        {
                            return (<NavButton link={link} toggleMenu={toggleMenu} ></NavButton>)
                        })}
                    </div>
                </ul>
            </nav>
            <DiscordButton></DiscordButton>
        </div>
    )
}
export default PhoneNavBar;