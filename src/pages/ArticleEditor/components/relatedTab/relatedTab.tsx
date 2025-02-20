import { faPlus, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomTabs, { TabItem } from "components/customTabs/customTabs";
import { useEffect, useState } from "react";
import tabForm from "./components/tabForm";
import "./relatedTab.scss";

interface RelatedTabProps {
  formData: any;
  setFormData: (formData: any) => void;
}

interface RelatedTabData {
  title: string;
  classname: string;
  isButtonTab?: boolean;
}

const RelatedTab = (props: RelatedTabProps) => {
  const { formData, setFormData } = props;
  const initialTabs: RelatedTabData[] =
    formData.related &&
    Array.isArray(formData.related) &&
    formData.related.length > 0
      ? formData.related.map((tab: any, index: number) => ({
          title: tab.title || `Relacionado ${index + 1}`,
          classname: tab.classname || "relatedItems__customTab",
        }))
      : [{ title: "Relacionado 1", classname: "relatedItems__customTab" }];

  const initialValues: any[] =
    formData.related &&
    Array.isArray(formData.related) &&
    formData.related.length > 0
      ? formData.related.map((tab: any) => tab.values || {})
      : [{}];

  const [relatedTabs, setRelatedTabs] = useState<RelatedTabData[]>(initialTabs);
  const [relatedValues, setRelatedValues] = useState<any[]>(initialValues);

  const addNewTab = () => {
    setRelatedTabs((prev) => [
      ...prev,
      {
        title: `Relacionado ${prev.length + 1}`,
        classname: "relatedItems__customTab",
      },
    ]);
    setRelatedValues((prev) => [...prev, {}]);
  };

  const removeTab = (index: number) => {
    const newRelatedTabs = [...relatedTabs];
    newRelatedTabs.splice(index, 1);
    setRelatedTabs(newRelatedTabs);
    const newRelatedValues = [...relatedValues];
    newRelatedValues.splice(index, 1);
    setRelatedValues(newRelatedValues);
  };

  const handleTabFieldChange = (index: number, field: string, value: any) => {
    setRelatedValues((prev) => {
      const newValues = [...prev];
      newValues[index] = { ...newValues[index], [field]: value };
      return newValues;
    });
  };

  useEffect(() => {
    setFormData({
      ...formData,
      related: relatedTabs.map((tab, index) => ({
        title: tab.title,
        content: tabForm(
          index,
          (field: string, value: any) =>
            handleTabFieldChange(index, field, value),
          relatedValues[index],
          index,
          removeTab,
        ),
        classname: tab.classname,
        values: relatedValues[index] || {},
      })),
    });
  }, [relatedTabs, relatedValues]);

  const computedTabs: TabItem[] = relatedTabs.map((tab, index) => ({
    title: tab.title,
    content: tabForm(
      index,
      (field: string, value: any) => handleTabFieldChange(index, field, value),
      relatedValues[index],
      index,
      removeTab,
    ),
    classname: tab.classname,
    isButtonTab: false,
  }));

  const addTabButton: TabItem = {
    title: "",
    content: <button onClick={addNewTab}>Agregar Relacionado</button>,
    icon: faPlus,
    classname: "relatedItems__customTab",
    isButtonTab: true,
    onClick: addNewTab,
  };

  return (
    <div className="formTab relatedTab">
      <CustomTabs
        tabs={[...computedTabs, addTabButton]}
        classname="relatedItems"
      />
    </div>
  );
};

export default RelatedTab;
