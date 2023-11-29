import React from 'react';
import './NavBar.scss';
import { Link } from 'react-router-dom';


const NavBar: React.FC = () =>
{
    return (
        <div className='navbar'>
            <div className='logoContainer'>
                <img className='logo' src={process.env.PUBLIC_URL + '/Logo.png'} />
            </div>
            <nav>
                <ul className='navContainer'>
                    <li><Link className='navLink' to="/Home">Inicio</Link></li>
                    <div className='navSeparator'></div>
                    <li><Link className='navLink' to="/Campaigns">Campañas</Link></li>
                    <div className='navSeparator'></div>
                    <li><Link className='navLink' to="/Hispania">Conoce Hispania</Link></li>
                    <div className='navSeparator'></div>
                    <li><Link className='navLink' to="/Utilities">Utilidades</Link></li>
                </ul>
            </nav>
        </div>

    );
};

export default NavBar;