import React, { useCallback, useEffect, useRef, useState } from "react";
import CustomSheet from "../../components/AppSheet";
import API_CONSTANTS from "../../constants/apiConstants.ts";
import { useGetApi, usePostApi } from "../../services/use-api.ts";
import { ROUTES } from "../../constants/routesConstants.ts";
import { useLocation, useNavigate } from "react-router-dom";
// import AppButton from "../../components/AppButton.tsx";
// import "./Shimmer.css";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  ChartNoAxesCombined,
  ChevronRight,
  EllipsisVertical,
  Megaphone,
  ReceiptText,
  // Plus,
} from "lucide-react";
import AppModal from "../../components/AppModal.tsx";
import { useSelector } from "react-redux";
import { useSidebar } from "../../components/ui/sidebar.tsx";
import socketService from "../../utils/socket";
import { useAppDispatch, useAppSelector } from "../../redux/store.ts";
import PatientsOverAllReportSidePannel from "../Patients/PatientsOverAllReportSidePannel";
import AddPatient from "../Patients/AddPatient";
import { Switch } from "../../components/ui/switch.tsx";
import clsx from "clsx";
import moment from "moment";
import { setOrgnazationSearch } from "../../redux/GlobalSearch.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu.tsx";
// import ChatBot from "../ChatBot/ChatBot.tsx";

const Organization: React.FC = () => {
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const { getData: GetOrganizationApi, isLoading: loading } =
    useGetApi<any>("");
  const [organizationList, setOrganizationList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { userData } = useAppSelector((state: any) => state.authData);
  const { state } = useSidebar();
  const toggleClose = () => {
    setIsModalOpen((prev) => !prev);
    // fetchReports();
  };
  // const { teamLogsSearch } = useSelector((state: any) => state.searchData);
  const [usersData, setUsersData] = useState<any>([]);
  const [clientsData, setClientsData] = useState<any>([]);
  const [activeTab, setActiveTab] = useState<
    "organization" | "users" | "clients"
  >("organization");
  const dispatch = useAppDispatch();
  const { OrgnazationSearch } = useSelector((state: any) => state.searchData);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const lastScrollTop = useRef(0);

  const updateOrganizationList = async (
    name: any,
    obj: any,
    checked: any,
    OrgnazationSearch: any,
    tab: any
  ) => {
    console.log("Updating organization list with:", OrgnazationSearch);
    const final = Object.keys(obj).reduce((acc, key) => {
      acc[key] = key === name ? checked : obj[key];
      return acc;
    }, {} as Record<string, any>);

    try {
      let response: any;
      console.log("response", response);

      if (tab === "users") {
        response = await postData(
          final,
          `${API_CONSTANTS.UPDATE_Doctors}/${obj._id}`
        );
        // if (response?.data.success && OrgnazationSearch !== null) {
        //     fetchReports({ apiType: "users", currentPageValue: currentPage, search: OrgnazationSearch });
        // }
        setUsersData((prev: any[]) => {
          return prev.map((item) => (item._id === final._id ? final : item));
        });
      } else if (tab === "clients") {
        setClientsData((prev: any[]) => {
          return prev.map((item) => (item._id === final._id ? final : item));
        });
        response = await postData(
          final,
          `${API_CONSTANTS.UPDATE_Patients}/${obj._id}`
        );
        // if (response?.data.success && OrgnazationSearch !== null) {
        //     fetchReports({ apiType: "clients", currentPageValue: currentPage, search: OrgnazationSearch });
        // }
      } else {
        setOrganizationList((prev: any[]) => {
          return prev.map((item) => (item._id === final._id ? final : item));
        });
        console.log(
          "organizationList",
          organizationList.map((item) =>
            item._id === final._id ? final : item
          )
        );
        // Fallback to organization update
        response = await postData(
          final,
          `${API_CONSTANTS.UPDATE_ORGANIZATION}/${obj._id}`
        );
        // if (response?.data.success && OrgnazationSearch !== null) {
        //     fetchReports({ apiType: "organization", currentPageValue: currentPage, search: OrgnazationSearch });
        // }
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      setHasMore(false);
    }
  };

  const { postData } = usePostApi<any>({
    path: API_CONSTANTS.UPDATE_ORGANIZATION,
  });
  const location = useLocation();

  useEffect(() => {
    if (location.search.includes("tab=doctor")) {
      setActiveTab("users");
    } else if (location.search.includes("tab=patient")) {
      setActiveTab("clients");
    } else {
      setActiveTab("organization");
    }
  }, [location.search]);

  const columns = React.useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        header: "Organization",
        id: "organization",
        enableSorting: false,
        // meta: {
        //     className: "hidden md:table-cell",
        // },
        accessorFn: (row) => row?.original?.organizationName,
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <span className="text-[14px] truncate text-sm font-medium text-[#1A2435]">
                {row?.original?.organizationName || "N/A"}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Admin Name",
        id: "doctorName",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.userDetails?.name, // assuming 'doctorName' exists on the row
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <span className="text-[14px] truncate text-sm font-medium text-[#1A2435] mt-1">
                {row?.original?.userDetails?.name || "N/A"}
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
        // meta: {
        //     className: "hidden md:table-cell",
        // },
        accessorFn: (row) => row?.userDetails?.email,
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] mt-1">
                {row?.original?.userDetails?.email || "N/A"}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Phone",
        id: "phone",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.phone,
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <span className="text-[14px] font-regular truncate text-sm text-[#8C929A]  mt-1">
                {row?.original?.phone || "N/A"}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Doctors",
        id: "userCount",
        enableSorting: true,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.userCount,
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] mt-1">
                {row?.original?.userCount || "0"}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Patients",
        id: "clientCount",
        enableSorting: true,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.clientCount, // assuming 'totalPatients' exists on the row
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] mt-1">
                {row?.original?.clientCount || "0"}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Reports",
        id: "reportCount",
        enableSorting: true,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.reportCount, // assuming 'reportsCreated' exists on the row
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <span className="text-[14px] font-regular truncate text-sm text-[#8C929A]  mt-1">
                {row?.original?.reportCount || "0"}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Status",
        id: "status",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.status,
        cell: ({ row }: any) => {
          const renewalDate = row?.original?.renewalDate;
          const today = new Date();
          let isActive = false;

          if (renewalDate) {
            const renewal = new Date(renewalDate);
            isActive =
              renewal.setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0);
          }
          return (
            <div className="flex">
              {/* <span
                                    className={`text-[14px] font-regular truncate mt-1 ${isActive ? "text-green-500" : "text-red-500"
                                        }`}
                                >
                                    {isActive ? "Paid" : "Expired"}
                                </span> */}
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {isActive ? "Paid" : "Expired"}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Enabled",
        id: "isActive",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.isActive,
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <Switch
                checked={row?.original?.isActive}
                onCheckedChange={(checked) => {
                  updateOrganizationList(
                    "isActive",
                    row?.original,
                    checked,
                    OrgnazationSearch,
                    "organization"
                  );
                }}
                className="mt-1 bg-[#01576A]"
              />
            </div>
          );
        },
        size: 300,
      },
      {
        header: "EMR Feature",
        id: "emrFeature",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.emrFeature, // assuming 'emrFeature' exists on the row
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <Switch
                checked={row?.original?.emrEnabled}
                onCheckedChange={(checked) => {
                  updateOrganizationList(
                    "emrEnabled",
                    row?.original,
                    checked,
                    OrgnazationSearch,
                    "organization"
                  );
                }}
                className=" mt-1"
              />
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Reports Creation",
        id: "reportsCreation",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.reportsCreation, // assuming 'reportsCreation' exists on the row
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <Switch
                checked={row?.original?.createReportEnabled}
                onCheckedChange={(checked) => {
                  // Handle the state change logic here, if needed.
                  // You can dispatch an action or update the state in your app.
                  updateOrganizationList(
                    "createReportEnabled",
                    row?.original,
                    checked,
                    OrgnazationSearch,
                    "organization"
                  );
                }}
                className=" mt-1"
              />
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Appointments Enabled",
        id: "appointmentsEnabled",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.appointmentsEnabled,
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <Switch
                checked={row?.original?.appointmentsEnabled}
                onCheckedChange={(checked) => {
                  updateOrganizationList(
                    "appointmentsEnabled",
                    row?.original,
                    checked,
                    OrgnazationSearch,
                    "organization"
                  );
                }}
                className="mt-1 bg-[#01576A]"
              />
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Billing Enabled",
        id: "billingEnabled",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.billingEnabled,
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <Switch
                checked={row?.original?.billingEnabled}
                onCheckedChange={(checked) => {
                  updateOrganizationList(
                    "billingEnabled",
                    row?.original,
                    checked,
                    OrgnazationSearch,
                    "organization"
                  );
                }}
                className="mt-1 bg-[#01576A]"
              />
            </div>
          );
        },
        size: 300,
      },
      {
        header: "OTP Verification",
        id: "otpVerification",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.otpVerification, // assuming 'otpVerification' exists on the row
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <Switch
                checked={!row?.original?.disableOtpVerification}
                onCheckedChange={(checked) => {
                  // Toggle the actual 'disableOtpVerification' value
                  const newValue = !checked;
                  updateOrganizationList(
                    "disableOtpVerification",
                    row?.original,
                    newValue,
                    OrgnazationSearch,
                    "organization"
                  );
                }}
                className="mt-1 bg-[#01576A]"
              />
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Multi-Device",
        id: "enableMultiDeviceLogin",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.enableMultiDeviceLogin, // assuming 'otpVerification' exists on the row
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <Switch
                checked={row?.original?.enableMultiDeviceLogin}
                onCheckedChange={(checked) => {
                  updateOrganizationList(
                    "enableMultiDeviceLogin",
                    row?.original,
                    checked,
                    OrgnazationSearch,
                    "organization"
                  );
                }}
                className="mt-1 bg-[#01576A]"
              />
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Patient Data Download",
        id: "allowPatientDataDownload",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.emrFeature, // assuming 'emrFeature' exists on the row
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <Switch
                checked={row?.original?.allowPatientDataDownload}
                onCheckedChange={(checked) => {
                  updateOrganizationList(
                    "allowPatientDataDownload",
                    row?.original,
                    checked,
                    OrgnazationSearch,
                    "organization"
                  );
                }}
                className=" mt-1"
              />
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Patient Data Edit",
        id: "allowPatientDataEdit",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.emrFeature, // assuming 'emrFeature' exists on the row
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <Switch
                checked={row?.original?.allowPatientDataEdit}
                onCheckedChange={(checked) => {
                  updateOrganizationList(
                    "allowPatientDataEdit",
                    row?.original,
                    checked,
                    OrgnazationSearch,
                    "organization"
                  );
                }}
                className=" mt-1"
              />
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Report Limit",
        id: "reportsLimit",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.reportsLimit,
        cell: ({ row }: any) => {
          const value = row?.original?.reportsLimit || 0;

          return (
            <div className="flex items-center">
              <input
                type="number"
                defaultValue={value}
                onBlur={(e) =>
                  updateOrganizationList(
                    "reportsLimit",
                    row.original,
                    Number(e.target.value),
                    OrgnazationSearch,
                    "organization"
                  )
                }
                className="text-sm text-[#8C929A] border border-gray-300 rounded px-2 py-1 w-24"
              />
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Account Limit",
        id: "usersLimit",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.usersLimit,
        cell: ({ row }: any) => {
          const value = row?.original?.usersLimit || 0;

          return (
            <div className="flex items-center">
              <input
                type="number"
                defaultValue={value}
                onBlur={(e) =>
                  updateOrganizationList(
                    "usersLimit",
                    row.original,
                    Number(e.target.value),
                    OrgnazationSearch,
                    "organization"
                  )
                }
                className="text-sm text-[#8C929A] border border-gray-300 rounded px-2 py-1 w-24"
              />
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Amount",
        id: "packageAmount",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.packageAmount,
        cell: ({ row }: any) => {
          const value = row?.original?.packageAmount || 0;

          return (
            <div className="flex items-center">
              <input
                type="number"
                defaultValue={value}
                onBlur={(e) =>
                  updateOrganizationList(
                    "packageAmount",
                    row.original,
                    Number(e.target.value),
                    OrgnazationSearch,
                    "organization"
                  )
                }
                className="text-sm text-[#8C929A] border border-gray-300 rounded px-2 py-1 w-24"
              />
            </div>
          );
        },
        size: 300,
      },
      {
        // header: "Days",
        header: "Months",
        id: "renewDuration",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.renewDuration,
        cell: ({ row }: any) => {
          const value = row?.original?.renewDuration || 0;

          return (
            <div className="flex items-center">
              <input
                type="number"
                defaultValue={value}
                onBlur={(e) =>
                  updateOrganizationList(
                    "renewDuration",
                    row.original,
                    Number(e.target.value),
                    OrgnazationSearch,
                    "organization"
                  )
                }
                className="text-sm text-[#8C929A] border border-gray-300 rounded px-2 py-1 w-24"
              />
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Renewal Date",
        id: "renewalDate",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.renewalDate,
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <input
                type="date"
                id="renewalDate"
                style={{ paddingLeft: "17px", paddingTop: "3px", paddingBottom: "3px" }}
                defaultValue={moment(row?.original?.renewalDate).format("YYYY-MM-DD")}

                onBlur={(e) => {
                  const formattedDate = moment(e.target.value).format("YYYY-MM-DD");

                  updateOrganizationList(
                    "renewalDate",
                    row?.original,
                    formattedDate,
                    OrgnazationSearch,
                    "organization"
                  );
                }}

                className="
    bg-white 
    w-full 
    outline-none 
    text-sm
    cursor-pointer 
    text-[#8C929A]
    border border-gray-300
    rounded
    shadow-sm
    focus:ring-1 focus:ring-[#526279]
    focus:border-[#526279]
    transition
    no-calendar-icon
    px-2
  "
                max={new Date().toISOString().split('T')[0]}
              />


            </div>

          );
        },

        size: 300,
      },
      {
        header: "View",
        id: "View",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.View,
        cell: ({ row }: any) => {
          return (
            <div className="flex z-50 justify-center">
              <button
                onClick={() => {
                  navigate(
                    `${ROUTES.OrganizationDetails}?id=${row.original?._id}`
                  );
                }}
                className={clsx(
                  "font-regular w-5/6 rounded-[30px] border border-[#E6E7E7] mt-[-3px] flex items-center text-sm justify-center font-normal text-[#666D79] px-4 py-1 max-w-[120px] whitespace-nowrap",
                  row.original.reportsCount > 0 ? "cursor-pointer" : ""
                )}
              >
                <p>Full Details </p>
                <ChevronRight strokeWidth={"1.5px"} height={"18px"} />
              </button>
            </div>
          );
        },
        size: 300,
      },
    ];
    return baseColumns;
  }, [organizationList, OrgnazationSearch]);

  const columnsUsersData = React.useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        header: "Docter",
        id: "name",
        enableSorting: false,
        // meta: {
        //     className: "hidden md:table-cell",
        // },
        accessorFn: (row) => row?.original?.name,
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <span className="text-[14px] truncate text-sm font-medium text-[#1A2435]">
                {row?.original?.name || "N/A"}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Organization",
        id: "organizationId",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.original?.organizationId,
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <span className="text-[14px] truncate text-sm font-medium text-[#1A2435]">
                {row?.original?.organizationId?.organizationName || "N/A"}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Email",
        id: "email",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.userDetails?.email, // assuming 'doctorName' exists on the row
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] mt-1">
                {row?.original?.email || "N/A"}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Joined Date",
        id: "createdAt",
        accessorFn: (row) => moment(row?.createdAt).format("ll"),
        meta: {
          className: "hidden md:table-cell",
        },
        enableSorting: false,
        cell: ({ row }: any) => (
          <div className="flex gap-2 z-50 w-[100px]">
            <span className="text-[14px] font-normal truncate text-sm text-[#8C929A]">
              {moment(row?.original?.createdAt).format("ll")}
            </span>
          </div>
        ),
        size: 160,
      },
      {
        header: "Phone",
        id: "phone",
        enableSorting: false,
        // meta: {
        //     className: "hidden md:table-cell",
        // },
        accessorFn: (row) => row?.phone,
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <span className="text-[14px] font-regular truncate text-sm text-[#8C929A]  mt-1">
                {row?.original?.phone || "N/A"}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Enabled",
        id: "isActive",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.isActive,
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <Switch
                checked={row?.original?.isActive}
                onCheckedChange={(checked) => {
                  // const { OrgnazationSearch } = useSelector((state: any) => state.searchData);

                  updateOrganizationList(
                    "isActive",
                    row?.original,
                    checked,
                    OrgnazationSearch,
                    "users"
                  );
                }}
                className="mt-1 bg-[#01576A]"
              />
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Multi-Device",
        id: "enableMultiDeviceLogin",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.enableMultiDeviceLogin, // assuming 'otpVerification' exists on the row
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <Switch
                checked={row?.original?.enableMultiDeviceLogin}
                onCheckedChange={(checked) => {
                  updateOrganizationList(
                    "enableMultiDeviceLogin",
                    row?.original,
                    checked,
                    OrgnazationSearch,
                    "users"
                  );
                }}
                className="mt-1 bg-[#01576A]"
              />
            </div>
          );
        },
        size: 300,
      },
    ];
    return baseColumns;
  }, [userData, OrgnazationSearch]);

  const cloumnsClientsData = React.useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        header: "Name",
        id: "name",
        enableSorting: false,
        // meta: { className: "hidden md:table-cell" },
        accessorFn: (row) => row?.original?.name || "N/A",
        cell: ({ row }) => (
          <div className="flex w-24">
            <span className="text-[14px] truncate text-sm font-medium text-[#1A2435] mt-1">
              {row?.original?.name || "N/A"}
            </span>
          </div>
        ),
        size: 300,
      },
      {
        header: "Email",
        id: "email",
        enableSorting: false,
        meta: { className: "hidden md:table-cell" },
        // email could be directly on row or inside userDetails
        accessorFn: (row) =>
          row?.original?.email || row?.original?.userDetails?.email || "N/A",
        cell: ({ row }) => (
          <div className="flex">
            <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] mt-1">
              {row?.original?.email ||
                row?.original?.userDetails?.email ||
                "N/A"}
            </span>
          </div>
        ),
        size: 300,
      },
      {
        header: "Phone",
        id: "phone",
        enableSorting: false,
        // meta: { className: "hidden md:table-cell" },
        // phone field can be either phone or phoneNumber depending on data
        accessorFn: (row) =>
          row?.original?.phone || row?.original?.phoneNumber || "N/A",
        cell: ({ row }) => (
          <div className="flex">
            <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] mt-1">
              {row?.original?.phone || row?.original?.phoneNumber || "N/A"}
            </span>
          </div>
        ),
        size: 300,
      },
      {
        header: "Joined Date",
        id: "createdAt",
        enableSorting: false,
        meta: { className: "hidden md:table-cell" },
        accessorFn: (row) => row?.original?.createdAt,
        cell: ({ row }) => (
          <div className="flex gap-2 z-50 w-[100px]">
            <span className="text-[14px] font-normal truncate text-sm text-[#8C929A]">
              {row?.original?.createdAt
                ? moment(row.original.createdAt).format("ll")
                : "N/A"}
            </span>
          </div>
        ),
        size: 160,
      },
      {
        header: "Role",
        id: "role",
        enableSorting: false,
        meta: { className: "hidden md:table-cell" },
        accessorFn: (row) => row?.original?.role || "N/A",
        cell: ({ row }) => (
          <div className="flex">
            <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] mt-1">
              {row?.original?.role || "Docter"}
            </span>
          </div>
        ),
        size: 300,
      },
      {
        header: "Enabled",
        id: "isActive",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.isActive,
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <Switch
                checked={row?.original?.isActive}
                onCheckedChange={(checked) => {
                  updateOrganizationList(
                    "isActive",
                    row?.original,
                    checked,
                    OrgnazationSearch,
                    "clients"
                  );
                }}
                className="mt-1 bg-[#01576A]"
              />
            </div>
          );
        },
        size: 300,
      },
    ];

    return baseColumns;
  }, [clientsData, OrgnazationSearch]);

  let dataToUse;
  if (activeTab === "clients") {
    dataToUse = clientsData;
  } else if (activeTab === "organization") {
    dataToUse = organizationList;
  } else {
    dataToUse = usersData;
  }

  let dataToUseColumns;
  if (activeTab === "clients") {
    dataToUseColumns = cloumnsClientsData;
  } else if (activeTab === "organization") {
    dataToUseColumns = columns;
  } else {
    dataToUseColumns = columnsUsersData;
  }

  const [pagination, setPagination] = useState<any>({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const defaultData = React.useMemo(() => [], []);

  const table = useReactTable({
    data: dataToUse ?? defaultData,
    columns: dataToUseColumns,
    rowCount: pagination.pageSize,
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

  useEffect(() => {
    setOrganizationList([]);
    setCurrentPage(1);
    setHasMore(true);
  }, [sorting]);

  useEffect(() => {
    socketService.disconnect();
    socketService.connect();
    const setupSocketEvents = () => {
      const onConnect = () => {
        console.log("Socket connected");
      };
      const onDisconnect = (reason: string) => {
        console.log("Socket disconnected", reason);
        if (!socketService.isConnected()) {
          socketService.connect();
        }
      };
      const onReportProcessingFailed = (data: any) => {
        console.log("reportProcessingFailed", data);
      };
      const onReportStatus = (data: any) => {
        if (data.completed) {
          // fetchReports();
        }
      };
      socketService.on("connect", onConnect);
      socketService.on("disconnect", onDisconnect);
      socketService.on("reportProcessingFailed", onReportProcessingFailed);
      socketService.on("reportStatus", onReportStatus);
      // socketService.on(userData.organizationId, onOrganizationIdUpdate);

      return () => {
        socketService.off("connect", onConnect);
        socketService.off("disconnect", onDisconnect);
        socketService.off("reportProcessingFailed", onReportProcessingFailed);
        socketService.off("reportStatus", onReportStatus);
        // socketService.off(userData.organizationId, onOrganizationIdUpdate);
      };
    };
    const cleanup = setupSocketEvents();

    return () => {
      cleanup();
    };
  }, [pagination]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (OrgnazationSearch !== null) {
        setCurrentPage(1);
        setHasMore(true);
        const sortedColumn = sorting[0]?.id;
        if (
          sortedColumn === "clientCount" ||
          sortedColumn === "reportCount" ||
          sortedColumn === "userCount"
        ) {
          fetchReports({ apiType: "organization", currentPageValue: 1 });
        } else {
          fetchReports({ apiType: "users", currentPageValue: 1 });
          fetchReports({ apiType: "clients", currentPageValue: 1 });
          fetchReports({ apiType: "organization", currentPageValue: 1 });
        }
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [OrgnazationSearch, sorting]);

  const handleTabClick = (tab: "users" | "clients" | "organization") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setHasMore(true);
    fetchReports({ apiType: tab, currentPageValue: 1 });
  };

  useEffect(() => {
    if (currentPage > 1) {
      fetchReports({ apiType: activeTab, currentPageValue: currentPage });
    }
  }, [currentPage]);

  const fetchReports = async ({
    apiType = "organization",
    currentPageValue = 1,
    search = OrgnazationSearch,
  }: {
    apiType: "organization" | "users" | "clients";
    currentPageValue?: number;
    search?: string;
  }) => {
    const pageSize = 15;
    const page = currentPageValue.toString();
    // Build query params conditionally
    const params = new URLSearchParams({
      per_page: pageSize.toString(),
      page: page,
      search: search || "",
    });

    if (apiType === "organization" && sorting[0]?.id) {
      params.set("sortBy", sorting[0].id);
      params.set("sortOrder", sorting[0].desc ? "desc" : "asc");
    }

    // Determine endpoint
    let endpoint = `${API_CONSTANTS.GET_Users}?${params}`;
    if (apiType === "clients") {
      endpoint = `${API_CONSTANTS.GET_CLIENTS}?${params}`;
    } else if (apiType === "organization") {
      endpoint = `${API_CONSTANTS.GET_ALL_ORGANIZATION}?${params}`;
    }

    try {
      const response: any = await GetOrganizationApi(endpoint);
      if (response?.data.success) {
        const key =
          apiType === "clients"
            ? "clients"
            : apiType === "organization"
              ? "orgs"
              : "users";

        const newItems = response.data[key]?.items || [];
        if (currentPage === 1) {
          if (apiType === "clients") {
            const updatedItems = newItems.map((item: any) => ({
              ...item,
              isActive: item.isActive ?? false,
            }));
            setClientsData(updatedItems);
          } else if (apiType === "organization") {
            const updatedItems = newItems.map((item: any) => ({
              ...item,
              renewDuration: item.renewDuration ?? "",
              packageAmount: item.packageAmount ?? "",
              appointmentsEnabled: item.appointmentsEnabled ?? false,
              billingEnabled: item.billingEnabled ?? false,
              isActive: item.isActive ?? false,
              enableMultiDeviceLogin: item.enableMultiDeviceLogin ?? false,
              allowPatientDataDownload: item.allowPatientDataDownload ?? false,
              allowPatientDataEdit: item.allowPatientDataEdit ?? false,
            }));
            setOrganizationList(updatedItems);
          } else {
            const updatedItems = newItems.map((item: any) => ({
              ...item,
              isActive: item.isActive ?? false,
              enableMultiDeviceLogin: item.enableMultiDeviceLogin ?? false,
            }));
            setUsersData(updatedItems);
          }
        } else {
          if (apiType === "clients") {
            // setClientsData((prev: any) => [...prev, ...newItems]);
            // setClientsData((prev: any[]) => {
            //     const newIds = new Set(newItems.map((item: any) => item._id));

            //     // Keep only those items from prev whose _id is NOT in newItems
            //     const filteredPrev = prev.filter((item: any) => !newIds.has(item._id));

            //     // Return merged array: filtered prev + newItems
            //     return [...filteredPrev, ...newItems];
            // });
            setClientsData((prev: any[]) => {
              const newItemsWithIsActive = newItems.map((item: any) => ({
                ...item,
                isActive: item.isActive ?? false,
              }));

              const newIds = new Set(
                newItemsWithIsActive.map((item: any) => item._id)
              );
              const filteredPrev = prev.filter(
                (item: any) => !newIds.has(item._id)
              );

              return [...filteredPrev, ...newItemsWithIsActive];
            });
          } else if (apiType === "organization") {
            // setOrganizationList((prev: any) => [
            //     ...prev,
            //     ...newItems.map((item: any) => ({
            //         ...item,
            //         renewDuration: item.renewDuration ?? "",
            //         packageAmount: item.packageAmount ?? "",
            //     })),
            // ]);
            setOrganizationList((prev: any[]) => {
              const newItemsWithNewFields = newItems.map((item: any) => ({
                ...item,
                renewDuration: item.renewDuration ?? "",
                packageAmount: item.packageAmount ?? "",
                appointmentsEnabled: item.appointmentsEnabled ?? false,
                billingEnabled: item.billingEnabled ?? false,
                isActive: item.isActive ?? false,
                enableMultiDeviceLogin: item.enableMultiDeviceLogin ?? false,
                allowPatientDataDownload:
                  item.allowPatientDataDownload ?? false,
                allowPatientDataEdit: item.allowPatientDataEdit ?? false,
              }));

              const newIds = new Set(
                newItemsWithNewFields.map((item: any) => item._id)
              );
              const filteredPrev = prev.filter(
                (item: any) => !newIds.has(item._id)
              );

              return [...filteredPrev, ...newItemsWithNewFields];
            });
          } else {
            // setUsersData((prev: any) => [...prev, ...newItems]);
            // setUsersData((prev: any[]) => {
            //     // Ensure no duplicate entries by _id
            //     const newIds = new Set(newItems.map((item: any) => item._id));

            //     // Filter out previous items that are also in newItems
            //     const filteredPrev = prev.filter(item => !newIds.has(item._id));

            //     // Return updated array with newItems replacing any existing ones
            //     return [...filteredPrev, ...newItems];
            // });
            setUsersData((prev: any[]) => {
              // Add required fields to every new item
              const newItemsWithFields = newItems.map((item: any) => ({
                ...item,
                isActive: item.isActive ?? false,
                enableMultiDeviceLogin: item.enableMultiDeviceLogin ?? false,
              }));

              // Ensure no duplicate entries by _id
              const newIds = new Set(
                newItemsWithFields.map((item: any) => item._id)
              );

              // Filter out previous items that are also in newItems
              const filteredPrev = prev.filter((item) => !newIds.has(item._id));

              // Return updated array with enriched new items
              return [...filteredPrev, ...newItemsWithFields];
            });
          }
        }

        setHasMore(newItems.length === pageSize);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      setHasMore(false);
    }
  };

  const toggleEdit = () => {
    setEdit((prev) => !prev);
  };

  const tableContainerRef = useRef<HTMLDivElement>(null);
  // const handleTableScroll = useCallback(() => {
  //     const container = tableContainerRef.current;
  //     if (!container || loading || !hasMore) return;

  //     const { scrollTop, scrollHeight, clientHeight } = container;
  //     // Check if user has scrolled to bottom of table (with a small threshold)
  //     if (scrollHeight - scrollTop - clientHeight < 50) {
  //         setCurrentPage((prevPage) => prevPage + 1);
  //     }
  // }, [loading, hasMore]);

  const handleTableScroll = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    const isScrollingUpward = scrollTop < lastScrollTop.current;
    lastScrollTop.current = scrollTop;
    setIsScrollingUp(isScrollingUpward);

    if (isScrollingUpward && scrollTop === 0 && currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
      setScrollPosition(clientHeight);
    } else if (
      !isScrollingUpward &&
      scrollHeight - scrollTop - clientHeight < 50 &&
      hasMore
    ) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [loading, hasMore, currentPage]);

  // useEffect(() => {
  //   const container = tableContainerRef.current;
  //   if (container) {
  //     container.addEventListener("scroll", handleTableScroll);
  //     return () => container.removeEventListener("scroll", handleTableScroll);
  //   }
  // }, [handleTableScroll]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleTableScroll);
      return () => {
        container.removeEventListener("scroll", handleTableScroll);
        document.body.style.overflow = "auto";
      };
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [handleTableScroll]);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (container && isScrollingUp && scrollPosition > 0) {
      container.scrollTop = scrollPosition;
      setScrollPosition(0);
    }
  }, [clientsData, isScrollingUp, scrollPosition]);

  return (
    <div
      className=" !bg-[#F5F6F6]"
      style={{ marginLeft: state == "collapsed" ? "28px" : "" }}
    >
      <header className="flex justify-between">
        <div></div>
        {/* <AppButton
                    // onClick={() => toggleClose()}
                    className="relative flex w-[190px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none mt-[16px] mb-[16px] mr-[8px] md:mr-[16px] rounded-[30px] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Organization
                </AppButton> */}
      </header>
      <div className="px-2 md:px-4 flex justify-between mb-2 md:mb-0">
        <li className="flex flex-row gap-[6px] md:gap-[10px]">
          <a
            onClick={() => {
              handleTabClick("organization");
              setActiveTab("organization");
              table.resetRowSelection();
              navigate(`${ROUTES.Organization}?tab=organizationmain`, {
                replace: true,
              });
              dispatch(setOrgnazationSearch(""));
            }}
            className={`relative flex w-[100px] sm:w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 border-none mt-[16px] mb-[5px] md:mb-[16px] rounded-[30px] text-sm cursor-pointer shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white text-[#293343] ${activeTab === "organization" ? "font-bold" : ""
              }`}
          >
            Organization
          </a>
          <a
            onClick={() => {
              handleTabClick("users");
              setActiveTab("users");
              table.resetRowSelection();
              navigate(`${ROUTES.Organization}?tab=doctor`, {
                replace: true,
              });
              dispatch(setOrgnazationSearch(""));
            }}
            className={`relative flex w-[100px] sm:w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 border-none mt-[16px] mb-[5px] md:mb-[16px] rounded-[30px] text-sm cursor-pointer shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white text-[#293343] ${activeTab === "users" ? "font-bold" : ""
              }`}
          >
            Doctor
          </a>
          <a
            onClick={() => {
              setActiveTab("clients");
              handleTabClick("clients");
              table.resetRowSelection();
              navigate(`${ROUTES.Organization}?tab=patient`, {
                replace: true,
              });
              dispatch(setOrgnazationSearch(""));
            }}
            className={`relative flex w-[100px] sm:w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 border-none mt-[16px] mb-[5px] md:mb-[16px] rounded-[30px] text-sm cursor-pointer shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white text-[#293343] ${activeTab === "clients" ? "font-bold" : ""
              }`}
          >
            Patient
          </a>
        </li>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <a
              className={`relative flex w-[40px] h-[40px] px-[10px] py-[6px] justify-center items-center flex-shrink-0 border-none mt-[16px] mb-[5px] md:mb-[16px] rounded-[30px] text-sm cursor-pointer shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white text-[#293343]`}
              onClick={(e) => e.stopPropagation()}
            >
              <EllipsisVertical className="h-4 w-4 text-gray-600" />
            </a>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${ROUTES.ADMINANALYTICS}`);
              }}
              className="cursor-pointer"
            >
              <ChartNoAxesCombined className="mr-2 h-4 w-4 text-gray-600" />
              Analytics
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${ROUTES.ORGBROADCAST}?tab=organization`, {
                  replace: true,
                });
              }}
              className="cursor-pointer"
            >
              <Megaphone className="mr-2 h-4 w-4 text-gray-600" />
              Broadcast
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${ROUTES.ADMIN_INVOICE}`);
              }}
              className="cursor-pointer"
            >
              <ReceiptText className="mr-2 h-4 w-4 text-gray-600" />
              Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
      <div className="px-2 md:px-4">
        <div
          className="rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white overflow-hidden overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white overflow-x-auto w-full"
          ref={tableContainerRef}
          style={{
            height: "calc(100vh - 152px)",
            overflowY: "auto",
          }}
        >
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white z-10 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-[#E6E6E8]">
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className={`p-3 font-manrope text-base  font-medium text-[#666D79] 
                                                ${header.column.columnDef.meta
                            ?.className || ""
                          }`}
                      >
                        {!header.isPlaceholder && (
                          <div
                            className={`flex items-center space-x-2 ${header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                              } ${header.id === "organization" ? "" : ""}  ${header.id === "View"
                                ? "justify-center"
                                : "justify-start"
                              } ${header.id === "role" ? "w-20" : ""}`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() &&
                              ({
                                asc: (
                                  <ArrowUp className="w-4 h-4 text-gray-500 pl-1" />
                                ),
                                desc: (
                                  <ArrowDown className="w-4 h-4 text-gray-500 pl-1" />
                                ),
                                false: (
                                  <ArrowDownUp className="w-4 h-4 text-gray-500 pl-1" />
                                ),
                              }[header.column.getIsSorted() as string] ??
                                null)}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody>
              {loading && organizationList?.length === 0 ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-100 bg-[#f4f4f4]"
                  >
                    {table.getVisibleLeafColumns().map((column, cellIndex) => (
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
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b hover:bg-gray-100 bg-[#ffffff] transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td
                          key={cell.id}
                          className={`px-3 pt-2 pb-[0.6rem] text-gray-700 !font-medium ${cell.column.columnDef.meta?.className || ""
                            } 
                                                    ${cell.column.columnDef
                              .header === ""
                              ? "ml-5"
                              : "" // Adjust width
                            }`}
                        // onClick={() => {
                        //     navigate(
                        //         `${ROUTES.OrganizationDetails}?id=${row.original?._id}`
                        //     );

                        // }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={table.getHeaderGroups()[0].headers.length}
                    className="text-center py-4 text-gray-500 h-[20rem] flex-1 bg-[#ffffff]"
                  >
                    No Organization to show
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && organizationList?.length > 0 && (
            <div className="flex items-center justify-center py-4 space-x-2">
              <span className="text-[#526279">loading Organization...</span>
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
        {/* <tab> navigation </tab> */}
      </div>

      <CustomSheet
        title=""
        isOpen={edit}
        toggle={toggleEdit}
        className="dark:bg-gray-800 dark:text-gray-100"
        content={<PatientsOverAllReportSidePannel />}
      />
      {/* {loading && <AppLoader />} */}

      {/* <ChatBot /> */}

      <AppModal isOpen={isModalOpen} toggle={toggleClose} title="">
        <AddPatient toggleClose={toggleClose} />
      </AppModal>
    </div>
  );
};

export default Organization;
