import React from "react";
import "./rollPanel.scss";

interface RollPanelProps {
  title: string;
  rollLabel: string;
  onRoll: () => void;
  onClear: () => void;
  canClear: boolean;
  onDownload: () => void;
  onCopy: () => void;
  copyLabel: string;
  exportDisabled: boolean;
  panelRef: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
}

const RollPanel: React.FC<RollPanelProps> = ({
  title,
  rollLabel,
  onRoll,
  onClear,
  canClear,
  onDownload,
  onCopy,
  copyLabel,
  exportDisabled,
  panelRef,
  children,
}) => (
  <div className="rollPanel" ref={panelRef}>
    <h2 className="rollPanel__title">{title}</h2>
    <div className="rollPanel__controls">
      <button type="button" onClick={onRoll}>
        {rollLabel}
      </button>
      {canClear && (
        <button type="button" onClick={onClear}>
          Borrar tiradas
        </button>
      )}
    </div>

    <div className="rollPanel__body">{children}</div>

    {canClear && (
      <div className="rollPanel__exportActions">
        <button type="button" disabled={exportDisabled} onClick={onDownload}>
          Descargar
        </button>
        <button type="button" disabled={exportDisabled} onClick={onCopy}>
          {copyLabel}
        </button>
      </div>
    )}
  </div>
);

export default RollPanel;
