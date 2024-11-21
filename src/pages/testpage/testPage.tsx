import DiceRoller from "./DiceRoller20";
import DiceRoller3d6 from "./DiceRoller3d6";
import DiceRoller4d6 from "./DiceRoller4d6";
import './styles.scss';


const TestPage = () =>
{
    return <div className="diceRollerContainer">
        <DiceRoller></DiceRoller>
        <DiceRoller3d6></DiceRoller3d6>
        <DiceRoller4d6></DiceRoller4d6>
    </div>;
};
export default TestPage;

