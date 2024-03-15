import React from 'react';
import './NotFound.scss';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () =>
{
  const dragonImage = `${process.env.PUBLIC_URL}/NotFound.png`;
  return (
    <>
      <div className='notFound'>
        <img draggable={false} className='notFound__mainImage' src={dragonImage} alt="404 error with a little confused dragon" />
        <div className='notFound__textContainer'>
          <h1>Ups! No encontramos esa página</h1>
          <h2>Un goblin te ha robado la página</h2>
          <p>Vuelve al <Link className='link link--bold link--hoverUnderline' to='/'>Inicio</Link> y trata de buscar otra</p>
        </div>
      </div>
    </>
  );
};

export default NotFound;