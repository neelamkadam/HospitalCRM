import React, { useCallback, useEffect, useRef, useState } from "react";
import CustomSheet from "../../../components/AppSheet";
import { deleteAppointmentPatient, useGetApi, usePostApi } from "../../../services/use-api.ts";
import { ROUTES } from "../../../constants/routesConstants.ts";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import AppButton from "../../../components/AppButton.tsx";
// import "./../Shimmer.css";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
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
    Check,
    // ChevronDown,
    // ChevronRight,
    Edit,
    EllipsisVertical,
    // ChevronsUpDown,
    // ChevronUp,
    Plus,
    Trash2,
} from "lucide-react";
import AppModal from "../../../components/AppModal.tsx";
import { useSelector } from "react-redux";
import { useSidebar } from "../../../components/ui/sidebar.tsx";
import socketService from "../../../utils/socket";
import { useAppSelector } from "../../../redux/store.ts";
// import clsx from "clsx";
import { Data_Constcnts } from "../../../constants/AppConstants.ts";
import PatientsOverAllReportSidePannel from "../../Patients/PatientsOverAllReportSidePannel.tsx";
import AddDoctorAppointment from "./AddDoctorAppointment.tsx";
import API_CONSTANTS from "../../../constants/apiConstants.ts";
import AppDeleteDialog from "../../../components/AppDeleteDialog.tsx";
// import { stat } from "fs";
// import ChatBot from "../ChatBot/ChatBot.tsx";

const BookDoctorAppointment: React.FC = () => {
    const navigate = useNavigate();
    const [edit, setEdit] = useState(false);
    const { getData: GetReportApi, isLoading: loading } = useGetApi<any>("");
    const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { userData } = useAppSelector((state: any) => state.authData);
    const { state } = useSidebar();
    const toggleClose = () => {
        setIsModalOpen((prev) => !prev);
        fetchAppointments();
    };
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    // const [HealthSummaryNotFound, setHealthSummaryNotFoune] =
    //   useState<boolean>(false);
    const { patientSearch } = useSelector((state: any) => state.searchData);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>({});
    const { postData: UpdateAppointmentApi } = usePostApi<any>({
        path: "", // Provide a default or dynamic path as needed
    });

    type Row = {
        healthSummaryId?: {
            conditions?: { name: string }[];
        };
    };

    const handleEdit = (row: any) => {
        setSelectedRow(row);
        // setEdit(true);
        toggleClose();
    };

    const DropdownFiilter: React.FC<{ row: any }> = ({ row }) => {

        const [open, setOpen] = useState(false);
        return (
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border-2 border-solid"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <EllipsisVertical className="h-4 w-4 text-gray-600" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    {row.original?.createdByDoctor === null && (
                        <>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    if (row.original.status !== "rescheduled") return;
                                    e.stopPropagation();
                                    setSelectedRow(row.original);
                                    handleAccept(row.original);
                                }}
                                className={`cursor-pointer flex items-center gap-2 p-2 rounded ${row.original.status !== "rescheduled"
                                    ? "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400"
                                    : "hover:bg-gray-100"
                                    }`}
                                disabled={row.original.status !== "rescheduled"}
                            >
                                <Check className="h-4 w-4" />
                                Accept
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={(e) => {
                                    if (
                                        row.original.status === "approved" ||
                                        row.original.status === "cancel"
                                    )
                                        return; // block action
                                    e.stopPropagation();
                                    handleEdit(row.original);
                                    setOpen(false);
                                }}
                                className={`cursor-pointer flex items-center gap-2 p-2 rounded ${row.original.status === "approved" || row.original.status === "cancel"
                                    ? "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400"
                                    : "hover:bg-gray-100"
                                    }`}
                                disabled={
                                    row.original.status === "approved" || row.original.status === "cancel"
                                }
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                        </>
                    )}

                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.original);
                            setOpen(false); // close manually after action
                        }}
                        className="cursor-pointer text-red-400 focus:text-red-400"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu >
        );
    };


    const columns = React.useMemo<ColumnDef<any>[]>(
        () => {
            const baseColumns: ColumnDef<any>[] = [
                {
                    header: "Doctor Name",
                    id: "name",
                    enableSorting: false,
                    // meta: {
                    //     className: "hidden md:table-cell",
                    // },
                    accessorFn: (row) => row?.original?.doctorDetails?.name || "-",
                    cell: ({ row }: any) => {
                        return (
                            <div className="flex">
                                <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] ml-6 mt-1">
                                    {row?.original?.doctorDetails?.name || "-"}
                                </span>
                            </div>
                        );
                    },
                    size: 132,
                },
                {
                    header: "Organization",
                    id: "organizationName",
                    enableSorting: false,
                    meta: {
                        className: "hidden md:table-cell",
                    },
                    accessorFn: (row) => row?.original?.orgDetails?.organizationName || "-",
                    cell: ({ row }: any) => {
                        return (
                            <div className="flex">
                                <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] ml-6 mt-1">
                                    {row?.original?.orgDetails?.organizationName || "-"}
                                </span>
                            </div>
                        );
                    },
                    size: 132,
                },
                {
                    header: "Date",
                    id: "createdAt",
                    enableSorting: false,
                    meta: {
                        className: "hidden md:table-cell",
                    },
                    accessorFn: (row) => moment(row?.original?.dateTime).format("ll"),
                    cell: ({ row }: any) => {
                        return (
                            <div className="flex gap-2">
                                <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] mt-1">
                                    {moment(row?.original?.dateTime).format("ll")}
                                </span>
                            </div>
                        );
                    },
                },
                {
                    header: "Time",
                    id: "dateTime",
                    enableSorting: false,
                    accessorFn: (row) => moment(row?.original?.dateTime).format("lll"), // 👈 date + time
                    meta: { className: "hidden md:table-cell" },
                    cell: ({ row }: any) => {
                        return (
                            <div className="flex gap-2">
                                <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] mt-1">
                                    {moment(row?.original?.dateTime).format("LT")}
                                </span>
                            </div>
                        );
                    },
                },
                {
                    header: "Created By",
                    id: "createdByDoctor",
                    enableSorting: false,
                    meta: {
                        className: "hidden md:table-cell",
                    },
                    accessorFn: (row) => row?.original?.createdByDoctor || "-",
                    cell: ({ row }: any) => {
                        const isCreatedByDoctor = row?.original?.createdByDoctor;
                        return (
                            <div className="flex">
                                <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] ml-6 mt-1">
                                    {isCreatedByDoctor !== null ? "Doctor" : "Patient"}
                                </span>
                            </div>
                        );
                    },
                    size: 132,
                },
                {
                    header: "Status",
                    id: "status",
                    enableSorting: false,
                    accessorFn: (row) => row?.status, // keep raw status value
                    // meta: { className: "hidden md:table-cell" },
                    cell: ({ row }: any) => {
                        const status = row?.original?.status;
                        const isHighlighted =
                            status === "approved" || status === "rescheduled";

                        return (
                            <div className="flex gap-2">
                                <span
                                    className={`text-[14px] font-regular truncate text-sm mt-1`}
                                    style={{
                                        color: isHighlighted ? "rgb(1, 87, 106)" : "#8C929A",
                                    }}
                                >
                                    {status === "pending"
                                        ? "Requested"
                                        : status === "approved"
                                            ? "Approved"
                                            : status === "rescheduled"
                                                ? "Rescheduled"
                                                : status === "cancel"
                                                    ? "Cancelled"
                                                    : ""}
                                </span>
                            </div>
                        );
                    },
                },

                {
                    id: "actions",
                    header: "Action",
                    cell: ({ row }) => {
                        return (
                            <div className="flex justify-center">
                                <DropdownFiilter row={row} />
                            </div>
                        );
                    },
                    meta: {
                        className: "w-[60px]",
                    },
                },
            ];

            // Add conditional columns based on EMR settings
            if (
                userData?.organizationId?.emrEnabled &&
                userData?.organizationId?.emrType === Data_Constcnts.EMR_TYPE
            ) {
                // Add Primary Condition column after Patient Name
                baseColumns.splice(1, 0, {
                    header: "Primary Condition",
                    id: "PrimaryCondition",
                    enableSorting: false,
                    accessorFn: (row: Row) =>
                        row.healthSummaryId?.conditions
                            ?.map((condition: { name: string }) => condition.name)
                            .join(", "),
                    cell: ({ cell }: any) => {
                        const conditions =
                            cell.row.original?.healthSummaryId?.conditions?.slice(0, 3) || [];
                        const remainingCount =
                            cell.row.original?.healthSummaryId?.conditions?.length - 3;

                        return (
                            <div>
                                <ol className="list-disc ml-[0px] md:ml-[0px] pl-5 marker:text-gray-300">
                                    {conditions?.length > 0 ? (
                                        conditions?.map((condition: any, index: number) => (
                                            <li key={index} className="">
                                                <span className="truncate text-sm font-medium text-[#1A2435]">
                                                    {condition?.name}
                                                </span>
                                            </li>
                                        ))
                                    ) : (
                                        <span className="text-sm font-medium text-[#1A2435]">
                                            None
                                        </span>
                                    )}
                                </ol>
                                <>
                                    {conditions?.length > 2 && remainingCount > 0 && (
                                        <ol className="list-disc ml-[0px] md:ml-[0px] pl-5 marker:text-gray-300">
                                            <li>
                                                <button className="text-sm font-medium text-[#1A2435] pl-[0px]">
                                                    +{remainingCount} more{" "}
                                                    {remainingCount == 1 ? "condition" : "conditions"}
                                                </button>
                                            </li>
                                        </ol>
                                    )}
                                </>
                            </div>
                        );
                    },
                    size: 242,
                });

                // Add View column at the end
                // baseColumns.push({
                //     header: "View",
                //     id: "View",
                //     enableSorting: false,
                //     meta: { className: "hidden md:table-cell" },
                //     cell: ({ row }: any) => {
                //         return (
                //             <div className="flex z-50 justify-center">
                //                 <button
                //                     onClick={() => {
                //                         if (row.original.reportsCount > 0) {
                //                             if (row?.original?.healthSummaryId?.clientId) {
                //                                 navigate(
                //                                     `${ROUTES.PATIENTS_OVERALL_HEALTH}?id=${row.original._id}`
                //                                 );
                //                             } else {
                //                                 console.log("health summary not found");
                //                             }
                //                         }
                //                     }}
                //                     className={clsx(
                //                         "font-regular w-5/6 rounded-[30px] border border-[#E6E7E7] mt-[-3px] flex items-center text-sm justify-center font-normal text-[#666D79] px-4 py-1 max-w-[120px] whitespace-nowrap",
                //                         row.original.reportsCount > 0 ? "cursor-pointer" : ""
                //                     )}
                //                 >
                //                     <p>Full Profile </p>
                //                     <ChevronRight strokeWidth={"1.5px"} height={"18px"} />
                //                 </button>
                //             </div>
                //         );
                //     },
                // });
            }

            return baseColumns;
        },
        [userData] // Add userData as a dependency
    );

    const [pagination, setPagination] = useState<any>({
        pageIndex: 1,
        pageSize: 10,
        totalPages: 0,
    });
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const defaultData = React.useMemo(() => [], []);

    const table = useReactTable({
        data: appointmentsList ?? defaultData,
        columns,
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
        setAppointmentsList([]);
        setCurrentPage(1); // Reset to first page
        setHasMore(true); // Reset hasMore
        fetchAppointments(true);
    }, [patientSearch, sorting]);

    useEffect(() => {
        if (currentPage > 1) {
            fetchAppointments();
        }
    }, [currentPage]);

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
                    // fetchAppointments();
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

    const handleAccept = async (row: any) => {
        try {
            const payload = {
                ...row,
                status: "approved",
            };

            await UpdateAppointmentApi(payload, `${API_CONSTANTS.APPOINTMENTS.UPDATE}/${row._id}`);

            fetchAppointments();
            setSelectedRow(null);
        } catch (error) {
            console.error("Error accepting appointment:", error);
        }
    };

    const fetchAppointments = async (currentPageValue = false) => {
        const pageSize = 15;
        const page = currentPageValue ? "1" : currentPage.toString();
        const params = new URLSearchParams({
            per_page: pageSize.toString(),
            page: page,
            sortBy: sorting[0]?.id || "",
            sortOrder: sorting[0]?.desc ? "desc" : "asc",
            search: patientSearch,

        });
        // ?search=&doctorId=&startDateTime=&endDateTime=
        try {
            const response: any = await GetReportApi(
                `${API_CONSTANTS.GET_ALL_APPOINTMENTS_PATIENT_PORTAL}?${params}`
            );
            if (response?.data.success) {
                const newAppointments = response?.data?.appointments?.items || [];
                if (currentPage === 1) {
                    setAppointmentsList(newAppointments);
                } else {
                    setAppointmentsList((prev) => [...prev, ...newAppointments]);
                }
                setHasMore(newAppointments?.length === pageSize);
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
    const handleTableScroll = useCallback(() => {
        const container = tableContainerRef.current;
        if (!container || loading || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        // Check if user has scrolled to bottom of table (with a small threshold)
        if (scrollHeight - scrollTop - clientHeight < 50) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    }, [loading, hasMore]);

    useEffect(() => {
        const container = tableContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleTableScroll);
            return () => container.removeEventListener("scroll", handleTableScroll);
        }
    }, [handleTableScroll]);

    const handleDelete = (row: any) => {
        setDeleteModal(true);
        setSelectedRow(row);
    };

    const handleDeleteAppointment = async () => {
        setDeleteLoading(true);
        const result = await deleteAppointmentPatient(
            `${API_CONSTANTS.DELETE_APPOINTMENT_PATIENTS}/${selectedRow._id}`
        );
        if (result.success) {
            setAppointmentsList(appointmentsList.filter((appointment) => appointment._id !== selectedRow._id));
        }
        setDeleteLoading(false);
        setDeleteModal(false);
    };

    return (
        <div
            className=" !bg-[#F5F6F6]"
            style={{ marginLeft: state == "collapsed" ? "28px" : "" }}
        >
            <header className="flex justify-between">
                {/* <AppButton
          className="relative flex w-[127px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none mt-[16px] mb-[16px] ml-[16px] rounded-[30px] shadow-md text-sm"
        >
          <RotateCw /> Update info
          <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-blink">
            0
          </span>
        </AppButton> */}
                <div></div>

                <AppButton
                    onClick={() => { toggleClose(); setSelectedRow({}); }}
                    className="relative flex w-[170px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none mt-[16px] mb-[16px] mr-[8px] md:mr-[16px] rounded-[30px] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] text-sm"
                >
                    <Plus /> Book Appointment
                </AppButton>
            </header>
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
                                      ${header.id === "View"
                                                        ? "w-[13%] text-center"
                                                        : ""
                                                    } ${header.column.columnDef.meta?.className || ""
                                                    }`}
                                            // style={{
                                            //   paddingLeft: header.id == "select" ? "19px" : "",
                                            //   width: `${header.getSize()}px`,
                                            //   minWidth: `${header.getSize()}px`,
                                            // }}
                                            >
                                                {!header.isPlaceholder && (
                                                    <div
                                                        className={
                                                            header.column.getCanSort()
                                                                ? "cursor-pointer select-none flex items-center space-x-2"
                                                                : ""
                                                        }
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
                            {loading && appointmentsList?.length === 0 ? (
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
                                    // style={{
                                    //   cursor:
                                    //     selectedTab === "completed" ? "pointer" : "auto",
                                    // }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className={`px-3 pt-2 pb-[0.6rem] text-gray-700 !font-medium cursor-pointer ${cell.column.columnDef.meta?.className || ""
                                                    } ${cell.column.columnDef.header === "edit" ? "w-0" : "" // Adjust width
                                                    }`}
                                                onClick={() => {
                                                    if (
                                                        userData?.organizationId?.emrEnabled &&
                                                        userData?.organizationId?.emrType ===
                                                        Data_Constcnts.EMR_TYPE
                                                        // && row?.original?.healthSummaryId?.clientId
                                                    ) {
                                                        if (cell.column.columnDef.header === "View") {
                                                            navigate(
                                                                `${ROUTES.PATIENTS_OVERALL_HEALTH}?id=${row.original?._id}`
                                                            );
                                                        } else {
                                                            console.log(
                                                                "🚀 ~ cell.row.original:",
                                                                cell.row.original
                                                            );
                                                            // if (
                                                            //   cell.row.original.reportsCount > 0 ||
                                                            //   cell?.row?.original?.healthSummaryId?.clientId
                                                            // ) {
                                                            if (row.original._id) {
                                                                toggleEdit();
                                                                navigate(
                                                                    `${ROUTES.PATIENTS}?id=${row.original._id
                                                                    }&summary=${row?.original?.healthSummaryId?.clientId
                                                                        ? true
                                                                        : false
                                                                    }`
                                                                );
                                                            }
                                                            // }
                                                        }
                                                    }
                                                }}
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
                                        style={{ height: "calc(100vh - 210px)" }}
                                    >
                                        No Appointments to show
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {loading && appointmentsList?.length > 0 && (
                        <div className="flex items-center justify-center py-4 space-x-2">
                            <span className="text-[#526279">loading appointments...</span>
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
            {/* <ChatBot /> */}
            <CustomSheet
                title=""
                isOpen={edit}
                toggle={toggleEdit}
                className="dark:bg-gray-800 dark:text-gray-100"
                content={<PatientsOverAllReportSidePannel />}
            />
            {/* {loading && <AppLoader />} */}

            <AppModal isOpen={isModalOpen} toggle={toggleClose} title="">
                <AddDoctorAppointment toggleClose={toggleClose} selectedRow={selectedRow} setSelectedRow={setSelectedRow} fetchAppointments={fetchAppointments} />
            </AppModal>

            <AppDeleteDialog
                isLoading={deleteLoading}
                isOpen={deleteModal}
                title="Delete Appointment"
                description={`Are you sure you want to delete the appointment ?`}
                onConfirm={() => handleDeleteAppointment()}
                onClose={() => setDeleteModal(false)}
            />
        </div>
    );
};

export default BookDoctorAppointment;
