import React, { useState } from "react";
import RollPanel from "../RollPanel/rollPanel";
import RollStatsSummary from "../RollStatsSummary/rollStatsSummary";
import RollGrid from "../RollGrid/rollGrid";
import { useScreenshotExport } from "../hooks/useScreenshotExport";
import { computeRollStats, roll4d6DropLowest } from "../diceUtils";

const DiceRoller4d6: React.FC = () => {
  const [rolls, setRolls] = useState<number[]>([]);
  const { targetRef, download, copy, copyStatus } = useScreenshotExport("Tirada-4d6.png");

  const rollDice = () => setRolls(roll4d6DropLowest());
  const clearRolls = () => setRolls([]);
  const stats = computeRollStats(rolls);

  return (
    <RollPanel
      title="Lanza 4D6, descartando el menor"
      rollLabel="Tirar 4d6 (Drop Lowest)"
      onRoll={rollDice}
      onClear={clearRolls}
      canClear={rolls.length > 0}
      onDownload={download}
      onCopy={copy}
      copyLabel={copyStatus === "copied" ? "¡Copiado!" : "Copiar"}
      exportDisabled={rolls.length === 0}
      panelRef={targetRef}
    >
      {rolls.length > 0 && <RollStatsSummary stats={stats} />}
      <RollGrid rolls={rolls} />
    </RollPanel>
  );
};

export default DiceRoller4d6;
