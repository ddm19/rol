import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

export const DiscordButton: React.FC = () =>
{
    return (<div className='discordButton navItem'>
        <Link className='discordLink navItem' target="_blank" to={process.env.REACT_APP_DISCORD_LINK ? process.env.REACT_APP_DISCORD_LINK : "/Error"}>
            <FontAwesomeIcon icon={faDiscord} />
            Cruza el Portal
        </Link>
    </div>
    );
};
