import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import "./diceRoller.scss";
import DiceRoller6d20 from "./DiceRoller6d20/diceRoller6d20";
import DiceRoller3d6 from "./DiceRoller3d6/diceRoller3d6";
import DiceRoller4d6 from "./DiceRoller4d6/diceRoller4d6";
import PointBuy from "./PointBuy/pointBuy";

const DiceRollerPage: React.FC = () => (
  <div className="diceRollerPage">
    <DiceRoller6d20 />
    <DiceRoller3d6 />
    <DiceRoller4d6 />



    <div className="diceRollerPage__advisor">
      <h3 className="diceRollerPage__advisorText">
        Este lado es para los valientes, mayores riesgos, mayores recompensas.
      </h3>
      <FontAwesomeIcon icon={faArrowRight} className="diceRollerPage__advisorIcon" />
      <h3 className="diceRollerPage__advisorText">
        Este lado es para los que quieran una experiencia equilibrada, valores más medios y
        personajes estables.
      </h3>
    </div>
    <div className="diceRollerPage__pointBuy">
      <PointBuy />
    </div>
  </div>
);

export default DiceRollerPage;
