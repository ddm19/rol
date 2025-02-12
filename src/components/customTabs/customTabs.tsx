import Tabs from "@mui/material/Tabs";
import { Tab } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition, faHome } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import "./customTabs.scss";

interface TabsProps {
  tabs: TabItem[];
}
export interface TabItem {
  title: string;
  content: JSX.Element;
  icon?: IconDefinition;
}

const CustomTabs = (props: TabsProps) => {
  const { tabs } = props;
  const [value, setValue] = useState(0);

  const handleChange = (
    _event: React.SyntheticEvent<Element, Event>,
    newValue: number
  ) => {
    setValue(newValue);
  };

  return (
    <>
      <Tabs value={value} onChange={handleChange} className="customTabsPanel">
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={
              <>
                {tab.icon ? <FontAwesomeIcon icon={tab.icon} /> : null}
                {tab.title}
              </>
            }
            value={index}
            className="customTabsPanel__customTab"
          />
        ))}
      </Tabs>
      {tabs[value].content}
    </>
  );
};

export default CustomTabs;
