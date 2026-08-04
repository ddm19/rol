import React, { useState } from "react";
import "./pointBuy.scss";
import RollPanel from "../RollPanel/rollPanel";
import RollStatsSummary from "../RollStatsSummary/rollStatsSummary";
import RollGrid from "../RollGrid/rollGrid";
import { useScreenshotExport } from "../hooks/useScreenshotExport";
import { ABILITY_SCORE_COUNT, computeRollStats } from "../diceUtils";


const POINT_BUY_BUDGET = 27;
const MIN_SCORE = 8;
const MAX_SCORE = 15;
const POINT_COST: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

const startingScores = (): number[] => Array.from({ length: ABILITY_SCORE_COUNT }, () => MIN_SCORE);

const PointBuy: React.FC = () => {
  const [scores, setScores] = useState<number[]>([]);
  const { targetRef, download, copy, copyStatus } = useScreenshotExport("Compra-de-puntos.png");

  const start = () => setScores(startingScores());
  const clear = () => setScores([]);

  const spentPoints = scores.reduce((sum, score) => sum + POINT_COST[score], 0);
  const remainingPoints = POINT_BUY_BUDGET - spentPoints;
  const finished = scores.length > 0 && remainingPoints === 0;

  const increase = (index: number) => {
    setScores((previous) => previous.map((value, i) => (i === index ? value + 1 : value)));
  };

  const decrease = (index: number) => {
    setScores((previous) => previous.map((value, i) => (i === index ? value - 1 : value)));
  };

  const stats = computeRollStats(scores);

  return (
    <RollPanel
      title="Compra de puntos"
      rollLabel="Comenzar compra de puntos"
      onRoll={start}
      onClear={clear}
      canClear={scores.length > 0}
      onDownload={download}
      onCopy={copy}
      copyLabel={copyStatus === "copied" ? "¡Copiado!" : "Copiar"}
      exportDisabled={!finished}
      panelRef={targetRef}
    >
      {scores.length > 0 && (
        <div className="pointBuy__remaining">Puntos restantes: {remainingPoints}</div>
      )}

      {scores.length > 0 && <RollStatsSummary stats={stats} />}

      <RollGrid
        rolls={scores}
        renderCellExtra={(index, value) => (
          <div className="rollGrid__cellActions">
            <button
              type="button"
              className="rollGrid__actionButton"
              disabled={value <= MIN_SCORE}
              onClick={() => decrease(index)}
            >
              -1
            </button>
            <button
              type="button"
              className="rollGrid__actionButton"
              disabled={value >= MAX_SCORE || POINT_COST[value + 1] - POINT_COST[value] > remainingPoints}
              onClick={() => increase(index)}
            >
              +1
            </button>
          </div>
        )}
      />
    </RollPanel>
  );
};

export default PointBuy;
