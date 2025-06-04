import React from "react";
import { ChoiceItem } from "../data";
import "./Ventajas.scss";

interface SelectedSummaryProps {
  advantagesSelected: ChoiceItem[];
  disadvantagesSelected: ChoiceItem[];
  onRemove: (item: ChoiceItem) => void;
}

const SelectedSummary: React.FC<SelectedSummaryProps> = ({
  advantagesSelected,
  disadvantagesSelected,
  onRemove,
}) => {
  const total =
    advantagesSelected.reduce((sum, item) => sum + item.tier, 0) -
    disadvantagesSelected.reduce((sum, item) => sum + item.tier, 0);

  return (
    <div className="advantagesPage__selectedHeader">
      <div className="advantagesPage__ventajas">
        <h2>Ventajas:</h2>
        {advantagesSelected.map((item) => (
          <div key={item.id} className="advantagesPage__selectedItem">
            <div className="advantagesPage__selectedItemTitle">
              {item.title}
            </div>
            <button
              className="advantagesPage__selectedItemRemove"
              onClick={() => onRemove(item)}
            >
              X
            </button>
          </div>
        ))}
      </div>

      <div className="advantagesPage__separator" />

      <div className="advantagesPage__desventajas">
        <h2>Desventajas:</h2>
        {disadvantagesSelected.map((item) => (
          <div key={item.id} className="advantagesPage__selectedItem">
            <div className="advantagesPage__selectedItemTitle">
              {item.title}
            </div>
            <button
              className="advantagesPage__selectedItemRemove"
              onClick={() => onRemove(item)}
            >
              X
            </button>
          </div>
        ))}
      </div>

      <h4 className="advantagesPage__total">Total: {total}</h4>
    </div>
  );
};

export default SelectedSummary;
