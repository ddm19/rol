import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { NavigationLink } from '../NavBar';
import NavButton from '../NavButton/NavButton';

interface Props
{
    navigationLinks: NavigationLink[];
}

export const NavigationLinksRender: React.FC<Props> = (props: Props) =>
{

    const { navigationLinks } = props

    return (
        <>
            {navigationLinks.map((link: NavigationLink, index: number) =>
            {
                return (
                    <>
                        <NavButton link={link} key={index} ></NavButton>
                        {index < navigationLinks.length - 1 ?
                            <div className='navSeparator'></div> : null}
                    </>
                );
            })}
        </>

    );
};
export default NavigationLinksRender;