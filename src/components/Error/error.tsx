import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './error.scss';

interface ErrorProps
{
    title: ReactNode;
    subtitle: ReactNode;
    image?: string;
    homeLink?: ReactNode;
}

const Error: React.FC<ErrorProps> = (props: ErrorProps) =>
{
    const { title, image, subtitle, homeLink } = props;

    const defaultImage = `/NotFound.png`;
    return (
        <>
            <div className='error'>
                <img draggable={false} className='error__mainImage' src={image || defaultImage} alt="Error" />
                <div className='error__textContainer'>
                    <h1>{title}</h1>
                    <h2>{subtitle}</h2>
                    {homeLink || <p>Vuelve al <Link className='link link--bold link--hoverUnderline' to='/'>Inicio</Link></p>}
                </div>
            </div>
        </>
    );
};

export default Error;
