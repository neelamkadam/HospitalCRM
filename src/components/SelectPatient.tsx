import React, { useEffect, useState } from "react";
import AppButton from "./AppButton";
import Select from "react-select";
import { Plus, Search } from "lucide-react";
import API_CONSTANTS from "../constants/apiConstants";
import { useGetApi } from "../services/use-api";
import AppModal from "./AppModal";
import AddPatient from "../pages/Patients/AddPatient";

interface SelectPatientProps {
  onSelectPatient: (patientId: { value: string; label: string } | null) => void;
}

const SelectPatient: React.FC<SelectPatientProps> = ({ onSelectPatient }) => {
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [patientList, setPatientList] = useState([]);
  const { getData: GetPatientList } = useGetApi<any>("");
  const [isModalOpenAddPatient, setsetIsModalOpenAddPatient] = useState(false);

  useEffect(() => {
    fetchPatient();
  }, [isModalOpenAddPatient]);

  const fetchPatient = async () => {
    try {
      const response: any = await GetPatientList(
        `${API_CONSTANTS.GET_ALL_PATIENTS_WITH_ID}`
      );
      if (response.data.success) {
        const transformedData = response.data.data.clients.map((item: any) => ({
          label: item.name,
          value: item._id,
        }));
        setPatientList(transformedData);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  const handleSelectChange = (option: { value: string; label: string }) => {
    setSelectedOption(option);
  };

  const CustomSingleValue = ({ data }: any) => {
    return (
      <div className="flex items-center gap-2 mt-[-22px]">
        <Search className="w-5 h-5 text-gray-500" />
        <span className="text-[16px]">{data.label}</span>
      </div>
    );
  };

  const CustomPlaceholder = () => {
    return (
      <div className="flex items-center gap-2 text-[#526279] mt-[-22px]">
        <Search className="w-5 h-5 text-gray-500" />
        <span className="text-[16px]">Search Patient Name</span>
      </div>
    );
  };

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "#fff",
      border: state.isFocused ? "1px solid #016B83" : "1px solid #A0AEC0",
      boxShadow: state.isFocused
        ? "0px 0px 0px 4px #016B833D, 0px 1px 2px 0px #4E4E4E0D"
        : "none",
      padding: "0px 0px 0px 12px",
      borderRadius: "0.375rem",
      width: "100%",
      color: "#526279",
      fontSize: "0.875rem",
      fontWeight: "400",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      minHeight: "auto",
      transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        border: "1px solid #A0AEC0",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "#E5ECED",
      borderRadius: "0.375rem",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#E5ECED"
        : state.isFocused
        ? "#E5ECED"
        : "#fff",
      color: state.isSelected ? "#01576A" : "#526279",
      padding: "0.75rem",
      fontSize: "1rem",
      textAlign: "left",
      transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#526279",
      fontSize: "0.875rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      minHeight: "auto",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "0",
    }),
    input: (provided: any) => ({
      ...provided,
      margin: "0",
      padding: "0",
    }),
  };

  const toggleCloseAddPatient = () => {
    setsetIsModalOpenAddPatient((prev) => !prev);
  };

  return (
    <div className="space-y-2 text-[#1A2435] font-bolder text-[16px]">
      <p className="text-xl text-[#1A2435] font-medium px-6 py-4 border-b text-left">
        Select Patient
      </p>
      <div
        className="hover:underline cursor-pointer float-end pb-2 pr-7"
        onClick={() => toggleCloseAddPatient()}
      >
        <p className="font-medium text-lg text-[#01576A] flex items-center">
          <span className="mr-1">
            <Plus size={17} />
          </span>
          Add a Patient
        </p>
      </div>
      <div className="space-y-2 text-[#1A2435] font-bolder text-[16px] p-6">
        <div className="flex-grow">
          <Select
            value={selectedOption}
            onChange={handleSelectChange}
            options={patientList}
            styles={customStyles}
            className="search-patient"
            components={{
              SingleValue: CustomSingleValue,
              Placeholder: CustomPlaceholder,
            }}
            isSearchable={true}
            isClearable={true}
            placeholder="Search Patient Name"
          />
        </div>
        <div className="mt-auto">
          <AppButton
            disable={selectedOption != null ? false : true}
            onClick={() => onSelectPatient(selectedOption)}
            className="w-full"
          >
            Confirm
          </AppButton>
        </div>
      </div>
      <AppModal
        isOpen={isModalOpenAddPatient}
        toggle={toggleCloseAddPatient}
        title=""
      >
        <AddPatient
          toggleClose={toggleCloseAddPatient}
          setNewPatient={(patient: any) => {
            setSelectedOption(patient);
          }}
        />
      </AppModal>
    </div>
  );
};

export default SelectPatient;
