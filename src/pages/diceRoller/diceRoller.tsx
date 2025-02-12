import html2canvas from "html2canvas";
import DiceRoller from "./DiceRoller20";
import DiceRoller3d6 from "./DiceRoller3d6";
import DiceRoller4d6 from "./DiceRoller4d6";
import "./diceRoller.scss";

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
const DiceRollerPage = () => {
  return (
    <div className="diceRollerContainer">
      <div>
        <DiceRoller></DiceRoller>
      </div>
      <div>
        <DiceRoller3d6></DiceRoller3d6>
      </div>
      <div>
        <DiceRoller4d6></DiceRoller4d6>
      </div>
    </div>
  );
};
export default DiceRollerPage;
