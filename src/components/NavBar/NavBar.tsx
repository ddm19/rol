import React from 'react';
import './NavBar.scss';
import { useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'

const NavBar: React.FC = () =>
{
    interface NavigationLink
    {
        name: string,
        url: string,
        sublinks?: Array<NavigationLink>
    }
    const location = useLocation();
    const isActive = (path: string) => location.pathname.startsWith(path);

    const navigationLinks: Array<NavigationLink> = [
        { name: "Inicio", url: '/' },
        { name: "Campañas", url: '/Campaigns' },
        {
            name: "Conoce Hispania",
            url: '/Hispania',
            sublinks: [
                { name: "Criaturas", url: "/Creatures" },
                { name: "Lugares", url: "/Places" },
                { name: "Objetos", url: "/Objects" }
            ]
        },
        {
            name: "Utilidades",
            url: '/Utilities',
            sublinks: [
                { name: "Ventajas y Desventajas", url: "/PerksFlaws" },
                { name: "Creador de Personajes", url: "/PJMaker" },
                { name: "Lanzadados", url: "/DiceRoller" }
            ]
        }
    ];
    const navigationLinksRender = () =>
    {
        return (
            navigationLinks.map((link: NavigationLink, index: number) =>
            {
                return (
                    <>
                        <li key={index} className={`navButton ${isActive(link.url) ? 'activeLink' : ''}`}>
                            <Link className='navLink link' to={link.url}>
                                {link.name}
                                {link.sublinks && link.sublinks.length > 0 ? <FontAwesomeIcon icon={faCaretDown} /> : null}
                            </Link>
                            {link.sublinks && link.sublinks.length > 0 ?
                                <ul className='dropdown'>
                                    {link.sublinks.map((sublink: NavigationLink) =>
                                    {
                                        return (
                                            <li className='dropdown-content'>
                                                <Link className='navLink link' to={link.url + sublink.url}>{sublink.name}</Link>

                                            </li>
                                        )
                                    })}

                                </ul>
                                : null}
                        </li >

                        {index < navigationLinks.length - 1 ?
                            <div className='navSeparator'></div> : null}
                    </>
                )
            })
        )
    }

    return (
        <div className='navbar'>

            <div className='logoContainer'>
                <Link className='navLink' to="/"><img className='logo' alt='WebLogo' src={process.env.PUBLIC_URL + '/Logo.png'} /></Link>
            </div>
            <nav className='parentNav'>
                <ul className='navContainer'>
                    {navigationLinksRender()}
                </ul>
                <div className='discordButton'>
                    <Link className='discordLink' target="_blank" to={process.env.REACT_APP_DISCORD_LINK ? process.env.REACT_APP_DISCORD_LINK : "/Error"}>
                        <FontAwesomeIcon icon={faDiscord} />
                        Cruza el Portal
                    </Link>
                </div>
            </nav>
        </div>


    );
};

export default NavBar;