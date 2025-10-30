import html2canvas from "html2canvas";
import DiceRoller from "./DiceRoller20";
import DiceRoller3d6 from "./DiceRoller3d6";
import DiceRoller4d6 from "./DiceRoller4d6";
import "./diceRoller.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCopy } from "@fortawesome/free-solid-svg-icons";
import { createRoot } from "react-dom/client";

export const saveScreenshot = (diceClass: string) => {
  html2canvas(document.querySelector(diceClass) as HTMLElement, {
    allowTaint: false,
    useCORS: true,
    scale: 2,
    logging: true,
    backgroundColor: null,
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = "Tirada.png";
    link.href = canvas.toDataURL();
    link.click();
  });
};

export const copyScreenshot = (diceClass: string, element: HTMLElement) => {
  html2canvas(document.querySelector(diceClass) as HTMLElement, {
    allowTaint: false,
    useCORS: true,
  }).then((canvas) => {
    const dataUrl = canvas.toDataURL();
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]);
        const iconWrapper = document.createElement("span");
        iconWrapper.className = "dice-copy-icon";
        const root = createRoot(iconWrapper);
        root.render(<FontAwesomeIcon icon={faCopy} />);
        element.innerText = "Copiado! ";
        element.appendChild(iconWrapper);
        element.style.backgroundColor = "green";
        element.style.color = "white";

        setTimeout(() => {
          element.innerText = "Copiar";
          element.style.backgroundColor = "";
          element.style.color = "";
          root.unmount();
          element.removeChild(iconWrapper);
        }, 1000);
      });
  });
};

const DiceRollerPage = () => {
  const isMobile = window.innerWidth <= 700;
  const diceWideDistribution = <div className="diceRollerContainer">
    <h2>Lanza 6D20 y realiza sumas</h2>
    <h2>Lanza 3D6 2 veces y quédate con la mejor</h2>
    <h2>Lanza 4D6, descartando el menor</h2>

    <div className="diceRollerContainer__panel">
      <DiceRoller></DiceRoller>
    </div>

    <div className="diceRollerContainer__panel">
      <DiceRoller3d6></DiceRoller3d6>
    </div>
    <div className="diceRollerContainer__panel">
      <DiceRoller4d6></DiceRoller4d6>
    </div>

    <div className="diceRollerContainer__advisor">
      <h3>
        Este lado es para los valientes, mayores riesgos, mayores recompensas.
      </h3>
      <FontAwesomeIcon icon={faArrowRight} className="diceRollerContainer__advisor" />
      <h3>
        Este lado es para los que quieran una experiencia equilibrada, valores más medios y personajes estables.
      </h3>
    </div>
  </div>;

  const diceMobileDistribution = <div className="diceRollerContainer">
    <h2>Lanza 6D20 y realiza sumas</h2>

    <div className="diceRollerContainer__panel">
      <DiceRoller></DiceRoller>
    </div>
    <h2>Lanza 3D6 2 veces y quédate con la mejor</h2>
    <div className="diceRollerContainer__panel">
      <DiceRoller3d6></DiceRoller3d6>
    </div>
    <h2>Lanza 4D6, descartando el menor</h2>
    <div className="diceRollerContainer__panel">
      <DiceRoller4d6></DiceRoller4d6>
    </div>




    <div className="diceRollerContainer__advisor">
      <h3>
        Este lado es para los valientes, mayores riesgos, mayores recompensas.
      </h3>
      <FontAwesomeIcon icon={faArrowRight} className="diceRollerContainer__advisor" />
      <h3>
        Este lado es para los que quieran una experiencia equilibrada, valores más medios y personajes estables.
      </h3>
    </div>
  </div>

  return (
    <>{isMobile ? diceMobileDistribution : diceWideDistribution}</>
  );
};
export default DiceRollerPage;
