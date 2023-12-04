import React from 'react';
import './NotFound.scss';

const NotFound: React.FC = () =>
{
  const dragonImage = "https://cdn3.iconfinder.com/data/icons/cam-the-tigeron/100/038-confused-thinking-uncertain-question-sticker-tigeron-gragon-512.png";
  return (
    <div className="not-found">
      <img src={dragonImage} alt="404 error page image" />
      <h1>Error 404</h1>
      <h2>Un Goblin te ha robado la página</h2>
      <p>Vuelve al inicio y trata de buscar otra!</p>
    </div>
  );
};

export default NotFound;