import React, { useCallback, useEffect, useRef, useState } from "react";
import API_CONSTANTS from "../../constants/apiConstants";
import { useGetApi } from "../../services/use-api";
import { useSidebar } from "../../components/ui/sidebar";
import AppButton from "../../components/AppButton";
import { ArrowLeft, CalendarDays } from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import socketService from "../../utils/socket";
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
} from "lucide-react";
import { useAppSelector } from "../../redux/store";
import { useSelector } from "react-redux";
const CommonTable: React.FC = () => {
    const searchParams = new URLSearchParams(location.search);
    const organizationId = searchParams.get("id");
    const { getData: GetReportApi, isLoading: loading } = useGetApi<any>("");
    const [organizationData, setOrganizationData] = useState<any>(null);
    const [usersData, setUsersData] = useState<any>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { state } = useSidebar();
    const navigate = useNavigate();
    const { userData } = useAppSelector((state: any) => state.authData);
    const [pagination, setPagination] = useState<any>({
        pageIndex: 1,
        pageSize: 10,
        totalPages: 0,
    });
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const { teamLogsSearch } = useSelector((state: any) => state.searchData);

    const handleTableScroll = useCallback(() => {
        const container = tableContainerRef.current;
        if (!container || loading || !hasMore) return;
        const { scrollTop, scrollHeight, clientHeight } = container;
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

    useEffect(() => {
        const fetchData = async () => {
            if (!organizationId) return;
            const response: any = await GetReportApi(
                `${API_CONSTANTS.GET_ORGANIZATION_DETAILS}/${organizationId}`
            );
            if (response) {
                setOrganizationData(response.data.organization);
            }
        };

        fetchData();
    }, [organizationId]); // Trigger re-fetch if ID changes

    useEffect(() => {
        // userData?.role?.includes("client") &&
        //     navigate(`${ROUTES.HEALTHREPORT}?tab=completed`);
        setCurrentPage(1); // Reset to first page
        setHasMore(true); // Reset hasMore
        fetchReports(true);
    }, [teamLogsSearch, sorting]);

    useEffect(() => {
        if (currentPage > 1) {
            fetchReports();
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

    const fetchReports = async (currentPageValue = false) => {
        const pageSize = 15;
        const page = currentPageValue ? "1" : currentPage.toString();
        const params = new URLSearchParams({
            per_page: pageSize.toString(),
            page: page,
            sortBy: sorting[0]?.id || "",
            sortOrder: sorting[0]?.desc ? "desc" : "asc",
            search: teamLogsSearch,
            organizationId: organizationId || "",
        });

        try {
            const response: any = await GetReportApi(
                `${API_CONSTANTS.GET_Users}?${params}`
            );
            if (response?.data.success) {
                const newOrganization = response.data.users.items || [];
                if (currentPage === 1) {
                    setUsersData(newOrganization);
                } else {
                    setUsersData((prev: any) => [...prev, ...newOrganization]);
                }
                setHasMore(newOrganization?.length === pageSize);
            }
        } catch (error) {
            console.error("Error fetching report data:", error);
            setHasMore(false);
        }
    };

    const columns = React.useMemo<ColumnDef<any>[]>(
        () => {
            const baseColumns: ColumnDef<any>[] = [
                {
                    header: "Name",
                    id: "name",
                    enableSorting: false,
                    meta: {
                        className: "hidden md:table-cell",
                    },
                    accessorFn: (row) => row?.original?.name,
                    cell: ({ row }: any) => {
                        return (
                            <div className="flex">
                                <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] mt-1">
                                    {row?.original.name || "N/A"}
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
                    accessorFn: (row) => row?.userDetails.email, // assuming 'doctorName' exists on the row
                    cell: ({ row }: any) => {
                        console.log("Row Data:", row);
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
                    header: "Joined Date",
                    id: "createdAt",
                    accessorFn: (row) => moment(row?.createdAt).format("ll"),
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

            ];
            return baseColumns;
        },
        [userData]
    );

    const table = useReactTable({
        data: usersData,
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

    return (
        <>
            <div
                className={`${state === "collapsed"
                    ? "p-6 shadow-none rounded-lg transition-all text-gray-800 dark:bg-gray-800 dark:text-white ml-6"
                    : "px-4 shadow-none rounded-lg transition-all text-gray-800 dark:bg-gray-800 dark:text-white"
                    }`}
            >
                <header className="flex justify-between -mt-6">
                    <AppButton
                        onClick={() => navigate(ROUTES.Organization)}
                        className="py-3 rounded-[30px] w-[130px] h-[40px] !bg-white !text-[#293343] border-none flex items-center justify-center pl-1 text-sm"
                    >
                        <ArrowLeft className="w-7 h-7" />
                        Back
                    </AppButton>
                </header>

                {loading ? (
                    <div className="mt-4 shimmer-box">
                        {[1, 2, 3].map((_, i) => (
                            <div
                                key={i}
                                className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white"
                            >
                                {i === 0 && (
                                    <div className="rounded-full bg-gray-200 h-10 w-10 animate-pulse"></div>
                                )}
                                <div className="flex-1 space-y-4 py-1">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                        {i === 0 && (
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <section className="shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                            <div className="py-6 px-6 mt-4">
                                <h2 className="text-[32px] font-semibold text-[#1A2435] text-start">
                                    {organizationData?.organizationName}{" "}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 text-xl font-normal text-[#1A2435] mt-1">
                                    <span className="text-[20px]">
                                        {organizationData?.email}
                                    </span>
                                    <span className="text-[#8C929A] text-[20px]">
                                        {organizationData?.role}
                                    </span>
                                </div>
                                <p className="flex flex-wrap md:flex-nowrap text-[16px] text-[#8C929A] font-medium gap-x-4 gap-y-2 items-center mt-2">
                                    <div className="flex gap-2 items-center text-left">
                                        {/* <img src={idImage}></img> */}
                                        <span className="font-normal">
                                            Report ID {organizationData?.companyRegistrationID}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 items-center text-left">
                                        <CalendarDays size={18} />
                                        <span className="font-normal">
                                            {moment(
                                                organizationData?.reportDate
                                            ).format("LL")}
                                        </span>
                                    </div>
                                </p>
                            </div>
                        </section>
                        <li className="flex flex-row gap-[10px]">
                            <a
                                onClick={() => {
                                    navigate(`${ROUTES.HEALTHREPORT}?tab=completed`, { replace: true });
                                    table.resetRowSelection();
                                }}
                                className="relative flex w-[100px] sm:w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 border-none mt-[16px] mb-[5px] md:mb-[16px] rounded-[30px] text-sm cursor-pointer shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white text-[#293343]"
                            >
                                Doctor
                            </a>
                            <a
                                onClick={() => {
                                    navigate(`${ROUTES.HEALTHREPORT}?tab=completed`, { replace: true });
                                    table.resetRowSelection();
                                }}
                                className="relative flex w-[100px] sm:w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 border-none mt-[16px] mb-[5px] md:mb-[16px] rounded-[30px] text-sm cursor-pointer shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white text-[#293343]"
                            >
                                Patient
                            </a>
                        </li>
                        <section className="shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white mt-6">
                            {/* <div className=""> */}
                                <div
                                    className="rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] overflow-hidden overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white overflow-x-auto w-full"
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
                                                                className={`p-3 flex font-manrope text-base  font-medium text-[#666D79] 
                                                // ${header.id === "View" ? "justify-center" : ""}
                                                ${header.column.columnDef.meta?.className || ""
                                                                    }`}

                                                            >
                                                                {!header.isPlaceholder && (
                                                                    <div
                                                                        className={`flex items-center space-x-2 w-full ${header.column.getCanSort() ? "cursor-pointer select-none" : ""
                                                                            } ${header.id === "View" ? "justify-center" : "justify-start"}`}
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
                                            {loading && usersData?.length === 0 ? (
                                                Array.from({ length: 5 }).map((_, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b hover:bg-gray-100 bg-[#f4f4f4] animate-pulse"
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
                                            ) : table.getRowModel()?.rows?.length > 0 ? (
                                                table.getRowModel()?.rows?.map((row) => (
                                                    <tr
                                                        key={row.id}
                                                        className="border-b hover:bg-gray-100 bg-[#ffffff] transition-colors"
                                                    >
                                                        {row.getVisibleCells().map((cell) => {
                                                            return (
                                                                <td
                                                                    key={cell.id}
                                                                    className={`px-3 pt-2 pb-[0.6rem] text-gray-700 !font-medium ${cell.column.columnDef.meta?.className || ""
                                                                        } ${cell.column.columnDef.header === "" ? "ml-5" : "" // Adjust width
                                                                        }`}
                                                                >
                                                                    {flexRender(
                                                                        cell.column.columnDef.cell,
                                                                        cell.getContext()
                                                                    )}
                                                                </td>
                                                            )
                                                        })}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={table.getHeaderGroups()[0]?.headers?.length}
                                                        className="text-center py-4 text-gray-500 h-[20rem] flex-1 bg-[#ffffff]"
                                                    >
                                                        No Users to show
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    {loading && usersData?.length > 0 && (
                                        <div className="flex items-center justify-center py-4 space-x-2">
                                            <span className="text-[#526279">loading Users...</span>
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
                            {/* </div> */}
                        </section>
                        <section className="mt-6 mb-6 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                            <div className="py-6 px-6">
                                <h3 className="text-[28px] font-semibold text-[#1A2435] mb-6 text-left">
                                    Organization Settings
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-left">
                                    <div>
                                        <p className="text-[16px] text-[#8C929A] font-medium mb-1">Phone Number</p>
                                        <p className="text-[18px] font-semibold text-[#1A2435]">
                                            {organizationData?.countryCode} {organizationData?.phone}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[16px] text-[#8C929A] font-medium mb-1">EMR Enabled</p>
                                        <p
                                            className={`text-[18px] font-semibold ${organizationData?.emrEnabled ? "text-green-600" : "text-red-500"
                                                }`}
                                        >
                                            {organizationData?.emrEnabled ? "Yes" : "No"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[16px] text-[#8C929A] font-medium mb-1">Create Report Enabled</p>
                                        <p
                                            className={`text-[18px] font-semibold ${organizationData?.createReportEnabled ? "text-green-600" : "text-red-500"
                                                }`}
                                        >
                                            {organizationData?.createReportEnabled ? "Yes" : "No"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[16px] text-[#8C929A] font-medium mb-1">EMR Type</p>
                                        <p className="text-[18px] font-semibold text-[#1A2435]">{organizationData?.emrType}</p>
                                    </div>

                                    <div>
                                        <p className="text-[16px] text-[#8C929A] font-medium mb-1">Billing Enabled</p>
                                        <p
                                            className={`text-[18px] font-semibold ${organizationData?.billingEnabled ? "text-green-600" : "text-red-500"
                                                }`}
                                        >
                                            {organizationData?.billingEnabled ? "Yes" : "No"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[16px] text-[#8C929A] font-medium mb-1">Payment Gateway</p>
                                        <p className="text-[18px] font-semibold text-[#1A2435]">
                                            {organizationData?.paymentGateway || "N/A"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[16px] text-[#8C929A] font-medium mb-1">OTP Verification Disabled</p>
                                        <p
                                            className={`text-[18px] font-semibold ${organizationData?.disableOtpVerification ? "text-green-600" : "text-red-500"
                                                }`}
                                        >
                                            {organizationData?.disableOtpVerification ? "Yes" : "No"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[16px] text-[#8C929A] font-medium mb-1">Reports Limit</p>
                                        <p className="text-[18px] font-semibold text-[#1A2435]">
                                            {organizationData?.reportsLimit}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[16px] text-[#8C929A] font-medium mb-1">Users Limit</p>
                                        <p className="text-[18px] font-semibold text-[#1A2435]">
                                            {organizationData?.usersLimit}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[16px] text-[#8C929A] font-medium mb-1">Last Updated</p>
                                        <p className="text-[18px] font-semibold text-[#1A2435]">
                                            {moment(organizationData?.updatedAt).format("LL")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </>
    );
};

export default CommonTable;
