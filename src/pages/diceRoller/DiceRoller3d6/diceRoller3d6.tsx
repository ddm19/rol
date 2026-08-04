import React, { useState } from "react";
import "./diceRoller3d6.scss";
import RollPanel from "../RollPanel/rollPanel";
import RollStatsSummary from "../RollStatsSummary/rollStatsSummary";
import RollGrid from "../RollGrid/rollGrid";
import { useScreenshotExport } from "../hooks/useScreenshotExport";
import { computeRollStats, roll3d6 } from "../diceUtils";

const DiceRoller3d6: React.FC = () => {
  const [firstRoll, setFirstRoll] = useState<number[]>([]);
  const [secondRoll, setSecondRoll] = useState<number[]>([]);
  const { targetRef, download, copy, copyStatus } = useScreenshotExport("Tirada-3d6.png");

  const rollFirst = () => {
    setFirstRoll(roll3d6());
    setSecondRoll([]);
  };

  const rollSecond = () => setSecondRoll(roll3d6());

  const clearRolls = () => {
    setFirstRoll([]);
    setSecondRoll([]);
  };

  const firstStats = computeRollStats(firstRoll);
  const secondStats = computeRollStats(secondRoll);

  return (
    <RollPanel
      title="Lanza 3D6 2 veces y quédate con la mejor"
      rollLabel="Tirar 3d6 (1ª Tirada)"
      onRoll={rollFirst}
      onClear={clearRolls}
      canClear={firstRoll.length > 0}
      onDownload={download}
      onCopy={copy}
      copyLabel={copyStatus === "copied" ? "¡Copiado!" : "Copiar"}
      exportDisabled={firstRoll.length === 0}
      panelRef={targetRef}
    >
      {firstRoll.length > 0 && (
        <div className="diceRoller3d6__secondRollControls">
          <button type="button" onClick={rollSecond}>
            Tirar 3d6 (2ª Tirada)
          </button>
        </div>
      )}

      {firstRoll.length > 0 && (
        <div className="diceRoller3d6__comparison">
          <div className="diceRoller3d6__rollSet">
            <RollStatsSummary stats={firstStats} label="Primera Tirada" />
            <RollGrid rolls={firstRoll} />
          </div>
          {secondRoll.length > 0 && (
            <>
              <span className="diceRoller3d6__separator" />
              <div className="diceRoller3d6__rollSet">
                <RollStatsSummary stats={secondStats} label="Segunda Tirada" />
                <RollGrid rolls={secondRoll} />
              </div>
            </>
          )}
        </div>
      )}
    </RollPanel>
  );
};

export default DiceRoller3d6;
