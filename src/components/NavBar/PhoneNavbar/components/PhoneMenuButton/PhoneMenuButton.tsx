import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

interface PhoneMenuButtonProps
{
  toggleMenu: () => void;
}
const PhoneMenuButton = (props: PhoneMenuButtonProps) =>
{
  const { toggleMenu } = props;

  return (
    <button className="buttonMenu" onClick={toggleMenu}>
      <FontAwesomeIcon icon={faBars} className="menu-icon navItem" />
    </button>
  );
};
export default PhoneMenuButton;
