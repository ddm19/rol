import React, { useState } from 'react';
import './styles.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo } from '@fortawesome/free-solid-svg-icons';

const calculateBonus = (roll: number): string =>
{
    if (roll >= 20) return '+5';
    if (roll >= 18) return '+4';
    if (roll >= 16) return '+3';
    if (roll >= 14) return '+2';
    if (roll >= 12) return '+1';
    if (roll >= 10) return '0';
    if (roll >= 8) return '-1';
    if (roll >= 6) return '-2';
    if (roll >= 4) return '-3';
    if (roll >= 2) return '-4';
    return '-5';
};

const DiceRoller: React.FC = () =>
{
    const [rolls, setRolls] = useState<number[]>([]);
    const [addCounts, setAddCounts] = useState<number[]>([]);
    const [subtractCounts, setSubtractCounts] = useState<number[]>([]);
    const [actionsDone, setActionsDone] = useState<string[]>([]);

    const rollDice = () =>
    {
        const newRolls = Array.from({ length: 6 }, () => Math.floor(Math.random() * 20) + 1);
        setRolls(newRolls);
        setAddCounts(new Array(6).fill(0));
        setSubtractCounts(new Array(6).fill(0));
        setActionsDone(new Array(6).fill(''));
    };

    const clearRolls = () =>
    {
        setRolls([]);
        setAddCounts([]);
        setSubtractCounts([]);
        setActionsDone([]);
    };

    const resetAction = (index: number) =>
    {
        const newRolls = [...rolls];
        const newAddCounts = [...addCounts];
        const newSubtractCounts = [...subtractCounts];
        const newActionsDone = [...actionsDone];

        if (newActionsDone[index] === 'add')
        {
            newRolls[index] -= 2;
            newAddCounts[index] -= 1;
        } else if (newActionsDone[index] === 'subtract')
        {
            newRolls[index] += 2;
            newSubtractCounts[index] -= 1;
        }

        newActionsDone[index] = '';
        setRolls(newRolls);
        setAddCounts(newAddCounts);
        setSubtractCounts(newSubtractCounts);
        setActionsDone(newActionsDone);
    };

    const handleAdd = (index: number) =>
    {
        const remainingAdds = 3 - addCounts.reduce((acc, count) => acc + count, 0);
        if (actionsDone[index] === 'subtract') resetAction(index);
        if (!actionsDone[index] && rolls[index] < 21 && addCounts[index] < 3 && remainingAdds > 0)
        {
            const newRolls = [...rolls];
            newRolls[index] += 2;
            const newAddCounts = [...addCounts];
            newAddCounts[index] += 1;
            const newActionsDone = [...actionsDone];
            newActionsDone[index] = 'add';
            setRolls(newRolls);
            setAddCounts(newAddCounts);
            setActionsDone(newActionsDone);
        }
    };

    const handleSubtract = (index: number) =>
    {
        const remainingSubtracts = 3 - subtractCounts.reduce((acc, count) => acc + count, 0);
        if (actionsDone[index] === 'add') resetAction(index);
        if (!actionsDone[index] && rolls[index] > 2 && subtractCounts[index] < 3 && remainingSubtracts > 0)
        {
            const newRolls = [...rolls];
            newRolls[index] -= 2;
            const newSubtractCounts = [...subtractCounts];
            newSubtractCounts[index] += 1;
            const newActionsDone = [...actionsDone];
            newActionsDone[index] = 'subtract';
            setRolls(newRolls);
            setSubtractCounts(newSubtractCounts);
            setActionsDone(newActionsDone);
        }
    };

    const totalSum = rolls.reduce((acc, roll) => acc + roll, 0);
    const average = rolls.length > 0 ? (totalSum / rolls.length).toFixed(2) : '0.00';

    const remainingAdds = 3 - addCounts.reduce((acc, count) => acc + count, 0);
    const remainingSubtracts = 3 - subtractCounts.reduce((acc, count) => acc + count, 0);

    return (
        <div className="container">
            <button onClick={rollDice}>Tirar 6d20</button>
            <button onClick={clearRolls}>Borrar tiradas</button>
            <div className="stats">Total: {totalSum}</div>
            <div className="stats">Media: {average}</div>
            <div className="stats">Sumas restantes: {remainingAdds}</div>
            <div className="stats">Restas restantes: {remainingSubtracts}</div>
            <div className="roll-container">
                {rolls.map((roll, index) => (
                    <div key={index} className="roll-display">
                        <span>{roll}</span>
                        <span className="bonus">Bonus: {calculateBonus(roll)}</span>
                        <div className="action-buttons">
                            <button
                                onClick={() => handleAdd(index)}
                                disabled={roll >= 21 || addCounts[index] >= 3 || remainingAdds <= 0 || actionsDone[index] !== ''}
                                className={`action-button ${actionsDone[index] === 'add' ? 'green' : ''}`}
                            >
                                +2
                            </button>
                            <button
                                onClick={() => handleSubtract(index)}
                                disabled={roll <= 2 || subtractCounts[index] >= 3 || remainingSubtracts <= 0 || actionsDone[index] !== ''}
                                className={`action-button ${actionsDone[index] === 'subtract' ? 'red' : ''}`}
                            >
                                -2
                            </button>
                            <button
                                onClick={() => resetAction(index)}
                                className="reset-button"
                            >
                                <FontAwesomeIcon icon={faUndo} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiceRoller;
