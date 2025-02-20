import { useEffect, useState } from "react";
import CustomTabs, { TabItem } from "components/customTabs/customTabs";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface DynamicTabsManagerProps {
  formData: any;
  setFormData: (formData: any) => void;
  formKey: string;
  initialTabMetadata: { title: string; classname: string };
  renderTabForm: (
    index: number,
    onFieldChange: (field: string, value: any) => void,
    values: any,
    removeTab: (index: number) => void,
  ) => JSX.Element;
  addButtonLabel?: string;
}

const DynamicTabsManager = (props: DynamicTabsManagerProps) => {
  const {
    formData,
    setFormData,
    formKey,
    initialTabMetadata,
    renderTabForm,
    addButtonLabel = "Agregar",
  } = props;

  const initialTabs =
    formData[formKey] &&
    Array.isArray(formData[formKey]) &&
    formData[formKey].length > 0
      ? formData[formKey].map((tab: any, index: number) => ({
          title: tab.title || `${initialTabMetadata.title} ${index + 1}`,
          classname: tab.classname || initialTabMetadata.classname,
        }))
      : [];
  const initialValues =
    formData[formKey] &&
    Array.isArray(formData[formKey]) &&
    formData[formKey].length > 0
      ? formData[formKey].map((tab: any) => tab.values || {})
      : [{}];
  const [tabs, setTabs] = useState(initialTabs);
  const [values, setValues] = useState(initialValues);
  const addNewTab = () => {
    setTabs((prev) => [
      ...prev,
      {
        title: `${initialTabMetadata.title} ${prev.length + 1}`,
        classname: initialTabMetadata.classname,
      },
    ]);
    setValues((prev) => [...prev, {}]);
  };
  const removeTab = (index: number) => {
    const newTabs = [...tabs];
    newTabs.splice(index, 1);
    setTabs(newTabs);
    const newValues = [...values];
    newValues.splice(index, 1);
    setValues(newValues);
  };
  const handleFieldChange = (index: number, field: string, value: any) => {
    setValues((prev) => {
      const newVals = [...prev];
      newVals[index] = { ...newVals[index], [field]: value };
      return newVals;
    });
  };
  useEffect(() => {
    setFormData({
      ...formData,
      [formKey]: tabs.map((tab, index) => ({
        title: tab.title,
        content: renderTabForm(
          index,
          (field, value) => handleFieldChange(index, field, value),
          values[index],
          removeTab,
        ),
        classname: tab.classname,
        values: values[index] || {},
      })),
    });
  }, [tabs, values]);
  const computedTabs: TabItem[] = tabs.map((tab, index) => ({
    title: tab.title,
    content: renderTabForm(
      index,
      (field, value) => handleFieldChange(index, field, value),
      values[index],
      removeTab,
    ),
    classname: tab.classname,
    isButtonTab: false,
  }));
  const addTabButton: TabItem = {
    title: "",
    content: (
      <button onClick={addNewTab}>
        {addButtonLabel} <FontAwesomeIcon icon={faPlus} />
      </button>
    ),
    isButtonTab: true,
    onClick: addNewTab,
    icon: faPlus,
    classname: initialTabMetadata.classname,
  };
  return (
    <div>
      <CustomTabs tabs={[...computedTabs, addTabButton]} />
    </div>
  );
};

export default DynamicTabsManager;
