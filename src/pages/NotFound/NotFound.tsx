import React from 'react';
import './NotFound.scss';

const NotFound: React.FC = () =>
{
  const dragonImage = `${process.env.PUBLIC_URL}/NotFound.png`;
  return (
    <div className="not-found">
      <img src={dragonImage} alt="404 error with a little confused dragon" />
      <h1>Error 404</h1>
      <h2>Un Goblin te ha robado la página</h2>
      <p>Vuelve al inicio y trata de buscar otra!</p>
    </div>
  );
};

export default NotFound;