import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiceD20 } from "@fortawesome/free-solid-svg-icons";
import "./rollGrid.scss";
import { formatModifier, rollAbilityModifier } from "../diceUtils";

interface RollGridProps {
  rolls: number[];
  renderCellExtra?: (index: number, value: number) => React.ReactNode;
}

const RollGrid: React.FC<RollGridProps> = ({ rolls, renderCellExtra }) => (
  <div className="rollGrid">
    {rolls.map((roll, index) => (
      <div key={index} className="rollGrid__cell">
        <div className="rollGrid__die">
          <FontAwesomeIcon icon={faDiceD20} className="rollGrid__dieIcon" />
          <span className="rollGrid__value">{roll}</span>
        </div>
        <span className="rollGrid__modifier">Bonus: {formatModifier(rollAbilityModifier(roll))}</span>
        {renderCellExtra?.(index, roll)}
      </div>
    ))}
  </div>
);

export default React.memo(RollGrid);
