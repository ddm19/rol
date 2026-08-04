import React from "react";
import "./rollStatsSummary.scss";
import { AbilityRollStats } from "../types";
import { formatModifier } from "../diceUtils";

interface RollStatsSummaryProps {
  stats: AbilityRollStats;
  label?: string;
}

const RollStatsSummary: React.FC<RollStatsSummaryProps> = ({ stats, label }) => (
  <div className="rollStats">
    {label && <span className="rollStats__label">{label}</span>}
    <dl className="rollStats__grid">
      <div className="rollStats__item">
        <dt>Total</dt>
        <dd>{stats.total}</dd>
      </div>
      <div className="rollStats__item">
        <dt>Media</dt>
        <dd>{stats.mean.toFixed(2)}</dd>
      </div>
      <div className="rollStats__item">
        <dt>Máximo</dt>
        <dd>{stats.max}</dd>
      </div>
      <div className="rollStats__item">
        <dt>Mínimo</dt>
        <dd>{stats.min}</dd>
      </div>
      <div className="rollStats__item">
        <dt>Mediana</dt>
        <dd>{stats.median}</dd>
      </div>
      <div className="rollStats__item">
        <dt>Modificadores</dt>
        <dd>{formatModifier(stats.modifierTotal)}</dd>
      </div>
    </dl>
  </div>
);

export default React.memo(RollStatsSummary);
