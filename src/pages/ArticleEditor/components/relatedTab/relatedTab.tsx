import tabForm from "./components/tabForm";
import DynamicTabsManager from "../dynamicTabsManager/dynamicTabsManager";
import "./relatedTab.scss";

interface RelatedTabProps {
  formData: any;
  setFormData: (formData: any) => void;
}

const RelatedTab = (props: RelatedTabProps) => {
  const { formData, setFormData } = props;
  return (
    <div className="formTab relatedTab">
      <DynamicTabsManager
        formData={formData}
        setFormData={setFormData}
        formKey="related"
        initialTabMetadata={{
          title: "Relacionado",
          classname: "relatedItems__customTab",
        }}
        renderTabForm={(index, onFieldChange, values, removeTab) =>
          tabForm(index, onFieldChange, values, index, removeTab)
        }
        addButtonLabel="Agregar Relacionado"
      />
    </div>
  );
};

export default RelatedTab;
