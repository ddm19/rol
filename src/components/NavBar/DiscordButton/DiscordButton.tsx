import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import "./discordButton.scss";

export const DiscordButton: React.FC = () => {
  return (
    <div className="discordButton navItem">
      <div className="portalEffect">
        <div className="rings">
          <div className="ring"></div>
          <div className="ring"></div>
          <div className="ring"></div>
        </div>
        <div className="core"></div>
        <div className="sparkles">
          <div className="sparkle"></div>
          <div className="sparkle"></div>
          <div className="sparkle"></div>
          <div className="sparkle"></div>
          <div className="sparkle"></div>
        </div>
      </div>
      <Link
        className="discordLink navItem"
        target="_blank"
        to={
          process.env.REACT_APP_DISCORD_LINK
            ? process.env.REACT_APP_DISCORD_LINK
            : "/Error"
        }
      >
        <FontAwesomeIcon icon={faDiscord} />
        <span className="discordLink__text">Cruza el Portal</span>
      </Link>
    </div>
  );
};
