import React from "react";
import { ChoiceItem } from "../data";

interface ItemButtonProps {
  item: ChoiceItem;
  onClick: (item: ChoiceItem) => void;
  selectedCount: number;
  maxSelectable: number;
  isSelected: boolean;
}

const ItemButton: React.FC<ItemButtonProps> = ({
  item,
  onClick,
  selectedCount,
  maxSelectable,
  isSelected,
}) => {
  const disabled = !!item.disabled;
  const handleClick = () => {
    if (disabled) return;
    if (!isSelected && selectedCount >= maxSelectable) return;
    onClick(item);
  };

  return (
    <button
      className={`item-button ${disabled ? "disabled" : ""} ${
        isSelected ? "selected" : ""
      }`}
      onClick={handleClick}
      disabled={disabled}
    >
      <div
        className={`title ${item.tier === 0 ? "" : item.id.startsWith("d") ? "lila" : "naranja"}`}
      >
        {item.title}
      </div>
      <p className="description">{item.description}</p>
    </button>
  );
};

export default ItemButton;
