import Tabs from "@mui/material/Tabs";
import { Tab } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition, faHome } from "@fortawesome/free-solid-svg-icons";
import { MouseEventHandler, useState } from "react";
import "./customTabs.scss";

interface TabsProps {
  tabs: TabItem[];
  classname?: string;
}
export interface TabItem {
  title: string;
  content: JSX.Element;
  icon?: IconDefinition;
  classname?: string;
  isButtonTab?: boolean;
  onClick?: () => void;
}

const CustomTabs = (props: TabsProps) => {
  const { tabs, classname } = props;
  const [value, setValue] = useState(0);

  const isPhone = window.innerWidth < 700;

  const handleChange = (
    _event: React.SyntheticEvent<Element, Event>,
    newValue: number,
  ) => {
    setValue(newValue);
  };

  return (
    <>
      <Tabs
        value={value}
        onChange={handleChange}
        className={`${classname ? classname : "customTabsPanel"}`}
        variant={isPhone ? "scrollable" : "standard"}
        scrollButtons={isPhone ? "auto" : false}
        allowScrollButtonsMobile
      >
        {tabs.map((tab, index) => (
          <Tab
            onClick={tab.isButtonTab && tab.onClick ? tab.onClick : undefined}
            key={index}
            label={
              <>
                {tab.icon ? <FontAwesomeIcon icon={tab.icon} /> : null}
                {tab.title}
              </>
            }
            value={index}
            className={`${tab.classname ? tab.classname : "customTabsPanel__customTab"}`}
          />
        ))}
      </Tabs>
      {tabs[value].content}
    </>
  );
};

export default CustomTabs;
