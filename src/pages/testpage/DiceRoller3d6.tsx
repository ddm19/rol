import React, { useState } from 'react';

const calculateBonus = (roll: number): string =>
{
    if (roll >= 18) return '+4';
    if (roll >= 16) return '+3';
    if (roll >= 14) return '+2';
    if (roll >= 12) return '+1';
    if (roll >= 10) return '0';
    if (roll >= 8) return '-1';
    if (roll >= 6) return '-2';
    if (roll >= 4) return '-3';
    return '-4';
};

const DiceRoller3d6: React.FC = () =>
{
    const [rolls, setRolls] = useState<number[]>([]);

    const rollDice = () =>
    {
        const newRolls = Array.from({ length: 6 }, () =>
            Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1).reduce((a, b) => a + b)
        );
        setRolls(newRolls);
    };

    const clearRolls = () =>
    {
        setRolls([]);
    };

    const totalSum = rolls.reduce((acc, roll) => acc + roll, 0);
    const average = rolls.length > 0 ? (totalSum / rolls.length).toFixed(2) : '0.00';

    return (
        <div className="container">
            <button onClick={rollDice}>Tirar 3d6</button>
            <button onClick={clearRolls}>Borrar tiradas</button>
            <div className="stats">Total: {totalSum}</div>
            <div className="stats">Media: {average}</div>
            <div className="roll-container">
                {rolls.map((roll, index) => (
                    <div key={index} className="roll-display">
                        <span className="roll">{roll}</span>
                        <span className="bonus">Bonus: {calculateBonus(roll)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiceRoller3d6;
