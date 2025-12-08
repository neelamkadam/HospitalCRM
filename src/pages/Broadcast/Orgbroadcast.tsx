import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
} from "@tanstack/react-table";
import { ColumnDef, useReactTable } from "@tanstack/react-table";
import React, { useEffect, useRef, useState } from "react";
import { useSidebar } from "../../components/ui/sidebar";
import API_CONSTANTS from "../../constants/apiConstants";
import { deleteApiKey, useGetApi, usePostApi } from "../../services/use-api";
import AppInputField from "../../components/AppInput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { broadcastBulkSend } from "../../utils/validationSchems";
import AppButton from "../../components/AppButton";
import EditorInput from "../../components/EditorInput";
import { AuthBroadcastBulkSend } from "../../types/response.types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { setOrgnazationSearch } from "../../redux/GlobalSearch";
import {
  setSelectedRows,
  addSelectedRow,
  removeSelectedRow,
  clearSelectedRows,
} from "../../redux/broadcastSlice";
import {
  ArrowLeft,
  UsersRound,
  Stethoscope,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
} from "lucide-react";
import { Form } from "../../components/form";
import { customSelectStyles } from "../../utils/common-utils";
import Select from "react-select";
import { ROUTES } from "../../constants/routesConstants";
import { useNavigate, useSearchParams } from "react-router-dom";

const CustomOption = (props: any) => {
  const { data, innerRef, innerProps } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer"
      style={{
        backgroundColor: props.isFocused ? "#f3f4f6" : "transparent",
      }}
    >
      <span className="text-sm text-gray-700">{data.label}</span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Delete button clicked for:", data.value);
          if (props.handleDeleteBroadcastOption) {
            props.handleDeleteBroadcastOption(data.value);
          }
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="ml-2 p-1 rounded-full "
        title="Delete this option"
      >
        <Trash2 size={14} strokeWidth={2} color="#EF4444" />
      </button>
    </div>
  );
};

export interface broadcastSend {
  subject: string;
  email: string;
  message: string;
  type: string;
}

export const Icons = {
  UsersRound: UsersRound,
  Stethoscope: Stethoscope,
  ShieldCheck: ShieldCheck,
};

const Orgbroadcast: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const [scrollPosition, setScrollPosition] = useState(0);
  const { state } = useSidebar();
  const [pagination, setPagination] = useState<any>({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [organizationData, setOrganizationData] = useState<any>([]);
  const [patientData, setPatientData] = useState<any>([]);
  const [doctorData, setDoctorData] = useState<any>([]);
  const { selectedRows: selectedRowsArray } = useSelector(
    (state: any) => state.broadcast
  );
  const selectedRows = new Set(selectedRowsArray);
  const [selectAll, setSelectAll] = useState(false);
  const { OrgnazationSearch } = useSelector((state: any) => state.searchData);
  const [orgSelect, setOrgSElect] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<any>(tab);
  const [broadcastTypeInput, setBroadcastTypeInput] = useState<string>("");
  const [selectedBroadcastType, setSelectedBroadcastType] = useState<any>(null);
  const [broadcastTypeOptions, setBroadcastTypeOptions] = useState([]);

  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const { postData: broadcastBulkSendPost, isLoading: loading } =
    usePostApi<AuthBroadcastBulkSend>({
      path: API_CONSTANTS.ADMIN.POST_BROADCAST_BULK_SEND,
    });

  const { getData: GetOrganizationApi, isLoading: orgLoading } =
    useGetApi<any>("");
  const { getData: GetDoctorApi, isLoading: doctorLoading } =
    useGetApi<any>("");
  const { getData: GetPatientApi, isLoading: patientLoading } =
    useGetApi<any>("");
  const { getData: GetBroadcastTypeApi } = useGetApi<any>("");

  const { postData: PostBroadcastTypeApi } = usePostApi<any>({
    path: API_CONSTANTS.ADMIN.CREATE_BROADCAST_TYPE,
  });

  const showSuccessToast = (message: string) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const fetchOrganizationData = async () => {
    try {
      const organizationRes = await GetOrganizationApi(
        `${API_CONSTANTS.ADMIN.GET_ORGANIZATION}`
      );
      if (organizationRes?.status === 200) {
        const transformedData =
          organizationRes?.data?.organizations?.map((org: any) => ({
            label: org.organizationName,
            value: org._id,
            ...org,
          })) || [];

        setOrganizationData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
    }
  };

  const fetchPatientData = async () => {
    try {
      const patientRes = await GetPatientApi(
        `${API_CONSTANTS.ADMIN.GET_PATIENT_DATA}`
      );
      if (patientRes?.status === 200) {
        const transformedData =
          patientRes?.data?.clients?.map((client: any) => ({
            label: client.name,
            value: client._id,
            ...client,
          })) || [];

        setPatientData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
    }
  };

  const fetchDoctorData = async () => {
    try {
      const doctorRes = await GetDoctorApi(
        `${API_CONSTANTS.ADMIN.GET_DOCTOR_DATA}`
      );
      if (doctorRes?.status === 200) {
        const transformedData =
          doctorRes?.data?.users?.map((org: any) => ({
            label: org.name,
            value: org._id,
            ...org,
          })) || [];

        setDoctorData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
    }
  };

  useEffect(() => {
    if (selectedOption === "organization") {
      fetchOrganizationData();
    } else if (selectedOption === "patient") {
      fetchPatientData();
    } else if (selectedOption === "doctor") {
      fetchDoctorData();
    } else {
      setOrganizationData([]);
    }
  }, [selectedOption]);

  const fetchBroadcastTypeData = async () => {
    try {
      const broadcastTypeRes = await GetBroadcastTypeApi(
        `${API_CONSTANTS.ADMIN.GET_BROADCAST_TYPE}`
      );
      if (broadcastTypeRes?.status === 200) {
        const transformedData =
          broadcastTypeRes?.data?.data?.map((type: any) => ({
            label: type.name,
            value: type._id,
            ...type,
          })) || [];

        setBroadcastTypeOptions(transformedData);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
    }
  };

  useEffect(() => {
    fetchBroadcastTypeData();
  }, []);

  useEffect(() => {
    return () => {
      dispatch(clearSelectedRows());
    };
  }, [dispatch]);

  const handleRowSelect = (email: string) => {
    if (selectedRows.has(email)) {
      dispatch(removeSelectedRow(email));
    } else {
      dispatch(addSelectedRow(email));
    }
  };

  const filteredOrganizationData = React.useMemo(() => {
    if (!OrgnazationSearch || OrgnazationSearch.trim() === "") {
      return organizationData;
    }

    const searchTerm = OrgnazationSearch.toLowerCase();
    return organizationData.filter((org: any) => {
      const orgName = (org.organizationName || "").toLowerCase();
      const email = (org.email || "").toLowerCase();

      return orgName.includes(searchTerm) || email.includes(searchTerm);
    });
  }, [organizationData, OrgnazationSearch]);

  const filteredPatientData = React.useMemo(() => {
    if (!OrgnazationSearch || OrgnazationSearch.trim() === "") {
      return patientData;
    }

    const searchTerm = OrgnazationSearch.toLowerCase();
    return patientData.filter((patient: any) => {
      const patientName = (patient.name || "").toLowerCase();
      const email = (patient.email || "").toLowerCase();

      return patientName.includes(searchTerm) || email.includes(searchTerm);
    });
  }, [patientData, OrgnazationSearch]);

  const filteredDoctorData = React.useMemo(() => {
    if (!OrgnazationSearch || OrgnazationSearch.trim() === "") {
      return doctorData;
    }

    const searchTerm = OrgnazationSearch.toLowerCase();
    return doctorData.filter((doctor: any) => {
      const doctorName = (doctor.name || "").toLowerCase();
      const email = (doctor.email || "").toLowerCase();

      return doctorName.includes(searchTerm) || email.includes(searchTerm);
    });
  }, [doctorData, OrgnazationSearch]);

  const handleSelectAll = () => {
    if (selectAll) {
      dispatch(clearSelectedRows());
    } else {
      const allEmails = getCurrentData()
        .map((item: any) => item.email)
        .filter(Boolean);
      dispatch(setSelectedRows(allEmails));
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    const currentData = getCurrentData();
    if (currentData.length > 0) {
      const allEmails = currentData
        .map((item: any) => item.email)
        .filter(Boolean);
      const allSelected =
        allEmails.length > 0 &&
        allEmails.every((email: any) => selectedRows.has(email));
      setSelectAll(allSelected);
    }
  }, [
    selectedRows,
    filteredOrganizationData,
    filteredPatientData,
    filteredDoctorData,
    selectedOption,
  ]);

  const columns = React.useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        header: () => (
          <div className="flex items-center ml-5">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-4 h-4 accent-medistryColor bg-gray-100 border-gray-300  focus:ring-medistryColor focus:ring-2"
            />
            <p className="pl-2 font-regular text-sm text-[#8C929A]">
              Select All
            </p>
          </div>
        ),
        id: "select",
        enableSorting: false,
        cell: ({ row }: any) => {
          const email = row.original.email;
          return (
            <div className="flex items-center ml-5">
              <input
                type="checkbox"
                checked={selectedRows.has(email)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleRowSelect(email);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 accent-medistryColor bg-gray-100 border-gray-300  focus:ring-medistryColor focus:ring-2"
              />
            </div>
          );
        },
        size: 50,
      },
      {
        header: "Organization Name",
        id: "organizationName",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.organizationName,
        cell: ({ row }: any) => {
          const email = row.original.email;
          const isSelected = selectedRows.has(email);
          return (
            <div className="flex">
              <span
                className={`text-[14px] font-regular truncate text-sm mt-1 ${
                  isSelected ? "text-medistryColor" : "text-[#8C929A]"
                }`}
              >
                {row?.original?.organizationName || "N/A"}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Email ID",
        id: "email",
        enableSorting: false,
        accessorFn: (row) => row?.email,
        cell: ({ row }: any) => {
          const email = row.original.email;
          const isSelected = selectedRows.has(email);
          return (
            <div className="flex">
              <span
                className={`text-[14px] font-regular truncate text-sm mt-1 ${
                  isSelected ? "text-medistryColor" : "text-[#8C929A]"
                }`}
              >
                {email || ""}
              </span>
            </div>
          );
        },
        size: 300,
      },
    ];
    return baseColumns;
  }, [selectAll, selectedRows, OrgnazationSearch]);

  const patientcolumns = React.useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        header: () => (
          <div className="flex items-center ml-5">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-4 h-4 accent-medistryColor bg-gray-100 border-gray-300  focus:ring-medistryColor focus:ring-2"
            />
            <p className="pl-2 font-regular text-sm text-[#8C929A]">
              Select All
            </p>
          </div>
        ),
        id: "select",
        enableSorting: false,
        cell: ({ row }: any) => {
          const email = row.original.email;
          return (
            <div className="flex items-center ml-5">
              <input
                type="checkbox"
                checked={selectedRows.has(email)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleRowSelect(email);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 accent-medistryColor bg-gray-100 border-gray-300  focus:ring-medistryColor focus:ring-2"
              />
            </div>
          );
        },
        size: 50,
      },
      {
        header: "Patient Name",
        id: "name",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.name,
        cell: ({ row }: any) => {
          const email = row.original.email;
          const isSelected = selectedRows.has(email);
          return (
            <div className="flex">
              <span
                className={`text-[14px] font-regular truncate text-sm mt-1 ${
                  isSelected ? "text-medistryColor" : "text-[#8C929A]"
                }`}
              >
                {row?.original?.name || "N/A"}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Email ID",
        id: "email",
        enableSorting: false,
        accessorFn: (row) => row?.email,
        cell: ({ row }: any) => {
          const email = row.original.email;
          const isSelected = selectedRows.has(email);
          return (
            <div className="flex">
              <span
                className={`text-[14px] font-regular truncate text-sm mt-1 ${
                  isSelected ? "text-medistryColor" : "text-[#8C929A]"
                }`}
              >
                {email || ""}
              </span>
            </div>
          );
        },
        size: 300,
      },
    ];
    return baseColumns;
  }, [selectAll, selectedRows, OrgnazationSearch]);

  const doctorcolumns = React.useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        header: () => (
          <div className="flex items-center ml-5">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-4 h-4 accent-medistryColor bg-gray-100 border-gray-300  focus:ring-medistryColor focus:ring-2"
            />
            <p className="pl-2 font-regular text-sm text-[#8C929A]">
              Select All
            </p>
          </div>
        ),
        id: "select",
        enableSorting: false,
        cell: ({ row }: any) => {
          const email = row.original.email;
          return (
            <div className="flex items-center ml-5">
              <input
                type="checkbox"
                checked={selectedRows.has(email)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleRowSelect(email);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 accent-medistryColor bg-gray-100 border-gray-300  focus:ring-medistryColor focus:ring-2"
              />
            </div>
          );
        },
        size: 50,
      },
      {
        header: "Doctor Name",
        id: "name",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.name,
        cell: ({ row }: any) => {
          const email = row.original.email;
          const isSelected = selectedRows.has(email);
          return (
            <div className="flex">
              <span
                className={`text-[14px] font-regular truncate text-sm mt-1 ${
                  isSelected ? "text-medistryColor" : "text-[#8C929A]"
                }`}
              >
                {row?.original?.name || "N/A"}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Email ID",
        id: "email",
        enableSorting: false,
        accessorFn: (row) => row?.email,
        cell: ({ row }: any) => {
          const email = row.original.email;
          const isSelected = selectedRows.has(email);
          return (
            <div className="flex">
              <span
                className={`text-[14px] font-regular truncate text-sm mt-1 ${
                  isSelected ? "text-medistryColor" : "text-[#8C929A]"
                }`}
              >
                {email || ""}
              </span>
            </div>
          );
        },
        size: 300,
      },
    ];
    return baseColumns;
  }, [selectAll, selectedRows, OrgnazationSearch]);

  const getCurrentData = () => {
    if (selectedOption === "organization") return filteredOrganizationData;
    if (selectedOption === "patient") return filteredPatientData;
    if (selectedOption === "doctor") return filteredDoctorData;
    return [];
  };

  const table = useReactTable({
    data: getCurrentData(),
    columns:
      selectedOption === "organization"
        ? columns
        : selectedOption === "patient"
        ? patientcolumns
        : doctorcolumns,
    rowCount: getCurrentData().length,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updatedSorting) => {
      setSorting(updatedSorting);
    },
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (container && scrollPosition > 0) {
      container.scrollTop = scrollPosition;
      setScrollPosition(0);
    }
  }, [organizationData, scrollPosition]);

  const form = useForm<broadcastSend>({
    resolver: yupResolver(broadcastBulkSend()) as any,
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: broadcastSend) => {
    try {
      const selectedEmails = Array.from(selectedRows);

      const payload = {
        ...data,
        type: selectedBroadcastType?.name || "",
        emails: selectedEmails,
      };

      const resData: any = await broadcastBulkSendPost(payload);

      if (resData?.data.success) {
        showSuccessToast(
          `Broadcast sent successfully to ${selectedEmails.length} organizations!`
        );
        form.reset();
        dispatch(clearSelectedRows());
        setSelectAll(false);
        setSelectedBroadcastType(null);
      } else {
        console.log(resData?.message || "Failed to send broadcast");
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
    }
  };

  const handleAddBroadcastType = async () => {
    if (broadcastTypeInput.trim()) {
      const newType = {
        value: broadcastTypeInput.trim().toLowerCase(),
        label: broadcastTypeInput.trim(),
      };

      const exists = broadcastTypeOptions.some(
        (option: { value: string; label: string }) =>
          option.value === newType.value
      );

      if (!exists) {
        try {
          const payload = {
            name: broadcastTypeInput.trim(),
          };

          const response = await PostBroadcastTypeApi(payload);

          if (response?.status === 200 || response?.status === 201) {
            await fetchBroadcastTypeData();
            const createdType = {
              value: response?.data?.data?._id || newType.value,
              label: broadcastTypeInput.trim(),
            };
            setSelectedBroadcastType(createdType);
          } else {
            console.error("Failed to create broadcast type:", response);
          }
        } catch (error) {
          console.error("Error creating broadcast type:", error);
        }
      } else {
        console.error("Broadcast type already exists");
      }

      setBroadcastTypeInput("");
      setMenuIsOpen(false);
    }
  };

  const handleDeleteBroadcastOption = async (typeToDelete: string) => {
    try {
      const response = await deleteApiKey(
        `${API_CONSTANTS.ADMIN.DELETE_BROADCAST_TYPE}${typeToDelete}`
      );
      if (response.success) {
        setBroadcastTypeOptions(
          broadcastTypeOptions.filter(
            (option: { value: string; label: string }) =>
              option.value !== typeToDelete
          )
        );
      }
    } catch (error) {
      console.error("Error deleting broadcast type:", error);
    }
  };

  const selectData = [
    { value: "organization", label: "Organization" },
    { value: "doctor", label: "Doctor" },
    { value: "patient", label: "Patient" },
  ];

  const handleSelectChange = (
    option: { value: string; label: string } | null
  ) => {
    dispatch(setOrgnazationSearch(""));
    navigate(`${ROUTES.ORGBROADCAST}?tab=${option?.value}`, {
      replace: true,
    });
    setSelectedOption(option?.value || "organization");
    dispatch(clearSelectedRows());
    setSelectAll(false);
  };

  const handleBroadcastTypeChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedBroadcastType(option);
  };
  const CustomPlaceholder = () => {
    return (
      <div className="flex items-center gap-2 text-[#526279] mt-[-22px]">
        <Search className="w-5 h-5 text-gray-500" />
        <span className="text-[16px]">Select</span>
      </div>
    );
  };

  const CustomPlaceholderForBroadcastType = () => {
    return (
      <div className="flex items-center gap-2 text-[#ADB1B7] mt-[-26px]">
        <Search className="w-5 h-5 text-[#ADB1B7]" />
        <span className="text-[17px]">Select Broadcast Type</span>
      </div>
    );
  };
  const CustomSingleValue = ({ data }: any) => {
    return (
      <div className="flex items-center gap-2 mt-[-22px]">
        <Search className="w-5 h-5 text-gray-500" />
        <span className="font-medium text-[17px]">{data.label}</span>
      </div>
    );
  };

  return (
    <>
      {!orgSelect && (
        <div
          className=" !bg-[#F5F6F6]"
          style={{ marginLeft: state == "collapsed" ? "28px" : "" }}
        >
          <header className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 !mt-0">
            <div className="flex items-center gap-2 w-[90%] sm:w-auto">
              <AppButton
                onClick={() => navigate(ROUTES.Organization)}
                className="py-3 rounded-[30px] w-[50px] sm:w-[130px] h-[40px] !bg-white !text-[#293343] border-none flex items-center justify-center text-sm mt-[16px] ml-0 sm:ml-[8px] md:ml-[16px]"
              >
                <ArrowLeft className="w-7 h-7" />
                <span className="hidden sm:inline ml-1">Back</span>
              </AppButton>
              <Select
                value={selectData.find(
                  (option) => option.value === selectedOption
                )}
                onChange={handleSelectChange}
                options={selectData}
                isSearchable={true}
                placeholder="Search and select a service..."
                closeMenuOnSelect={true}
                blurInputOnSelect={true}
                openMenuOnClick={true}
                openMenuOnFocus={false}
                autoFocus={false}
                styles={{
                  ...customSelectStyles,
                  control: (provided: any, state: any) => ({
                    ...provided,
                    backgroundColor: "#fff",
                    border: "none",
                    boxShadow: state.isFocused
                      ? "0px 0px 0px 4px #016B833D, 0px 1px 2px 0px #4E4E4E0D"
                      : "none",
                    padding: "2px 1px 0px 12px",
                    borderRadius: "0.375rem",
                    width: "100%",
                    color: "#526279",
                    fontSize: "0.875rem",
                    fontWeight: "400",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    minHeight: "auto",
                    transition:
                      "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      border: "none",
                    },
                  }),
                  singleValue: (base: any) => ({
                    ...base,
                    color: "#000000 !important",
                  }),
                  menu: (base: any) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                  menuList: (base: any) => ({
                    ...base,
                    maxHeight: "200px",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                  }),
                }}
                className="flex-1 sm:w-auto lg:w-[295px] mt-4 mx-0 sm:mx-4"
                components={{
                  SingleValue: CustomSingleValue,
                  Placeholder: CustomPlaceholder,
                }}
              />
            </div>
            <AppButton
              isLoading={loading}
              type="button"
              label="Continue"
              className="py-3 rounded-[30px] w-[90%] sm:w-[130px] h-[40px] flex items-center justify-center text-sm mt-4 mx-0 sm:mx-4"
              disable={selectedRows.size === 0}
              onClick={() => {
                if (selectedRows.size > 0) {
                  setOrgSElect(true);
                  navigate(
                    `${ROUTES.ORGBROADCAST}?tab=${selectedOption}&isSearchable=no`,
                    {
                      replace: true,
                    }
                  );
                }
              }}
            />
          </header>
          <div className="px-2 md:px-4">
            <div
              className="rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white overflow-y-auto overflow-x-auto md:overflow-x-visible scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white w-full"
              ref={tableContainerRef}
              style={{
                height: "calc(100vh - 158px)",
              }}
            >
              <table className="w-full text-left md:table-fixed">
                <thead className="sticky top-0 bg-white z-10 border-b">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-[#E6E6E8]">
                      {headerGroup.headers.map((header) => {
                        return (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            className="p-3 font-manrope text-base font-medium text-[#666D79]"
                            style={{ minWidth: header.id === 'select' ? '80px' : '200px' }}
                          >
                            {!header.isPlaceholder && (
                              <div
                                className={`flex items-center space-x-2 ${
                                  header.column.getCanSort()
                                    ? "cursor-pointer select-none"
                                    : ""
                                } ${header.id === "organization" ? "" : ""}  ${
                                  header.id === "View"
                                    ? "justify-center"
                                    : "justify-start"
                                } ${header.id === "role" ? "w-20" : ""}`}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {(
                    selectedOption === "organization"
                      ? orgLoading
                      : selectedOption === "patient"
                      ? patientLoading
                      : selectedOption === "doctor"
                      ? doctorLoading
                      : false
                  ) ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-gray-100 bg-[#f4f4f4]"
                      >
                        {table
                          .getVisibleLeafColumns()
                          .map((column, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-4 py-2"
                              style={{
                                width: `${column.getSize()}px`,
                                maxWidth: `${column.getSize()}px`,
                              }}
                            >
                              <div
                                className="h-4 rounded bg-gray-200"
                                style={{
                                  width: "80%",
                                  maxWidth: `${column.getSize() * 0.8}px`,
                                }}
                              ></div>
                            </td>
                          ))}
                      </tr>
                    ))
                  ) : getCurrentData().length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleRowSelect(row.original.email)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={`p-3 text-sm text-gray-600 ${
                              selectedOption === "patient"
                                ? "w-[123px]"
                                : "w-[130px]"
                            }`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={table.getHeaderGroups()[0].headers.length}
                        className="text-center py-4 text-gray-500 h-[20rem] flex-1 bg-[#ffffff]"
                      >
                        {selectedOption === "organization"
                          ? "No Organization to show"
                          : selectedOption === "patient"
                          ? "No Patient to show"
                          : "No Doctor to show"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {(selectedOption === "organization"
                ? orgLoading
                : selectedOption === "patient"
                ? patientLoading
                : selectedOption === "doctor"
                ? doctorLoading
                : false) &&
                getCurrentData()?.length > 0 && (
                  <div className="flex items-center justify-center py-4 space-x-2">
                    <span className="text-[#526279">
                      Loading{" "}
                      {selectedOption === "organization"
                        ? "Organization"
                        : selectedOption === "patient"
                        ? "Patient"
                        : "Doctor"}
                      ...
                    </span>
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {orgSelect && (
        <div
          className=" !bg-[#F5F6F6]"
          style={{ marginLeft: state == "collapsed" ? "28px" : "" }}
        >
          <div className="px-2 md:px-4 mt-4">
            <header className="mb-4 flex justify-between items-center -mt-10">
              <AppButton
                onClick={() => {
                  setOrgSElect(false);
                }}
                className="py-3 rounded-[30px] w-[130px] h-[40px] !bg-white !text-[#293343] border-none flex items-center justify-center pl-1 text-sm"
              >
                <ArrowLeft className="w-7 h-7" />
                Back
              </AppButton>
            </header>
            <div
              className="rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white p-4 w-full"
              style={{ height: "calc(100vh - 152px)" }}
            >
              <Form {...form}>
                <form
                  className="space-y-6 text-[#1A2435] font-bolder h-full"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="grid lg:grid-cols-2 sm:col-span-1 md:col-span-1 xl:grid-cols-2 2xl:grid-cols-2 gap-4 mb-1">
                    <div>
                      <AppInputField<broadcastSend>
                        name="subject"
                        form={form}
                        label="Subject"
                        placeholder="Please Enter Subject"
                        isRequired={true}
                        className="!mb-0 font-normal"
                      />
                    </div>
                    <div className="text-left relative">
                      <div className="flex space-x-1">
                        <label className="block text-sm font-medium text-[#1A2435] mb-1">
                          Broadcast Type
                        </label>
                        <div className="text-gray-500">*</div>
                      </div>
                      <Select
                        key={broadcastTypeOptions.length}
                        value={selectedBroadcastType}
                        onChange={handleBroadcastTypeChange}
                        options={broadcastTypeOptions}
                        isSearchable={true}
                        isClearable={true}
                        placeholder="Search and select a service..."
                        closeMenuOnSelect={true}
                        blurInputOnSelect={false}
                        openMenuOnClick={true}
                        openMenuOnFocus={false}
                        autoFocus={false}
                        inputValue={broadcastTypeInput}
                        onInputChange={(inputValue, actionMeta) => {
                          if (
                            actionMeta.action !== "input-blur" &&
                            actionMeta.action !== "menu-close"
                          ) {
                            setBroadcastTypeInput(inputValue);
                          }
                        }}
                        menuIsOpen={menuIsOpen}
                        onMenuOpen={() => setMenuIsOpen(true)}
                        onMenuClose={() => {
                          setMenuIsOpen(false);
                          setBroadcastTypeInput("");
                        }}
                        styles={{
                          ...customSelectStyles,
                          control: (provided: any, state: any) => ({
                            ...provided,
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            boxShadow: state.isFocused
                              ? "0px 0px 0px 2px , 0px 1px 2px 0px #526279"
                              : "none",
                            padding: "4px 3px 4px 12px",
                            borderRadius: "0.375rem",
                            width: "100%",
                            color: "#526279",
                            fontSize: "17px",
                            fontWeight: "400",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            minHeight: "auto",
                            transition:
                              "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                            "&:hover": {
                              border: "1px solid #E5E7EB",
                            },
                          }),
                          singleValue: (base: any) => ({
                            ...base,
                            color: "#000000 !important",
                          }),
                          menu: (base: any) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                          menuList: (base: any) => ({
                            ...base,
                            maxHeight: "150px",
                            overflowY: "auto",
                            scrollbarWidth: "thin",
                          }),
                        }}
                        className="w-full mt-1 !text-[#526279]"
                        components={{
                          SingleValue: CustomSingleValue,
                          Placeholder: CustomPlaceholderForBroadcastType,
                          Option: (props) => (
                            <CustomOption
                              {...props}
                              handleDeleteBroadcastOption={
                                handleDeleteBroadcastOption
                              }
                            />
                          ),
                        }}
                      />
                      {broadcastTypeInput && broadcastTypeInput.trim() && (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddBroadcastType();
                          }}
                          className="absolute right-12 top-[38px] w-6 h-6 flex items-center justify-center hover:text-white rounded-full  cursor-pointer"
                        >
                          <Plus size={20} strokeWidth={3} color="#01576A" />
                        </button>
                      )}
                    </div>
                    {/* <div className="mt-2">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Broadcast Type
                              <span className="text-gray-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={broadcastTypeOptions}
                                onValueChange={field.onChange}
                                defaultValue={
                                  Array.isArray(field.value) ? field.value : []
                                }
                                placeholder="Select broadcast type"
                                variant="secondary"
                                animationConfig={{
                                  badgeAnimation: "pulse",
                                  popoverAnimation: "fade",
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div> */}
                  </div>

                  <EditorInput
                    label="Message"
                    value={form.watch("message")}
                    onChange={(value) => form.setValue("message", value)}
                    placeholder="Enter your broadcast message"
                    isRequired={true}
                    error={!!form.formState.errors.message}
                    errorText="Broadcast message is required"
                    height="calc(100vh - 380px)"
                  />

                  <div className=" text-right">
                    <AppButton
                      isLoading={loading}
                      type="submit"
                      label="Broadcast"
                      className="mt-[-2px] text-base"
                      disable={
                        selectedRows.size === 0 ||
                        form.watch("subject")?.trim() === "" ||
                        form.watch("message")?.trim() === "" ||
                        !selectedBroadcastType
                      }
                    />
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orgbroadcast;
