import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAudio, faUsers, faPuzzlePiece, faUserCog, faBook, faDiceD20 } from '@fortawesome/free-solid-svg-icons'
import './Footer.scss'
import { Link } from 'react-router-dom';

const Footer: React.FC = () =>
{
    const externalTools = [
        { icon: faPuzzlePiece, title: "W2G - Musiquilla", link: "https://w2g.tv/2ywai0s3ggt1bsq7kp" },
        { icon: faUserCog, title: "TokenStamp - Creador de Tokens", link: "https://rolladvantage.com/tokenstamp/" },
        { icon: faBook, title: "HeroForge  - Creador de Personajes (3D)", link: "https://www.heroforge.com/" },
        { icon: faDiceD20, title: "DnD Beyond - Reglas Generales", link: "https://www.dndbeyond.com" },
        { icon: faFileAudio, title: "Dungeon20 - Reglas Generales", link: "https://nivel20.com/games/dnd-5" },
    ]

    return (
        <div className='footerbg'>
            <div className="footerContainer">
                <div>
                    <h2 className='footerText'>Hispania</h2>
                    <p className='footerText'>© 2023 Ddm19Dev.</p>
                    <p className='footerText'>  All rights reserved.</p>
                </div>
                <div className='externalToolsContainer'>
                    <h4 className='footerText alignLeft externalToolsTitle'>Enlaces Externos</h4>
                    <div className='externalTools footerText'>
                        {externalTools.map((tool) =>
                        {
                            return (
                                <div className='externalTool link'>
                                    <FontAwesomeIcon icon={tool.icon}></FontAwesomeIcon>
                                    <Link className='footerText link' target='_blank' to={tool.link}>{tool.title}</Link>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div >
        </div>

    )
}
export default Footer;