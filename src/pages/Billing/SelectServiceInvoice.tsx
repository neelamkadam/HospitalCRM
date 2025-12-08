import React, { useEffect, useRef } from "react";
import Select from "react-select";
import CustomSingleValue from "../../components/CustomSingleValue";
import AppButton from "../../components/AppButton";
import { customSelectStyles } from "../../utils/common-utils";
import { Search, Trash2 } from "lucide-react";
import API_CONSTANTS from "../../constants/apiConstants";
import { deleteService } from "../../services/use-api";
import { useAppSelector } from "../../redux/store";

// ✅ Define the shape of your service option
interface ServiceOption {
  value: string | null;
  label: string | null;
  price?: number; // Add price property
  tax?: number;
  _id?: string;
}

// ✅ Define props expected by the component
interface SelectServiceInvoiceProps {
  servicesList: any[]; // Raw service data from API
  onChange: (option: ServiceOption | null) => void;
  value: ServiceOption;
  close: (value: boolean) => void;
  submit: () => void;
  onServiceDelete: (deletedId: string) => void;
  fetchData: () => void;
  isOpen: boolean;
}

const CustomPlaceholder = () => (
  <div className="flex items-center gap-2 text-[#526279] mt-[-22px]">
    <Search className="w-5 h-5 text-gray-500" />
    <span className="text-[17px]">Search Services</span>
  </div>
);

const CustomOption = (props: any) => {
  const { data, innerProps, onDelete } = props;
  const { userData } = useAppSelector((state: any) => state.authData);
  const permissions = userData.permissions;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(data);
    }
  };

  return (
    <div
      {...innerProps}
      className="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
    >
      <span className="text-gray-800">{data.label}</span>
      {(permissions.includes("full_billing") ||
        permissions.includes("admin")) && (
        <button
          type="button"
          onClick={handleDelete}
          className="p-1 rounded hover:text-red-500"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export const SelectServiceInvoice: React.FC<SelectServiceInvoiceProps> = ({
  servicesList,
  value,
  onChange,
  close,
  submit,
  onServiceDelete,
  fetchData,
  isOpen,
}) => {
  const selectRef = useRef<any>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const adminPage = window.location.href.includes("create-admin-invoice");

  // Create options directly from servicesList
  const serviceOptions = servicesList.map((service) => ({
    label: service.name,
    value: service.name,
    price: service.price,
    tax: service.tax,
    _id: service._id,
  }));

  useEffect(() => {
    channelRef.current = new BroadcastChannel("services_channel");
    channelRef.current.onmessage = (event) => {
      if (event.data === "servicesUpdated") {
        fetchData();
      }
    };
    return () => {
      channelRef.current?.close();
    };
  }, [fetchData]);

  // ✅ Fetch services whenever modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
      onChange({ value: null, label: null }); // reset selection when modal opens
    }
  }, [isOpen]);

  const handleServiceChange = (selectedOption: ServiceOption | null) => {
    onChange(selectedOption);
  };

  const handleDeleteService = async (service: ServiceOption) => {
    const result = await deleteService(
      adminPage
        ? `${API_CONSTANTS.ADMIN.DELETE_SERVICES}/${service._id}`
        : `${API_CONSTANTS.BILLINGS.SERVICE}/${service._id}`
    );
    if (result.success) {
      onServiceDelete(service._id!);
      fetchData();
      channelRef.current?.postMessage("servicesUpdated");
    }
  };

  const handleSubmit = () => {
    if (value?.value) {
      submit();
    }
  };

  // Handle cancel - close modal and reset selection
  const handleCancel = () => {
    onChange({ value: null, label: null }); // Reset selection
    close(false); // Close modal
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="text-xl text-[#1A2435] font-medium px-6 py-3 text-left">
        Select Service
      </div>
      <div className="w-full px-6 pb-6">
        <div
          className="border px-2 py-1 rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279] h-[46px]"
          onClick={(e) => e.stopPropagation()}
        >
          <Select
            ref={selectRef}
            value={value && value.value ? value : null}
            onChange={handleServiceChange}
            options={serviceOptions}
            className="search-patient"
            components={{
              SingleValue: CustomSingleValue,
              Placeholder: CustomPlaceholder,
              Option: (props) => (
                <CustomOption {...props} onDelete={handleDeleteService} />
              ),
            }}
            isSearchable={true}
            isClearable={true}
            placeholder="Search and select a service..."
            closeMenuOnSelect={true}
            blurInputOnSelect={true}
            openMenuOnClick={true}
            openMenuOnFocus={false}
            autoFocus={false}
            styles={{
              ...customSelectStyles,
              control: (base) => ({
                ...base,
                border: "none",
                boxShadow: "none",
                fontSize: "16px",
                backgroundColor: "transparent",
              }),
              singleValue: (base) => ({
                ...base,
                color: "#000000 !important",
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
              menuList: (base) => ({
                ...base,
                maxHeight: "100px",
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "#e5e5e5 #ffffff",
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#ffffff",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#e5e5e5",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "#d4d4d4",
                },
              }),
            }}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-around mt-6">
          <AppButton
            label="Cancel"
            className="mt-[10px] text-base w-full sm:flex-1 !bg-[#f3f4f6] !text-gray-900"
            onClick={handleCancel}
          />
          <AppButton
            label="Add Service"
            onClick={handleSubmit}
            loaddingClass="flex"
            className="mt-[10px] text-base w-full sm:flex-1"
            disable={!value || !value.value}
          />
        </div>
      </div>
    </div>
  );
};

export default SelectServiceInvoice;
