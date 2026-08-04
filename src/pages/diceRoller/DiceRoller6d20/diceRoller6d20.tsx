import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUndo } from "@fortawesome/free-solid-svg-icons";
import "./diceRoller6d20.scss";
import RollPanel from "../RollPanel/rollPanel";
import RollStatsSummary from "../RollStatsSummary/rollStatsSummary";
import RollGrid from "../RollGrid/rollGrid";
import { useScreenshotExport } from "../hooks/useScreenshotExport";
import { ABILITY_SCORE_COUNT, computeRollStats, roll6d20 } from "../diceUtils";
import { AbilityAdjustment, AdjustmentAction } from "../types";

const ADJUSTMENT_STEP = 2;
const ADJUSTMENT_POOL = 3;
const MIN_SCORE = 1;
const MAX_SCORE = 20;

const emptyAdjustments = (): AbilityAdjustment[] =>
  Array.from({ length: ABILITY_SCORE_COUNT }, () => ({ action: null, delta: 0 }));

const DiceRoller6d20: React.FC = () => {
  const [rolls, setRolls] = useState<number[]>([]);
  const [adjustments, setAdjustments] = useState<AbilityAdjustment[]>([]);
  const { targetRef, download, copy, copyStatus } = useScreenshotExport("Tirada-6d20.png");

  const rollDice = () => {
    setRolls(roll6d20());
    setAdjustments(emptyAdjustments());
  };

  const clearRolls = () => {
    setRolls([]);
    setAdjustments([]);
  };

  const usedCount = (action: Exclude<AdjustmentAction, null>) =>
    adjustments.filter((adjustment) => adjustment.action === action).length;

  const remainingAdds = ADJUSTMENT_POOL - usedCount("add");
  const remainingSubtracts = ADJUSTMENT_POOL - usedCount("subtract");

  const applyAdjustment = (index: number, action: Exclude<AdjustmentAction, null>) => {
    const current = rolls[index];
    const target =
      action === "add"
        ? Math.min(current + ADJUSTMENT_STEP, MAX_SCORE)
        : Math.max(current - ADJUSTMENT_STEP, MIN_SCORE);
    const delta = Math.abs(target - current);

    setRolls((previous) => previous.map((value, i) => (i === index ? target : value)));
    setAdjustments((previous) =>
      previous.map((adjustment, i) => (i === index ? { action, delta } : adjustment))
    );
  };

  const undoAdjustment = (index: number) => {
    const { action, delta } = adjustments[index];
    if (!action) return;

    setRolls((previous) =>
      previous.map((value, i) => {
        if (i !== index) return value;
        return action === "add" ? value - delta : value + delta;
      })
    );
    setAdjustments((previous) =>
      previous.map((adjustment, i) => (i === index ? { action: null, delta: 0 } : adjustment))
    );
  };

  const stats = computeRollStats(rolls);
  const exportDisabled = rolls.length === 0 || remainingAdds > 0 || remainingSubtracts > 0;

  return (
    <RollPanel
      title="Lanza 6D20 y realiza sumas"
      rollLabel="Tirar 6d20"
      onRoll={rollDice}
      onClear={clearRolls}
      canClear={rolls.length > 0}
      onDownload={download}
      onCopy={copy}
      copyLabel={copyStatus === "copied" ? "¡Copiado!" : "Copiar"}
      exportDisabled={exportDisabled}
      panelRef={targetRef}
    >
      {rolls.length > 0 && <RollStatsSummary stats={stats} />}

      {rolls.length > 0 && (
        <div className="diceRoller6d20__tokens">
          <span>Sumas restantes: {remainingAdds}</span>
          <span>Restas restantes: {remainingSubtracts}</span>
        </div>
      )}

      <RollGrid
        rolls={rolls}
        renderCellExtra={(index) => {
          const adjustment = adjustments[index];
          return (
            <div className="rollGrid__cellActions">
              <button
                type="button"
                className={`rollGrid__actionButton rollGrid__actionButton--add${
                  adjustment.action === "add" ? " rollGrid__actionButton--active" : ""
                }`}
                disabled={Boolean(adjustment.action) || remainingAdds <= 0}
                onClick={() => applyAdjustment(index, "add")}
              >
                +2
              </button>
              <button
                type="button"
                className={`rollGrid__actionButton rollGrid__actionButton--subtract${
                  adjustment.action === "subtract" ? " rollGrid__actionButton--active" : ""
                }`}
                disabled={Boolean(adjustment.action) || remainingSubtracts <= 0}
                onClick={() => applyAdjustment(index, "subtract")}
              >
                -2
              </button>
              <button
                type="button"
                className="rollGrid__undoButton"
                disabled={!adjustment.action}
                onClick={() => undoAdjustment(index)}
              >
                <FontAwesomeIcon icon={faUndo} />
              </button>
            </div>
          );
        }}
      />
    </RollPanel>
  );
};

export default DiceRoller6d20;
