import DynamicTabsManager from "../dynamicTabsManager/dynamicTabsManager";
import tabForm from "./components/tabForm";

interface ImportsTabProps {
  formData: any;
  setFormData: (formData: any) => void;
}

const ImportsTab = (props: ImportsTabProps) => {
  const { formData, setFormData } = props;
  return (
    <div className="formTab importsTab">
      <DynamicTabsManager
        key="imports"
        formData={formData}
        setFormData={setFormData}
        formKey="imports"
        initialTabMetadata={{
          title: "Importado",
          classname: "importsItems__customTab",
        }}
        renderTabForm={(index, onFieldChange, values, removeTab) =>
          tabForm(index, onFieldChange, values, index, removeTab)
        }
        addButtonLabel="Agregar Importado"
      />
    </div>
  );
};
export default ImportsTab;
