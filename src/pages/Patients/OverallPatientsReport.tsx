import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { deletePatient, useGetApi, usePostApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import OrgonChart from "./OrgonChart";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DownloadIcon,
  Edit,
  EllipsisVertical,
  HandHeart,
  Merge,
  Plus,
  Search,
  UserRoundPen,
  // X,
  // XCircle,
} from "lucide-react";
import moment from "moment";
import AppButton from "../../components/AppButton";
// import {
//   // ColumnDef,
//   // getCoreRowModel,
//   // flexRender,
//   // useReactTable,
//   // Row,
//   // getExpandedRowModel,
// } from "@tanstack/react-table";
import { useSidebar } from "../../components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
// import MangementIcon from "../../assets/mangesment.svg";
import idImage from "../../assets/id.svg";
import {
  // cn,
  ConditionsStatusOrder,
  ProfielShareMessage,
} from "../../lib/utils";
import AppModal from "../../components/AppModal";
import Select from "react-select";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { selectMergePatient } from "../../utils/validationSchems";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { CopyToClipboard } from "react-copy-to-clipboard";
// import UpArrow from "../../assets/Svgs/arrowUp.svg";
// import DownArrow from "../../assets/Svgs/ArrowDown.svg";
import socketService from "../../utils/socket";
import {
  EmailIcon,
  EmailShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import AppDeleteDialog from "../../components/AppDeleteDialog";
import { ROUTES } from "../../constants/routesConstants";
import { SwitchWithLabel } from "../../components/AppSwitchWithLabel";
import EditPatient from "../../components/EditPatient";
import AppPatientRequestDialog from "../../components/AppPatientRequestDialog";
import SelectWayToReortCreate from "../HealthReport/SelectWayToReortCreate";
import FileUpload from "../HealthReport/FileUpload";
import ReportOverview from "./ReportOverview";
import PatienDownloadData from "../../components/PatienDownloadData";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";

// type ExtendedRow<T> = Row<T> & {
//   subComponentData?: any;
// };

export interface SelectPatient {
  patientId: {
    value: string;
    label: string;
  };
}
// interface TableProps {
//   data: any[];
//   columns: any[];
//   renderSubComponent: (props: { row: ExtendedRow<any> }) => JSX.Element;
//   getRowCanExpand?: (row: Row<any>) => boolean;
//   onExpandRow?: (row: any) => void;
// }

const OverallPatientsReport: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hostName = window.location.host;
  const reportId: any = searchParams.get("id");
  const {
    getData: GetReportApi,
    isLoading: isLoading,
    error: IsReportError,
  } = useGetApi<any>("", {
    isToaster: false,
  });
  const { getData: GetIndividualPatientReports, isLoading: isReportLoading } =
    useGetApi<any>("", {
      isToaster: false,
    });
  const [reportDataInfo, setReportDataInfo] = useState<any>([]);
  const [selectedTab, setSelectedTab] = useState("All");
  const { state } = useSidebar();
  const [patientList, setPatientList] = useState([]);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setReportIsModalOpen] = useState<boolean>(false);
  const [openFile, setOpenFile] = useState(false);
  const [uploadeFiles, setUploadFile] = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState<boolean>(false);
  const [isModalShareOpen, setIsModalShareOpen] = useState<boolean>(false);
  const [deletePatientModal, setDeletePatientModal] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { getData: GetPatientList } = useGetApi<any>("");
  const { userData } = useSelector((state: any) => state.authData);
  console.log("🚀 ~ OverallPatientsReport ~ userData:", userData);
  const orgPermission = userData?.organizationId;
  const [copied, setCopied] = useState(false);
  const [patientRequest, setPatientRequest] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  console.log("hasMore", hasMore);
  const { reportSearch } = useSelector((state: any) => state.searchData);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [pagination, setPagination] = useState<any>({
    pageIndex: 1,
    pageSize: 25,
    totalPages: 0,
  });
  const [opationOpen, setOpationOpen] = useState<boolean>(false);

  const sortedConditions = reportDataInfo?.conditions?.sort(
    (a: any, b: any) => {
      const indexA = ConditionsStatusOrder.indexOf(a.status);
      const indexB = ConditionsStatusOrder.indexOf(b.status);
      return (
        (indexA === -1 ? ConditionsStatusOrder.length : indexA) -
        (indexB === -1 ? ConditionsStatusOrder.length : indexB)
      );
    }
  );

  const { postData: createReportText, isLoading: loading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.CLIENT_MERGE,
    });

  const { postData: sendPatientRequest, isLoading: patientRequestLoading } =
    usePostApi<any>({
      path: API_CONSTANTS.PATIENTS.PATIENT_HEALTH_SUMMARY_REQUEST,
    });

  useEffect(() => {
    if (!socketService.isConnected()) {
      socketService.connect();
    }
    const onIdUpdate = (data: any) => {
      if (data.profileMerged) fetchReports();
    };
    socketService.on("connect", () => console.log("Connected"));
    socketService.on("disconnect", (reason: string) => {
      console.log("Disconnected:", reason);
      if (!socketService.isConnected()) {
        setTimeout(() => socketService.connect(), 1000);
      }
    });
    socketService.on(reportId, onIdUpdate);
    return () => {
      socketService.off("connect", () => console.log("Connected"));
      socketService.off("disconnect", (reason: string) => {
        console.log("Disconnected:", reason);
      });
      socketService.off(reportId, onIdUpdate);
    };
  }, []);

  useEffect(() => {
    if (reportDataInfo?.clientId?._id) {
      fetchIndividualPatientReports(true);
    }
  }, [reportDataInfo?.clientId?._id, reportSearch]);

  const toggleItem = (value: string) => {
    setOpenItems((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  useEffect(() => {
    fetchReports();
    fetchPatient();
  }, []);

  const fetchPatient = async () => {
    if (userData?.role != "client") {
      try {
        const response: any = await GetPatientList(
          `${API_CONSTANTS.GET_ALL_PATIENTS_WITH_ID}`
        );
        if (response.data.success) {
          const transformedData = response.data.data.clients.map(
            (item: any) => ({
              label: item.name,
              value: item._id,
            })
          );

          setPatientList(
            transformedData.filter((val: any) => val.value !== reportId)
          );
          setSelectedOption(null);
          form.reset();
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    }
  };

  const fetchReports = async () => {
    const response: any = await GetReportApi(
      `${API_CONSTANTS.OVERALL_PATIENTS_REPORT}/${reportId}`
    );
    if (response?.data.success) {
      setReportDataInfo(response.data.overAllHealth);
      let flattenedData: any[] = [];
      response?.data?.overAllHealth?.organSystems?.forEach(
        (organSystem: any) => {
          organSystem.organs.forEach((organ: any) => {
            const rowData = {
              organSystem: organSystem.name,
              organName: organ.name,
              ...organ.values,
            };
            flattenedData.push(rowData);
          });
        }
      );
    }
  };

  const fetchIndividualPatientReports = async (resetPage = false) => {
    if (resetPage) {
      setCurrentPage(1);
      setReportsList([]);
      setHasMore(true);
    }
    const current = window?.location?.search?.split("=")[1];
    const pageSize = 25;
    const page = resetPage ? "1" : currentPage.toString();

    const params = new URLSearchParams({
      per_page: pageSize.toString(),
      page: page,
      status:
        current === "progress"
          ? "pending,processing,uploading"
          : current === "flagged"
          ? "failed,flagged,duplicate,invalid"
          : current === "draft"
          ? "draft"
          : current === "approval_pending"
          ? "approval_pending"
          : "completed",
      search: reportSearch,
      // sortBy: sorting[0]?.id || "",
      // sortOrder: sorting[0]?.desc ? "desc" : "asc",
      clientId: reportDataInfo?.clientId._id,
    });

    try {
      const response: any = await GetIndividualPatientReports(
        `${API_CONSTANTS.PATIENTS.INDIVIDUAL_PATIENT_REPORT}?${params}`
      );
      if (response?.data.success) {
        const newReports = response?.data?.reports?.items || [];

        if (currentPage === 1) {
          setReportsList(newReports);
        } else {
          setReportsList((prev) => [...prev, ...newReports]);
        }

        setPagination((prevPagination: any) => ({
          ...prevPagination,
          totalPages: response?.data?.reports.totalPages,
        }));

        setHasMore(newReports.length === pageSize);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      setHasMore(false);
    }
  };

  // const handleOrganMetricBlur = (
  //   organIndex: number,
  //   metricIndex: number,
  //   field: string,
  //   originalValue: string,
  //   updatedValue: string
  // ) => {
  //   console.log("omakar");

  //   if (originalValue === updatedValue) return;

  //   const originalMetric = reportDataInfo.organSystemCards[organIndex].metrics[metricIndex];

  //   const newChange = {
  //     entity: "metric",
  //     originalValue,
  //     updatedValue,
  //   };

  //   setChanges((prev) => {
  //     const existingIndex = prev.findIndex(
  //       (c) =>
  //         c.entity === "metric" &&
  //         c.originalValue === originalValue &&
  //         c.updatedValue !== updatedValue
  //     );

  //     if (existingIndex !== -1) {
  //       const updated = [...prev];
  //       updated[existingIndex] = newChange;
  //       return updated;
  //     } else {
  //       return [...prev, newChange];
  //     }
  //   });
  // };

  // const columnsCondition: ColumnDef<any>[] = [
  //   // {
  //   //   accessorKey: "name",
  //   //   id: "name",
  //   //   header: () => "Metric",
  //   //   cell: ({ row }) => {
  //   //     return (
  //   //       <div
  //   //         style={{
  //   //           paddingLeft: `${row.depth * 2}rem`,
  //   //           width: "222px",
  //   //         }}
  //   //         className="font-medium"
  //   //       >
  //   //         {row.original.metric}
  //   //       </div>
  //   //     );
  //   //   },
  //   //   footer: (props) => props.column.id,
  //   // },
  //   {
  //     accessorKey: "name",
  //     id: "name",
  //     header: () => "Metric",
  //     cell: ({ row }) => {
  //       const organIndex = row?.original?.organIndex; // We'll pass this from render
  //       const metricIndex = row?.original?.metricIndex;

  //       return (
  //         <div
  //           style={{
  //             paddingLeft: `${row.depth * 2}rem`,
  //             width: "222px",
  //           }}
  //           className="font-medium"
  //         >
  //           {isEditingOrgans ? (
  //             <input
  //               type="text"
  //               value={row.original.metric}
  //               onChange={(e) =>
  //                 handleInputChange(
  //                   "organs",
  //                   organIndex,
  //                   0,
  //                   metricIndex,
  //                   "metric",
  //                   e.target.value
  //                 )
  //               }
  //               onBlur={(e) =>
  //                 handleOrganMetricBlur(
  //                   organIndex!,
  //                   metricIndex!,
  //                   "metric",
  //                   editableData.organs[organIndex!].metrics[metricIndex!].metric, // original value
  //                   e.target.value
  //                 )
  //               }
  //               className="border border-gray-300 rounded px-2 py-1 w-full"
  //             />
  //           ) : (
  //             row.original.metric
  //           )}
  //         </div>
  //       );
  //     },
  //   },
  //   {
  //     accessorKey: "Value",
  //     header: () => "Value",
  //     cell: ({ row }) => {
  //       return (
  //         <>
  //           <span
  //             className={`${row?.original?.highRisk === true
  //               ? " text-[#f5604a]"
  //               : " text-gray-700 hover:bg-gray-100"
  //               }`}
  //           >
  //             {row?.original?.value}
  //           </span>{" "}
  //           <span>{row?.original?.unit}</span>
  //         </>
  //       );
  //     },
  //     footer: (props) => props.column.id,
  //   },
  //   {
  //     accessorKey: "Range",
  //     header: () => "Range",
  //     cell: ({ row }) => {
  //       return <span className="text-[#8C929A]">{row.original.range}</span>;
  //     },
  //     footer: (props) => props.column.id,
  //   },
  //   {
  //     id: "expander",
  //     header: "Action",
  //     cell: ({ row }) => {
  //       return row.getCanExpand() ? (
  //         <button
  //           className="w-3 h-3 shrink-0"
  //           onClick={() => {
  //             row.toggleExpanded();
  //           }}
  //         >
  //           {row.getIsExpanded() ? (
  //             <img src={UpArrow} alt="Down Arrow" className="w-3 shrink-0" />
  //           ) : (
  //             <img src={DownArrow} alt="Up Arrow" className="w-3 shrink-0" />
  //           )}
  //         </button>
  //       ) : null;
  //     },
  //   },
  // ];

  // const Table = ({
  //   data,
  //   columns,
  //   renderSubComponent,
  //   getRowCanExpand,
  //   onExpandRow,
  // }: TableProps): JSX.Element => {
  //   const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>(
  //     {}
  //   );
  //   const [subComponentDataMap, setSubComponentDataMap] = useState<
  //     Record<string, any>
  //   >({});
  //   const { getData: GetReportApi } = useGetApi<any>("");

  //   const handleToggleRow = async (rowId: string, row: any) => {
  //     const willExpand = !expandedRows[rowId];

  //     setExpandedRows((prev) => ({
  //       ...prev,
  //       [rowId]: willExpand,
  //     }));

  //     // Fetch data only when expanding and if we don't already have it
  //     if (willExpand && !subComponentDataMap[rowId]) {
  //       try {
  //         // Get metric name from row data - adjust this based on your data structure
  //         const metricName = row.metric || row.name || "";

  //         const response: any = await GetReportApi(
  //           `${API_CONSTANTS.OVERTIMEDATA}?clientId=${reportDataInfo.clientId._id}&name=${metricName}`
  //         );

  //         // Store the fetched data in our map
  //         setSubComponentDataMap((prev) => ({
  //           ...prev,
  //           [rowId]: response.data.overtimeReport,
  //         }));
  //       } catch (error) {
  //         console.error("Error fetching overtime data:", error);
  //         // Optionally store error state in the map
  //         setSubComponentDataMap((prev) => ({
  //           ...prev,
  //           [rowId]: { error: true },
  //         }));
  //       }
  //     }

  //     // Call the onExpandRow callback if provided
  //     if (onExpandRow) {
  //       onExpandRow(row);
  //     }
  //   };

  //   const table = useReactTable({
  //     data,
  //     columns,
  //     state: {
  //       expanded: expandedRows,
  //     },
  //     onExpandedChange: (updatedExpanded) => {
  //       setExpandedRows(updatedExpanded as Record<string, boolean>);
  //     },
  //     getSubRows: (row) => row.subRows,
  //     getRowCanExpand,
  //     getCoreRowModel: getCoreRowModel(),
  //     getExpandedRowModel: getExpandedRowModel(),
  //   });

  //   useEffect(() => {
  //     const validExpandedState = Object.keys(expandedRows).reduce(
  //       (acc, key) => {
  //         if (data.some((row) => row.id === key)) {
  //           acc[key] = expandedRows[key];
  //         }
  //         return acc;
  //       },
  //       {} as Record<string, boolean>
  //     );

  //     setExpandedRows(validExpandedState);
  //   }, [data]);

  //   return (
  //     <div className="border rounded-lg overflow-hidden ml-3 mb-3 mr-3 mt-2 overflow-x-auto">
  //       <table className="w-full">
  //         <tbody>
  //           {table.getRowModel().rows.map((row, rowIndex) => {
  //             const isHighRisk = row?.original?.risk === "High";
  //             return (
  //               <React.Fragment key={row.id}>
  //                 <tr
  //                   className={`border-b last:border-0 [&:only-child]:border-0 transition-colors bg-white text-start ${rowIndex === table?.getRowModel().rows?.length - 1
  //                     ? "last:rounded-bl-lg last:rounded-br-lg"
  //                     : ""
  //                     } ${isHighRisk ? "bg-[#f68f80]" : "hover:bg-[#F7F8F8]"}`}
  //                   style={{ cursor: "pointer" }}
  //                   onClick={() => handleToggleRow(row.id, row.original)}
  //                 >
  //                   {row.getVisibleCells().map((cell) => (
  //                     <td
  //                       key={cell.id}
  //                       className={`p-3 ${cell.column.id === "name" ? "w-[222px]" : ""
  //                         }`}
  //                     >
  //                       {cell.column.id === "expander" ? (
  //                         row.getCanExpand() ? (
  //                           <button
  //                             className="w-3 h-3 shrink-0"
  //                             onClick={() =>
  //                               handleToggleRow(row.id, row.original)
  //                             }
  //                           >
  //                             {expandedRows[row.id] ? (
  //                               <img
  //                                 src={UpArrow}
  //                                 alt="Down Arrow"
  //                                 className="w-3 shrink-0"
  //                               />
  //                             ) : (
  //                               <img
  //                                 src={DownArrow}
  //                                 alt="Up Arrow"
  //                                 className="w-3 shrink-0"
  //                               />
  //                             )}
  //                           </button>
  //                         ) : null
  //                       ) : (
  //                         flexRender(
  //                           cell.column.columnDef.cell,
  //                           cell.getContext()
  //                         )
  //                       )}
  //                     </td>
  //                   ))}
  //                 </tr>
  //                 {expandedRows[row.id] && (
  //                   <tr>
  //                     <td
  //                       colSpan={row.getVisibleCells()?.length}
  //                       className="bg-gray-50"
  //                     >
  //                       {renderSubComponent({
  //                         row: {
  //                           ...row,
  //                           subComponentData: subComponentDataMap[row.id],
  //                         } as ExtendedRow<any>, // Cast the row as ExtendedRow<any>
  //                       })}
  //                     </td>
  //                   </tr>
  //                 )}
  //               </React.Fragment>
  //             );
  //           })}
  //         </tbody>
  //       </table>
  //     </div>
  //   );
  // };

  const AlternativeSubComponent = ({ original }: { original: any }) => {
    const [subComponentData, setSubComponentData] = useState<any>(null);
    const [allData, setAllData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { getData: GetReportApi } = useGetApi<any>("");

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Get the metric name from the row data
          const metricName = original?.metric || original?.name;

          if (metricName) {
            const response: any = await GetReportApi(
              `${API_CONSTANTS.OVERTIMEDATA}?clientId=${reportDataInfo.clientId._id}&name=${metricName}`
            );
            response?.data?.overtimeReport?.length &&
              setSubComponentData(response.data.overtimeReport[0].values);
            response?.data?.overtimeReport?.length &&
              setAllData(response.data.overtimeReport);
          }
        } catch (error) {
          console.error("Error fetching overtime data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [original]);

    if (isLoading) {
      return <div className="p-4">Loading...</div>;
    }

    if (!subComponentData || !Array.isArray(subComponentData)) {
      return <div className="p-4">No data available</div>;
    }

    return (
      <>
        <div className="">
          <ol className="relative border-s border-[#4993A4]">
            {allData?.map((item: any) => {
              return (
                <li className="">
                  <div className="absolute w-3 h-3 bg-[#4993A4] rounded-full -start-1.5 border border-[#4993A4] dark:border-gray-900 dark:bg-gray-700"></div>
                  <div className="pl-3">
                    <table>
                      <tr>
                        <td
                          style={{ width: "230px" }}
                          className="text-start h-8"
                        >
                          <p className="text-sm mt-[-20px]">
                            {item?.reportDate &&
                              moment(item?.reportDate).format("ll")}
                          </p>
                        </td>
                        <td className="text-start">
                          {item?.values?.map(
                            (value: any, valueIndex: number) => (
                              <p
                                className="text-sm mt-[-20px] ml-[-11px]"
                                key={valueIndex}
                              >
                                {value?.value} {value?.unit}
                              </p>
                            )
                          )}
                        </td>
                      </tr>
                    </table>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </>
    );
  };

  const form = useForm<SelectPatient>({
    resolver: yupResolver(selectMergePatient),
    defaultValues: {
      patientId: {},
    },
  });

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "#fff",
      border: state.isFocused
        ? "1px solid #016B83"
        : form?.formState?.errors?.patientId
        ? "2px solid red"
        : "1px solid #A0AEC0",
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
      backgroundColor: state.isFocused ? "#E5ECED" : "#fff",
      color: state.isFocused ? "#01576A" : "#526279",
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

  const toggleClose = () => {
    setIsModalOpen((prev) => !prev);
  };

  const toggleReportClose = () => {
    setReportIsModalOpen((prev) => !prev);
  };
  const toggleClose1 = () => {
    setOpenFile((prev) => !prev);
  };
  const toggleShareClose = () => {
    setIsModalShareOpen((prev) => !prev);
  };

  const handleSelectChange = (option: { value: string; label: string }) => {
    setSelectedOption(option);
    form.setValue("patientId", option, { shouldValidate: true });
    form.clearErrors("patientId");
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

  const handleMegreAccount = async () => {
    const data: any = form.watch("patientId");
    if (!data.value) {
      form.setError("patientId", {
        type: "manual",
        message: "Patient is required",
      });
      return;
    }

    const payload = {
      clientIdToDelete: data?.value,
      clientIdToMerge: reportId,
    };

    try {
      const resData: any = await createReportText(payload);
      if (resData?.data?.success) {
        toggleClose();
        fetchPatient();
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  const togglePatientsClose = () => {
    setPatientModalOpen((prev) => !prev);
  };

  const togglePatientsDownloadClose = () => {
    setOpationOpen((prev) => !prev);
  };

  const DropdownFiilter = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="text-gray-500 font-normal border-0 shadow-none text-sm flex items-center p-1">
          <EllipsisVertical />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto mr-4">
        <DropdownMenuGroup>
          {/* <DropdownMenuItem
            className="cursor-pointer text-[#1A2435]"
            style={{ fontSize: "16px" }}
            onClick={() => toggleShareClose()}
          >
            <Share /> Share Profile
          </DropdownMenuItem> */}
          {orgPermission?.allowPatientDataDownload &&
            userData?.permissions.includes("allowPatientDataDownload") && (
              <DropdownMenuItem
                className="cursor-pointer text-[#1A2435]"
                style={{ fontSize: "16px" }}
                onClick={() => setOpationOpen(true)}
              >
                <DownloadIcon /> Download Patient Data
              </DropdownMenuItem>
            )}
          <DropdownMenuItem
            className="cursor-pointer text-[#1A2435]"
            style={{ fontSize: "16px" }}
            onClick={() => setPatientRequest(true)}
          >
            <HandHeart /> Request Patient Data
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-[#1A2435]"
            style={{ fontSize: "16px" }}
            onClick={() => togglePatientsClose()}
          >
            <UserRoundPen /> Edit Patient
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-[#1A2435]"
            style={{ fontSize: "16px" }}
            onClick={() => setIsModalOpen(true)}
          >
            <Merge /> Merge Account
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const handleDeletePatient = async () => {
    setDeleteLoading(true);
    const result = await deletePatient(
      `${API_CONSTANTS.DELETE_PATIENT}${reportId}`
    );
    if (result.success) {
      navigate(ROUTES.PATIENTS);
    }
    setDeleteLoading(false);
  };

  const handlePatientRequest = async () => {
    const payload = {
      clientId: reportId,
    };
    const res: any = await sendPatientRequest(payload);
    if (res.data.success) {
      setPatientRequest(false);
    }
  };
  const [isgraph, setIsgraph] = useState(false);
  const handleFullAccessChange = (value: boolean) => setIsgraph(value);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [isEditingConditions, setIsEditingConditions] = useState(false);
  const [isEditingOrgans, setIsEditingOrgans] = useState(false);
  const [isEditingOverallHealthSummary, setIsEditingOverallHealthSummary] =
    useState(false);
  const [editableData, setEditableData] = useState<any>();
  console.log("editableData", editableData);

  const [changes, setChanges] = useState<any[]>([]);
  // state: track expanded metric index per organ (organ = outer 'index' you already have)
  const [expandedRowsByOrgan, setExpandedRowsByOrgan] = useState<
    Record<number, number | null>
  >({});

  const toggleRow = (organIndex: number, mIndex: number) => {
    setExpandedRowsByOrgan((prev) => {
      const current = prev[organIndex] ?? null;
      return {
        ...prev,
        [organIndex]: current === mIndex ? null : mIndex,
      };
    });
  };

  useEffect(() => {
    if (reportDataInfo) {
      setEditableData({
        medicalHistory: reportDataInfo.medicalHistory || [],
        conditions: sortedConditions || [],
        organs: reportDataInfo.organSystemCards || [],
        healthSummary: reportDataInfo.overallHealthSummary || "",
      });
    }
  }, [reportDataInfo, sortedConditions]);

  const { postData: sendReportChangeRequest } = usePostApi<any>({
    path: `${API_CONSTANTS.PATIENTS.PATIENT_CHANGE_REPORT_DATA}/${reportId}`,
  });

  const { postData: sendReportNumberChangeRequest } = usePostApi<any>({
    path: `${API_CONSTANTS.PATIENTS.PATIENT_CHANGE_REPORT_DATA_NUMBER}/${reportId}`,
  });

  // Generic toggle
  const handleToggleEdit = (
    section: "history" | "conditions" | "organs" | "healthSummary",
    isEditing: boolean
  ) => {
    if (section === "history") setIsEditingHistory(isEditing);
    if (section === "conditions") setIsEditingConditions(isEditing);
    if (section === "organs") setIsEditingOrgans(isEditing);
    if (section === "healthSummary")
      setIsEditingOverallHealthSummary(isEditing);

    if (!isEditing) {
      // Cancel edits — revert all
      setEditableData({
        medicalHistory: reportDataInfo?.medicalHistory || [],
        conditions: sortedConditions || [],
        organs: reportDataInfo?.organSystemCards || [],
        healthSummary: reportDataInfo?.overallHealthSummary || "",
      });
      setChanges([]);
    }
  };

  const handleInputChange = (
    section: "history" | "conditions" | "organs" | "healthSummary",
    outerIndex: number,
    innerIndex: number,
    subIndex: number | null,
    field: string,
    value: string
  ) => {
    const newData = JSON.parse(JSON.stringify(editableData));
    if (section === "history") {
      if (subIndex !== null) {
        newData.medicalHistory[outerIndex].testsAndConditions[
          innerIndex
        ].metrics[subIndex][field] = value;
      } else {
        if (field === "condition") {
          newData.medicalHistory[outerIndex].testsAndConditions[
            innerIndex
          ].name = value;
        } else {
          newData.medicalHistory[outerIndex].testsAndConditions[innerIndex][
            field
          ] = value;
        }
      }
    } else if (section === "conditions") {
      if (field === "condition") {
        newData.conditions[outerIndex].name = value;
      } else if (field === "name") {
        newData.conditions[outerIndex][field] = value;
      } else if (subIndex !== null) {
        newData.conditions[outerIndex].metrics[subIndex][field] = value;
      } else {
        newData.conditions[outerIndex].observations[innerIndex] = value;
      }
    } else if (section === "organs") {
      if (subIndex !== null) {
        // Editing a metric inside metrics array
        newData.organs[outerIndex].metrics[subIndex][field] = value;
      } else {
        // Editing top-level organ fields (like organ name)
        newData.organs[outerIndex][field] = value;
      }
    } else if (section === "healthSummary") {
      newData.healthSummary = value;
    }
    setEditableData(newData);
  };

  // const handleBlurChange = async (entity: string, originalValue: string, updatedValue: string) => {
  //   if (originalValue !== updatedValue) {
  //     setChanges((prev) => {
  //       const existingIndex = prev.findIndex((item) => item.originalValue === originalValue);
  //       if (existingIndex !== -1) {
  //         const updatedChanges = [...prev];
  //         updatedChanges[existingIndex] = { entity, originalValue, updatedValue };
  //         return updatedChanges;
  //       } else {
  //         return [...prev, { entity, originalValue, updatedValue }];
  //       }
  //     });
  //   }
  // };

  const handleBlurChange = async (
    entity: string,
    originalValue: string,
    updatedValue: string
  ) => {
    if (originalValue !== updatedValue) {
      setChanges((prev) => {
        // 🟢 If it's healthSummary, handle directly
        if (entity === "healthSummary") {
          const existingIndex = prev.findIndex(
            (item) => item.entity === "healthSummary"
          );
          if (existingIndex !== -1) {
            // Replace existing summary change
            const updatedChanges = [...prev];
            updatedChanges[existingIndex] = {
              entity,
              originalValue,
              updatedValue,
            };
            return updatedChanges;
          } else {
            // Add new summary change
            return [...prev, { entity, originalValue, updatedValue }];
          }
        }

        // 🟡 Default logic for others
        const existingIndex = prev.findIndex(
          (item) => item.originalValue === originalValue
        );
        if (existingIndex !== -1) {
          const updatedChanges = [...prev];
          updatedChanges[existingIndex] = {
            entity,
            originalValue,
            updatedValue,
          };
          return updatedChanges;
        } else {
          return [...prev, { entity, originalValue, updatedValue }];
        }
      });
    }
  };

  // Holds the live edits in the table
  const [editableMetrics, setEditableMetrics] = useState<any>({});
  const [metricChanges, setMetricChanges] = useState<any[]>([]);

  const handleMetricChange = (
    section: "history" | "conditions" | "organs",
    outerIndex: number, // hIndex or cIndex (history/condition container)
    innerIndex: number, // cIndex for history.testsAndConditions
    mIndex: number, // metric index
    field: string,
    value: string
  ) => {
    setEditableMetrics((prev: any) => {
      const copy = { ...prev };
      if (section === "organs") {
        if (!copy[section]) copy[section] = [];
        while (copy[section].length <= outerIndex) copy[section].push([]);
        while (copy[section][outerIndex].length <= mIndex)
          copy[section][outerIndex].push({});
        copy[section][outerIndex][mIndex][field] = value;
      } else {
        if (!copy[section]) copy[section] = {};
        if (!copy[section][outerIndex]) copy[section][outerIndex] = {};
        if (!copy[section][outerIndex][innerIndex])
          copy[section][outerIndex][innerIndex] = {};
        if (!copy[section][outerIndex][innerIndex][mIndex])
          copy[section][outerIndex][innerIndex][mIndex] = {};

        copy[section][outerIndex][innerIndex][mIndex][field] = value;
      }
      return copy;
    });
  };

  // const handleMetricBlur = (
  //   section: "history" | "conditions" | "organs",
  //   outerIndex: number, // hIndex or cIndex
  //   innerIndex: number, // cIndex for history.testsAndConditions, 0 for conditions
  //   mIndex: number,     // metric index
  //   field: string
  // ) => {
  //   const liveValue = editableMetrics?.[section]?.[outerIndex]?.[innerIndex]?.[mIndex]?.[field];

  //   let originalMetric: any;
  //   let metricKey: string | undefined;

  //   if (section === "history") {
  //     originalMetric = reportDataInfo.medicalHistory[outerIndex].testsAndConditions[innerIndex].metrics[mIndex];
  //     metricKey = originalMetric.metric;
  //   } else if (section === "conditions") {
  //     originalMetric = reportDataInfo.conditions[outerIndex].metrics[mIndex];
  //     metricKey = originalMetric.metric;
  //   }

  //   if (liveValue === undefined || liveValue === originalMetric[field]) return;

  //   const newChange = {
  //     metric: metricKey,
  //     updateColumn: field,
  //     originalValue: originalMetric[field],
  //     updatedValue: liveValue,
  //     value: originalMetric.value ?? null,
  //     unit: originalMetric.unit ?? null,
  //     range: originalMetric.range ?? null,
  //     highRisk: true,
  //   };

  //   setMetricChanges((prev) => {
  //     const existingIndex = prev.findIndex(
  //       (c) => c.metric === metricKey && c.updateColumn === field
  //     );

  //     if (existingIndex !== -1) {
  //       const updated = [...prev];
  //       updated[existingIndex] = newChange;
  //       return updated;
  //     } else {
  //       return [...prev, newChange];
  //     }
  //   });
  // };

  const handleMetricBlur = (
    section: "history" | "conditions" | "organs",
    outerIndex: number, // organIndex / hIndex / cIndex
    innerIndex: number, // only used for history, ignored for organs
    mIndex: number, // metric index
    field: string
  ) => {
    let liveValue;

    if (section === "organs") {
      liveValue = editableMetrics?.[section]?.[outerIndex]?.[mIndex]?.[field];
    } else {
      liveValue =
        editableMetrics?.[section]?.[outerIndex]?.[innerIndex]?.[mIndex]?.[
          field
        ];
    }

    let originalMetric: any;
    let metricKey: string | undefined;

    if (section === "history") {
      originalMetric =
        reportDataInfo.medicalHistory[outerIndex].testsAndConditions[innerIndex]
          .metrics[mIndex];
      metricKey = originalMetric.metric;
    } else if (section === "conditions") {
      originalMetric = reportDataInfo.conditions[outerIndex].metrics[mIndex];
      metricKey = originalMetric.metric;
    } else if (section === "organs") {
      originalMetric =
        reportDataInfo.organSystemCards[outerIndex].metrics[mIndex];
      metricKey = originalMetric.metric;
    }

    // If value didn't change, do nothing
    if (liveValue === undefined || liveValue === originalMetric[field]) return;

    const newChange = {
      metric: metricKey,
      updateColumn: field,
      originalValue: originalMetric[field],
      updatedValue: liveValue,
      value: originalMetric.value ?? null,
      unit: originalMetric.unit ?? null,
      range: originalMetric.range ?? null,
      highRisk: true,
      mIndex: mIndex,
      innerIndex: innerIndex,
      outerIndex: outerIndex,
    };

    setMetricChanges((prev) => {
      const existingIndex = prev.findIndex(
        (c) =>
          c.metric === metricKey &&
          c.updateColumn === field &&
          c.outerIndex === outerIndex &&
          c.innerIndex === innerIndex &&
          c.mIndex === mIndex
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = newChange;
        return updated;
      } else {
        return [...prev, newChange];
      }
    });
  };

  const [loader, setLoader] = useState(false);

  const handleSubmit = async (finalData: any) => {
    setLoader(true);
    const updatedMetrics = metricChanges.map((metricItem) => {
      const match = finalData.find(
        (fItem: any) => fItem.originalValue === metricItem.metric
      );
      if (match) {
        return { ...metricItem, metric: match.updatedValue };
      }
      return metricItem;
    });
    try {
      let resData: any = null;
      let resNumberData: any = null;

      // ✅ Call first API only if finalData has items
      if (finalData.length > 0) {
        resData = await sendReportChangeRequest(finalData);
      }

      // ✅ Call second API only if updatedMetrics has items
      if (updatedMetrics.length > 0) {
        resNumberData = await sendReportNumberChangeRequest(updatedMetrics);
      }

      // ✅ Only proceed if any API call actually happened and succeeded
      if (resData || resNumberData) {
        fetchReports();
        setChanges([]);
        setMetricChanges([]);
        setLoader(false);
      } else {
        setLoader(false);
        console.log("No changes to submit — skipping API calls.");
      }
    } catch (error) {
      setLoader(false);
      console.error("Error during report submission:", error);
    }
  };

  return (
    <>
      {IsReportError ? (
        <div className="mb-4">
          <div className="flex items-center justify-center py-10 px-6 m-4 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
            <p className="text-gray-500 text-center text-base font-medium">
              No EMR History Added
            </p>
          </div>
        </div>
      ) : (
        <div
          className="p-4 rounded-lg transition-all  text-gray-800 dark:bg-gray-800 dark:text-white"
          style={{ marginLeft: state == "collapsed" ? "28px" : "" }}
        >
          {userData?.role != "client" && (
            <header className="mb-4 flex justify-between items-center -mt-10">
              <AppButton
                onClick={() => navigate(-1)}
                className="py-3 rounded-[30px] w-[130px] h-[40px] !bg-white !text-[#293343] border-none flex items-center justify-center pl-1 text-sm"
              >
                <ArrowLeft className="w-7 h-7" />
                Back
              </AppButton>
              <span className="flex items-center">
                <AppButton
                  className="mt-10 flex w-[120px] sm:w-[147px] h-[40px] py-[6px] justify-center items-center flex-shrink-0 !text-[#334155] !bg-white border-none mr-[8px] rounded-[30px] text-sm"
                  onClick={() => setReportIsModalOpen(true)}
                >
                  <Plus /> Add Report
                </AppButton>
                <span
                  className={`cursor-pointer bg-white rounded-full text-[#293343] hover:text-[#293343] p-1 mt-10 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]`}
                >
                  <DropdownFiilter />
                </span>
              </span>
            </header>
          )}
          {/* Patient report Loader boxes start from here */}
          {isLoading ? (
            <div className="mb-4 shimmer-box">
              <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                <div className="rounded-full bg-gray-200 h-10 w-10 animate-pulse"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4 mt-4 w-2/4">
                <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {IsReportError ? (
                <div className="mb-4">
                  <div className="flex items-center justify-center py-10 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                    <p className="text-gray-500 text-center text-base font-medium">
                      Health summary not found
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <section className="shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                    <div className="p-6">
                      <h2 className="text-[32px] font-semibold text-[#1A2435] text-start">
                        {reportDataInfo?.clientId?.name}
                        <span className="font-semibold ml-2 text-[#8C929A]">
                          {Number(reportDataInfo?.clientId?.age || 0)},{" "}
                          {reportDataInfo?.clientId?.gender}
                        </span>
                      </h2>
                      <p className="flex text-[16px] text-[#8C929A] font-semibold">
                        <img src={idImage}></img>
                        <span className="font-normal ml-1">
                          {reportDataInfo?.clientId?._id}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {reportDataInfo?.clientId?.physicians.map(
                          (doctor: any, index: any) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-[#F7F8F8] text-[#1A2435] rounded-md text-[12px] font-normal border border-[#E6E7E9] h-[27px]"
                            >
                              {doctor}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </section>

                  {reportDataInfo?.overallHealthSummary && (
                    <section className="mt-6 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl  bg-white">
                      <div className="grid grid-cols-1 p-6 mt-6">
                        <div className="">
                          <h2 className="flex justify-between text-[24px] font-semibold text-[#1A2435] mb-1 text-start">
                            {/* <img src={GroupImage}></img> */}
                            <span className="font-normal">Health Summary</span>
                            {orgPermission?.allowPatientDataEdit &&
                              userData?.permissions.includes(
                                "allowPatientDataEdit"
                              ) && (
                                <span className="mt-[5px]">
                                  <TooltipProvider>
                                    {!isEditingOverallHealthSummary ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Edit
                                            className="w-5 h-5 text-gray-300 cursor-pointer"
                                            onClick={() =>
                                              handleToggleEdit(
                                                "healthSummary",
                                                true
                                              )
                                            }
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                          <p>Edit</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <CheckCircle2
                                            className="w-6 h-6 text-[#016B83] cursor-pointer"
                                            onClick={() => {
                                              handleSubmit(changes);
                                              handleToggleEdit(
                                                "healthSummary",
                                                false
                                              );
                                            }}
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                          <p>Save</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </TooltipProvider>
                                </span>
                              )}
                          </h2>
                          <p className="flex text-start font-normal text-[16px] text-[#394557] leading-22">
                            {isEditingOverallHealthSummary ? (
                              <>
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex flex-col w-full"
                                >
                                  <textarea
                                    rows={4}
                                    value={editableData?.healthSummary ?? ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "healthSummary",
                                        0,
                                        0,
                                        null,
                                        "healthSummary",
                                        e.target.value
                                      )
                                    }
                                    onBlur={(e) =>
                                      handleBlurChange(
                                        "healthSummary",
                                        reportDataInfo?.overallHealthSummary,
                                        e.target.value
                                      )
                                    }
                                    className="border p-2 rounded text-[16px] w-full resize-none focus:outline-none focus:border-[#016B83]"
                                    // placeholder="Enter health summary..."
                                  />
                                </div>
                              </>
                            ) : (
                              <>{reportDataInfo?.overallHealthSummary}</>
                            )}
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                  <div className="flex flex-wrap gap-2 mt-10 lg:flex-nowrap">
                    {(sortedConditions?.length > 0 ||
                      reportDataInfo?.organSystemCards?.length > 0 ||
                      reportDataInfo?.medicalHistory?.length > 0 ||
                      reportDataInfo?.topInsights?.length > 0) &&
                      !userData?.role?.includes("client") && (
                        <AppButton
                          className={`w-13 h-10 mt-0 rounded-3xl border flex justify-center shadow-none ${
                            selectedTab === "All"
                              ? "!bg-[#CCE1E6] !text-[#016B83] !border-[#CCE1E6]"
                              : "!bg-white !text-[#666D79] border-[#E6E6E8]"
                          }`}
                          onClick={() => setSelectedTab("All")}
                        >
                          All
                        </AppButton>
                      )}

                    {reportDataInfo?.medicalHistory?.length > 0 && (
                      <AppButton
                        className={`w-13 h-10 mt-0 rounded-3xl border flex justify-center shadow-none ${
                          selectedTab === "Medical History"
                            ? "!bg-[#CCE1E6] !text-[#016B83] !border-[#CCE1E6]"
                            : "!bg-white !text-[#666D79] border-[#E6E6E8]"
                        }`}
                        onClick={() => setSelectedTab("Medical History")}
                      >
                        Medical History
                      </AppButton>
                    )}

                    {sortedConditions?.length > 0 &&
                      !userData?.role?.includes("client") && (
                        <AppButton
                          className={`w-13 h-10 mt-0 rounded-3xl border flex justify-center shadow-none ${
                            selectedTab === "Medical Conditions"
                              ? "!bg-[#CCE1E6] !text-[#016B83] !border-[#CCE1E6]"
                              : "!bg-white !text-[#666D79] border-[#E6E6E8]"
                          }`}
                          onClick={() => setSelectedTab("Medical Conditions")}
                        >
                          Tests & Conditions
                        </AppButton>
                      )}

                    {reportDataInfo?.organSystemCards?.length > 0 &&
                      !userData?.role?.includes("client") && (
                        <AppButton
                          className={`w-13 h-10 mt-0 rounded-3xl border flex justify-center shadow-none ${
                            selectedTab === "Organ Systems"
                              ? "!bg-[#CCE1E6] !text-[#016B83] !border-[#CCE1E6]"
                              : "!bg-white !text-[#666D79] border-[#E6E6E8]"
                          }`}
                          onClick={() => setSelectedTab("Organ Systems")}
                        >
                          Organs
                        </AppButton>
                      )}

                    {reportDataInfo?.topInsights?.length > 0 &&
                      !userData?.role?.includes("client") && (
                        <AppButton
                          className={`w-13 h-10 mt-0 rounded-3xl border flex justify-center shadow-none ${
                            selectedTab === "Medistry Insights"
                              ? "!bg-[#CCE1E6] !text-[#016B83] !border-[#CCE1E6]"
                              : "!bg-white !text-[#666D79] border-[#E6E6E8]"
                          }`}
                          onClick={() => setSelectedTab("Medistry Insights")}
                        >
                          Medistry Insights
                        </AppButton>
                      )}
                    {reportsList?.length > 0 &&
                      !userData?.role?.includes("client") && (
                        <AppButton
                          className={`w-13 h-10 mt-0 rounded-3xl border flex justify-center shadow-none ${
                            selectedTab === "Reports"
                              ? "!bg-[#CCE1E6] !text-[#016B83] !border-[#CCE1E6]"
                              : "!bg-white !text-[#666D79] border-[#E6E6E8]"
                          }`}
                          onClick={() => setSelectedTab("Reports")}
                        >
                          Reports
                        </AppButton>
                      )}
                  </div>

                  {(selectedTab === "All" ||
                    selectedTab === "Medical History") &&
                    reportDataInfo?.medicalHistory?.length > 0 && (
                      <section className="mt-6 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                        <div className="grid grid-cols-1 p-6 mt-6">
                          <div className="flex justify-between items-center mb-[21px]">
                            <h2 className="flex text-[24px] font-semibold text-[#1A2435]">
                              <span className="font-normal">
                                Medical History
                              </span>
                            </h2>

                            {orgPermission?.allowPatientDataEdit &&
                              userData?.permissions.includes(
                                "allowPatientDataEdit"
                              ) && (
                                <TooltipProvider>
                                  {!isEditingHistory ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Edit
                                          className="w-5 h-5 text-gray-300 cursor-pointer"
                                          onClick={() =>
                                            handleToggleEdit("history", true)
                                          }
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p>Edit</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <CheckCircle2
                                          className="w-6 h-6 text-[#016B83] cursor-pointer"
                                          onClick={() => {
                                            handleSubmit(changes);
                                            handleToggleEdit("history", false);
                                          }}
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p>Save</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </TooltipProvider>
                              )}
                          </div>

                          <ol className="relative border-s-[2px] border-[#4993A4] ml-[5px]">
                            {loader ? (
                              <div className="mb-4 shimmer-box">
                                <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                                  <div className="rounded-full bg-gray-200 h-10 w-10 animate-pulse"></div>
                                  <div className="flex-1 space-y-4 py-1">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="space-y-2">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                                  <div className="flex-1 space-y-4 py-1">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="space-y-2">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-4 mt-4 w-2/4">
                                  <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                  </div>
                                  <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                  </div>
                                  <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                  </div>
                                  <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                  </div>
                                  <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                  </div>
                                </div>
                                <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                                  <div className="flex-1 space-y-4 py-1">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="space-y-2">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              editableData.medicalHistory?.map(
                                (history: any, hIndex: number) => (
                                  <li key={hIndex} className="ms-4">
                                    <div className="flex">
                                      <div className="absolute w-3 h-3 bg-[#4993A4] rounded-full ml-[-22.5px] mt-[1px]"></div>
                                      <time className="block my-2 text-sm font-normal text-[#016B83]">
                                        {moment(
                                          history?.reportIdentification
                                            ?.reportDate
                                        ).format("LL")}
                                      </time>
                                    </div>

                                    {history?.testsAndConditions?.map(
                                      (item: any, cIndex: number) => {
                                        const value = `item-${hIndex}-${cIndex}`;

                                        return (
                                          <Accordion
                                            key={cIndex}
                                            type="multiple"
                                            className="w-full mb-2"
                                            value={openItems}
                                            onValueChange={setOpenItems}
                                          >
                                            <AccordionItem
                                              value={`item-${hIndex}-${cIndex}`}
                                            >
                                              <AccordionTrigger className="bg-white data-[state=open]:bg-[#016B8333] text-[#394557] rounded-t-lg py-2 cursor-pointer transition-all duration-200">
                                                <div
                                                  className="flex flex-col text-start w-full"
                                                  onClick={(e) => {
                                                    // Let accordion toggle normally when not clicking inside input
                                                    const target =
                                                      e.target as HTMLElement;
                                                    if (
                                                      target.tagName ===
                                                        "INPUT" ||
                                                      target.closest("input")
                                                    ) {
                                                      e.stopPropagation();
                                                    }
                                                  }}
                                                >
                                                  {isEditingHistory ? (
                                                    <>
                                                      <div className="flex flex-col">
                                                        <input
                                                          type="text"
                                                          value={item.name}
                                                          onChange={(e) =>
                                                            handleInputChange(
                                                              "history",
                                                              hIndex,
                                                              cIndex,
                                                              null,
                                                              "condition",
                                                              e.target.value
                                                            )
                                                          }
                                                          onBlur={(e) =>
                                                            handleBlurChange(
                                                              "condition",
                                                              reportDataInfo
                                                                .medicalHistory[
                                                                hIndex
                                                              ]
                                                                .testsAndConditions[
                                                                cIndex
                                                              ].name,
                                                              e.target.value
                                                            )
                                                          }
                                                          className="font-semibold text-[16px] w-[23%] p-1 rounded border border-gray-300 focus:border-[rgb(1,87,106)] focus:outline-none"
                                                          onClick={(e) =>
                                                            e.stopPropagation()
                                                          } // prevent accordion toggle when editing
                                                        />
                                                        <input
                                                          type="text"
                                                          value={
                                                            item.quickSummary
                                                          }
                                                          onChange={(e) =>
                                                            handleInputChange(
                                                              "history",
                                                              hIndex,
                                                              cIndex,
                                                              null,
                                                              "quickSummary",
                                                              e.target.value
                                                            )
                                                          }
                                                          onBlur={(e) =>
                                                            handleBlurChange(
                                                              "quickSummary",
                                                              reportDataInfo
                                                                .medicalHistory[
                                                                hIndex
                                                              ]
                                                                .testsAndConditions[
                                                                cIndex
                                                              ].quickSummary,
                                                              e.target.value
                                                            )
                                                          }
                                                          className="text-[14px] mt-1 text-[#394557] p-1 rounded w-full border border-gray-300 focus:border-[rgb(1,87,106)] focus:outline-none"
                                                          onClick={(e) =>
                                                            e.stopPropagation()
                                                          } // prevent accordion toggle when editing
                                                        />
                                                      </div>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <p className="font-semibold text-[16px]">
                                                        {item.name}
                                                      </p>
                                                      <p className="text-[14px] text-[#394557]">
                                                        {item.quickSummary}
                                                      </p>
                                                    </>
                                                  )}
                                                </div>
                                              </AccordionTrigger>

                                              <AccordionContent
                                                className="text-[#394557] bg-[#CCE1E6] rounded-b-lg cursor-pointer"
                                                onClick={(e) => {
                                                  const target =
                                                    e.target as HTMLElement;
                                                  if (
                                                    target.closest("input") ||
                                                    target.closest("button") ||
                                                    target.closest("table") ||
                                                    target.closest("tr") ||
                                                    target.closest("td")
                                                  ) {
                                                    return; // do not close when clicking inside table/input
                                                  }
                                                  setOpenItems((prev) =>
                                                    prev.filter(
                                                      (v) => v !== value
                                                    )
                                                  ); // close this one
                                                }}
                                              >
                                                <table className="w-full text-left border-collapse bg-white">
                                                  <tbody>
                                                    {item?.metrics?.map(
                                                      (
                                                        metric: any,
                                                        mIndex: number
                                                      ) => (
                                                        <tr
                                                          key={mIndex}
                                                          className="border-b"
                                                        >
                                                          {/* Metric Name */}
                                                          <td className="px-4 py-2 text-[#394557] font-semibold w-[25%]">
                                                            {isEditingHistory ? (
                                                              <input
                                                                type="text"
                                                                value={
                                                                  metric.metric
                                                                }
                                                                onChange={(e) =>
                                                                  handleInputChange(
                                                                    "history",
                                                                    hIndex,
                                                                    cIndex,
                                                                    mIndex,
                                                                    "metric",
                                                                    e.target
                                                                      .value
                                                                  )
                                                                }
                                                                onBlur={(e) =>
                                                                  handleBlurChange(
                                                                    "metric",
                                                                    reportDataInfo
                                                                      .medicalHistory[
                                                                      hIndex
                                                                    ]
                                                                      .testsAndConditions[
                                                                      cIndex
                                                                    ].metrics[
                                                                      mIndex
                                                                    ].metric,
                                                                    e.target
                                                                      .value
                                                                  )
                                                                }
                                                                className="p-1 rounded w-full border border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                              />
                                                            ) : (
                                                              metric.metric
                                                            )}
                                                          </td>

                                                          {/* Value */}
                                                          <td className="px-4 py-2 text-gray-700 w-[20%]">
                                                            {isEditingHistory ? (
                                                              <input
                                                                type="text"
                                                                value={
                                                                  editableMetrics
                                                                    ?.history?.[
                                                                    hIndex
                                                                  ]?.[cIndex]?.[
                                                                    mIndex
                                                                  ]?.value ??
                                                                  metric.value
                                                                }
                                                                onChange={(e) =>
                                                                  handleMetricChange(
                                                                    "history",
                                                                    hIndex,
                                                                    cIndex,
                                                                    mIndex,
                                                                    "value",
                                                                    e.target
                                                                      .value
                                                                  )
                                                                }
                                                                onBlur={() =>
                                                                  handleMetricBlur(
                                                                    "history",
                                                                    hIndex,
                                                                    cIndex,
                                                                    mIndex,
                                                                    "value"
                                                                  )
                                                                }
                                                                className="p-1 rounded w-full border border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                              />
                                                            ) : (
                                                              metric.value
                                                            )}
                                                          </td>

                                                          {/* Unit */}
                                                          <td className="px-4 py-2 text-[#8C929A] w-[20%]">
                                                            {isEditingHistory ? (
                                                              <input
                                                                type="text"
                                                                value={
                                                                  editableMetrics
                                                                    ?.history?.[
                                                                    hIndex
                                                                  ]?.[cIndex]?.[
                                                                    mIndex
                                                                  ]?.unit ??
                                                                  metric.unit
                                                                }
                                                                onChange={(e) =>
                                                                  handleMetricChange(
                                                                    "history",
                                                                    hIndex,
                                                                    cIndex,
                                                                    mIndex,
                                                                    "unit",
                                                                    e.target
                                                                      .value
                                                                  )
                                                                }
                                                                onBlur={() =>
                                                                  handleMetricBlur(
                                                                    "history",
                                                                    hIndex,
                                                                    cIndex,
                                                                    mIndex,
                                                                    "unit"
                                                                  )
                                                                }
                                                                className="p-1 rounded w-full border border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                              />
                                                            ) : (
                                                              metric.unit
                                                            )}
                                                          </td>

                                                          {/* Range */}
                                                          <td className="px-4 py-2 text-[#8C929A] w-[20%]">
                                                            {isEditingHistory ? (
                                                              <input
                                                                type="text"
                                                                value={
                                                                  editableMetrics
                                                                    ?.history?.[
                                                                    hIndex
                                                                  ]?.[cIndex]?.[
                                                                    mIndex
                                                                  ]?.range ??
                                                                  metric.range
                                                                }
                                                                onChange={(e) =>
                                                                  handleMetricChange(
                                                                    "history",
                                                                    hIndex,
                                                                    cIndex,
                                                                    mIndex,
                                                                    "range",
                                                                    e.target
                                                                      .value
                                                                  )
                                                                }
                                                                onBlur={() =>
                                                                  handleMetricBlur(
                                                                    "history",
                                                                    hIndex,
                                                                    cIndex,
                                                                    mIndex,
                                                                    "range"
                                                                  )
                                                                }
                                                                className="p-1 rounded w-full border border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                              />
                                                            ) : (
                                                              metric.range
                                                            )}
                                                          </td>
                                                          <td className="px-4 py-2 text-[#8C929A] w-[25%]">
                                                            {/* {metric.historicDate}  */}
                                                            {metric?.historicDate
                                                              ? moment(
                                                                  metric.historicDate
                                                                ).format("LL")
                                                              : item.lastReportedDate
                                                              ? moment(
                                                                  item.lastReportedDate
                                                                ).format("LL")
                                                              : null}
                                                          </td>
                                                        </tr>
                                                      )
                                                    )}
                                                  </tbody>
                                                </table>
                                              </AccordionContent>
                                            </AccordionItem>
                                          </Accordion>
                                        );
                                      }
                                    )}
                                  </li>
                                )
                              )
                            )}
                          </ol>
                        </div>
                      </section>
                    )}

                  {(selectedTab === "All" ||
                    selectedTab === "Medical Conditions") &&
                    !userData?.role?.includes("client") &&
                    sortedConditions?.length > 0 && (
                      <section className="mt-6 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                        <div className="grid grid-cols-1 p-6 mt-6">
                          <div className="flex justify-between items-center mb-[21px]">
                            <h2 className="flex text-[24px] font-semibold text-[#1A2435]">
                              <span className="font-normal">
                                Tests & Conditions
                              </span>
                            </h2>
                            {orgPermission?.allowPatientDataEdit &&
                              userData?.permissions.includes(
                                "allowPatientDataEdit"
                              ) && (
                                <TooltipProvider>
                                  {!isEditingConditions ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Edit
                                          className="w-5 h-5 text-gray-300 cursor-pointer"
                                          onClick={() =>
                                            handleToggleEdit("conditions", true)
                                          }
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p>Edit</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <CheckCircle2
                                          className="w-6 h-6 text-[#016B83] cursor-pointer"
                                          onClick={() => {
                                            handleSubmit(changes);
                                            handleToggleEdit(
                                              "conditions",
                                              false
                                            );
                                          }}
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p>Save</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </TooltipProvider>
                              )}
                          </div>

                          <Accordion
                            type="multiple"
                            className="w-full"
                            value={openItems}
                            onValueChange={setOpenItems}
                          >
                            {loader ? (
                              <div className="mb-4 shimmer-box">
                                <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                                  <div className="rounded-full bg-gray-200 h-10 w-10 animate-pulse"></div>
                                  <div className="flex-1 space-y-4 py-1">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="space-y-2">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                                  <div className="flex-1 space-y-4 py-1">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="space-y-2">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-4 mt-4 w-2/4">
                                  <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                  </div>
                                  <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                  </div>
                                  <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                  </div>
                                  <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                  </div>
                                  <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                  </div>
                                </div>
                                <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                                  <div className="flex-1 space-y-4 py-1">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="space-y-2">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              editableData.conditions?.map(
                                (item: any, cIndex: number) => {
                                  const value = `condition-${cIndex}`;

                                  return (
                                    <AccordionItem
                                      key={cIndex}
                                      value={value}
                                      className="data-[state=closed]:bg-[#fff] data-[state=open]:bg-[#016B8333] rounded-t-lg rounded-b-lg mb-[10px]"
                                    >
                                      <AccordionTrigger
                                        className="bg-[#F8F9FA] border border-[#EDEFF1] rounded-lg data-[state=open]:bg-[#CCE1E6] data-[state=open]:text-[#016B83] text-[#394557] pt-[11px] pb-[11px]"
                                        onClick={() => toggleItem(value)} // manually control open/close
                                      >
                                        <div className="w-full flex justify-between items-center">
                                          <div className="flex items-center">
                                            <span className="bg-[#fff] rounded-full w-7 h-7 flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]">
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  clipRule="evenodd"
                                                  d="M12 5.33333H4.00001C3.26363 5.33333 2.66668 5.93029 2.66668 6.66667V12C2.66668 12.7364 3.26363 13.3333 4.00001 13.3333H12C12.7364 13.3333 13.3333 12.7364 13.3333 12V6.66667C13.3333 5.93029 12.7364 5.33333 12 5.33333ZM4.00001 4C2.52725 4 1.33334 5.19391 1.33334 6.66667V12C1.33334 13.4728 2.52725 14.6667 4.00001 14.6667H12C13.4728 14.6667 14.6667 13.4728 14.6667 12V6.66667C14.6667 5.19391 13.4728 4 12 4H4.00001Z"
                                                  fill="#8C929A"
                                                />
                                                <path
                                                  d="M8.00001 6.66666C7.63182 6.66666 7.33334 6.96513 7.33334 7.33332V8.66666H6.00001C5.63182 8.66666 5.33334 8.96513 5.33334 9.33332C5.33334 9.70151 5.63182 9.99999 6.00001 9.99999H7.33334V11.3333C7.33334 11.7015 7.63182 12 8.00001 12C8.3682 12 8.66668 11.7015 8.66668 11.3333V9.99999H10C10.3682 9.99999 10.6667 9.70151 10.6667 9.33332C10.6667 8.96513 10.3682 8.66666 10 8.66666H8.66668V7.33332C8.66668 6.96513 8.3682 6.66666 8.00001 6.66666Z"
                                                  fill="#8C929A"
                                                />
                                              </svg>
                                            </span>

                                            {isEditingConditions ? (
                                              <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) =>
                                                  handleInputChange(
                                                    "conditions",
                                                    cIndex,
                                                    0,
                                                    null,
                                                    "condition",
                                                    e.target.value
                                                  )
                                                }
                                                onBlur={(e) =>
                                                  handleBlurChange(
                                                    "condition",
                                                    sortedConditions[cIndex]
                                                      .name,
                                                    e.target.value
                                                  )
                                                }
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                                className="border border-gray-300 rounded px-2 py-1 ml-3 text-[18px] font-medium focus:outline-none focus:border-[#016B83]"
                                              />
                                            ) : (
                                              <p className="font-medium ml-3 text-[18px] mt-[1px]">
                                                {item.name}
                                              </p>
                                            )}

                                            <span className="bg-[#EBECEE] text-xs font-medium text-[#8C929A] px-2 py-1.5 rounded-md ml-3">
                                              {item.status}
                                            </span>
                                          </div>

                                          <span className="text-sm hidden md:block">
                                            {item?.lastReportedDate &&
                                              moment(
                                                item.lastReportedDate
                                              ).format("LL")}
                                          </span>
                                        </div>
                                      </AccordionTrigger>

                                      {/* 🟢 Click content to close */}
                                      <AccordionContent
                                        className="text-[#394557] cursor-pointer"
                                        style={{ padding: "10px" }}
                                        onClick={(e) => {
                                          const target =
                                            e.target as HTMLElement;
                                          if (
                                            target.closest("input") ||
                                            target.closest("button") ||
                                            target.closest("table") ||
                                            target.closest("tr") ||
                                            target.closest("td")
                                          ) {
                                            return; // do nothing if clicking inside input/table
                                          }
                                          setOpenItems((prev) =>
                                            prev.filter((v) => v !== value)
                                          ); // close this accordion
                                        }}
                                      >
                                        <div className="rounded-lg overflow-hidden">
                                          {/* Metrics Table */}
                                          {item?.metrics?.length > 0 && (
                                            <div
                                              className={`rounded-lg bg-white ${
                                                item?.observations?.length > 0
                                                  ? "rounded-b-none border-b-0"
                                                  : ""
                                              }`}
                                            >
                                              <table className="w-full text-left">
                                                <tbody>
                                                  {item.metrics.map(
                                                    (
                                                      metric: any,
                                                      mIndex: number
                                                    ) => (
                                                      <tr
                                                        key={mIndex}
                                                        className="border-b last:border-0 [&:only-child]:border-0"
                                                      >
                                                        <td className="px-5 py-3 font-semibold w-[30%] text-gray-700">
                                                          {isEditingConditions ? (
                                                            <input
                                                              type="text"
                                                              value={
                                                                metric.metric
                                                              }
                                                              onChange={(e) =>
                                                                handleInputChange(
                                                                  "conditions",
                                                                  cIndex,
                                                                  0,
                                                                  mIndex,
                                                                  "metric",
                                                                  e.target.value
                                                                )
                                                              }
                                                              onBlur={(e) =>
                                                                handleBlurChange(
                                                                  "metric",
                                                                  sortedConditions[
                                                                    cIndex
                                                                  ].metrics[
                                                                    mIndex
                                                                  ].metric,
                                                                  e.target.value
                                                                )
                                                              }
                                                              className="p-1 rounded w-full border border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                            />
                                                          ) : (
                                                            metric.metric
                                                          )}
                                                        </td>

                                                        <td className="px-4 py-2 text-gray-700 w-[20%]">
                                                          {isEditingConditions ? (
                                                            <>
                                                              <input
                                                                type="text"
                                                                value={
                                                                  editableMetrics
                                                                    ?.conditions?.[
                                                                    cIndex
                                                                  ]?.[mIndex]?.[
                                                                    mIndex
                                                                  ]?.value ??
                                                                  metric.value
                                                                }
                                                                onChange={(e) =>
                                                                  handleMetricChange(
                                                                    "conditions",
                                                                    cIndex,
                                                                    mIndex,
                                                                    mIndex,
                                                                    "value",
                                                                    e.target
                                                                      .value
                                                                  )
                                                                }
                                                                onBlur={() =>
                                                                  handleMetricBlur(
                                                                    "conditions",
                                                                    cIndex,
                                                                    mIndex,
                                                                    mIndex,
                                                                    "value"
                                                                  )
                                                                }
                                                                className="border p-1 rounded w-[60px] border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                              />
                                                              <input
                                                                type="text"
                                                                value={
                                                                  editableMetrics
                                                                    ?.conditions?.[
                                                                    cIndex
                                                                  ]?.[mIndex]?.[
                                                                    mIndex
                                                                  ]?.unit ??
                                                                  metric.unit
                                                                }
                                                                onChange={(e) =>
                                                                  handleMetricChange(
                                                                    "conditions",
                                                                    cIndex,
                                                                    mIndex,
                                                                    mIndex,
                                                                    "unit",
                                                                    e.target
                                                                      .value
                                                                  )
                                                                }
                                                                onBlur={() =>
                                                                  handleMetricBlur(
                                                                    "conditions",
                                                                    cIndex,
                                                                    mIndex,
                                                                    mIndex,
                                                                    "unit"
                                                                  )
                                                                }
                                                                className="border p-1 rounded w-[65px] border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                              />
                                                            </>
                                                          ) : (
                                                            <>
                                                              <span
                                                                className={`${
                                                                  metric.highRisk
                                                                    ? "text-[#f5604a]"
                                                                    : "text-gray-700"
                                                                }`}
                                                              >
                                                                {metric.value}
                                                              </span>{" "}
                                                              {metric.unit}
                                                            </>
                                                          )}
                                                        </td>

                                                        <td className="px-4 py-2 text-[#8C929A] w-[30%]">
                                                          {isEditingConditions ? (
                                                            <input
                                                              type="text"
                                                              value={
                                                                editableMetrics
                                                                  ?.conditions?.[
                                                                  cIndex
                                                                ]?.[mIndex]?.[
                                                                  mIndex
                                                                ]?.range ??
                                                                metric.range
                                                              }
                                                              onChange={(e) =>
                                                                handleMetricChange(
                                                                  "conditions",
                                                                  cIndex,
                                                                  mIndex,
                                                                  mIndex,
                                                                  "range",
                                                                  e.target.value
                                                                )
                                                              }
                                                              onBlur={() =>
                                                                handleMetricBlur(
                                                                  "conditions",
                                                                  cIndex,
                                                                  mIndex,
                                                                  mIndex,
                                                                  "range"
                                                                )
                                                              }
                                                              className="p-1 rounded w-full border border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                            />
                                                          ) : (
                                                            metric.range
                                                          )}
                                                        </td>
                                                        <td className="px-4 py-2 text-[#8C929A] text-end">
                                                          {/* {moment(metric.historicDate).format("LL")} */}
                                                          {/* {metric?.historicDate ? moment(metric.historicDate).format("LL") : null} */}
                                                          {metric?.historicDate
                                                            ? moment(
                                                                metric.historicDate
                                                              ).format("LL")
                                                            : item.lastReportedDate
                                                            ? moment(
                                                                item.lastReportedDate
                                                              ).format("LL")
                                                            : null}
                                                        </td>
                                                      </tr>
                                                    )
                                                  )}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}

                                          {/* Observations */}
                                          {item?.observations?.length > 0 && (
                                            <div className="bg-white border rounded-lg rounded-t-none p-3 border-t-1 border-x-0 border-b-0">
                                              <ul className="pl-2 space-y-1">
                                                {item.observations.map(
                                                  (
                                                    observation: any,
                                                    oIndex: number
                                                  ) => (
                                                    <li
                                                      key={oIndex}
                                                      className="text-start"
                                                    >
                                                      {isEditingConditions ? (
                                                        <input
                                                          type="text"
                                                          value={observation}
                                                          onChange={(e) =>
                                                            handleInputChange(
                                                              "conditions",
                                                              cIndex,
                                                              oIndex,
                                                              null,
                                                              "observation",
                                                              e.target.value
                                                            )
                                                          }
                                                          onBlur={(e) =>
                                                            handleBlurChange(
                                                              "observation",
                                                              sortedConditions[
                                                                cIndex
                                                              ].observations[
                                                                oIndex
                                                              ],
                                                              e.target.value
                                                            )
                                                          }
                                                          className="p-1 rounded w-full border border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                        />
                                                      ) : (
                                                        observation
                                                      )}
                                                    </li>
                                                  )
                                                )}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  );
                                }
                              )
                            )}
                          </Accordion>
                        </div>
                      </section>
                    )}

                  {reportDataInfo?.organSystemCards?.length ? (
                    <>
                      {(selectedTab === "All" ||
                        selectedTab === "Organ Systems") &&
                        !userData?.role?.includes("client") && (
                          <section className="mt-6 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                            <div className="p-6">
                              <div className="flex justify-between items-center mb-[21px]">
                                <h2 className="flex text-[24px] font-semibold text-[#1A2435]">
                                  <span className="font-normal">Organs</span>
                                </h2>

                                {orgPermission?.allowPatientDataEdit &&
                                  userData?.permissions.includes(
                                    "allowPatientDataEdit"
                                  ) && (
                                    <TooltipProvider>
                                      {!isEditingOrgans ? (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Edit
                                              className="w-5 h-5 text-gray-300 cursor-pointer"
                                              onClick={() =>
                                                handleToggleEdit("organs", true)
                                              }
                                            />
                                          </TooltipTrigger>
                                          <TooltipContent side="top">
                                            <p>Edit</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      ) : (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <CheckCircle2
                                              className="w-6 h-6 text-[#016B83] cursor-pointer"
                                              onClick={() => {
                                                handleSubmit(changes);
                                                handleToggleEdit(
                                                  "organs",
                                                  false
                                                );
                                              }}
                                            />
                                          </TooltipTrigger>
                                          <TooltipContent side="top">
                                            <p>Save</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </TooltipProvider>
                                  )}
                              </div>

                              <div className="flex justify-between items-center mb-[21px]">
                                <SwitchWithLabel
                                  id="Time_Line"
                                  label="Graph"
                                  checked={isgraph}
                                  labelRight="Time Line"
                                  onCheckedChange={handleFullAccessChange}
                                />
                              </div>

                              <div className="w-100 overflow-hidden overflow-x-auto">
                                <div className="columns-1 lg:columns-2 gap-4">
                                  {loader ? (
                                    <div className="mb-4 shimmer-box">
                                      <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                                        <div className="rounded-full bg-gray-200 h-10 w-10 animate-pulse"></div>
                                        <div className="flex-1 space-y-4 py-1">
                                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                          <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                                        <div className="flex-1 space-y-4 py-1">
                                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                          <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex space-x-4 mt-4 w-2/4">
                                        <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                      </div>
                                      <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                                        <div className="flex-1 space-y-4 py-1">
                                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                          <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    editableData.organs?.map(
                                      (value: any, index: number) => (
                                        <div
                                          key={index}
                                          className="bg-[#F0F1F2] w-full border rounded-lg break-inside-avoid mb-4"
                                        >
                                          <div className="flex items-center justify-between pt-3 pl-3 pr-3">
                                            {isEditingOrgans ? (
                                              <input
                                                type="text"
                                                value={value.organ}
                                                onChange={(e) =>
                                                  handleInputChange(
                                                    "organs",
                                                    index,
                                                    0,
                                                    null,
                                                    "organ",
                                                    e.target.value
                                                  )
                                                }
                                                onBlur={(e) =>
                                                  handleBlurChange(
                                                    "organ",
                                                    reportDataInfo
                                                      .organSystemCards[index]
                                                      .organ,
                                                    e.target.value
                                                  )
                                                }
                                                className="border p-1 rounded text-[16px] w-full mr-3 border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                              />
                                            ) : (
                                              <h3 className="text-lg font-medium text-start text-[#394557]">
                                                {value?.organ
                                                  ?.charAt(0)
                                                  ?.toUpperCase() +
                                                  value?.organ?.slice(1)}
                                              </h3>
                                            )}
                                          </div>

                                          {/* <div className="flex-grow">
                                        {value?.metrics?.length > 0 && (
                                          <div className="flex-grow">
                                            {value?.metrics?.length > 0 && (
                                              <div className="overflow-x-auto border rounded-lg bg-white">
                                                <table className="w-full text-left border-collapse">
                                                  <thead>
                                                    <tr className="bg-gray-100">
                                                      <th className="px-4 py-2 text-[#394557] font-semibold w-[25%]">Metric</th>
                                                      <th className="px-4 py-2 text-[#394557] font-semibold w-[25%]">Value</th>
                                                      <th className="px-4 py-2 text-[#394557] font-semibold w-[25%]">Unit</th>
                                                      <th className="px-4 py-2 text-[#394557] font-semibold w-[25%]">Range</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {value.metrics.map((metric: any, mIndex: number) => (
                                                      <tr key={mIndex} className="border-b">
                                                        <td className="px-4 py-2 text-[#394557] font-semibold w-[25%]">
                                                          {isEditingOrgans ? (
                                                            <input
                                                              type="text"
                                                              value={metric.metric}
                                                              onChange={(e) =>
                                                                handleInputChange(
                                                                  "organs",
                                                                  index,
                                                                  0,
                                                                  mIndex,
                                                                  "metric",
                                                                  e.target.value
                                                                )
                                                              }
                                                              onBlur={(e) =>
                                                                handleBlurChange(
                                                                  "metric",
                                                                  reportDataInfo.organSystemCards[index].metrics[mIndex].metric, // original value
                                                                  e.target.value
                                                                )
                                                              }
                                                              className="border p-1 rounded w-full"
                                                            />
                                                          ) : (
                                                            metric.metric
                                                          )}
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-700 w-[25%]">
                                                          {isEditingOrgans ? (
                                                            <input
                                                              type="text"
                                                              value={editableMetrics?.organs?.[index]?.[mIndex]?.value ?? metric.value}
                                                              onChange={(e) =>
                                                                handleMetricChange("organs", index, 0, mIndex, "value", e.target.value)
                                                              }
                                                              onBlur={() => handleMetricBlur("organs", index, 0, mIndex, "value")}
                                                              className="border p-1 rounded w-full"
                                                            />
                                                          ) : (
                                                            metric.value
                                                          )}
                                                        </td>
                                                        <td className="px-4 py-2 text-[#8C929A] w-[25%]">
                                                          {isEditingOrgans ? (
                                                            <input
                                                              type="text"
                                                              value={editableMetrics?.organs?.[index]?.[mIndex]?.unit ?? metric.unit}
                                                              onChange={(e) =>
                                                                handleMetricChange("organs", index, 0, mIndex, "unit", e.target.value)
                                                              }
                                                              onBlur={() => handleMetricBlur("organs", index, 0, mIndex, "unit")}
                                                              className="border p-1 rounded w-full"
                                                            />
                                                          ) : (
                                                            metric.unit
                                                          )}
                                                        </td>
                                                        <td className="px-4 py-2 text-[#8C929A] w-[25%]">
                                                          {isEditingOrgans ? (
                                                            <input
                                                              type="text"
                                                              value={editableMetrics?.organs?.[index]?.[mIndex]?.range ?? metric.range}
                                                              onChange={(e) =>
                                                                handleMetricChange("organs", index, 0, mIndex, "range", e.target.value)
                                                              }
                                                              onBlur={() => handleMetricBlur("organs", index, 0, mIndex, "range")}
                                                              className="border p-1 rounded w-full"
                                                            />
                                                          ) : (
                                                            metric.range
                                                          )}
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                                <div className="mt-2">
                                                  {isgraph ? (
                                                    <div className="border rounded-lg overflow-hidden m-3 overflow-x-auto bg-white px-3 pt-4">
                                                      <OrgonChart row={{ original: value?.metrics }} reportDataInfo={reportDataInfo} />
                                                    </div>
                                                  ) : (
                                                    <AlternativeSubComponent original={value?.metrics} />
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                        )}
                                      </div> */}
                                          <div className="flex-grow">
                                            {value?.metrics?.length > 0 && (
                                              <div className="pl-3 pb-3 pr-3">
                                                <h3 className="text-lg font-semibold text-[#394557] mb-3">
                                                  {value?.organName}
                                                </h3>
                                                <div className="overflow-x-auto sm:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                                  <div className="divide-y min-w-[600px] sm:min-w-0 divide-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                                    {value.metrics.map(
                                                      (
                                                        metric: any,
                                                        mIndex: number
                                                      ) => (
                                                        <React.Fragment
                                                          key={mIndex}
                                                        >
                                                          {/* Row */}
                                                          <div
                                                            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
                                                            onClick={(e) => {
                                                              // prevent clicks inside input fields from toggling the row
                                                              if (
                                                                (
                                                                  e.target as HTMLElement
                                                                ).tagName !==
                                                                "INPUT"
                                                              ) {
                                                                toggleRow(
                                                                  index,
                                                                  mIndex
                                                                );
                                                              }
                                                            }}
                                                          >
                                                            {/* Left side (Metric + values) */}
                                                            <div className="flex flex-col w-full">
                                                              <div className="flex justify-between items-center">
                                                                {/* Metric name */}
                                                                <span className="font-medium text-start text-[#1A2435] w-[40%] flex">
                                                                  {isEditingOrgans ? (
                                                                    <input
                                                                      type="text"
                                                                      value={
                                                                        metric.metric
                                                                      }
                                                                      onChange={(
                                                                        e
                                                                      ) =>
                                                                        handleInputChange(
                                                                          "organs",
                                                                          index,
                                                                          0,
                                                                          mIndex,
                                                                          "metric",
                                                                          e
                                                                            .target
                                                                            .value
                                                                        )
                                                                      }
                                                                      onBlur={(
                                                                        e
                                                                      ) =>
                                                                        handleBlurChange(
                                                                          "metric",
                                                                          reportDataInfo
                                                                            .organSystemCards[
                                                                            index
                                                                          ]
                                                                            .metrics[
                                                                            mIndex
                                                                          ]
                                                                            .metric,
                                                                          e
                                                                            .target
                                                                            .value
                                                                        )
                                                                      }
                                                                      className="p-1 rounded w-full border border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                                    />
                                                                  ) : (
                                                                    metric.metric
                                                                  )}
                                                                </span>

                                                                {/* Value */}
                                                                <span
                                                                  className={`w-[20%] text-start ${
                                                                    metric.highRisk ==
                                                                    true
                                                                      ? "text-red-400"
                                                                      : "text-[#394557]"
                                                                  }`}
                                                                >
                                                                  {isEditingOrgans ? (
                                                                    <input
                                                                      type="text"
                                                                      value={
                                                                        editableMetrics
                                                                          ?.organs?.[
                                                                          index
                                                                        ]?.[
                                                                          mIndex
                                                                        ]
                                                                          ?.value ??
                                                                        metric.value
                                                                      }
                                                                      onChange={(
                                                                        e
                                                                      ) =>
                                                                        handleMetricChange(
                                                                          "organs",
                                                                          index,
                                                                          0,
                                                                          mIndex,
                                                                          "value",
                                                                          e
                                                                            .target
                                                                            .value
                                                                        )
                                                                      }
                                                                      onBlur={() =>
                                                                        handleMetricBlur(
                                                                          "organs",
                                                                          index,
                                                                          0,
                                                                          mIndex,
                                                                          "value"
                                                                        )
                                                                      }
                                                                      className="p-1 rounded w-full border border-white focus:border-[rgb(1,87,106)] focus:outline-none text-center"
                                                                    />
                                                                  ) : (
                                                                    metric.value
                                                                  )}
                                                                </span>

                                                                {/* Range */}
                                                                <span className="text-[#8C929A] w-[20%] text-right">
                                                                  {isEditingOrgans ? (
                                                                    <input
                                                                      type="text"
                                                                      value={
                                                                        editableMetrics
                                                                          ?.organs?.[
                                                                          index
                                                                        ]?.[
                                                                          mIndex
                                                                        ]
                                                                          ?.range ??
                                                                        metric.range
                                                                      }
                                                                      onChange={(
                                                                        e
                                                                      ) =>
                                                                        handleMetricChange(
                                                                          "organs",
                                                                          index,
                                                                          0,
                                                                          mIndex,
                                                                          "range",
                                                                          e
                                                                            .target
                                                                            .value
                                                                        )
                                                                      }
                                                                      onBlur={() =>
                                                                        handleMetricBlur(
                                                                          "organs",
                                                                          index,
                                                                          0,
                                                                          mIndex,
                                                                          "range"
                                                                        )
                                                                      }
                                                                      className="p-1 rounded w-full border border-white focus:border-[rgb(1,87,106)] focus:outline-none text-right"
                                                                    />
                                                                  ) : (
                                                                    metric.range
                                                                  )}
                                                                </span>

                                                                {/* Expand Arrow (still works as before) */}
                                                                <button
                                                                  type="button"
                                                                  onClick={(
                                                                    e
                                                                  ) => {
                                                                    e.stopPropagation(); // prevent triggering row click
                                                                    toggleRow(
                                                                      index,
                                                                      mIndex
                                                                    );
                                                                  }}
                                                                  className="ml-4 p-1 rounded hover:bg-gray-100 transition"
                                                                >
                                                                  {expandedRowsByOrgan[
                                                                    index
                                                                  ] ===
                                                                  mIndex ? (
                                                                    <ChevronUp className="w-5 h-5 text-gray-600" />
                                                                  ) : (
                                                                    <ChevronDown className="w-5 h-5 text-gray-600" />
                                                                  )}
                                                                </button>
                                                              </div>
                                                            </div>
                                                          </div>

                                                          {/* Expanded Sub-Row */}
                                                          {expandedRowsByOrgan[
                                                            index
                                                          ] === mIndex && (
                                                            <div className="bg-gray-50 border-t px-4 py-3">
                                                              {isgraph ? (
                                                                <div className="border rounded-lg overflow-hidden bg-white px-3 pt-4">
                                                                  <OrgonChart
                                                                    row={{
                                                                      original:
                                                                        metric,
                                                                    }}
                                                                    reportDataInfo={
                                                                      reportDataInfo
                                                                    }
                                                                  />
                                                                </div>
                                                              ) : (
                                                                <AlternativeSubComponent
                                                                  original={
                                                                    metric
                                                                  }
                                                                />
                                                              )}
                                                            </div>
                                                          )}
                                                        </React.Fragment>
                                                      )
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </section>
                        )}
                    </>
                  ) : null}

                  {(selectedTab === "All" ||
                    selectedTab === "Medistry Insights") &&
                    reportDataInfo?.topInsights?.length > 0 &&
                    !userData?.role?.includes("client") && (
                      <section className="mt-6 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                        <div className="grid grid-cols-1 p-6 mt-6">
                          <h2 className="flex text-[24px] font-semibold text-[#1A2435] text-start">
                            {/* <img src={GroupImage}></img> */}
                            <span className="font-normal">
                              {" "}
                              Medistry Insights
                            </span>
                          </h2>
                          <ul className="mt-1 space-y-1 text-sm text-[#394557]">
                            {reportDataInfo?.topInsights?.map(
                              (insight: any, index: number) => {
                                return (
                                  <li key={index}>
                                    <p className="flex text-start text-[16px] text-[#394557] pb-2 leading-22 font-normal">
                                      {insight?.insight}
                                    </p>
                                  </li>
                                );
                              }
                            )}
                          </ul>
                        </div>
                      </section>
                    )}

                  {(selectedTab === "All" || selectedTab === "Reports") &&
                    !userData?.role?.includes("client") &&
                    reportsList?.length > 0 && (
                      <section className="mt-6 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl  bg-white">
                        <div className="grid grid-cols-1 p-6 mt-6">
                          <div className="">
                            <h2 className="flex text-[24px] font-semibold text-[#1A2435] mb-[21px] text-start">
                              <span className="font-normal">Reports</span>
                            </h2>
                            <div>
                              <ReportOverview
                                reportsList={reportsList}
                                isReportLoading={isReportLoading}
                                pagination={pagination}
                              />
                            </div>
                          </div>
                        </div>
                      </section>
                    )}

                  <AppModal
                    isOpen={isModalOpen}
                    toggle={toggleClose}
                    title=""
                    className="flex flex-col overflow-visible" // Added flex-col
                  >
                    <div className="flex flex-col h-full">
                      {" "}
                      {/* Ensure full height */}
                      <div className="text-xl text-[#1A2435] font-medium px-6 py-4 border-b text-left">
                        Select an account to merge into{" "}
                        {reportDataInfo?.clientId?.name}
                        's. The chosen account will be deleted.
                      </div>
                      <div className="space-y-2 text-[#1A2435] font-bolder text-[16px] p-6">
                        <p className="mb-0 text-left">Select Patient</p>
                        {/* Content area that grows */}
                        <div className="flex-grow">
                          <Select
                            defaultValue={selectedOption}
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
                          {" "}
                          <AppButton
                            disable={loading}
                            onClick={() => handleMegreAccount()}
                            className="w-full"
                          >
                            Confirm
                          </AppButton>
                        </div>
                      </div>
                    </div>
                  </AppModal>
                  <AppModal
                    isOpen={isModalShareOpen}
                    toggle={toggleShareClose}
                    title=""
                    className="flex flex-col text-gray-600 "
                  >
                    <div className="text-xl text-[#1A2435] font-medium px-6 py-4 border-b text-left">
                      Share Profile
                    </div>

                    <div className="rounded-lg bg-white max-w-lg space-y-2 text-[#1A2435] font-bolder text-[16px] p-6">
                      <div className="flex gap-4 mb-4">
                        <WhatsappShareButton
                          url={ProfielShareMessage(hostName, reportId)}
                          title={"Profile share"}
                          separator=":: "
                          className="hover:opacity-80 transition-opacity"
                        >
                          <WhatsappIcon size={50} round />
                        </WhatsappShareButton>
                        <EmailShareButton
                          url={ProfielShareMessage(hostName, reportId)}
                          subject={"Profile share"}
                          body="I thought you might find this interesting:"
                          className="hover:opacity-80 transition-opacity"
                        >
                          <EmailIcon size={50} round />
                        </EmailShareButton>
                      </div>
                      <div className="bg-[#01576A] p-4 rounded-lg relative">
                        <p className="font-normal text-white whitespace-pre-line leading-4">
                          {ProfielShareMessage(hostName, reportId)}
                        </p>
                        <div className="absolute top-2 right-2 cursor-pointer text-white">
                          <CopyToClipboard
                            text={ProfielShareMessage(hostName, reportId)}
                            onCopy={() => {
                              setCopied(true);
                              setTimeout(() => {
                                setCopied(false);
                              }, 2000);
                            }}
                          >
                            <AppButton className="w-full px-2 py-1 h-auto mt-0 border-0 shadow-none hover:bg-white hover:text-black">
                              {copied ? "Copied!" : "Copy"}
                            </AppButton>
                            {/* {!copied ? <Copy /> : <CopyCheck />} */}
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>
                  </AppModal>
                </>
              )}
            </>
          )}
          {userData?.role != "client" && (
            <div className="flex justify-start pb-4 items-center mt-4 gap-4">
              <AppButton
                className="-mt-0 w-2/4 md:w-auto transition !text-base !bg-[#f3f4f6] hover:!bg-white shadow-none"
                onClick={() => setDeletePatientModal(true)}
              >
                <span className="cursor-pointer text-[#ADB1B7]">
                  Delete Patient
                </span>
              </AppButton>
            </div>
          )}
          <AppDeleteDialog
            isLoading={deleteLoading}
            isOpen={deletePatientModal}
            title="Delete Patient"
            description="Are you sure you want to delete this patient?"
            onConfirm={() => handleDeletePatient()}
            onClose={() => setDeletePatientModal(false)}
          />
          <AppPatientRequestDialog
            isLoading={patientRequestLoading}
            isOpen={patientRequest}
            title="Manage Patient Request"
            description="Are you sure you want to request this patient’s health records?"
            onConfirm={() => handlePatientRequest()}
            onClose={() => setPatientRequest(false)}
          />
          <AppModal
            isOpen={patientModalOpen}
            toggle={togglePatientsClose}
            title=""
          >
            <EditPatient
              toggleClose={togglePatientsClose}
              reportDataInfo={reportDataInfo}
              fetchReports={fetchReports}
            />
          </AppModal>
          <AppModal
            isOpen={isReportModalOpen}
            toggle={toggleReportClose}
            title=""
          >
            <SelectWayToReortCreate
              patientId={reportId}
              onSelectOption={(option) => {
                if (option === "fileUpload") {
                  setReportIsModalOpen(false);
                  setOpenFile(true);
                }
              }}
            />
          </AppModal>
          <AppModal
            isOpen={openFile}
            toggle={toggleClose1}
            disableOutsideClick={uploadeFiles}
            title=""
            className="p-2"
          >
            <FileUpload
              setOpenFile={setOpenFile}
              setUploadFile={setUploadFile}
            />
          </AppModal>
          <AppModal
            isOpen={opationOpen}
            toggle={togglePatientsDownloadClose}
            title=""
            className=""
          >
            <PatienDownloadData
              reportDataInfo={reportDataInfo}
              togglePatientsDownloadClose={togglePatientsDownloadClose}
            />
          </AppModal>
        </div>
      )}
    </>
  );
};

export default OverallPatientsReport;
