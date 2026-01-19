// src/components/AdvantagesPage.tsx

import React, { useEffect, useState } from "react";
import "./Ventajas.scss";
import { ChoiceItem, ChoiceTypes, disadvantages, advantages } from "./data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeartCircleCheck, faSkullCrossbones } from "@fortawesome/free-solid-svg-icons";

const AdvantagesPage: React.FC = () => {
  const [advantagesSelectedIds, setAdvantagesSelectedIds] = useState<string[]>(
    [],
  );
  const [disadvantagesSelectedIds, setDisadvantagesSelectedIds] = useState<
    string[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (item: ChoiceItem) => {
    if (item.disabled) return;

    if (item.type === ChoiceTypes.Advantage) {
      const alreadySelected = advantagesSelectedIds.includes(item.id);
      if (alreadySelected) {
        setAdvantagesSelectedIds((prev) => prev.filter((id) => id !== item.id));
      } else if (
        advantagesSelectedIds.length + disadvantagesSelectedIds.length <
        3
      ) {
        setAdvantagesSelectedIds((prev) => [...prev, item.id]);
      }
    } else {
      const alreadySelected = disadvantagesSelectedIds.includes(item.id);
      if (alreadySelected) {
        setDisadvantagesSelectedIds((prev) =>
          prev.filter((id) => id !== item.id),
        );
      } else if (
        advantagesSelectedIds.length + disadvantagesSelectedIds.length <
        3
      ) {
        setDisadvantagesSelectedIds((prev) => [...prev, item.id]);
      }
    }
  };

  const clearSelection = () => {
    setAdvantagesSelectedIds([]);
    setDisadvantagesSelectedIds([]);
  };

  const toggleContainer = () => {
    setIsOpen((prev) => !prev);
  };

  const tiers = [1, 2, 3];
  const grouped = {
    disadvantages: tiers.map((tier) =>
      disadvantages.filter((d) => d.tier === tier),
    ),
    specialDis: disadvantages.filter((d) => d.special),
    advantages: tiers.map((tier) => advantages.filter((v) => v.tier === tier)),
    specialAdv: advantages.filter((v) => v.special),
  };

  const sumSelected = (
    items: ChoiceItem[],
    selectedIds: string[],
    positive: boolean,
  ): number => {
    return selectedIds.reduce((acc, id) => {
      const item = items.find((i) => i.id === id);
      return acc + (item ? item.tier * (positive ? 1 : -1) : 0);
    }, 0);
  };

  const sumTotal = () =>
    sumSelected(advantages, advantagesSelectedIds, true) +
    sumSelected(disadvantages, disadvantagesSelectedIds, false);



  const total = sumTotal();


  return (
    <div className="advantagesPage">
      <button
        className="advantagesPage__openModalButton"
        onClick={toggleContainer}
      >
        Abrir Ventajas/Desventajas ({advantagesSelectedIds.length}<FontAwesomeIcon icon={faHeartCircleCheck} />  [+{sumSelected(advantages, advantagesSelectedIds, true)}] / {" "}
        {disadvantagesSelectedIds.length}<FontAwesomeIcon icon={faSkullCrossbones} />  [{sumSelected(disadvantages, disadvantagesSelectedIds, false)}] )  <b style={{ color: total <= 0 ? "lightgreen" : "lightcoral" }}>= {total}</b>
      </button>


      <div
        className={`advantagesPage__modalBackdrop ${isOpen ? "advantagesPage__modalBackdrop--open" : "advantagesPage__modalBackdrop--close"}`}
        onClick={toggleContainer}
      >

        <div
          className="advantagesPage__modalContent"
          onClick={(e) => e.stopPropagation()}
        >

          <div className="advantagesPage__selectedHeader">
            <button
              className="advantagesPage__closeButton"
              onClick={toggleContainer}
            >
              Cerrar
            </button>
            <div className="advantagesPage__selectedContainer">
              <div className="advantagesPage__ventajas">
                <h2 className="lilaFont">Ventajas:</h2>
                {advantagesSelectedIds.map((id) => {
                  const item = advantages.find((v) => v.id === id);
                  if (!item) return null;
                  return (
                    <div key={item.id} className="advantagesPage__selectedItem">
                      <div className="advantagesPage__selectedItemTitle">
                        {item.title}
                      </div>
                      <button
                        className="advantagesPage__selectedItemRemove"
                        onClick={() => handleSelect(item)}
                      >
                        X
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="advantagesPage__separator" />
              <div className="advantagesPage__desventajas">
                <h2 className="naranjaFont">Desventajas:</h2>
                {disadvantagesSelectedIds.map((id) => {
                  const item = disadvantages.find((d) => d.id === id);
                  if (!item) return null;
                  return (
                    <div key={item.id} className="advantagesPage__selectedItem">
                      <div className="advantagesPage__selectedItemTitle">
                        {item.title}
                      </div>
                      <button
                        className="advantagesPage__selectedItemRemove"
                        onClick={() => handleSelect(item)}
                      >
                        X
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="advantagesPage__totalContainer">
              <button
                className="advantagesPage__deleteButton"
                onClick={clearSelection}
              >
                Borrar selección
              </button>
              <h4 className="advantagesPage__total"> <b style={{ color: total <= 0 ? "green" : "red" }}>= Total: {total}</b></h4>
              <p className="advantagesPage__note">
                Recuerda: El total debe ser igual o menor a 0, además no puedes
                escoger más de 3 Ventajas/Desventajas en total.
              </p>
              <p className="advantagesPage__note">
                Recuerda: Nunca puedes escoger una ventaja que anule una
                desventaja.
              </p>

            </div>
          </div>
        </div>
      </div>


      <div>
        <div>
          <div className="advantagesPage__section">
            <h2>Desventajas</h2>
            <div className="advantagesPage__row">
              {tiers.map((tier, i) => (
                <div key={`d-tier-${tier}`} className="advantagesPage__list">
                  <h3>Tier {tier}</h3>
                  <ul className="advantagesPage__list">
                    {grouped.disadvantages[i].map((item: ChoiceItem) => {
                      const isSelected = disadvantagesSelectedIds.includes(
                        item.id,
                      );
                      return (
                        <li key={item.id}>
                          <button
                            className={`advantagesPage__itemButton lila${item.disabled
                              ? "advantagesPage__itemButton--disabled"
                              : ""
                              } ${isSelected ? "advantagesPage__itemButton--selected" : ""}`}
                            onClick={() => handleSelect(item)}
                            disabled={item.disabled}
                          >
                            <div
                              className={`advantagesPage__itemTitle`}
                            >
                              {item.title}
                            </div>
                            <p className="advantagesPage__itemDescription">
                              {item.description}
                            </p>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <div className="advantagesPage__list">
                <h3>Especiales</h3>
                <ul className="advantagesPage__list">
                  {grouped.specialDis.map((item: ChoiceItem) => {
                    const isSelected = disadvantagesSelectedIds.includes(
                      item.id,
                    );
                    return (
                      <li key={item.id}>
                        <button
                          className={`advantagesPage__itemButton advantagesPage__itemButton--disabled ${isSelected
                            ? "advantagesPage__itemButton--selected"
                            : ""
                            }`}
                          disabled
                        >
                          <div
                            className={`advantagesPage__itemTitle`}
                          >
                            {item.title}
                          </div>
                          <p className="advantagesPage__itemDescription">
                            {item.description}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div className="advantagesPage__section">
            <h2>Ventajas</h2>
            <div className="advantagesPage__row">
              {tiers.map((tier, i) => (
                <div key={`v-tier-${tier}`} className="advantagesPage__list">
                  <h3>Tier {tier}</h3>
                  <ul className="advantagesPage__list">
                    {grouped.advantages[i].map((item: ChoiceItem) => {
                      const isSelected = advantagesSelectedIds.includes(
                        item.id,
                      );
                      return (
                        <li key={item.id}>
                          <button
                            className={`advantagesPage__itemButton naranja ${item.disabled
                              ? "advantagesPage__itemButton--disabled"
                              : ""
                              } ${isSelected ? "advantagesPage__itemButton--selected" : ""}`}
                            onClick={() => handleSelect(item)}
                            disabled={item.disabled}
                          >
                            <div
                              className={`advantagesPage__itemTitle `}
                            >
                              {item.title}
                            </div>
                            <p className="advantagesPage__itemDescription">
                              {item.description}
                            </p>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <div className="advantagesPage__list">
                <h3>Especiales</h3>
                <ul className="advantagesPage__list">
                  {grouped.specialAdv.map((item: ChoiceItem) => {
                    const isSelected = advantagesSelectedIds.includes(item.id);
                    return (
                      <li key={item.id}>
                        <button
                          className={`advantagesPage__itemButton advantagesPage__itemButton--disabled ${isSelected
                            ? "advantagesPage__itemButton--selected"
                            : ""
                            }`}
                          disabled
                        >
                          <div
                            className={`advantagesPage__itemTitle `}
                          >
                            {item.title}
                          </div>
                          <p className="advantagesPage__itemDescription">
                            {item.description}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvantagesPage;
