import React from "react";
import { ChoiceItem } from "../data";
import ItemButton from "./itemButton";

interface TierSectionProps {
  title: string;
  items: ChoiceItem[];
  onSelect: (item: ChoiceItem) => void;
  selectedIds: string[];
  maxSelectable: number;
}

const TierSection: React.FC<TierSectionProps> = ({
  title,
  items,
  onSelect,
  selectedIds,
  maxSelectable,
}) => {
  return (
    <div className="column">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <ItemButton
              item={item}
              onClick={onSelect}
              selectedCount={selectedIds.length}
              maxSelectable={3}
              isSelected={selectedIds.includes(item.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TierSection;
