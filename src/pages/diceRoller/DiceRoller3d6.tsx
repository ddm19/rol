import React, { useState } from "react";
import { copyScreenshot, saveScreenshot } from "./diceRoller";

const calculateBonus = (roll: number): string => {
  if (roll >= 18) return "+4";
  if (roll >= 16) return "+3";
  if (roll >= 14) return "+2";
  if (roll >= 12) return "+1";
  if (roll >= 10) return "0";
  if (roll >= 8) return "-1";
  if (roll >= 6) return "-2";
  if (roll >= 4) return "-3";
  return "-4";
};

const DiceRoller3d6: React.FC = () => {
  const [rolls, setRolls] = useState<number[]>([]);
  const [rolls2, setRolls2] = useState<number[]>([]);

  const rollDice1 = () => {
    const newRolls = Array.from({ length: 6 }, () =>
      Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1).reduce(
        (a, b) => a + b
      )
    );

    setRolls(newRolls);
  };
  const rollDice2 = () => {
    const newRolls2 = Array.from({ length: 6 }, () =>
      Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1).reduce(
        (a, b) => a + b
      )
    );
    setRolls2(newRolls2);
  };

  const clearRolls = () => {
    setRolls([]);
    setRolls2([]);
  };

  const totalSum = rolls.reduce((acc, roll) => acc + roll, 0);
  const average =
    rolls.length > 0 ? (totalSum / rolls.length).toFixed(2) : "0.00";

  const totalSum2 = rolls2.reduce((acc, roll) => acc + roll, 0);
  const average2 =
    rolls2.length > 0 ? (totalSum2 / rolls2.length).toFixed(2) : "0.00";

  return (
    <>
      <div className="diceContainer d36">
        <button onClick={rollDice1}>Tirar 3d6 (1ª Tirada)</button>
        {rolls && rolls.length > 0 && (
          <button onClick={clearRolls}>Borrar tiradas</button>
        )}

        <div className="stats">Total: {totalSum}</div>
        <div className="stats">Media: {average}</div>
        <div>
          <button
            className="diceRollerContainer__downloadButton"
            onClick={() => saveScreenshot(".d36")}
          >
            Descargar
          </button>
          <button
            className="diceRollerContainer__downloadButton"
            id="copyButtond36"
            onClick={() => copyScreenshot(".d36", document.getElementById("copyButtond36")!)}
          >
            Copiar
          </button>
        </div>
        {rolls && rolls.length > 0 && (
          <div className="diceContainer d36">
            <button onClick={rollDice2}>Tirar 3d6 (2ª Tirada)</button>
            <div className="stats">Total (2): {totalSum2}</div>
            <div className="stats">Media (2): {average2}</div>
          </div>
        )}

        {rolls && rolls.length > 0 && (
          <div className="diceContainer__multipleRolls">
            <div>
              <div className="stats">Primera Tirada</div>
              <div className="roll-container">
                {rolls.map((roll, index) => (
                  <div key={index} className="roll-display">
                    <span className="roll">{roll}</span>
                    <span className="bonus">Bonus: {calculateBonus(roll)}</span>
                  </div>
                ))}
              </div>
            </div>
            <span className="diceContainer__separator" />
            <div>
              <div className="stats">Segunda Tirada</div>
              <div className="roll-container">
                {rolls2.map((roll, index) => (
                  <div key={index} className="roll-display">
                    <span className="roll">{roll}</span>
                    <span className="bonus">Bonus: {calculateBonus(roll)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DiceRoller3d6;
