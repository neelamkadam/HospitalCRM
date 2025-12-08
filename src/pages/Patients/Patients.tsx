import React, { useCallback, useEffect, useRef, useState } from "react";
import CustomSheet from "../../components/AppSheet";
import API_CONSTANTS from "../../constants/apiConstants.ts";
import { useGetApi } from "../../services/use-api.ts";
import { ROUTES } from "../../constants/routesConstants.ts";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import PatientsOverAllReportSidePannel from "./PatientsOverAllReportSidePannel.tsx";
import AppButton from "../../components/AppButton.tsx";
import "./Shimmer.css";
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
  // ChevronDown,
  ChevronRight,
  // ChevronsUpDown,
  // ChevronUp,
  Plus,
} from "lucide-react";
import AddPatient from "./AddPatient.tsx";
import AppModal from "../../components/AppModal.tsx";
import { useSelector } from "react-redux";
import { useSidebar } from "../../components/ui/sidebar.tsx";
import socketService from "../../utils/socket";
import { useAppSelector } from "../../redux/store.ts";
import clsx from "clsx";
import { Data_Constcnts } from "../../constants/AppConstants.ts";
// import ChatBot from "../ChatBot/ChatBot.tsx";

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const { getData: GetReportApi, isLoading: loading } = useGetApi<any>("");
  const [patientList, setPatientsList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { userData } = useAppSelector((state: any) => state.authData);
  const { state } = useSidebar();
  const toggleClose = () => {
    setIsModalOpen((prev) => !prev);
    fetchReports();
  };
  // const [HealthSummaryNotFound, setHealthSummaryNotFoune] =
  //   useState<boolean>(false);
  const { patientSearch } = useSelector((state: any) => state.searchData);

  type Row = {
    healthSummaryId?: {
      conditions?: { name: string }[];
    };
  };

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => {
      const baseColumns: ColumnDef<any>[] = [
        {
          header: "Patient Name",
          id: "name",
          enableSorting: true,
          accessorFn: (row) => `${row?.name} ${row?.age}`,
          cell: ({ cell }: any) => {
            const { name, age, gender } = cell.row.original;
            return (
              <span>
                <span className="font-medium text-[#1A2435] text-sm">
                  {name}
                </span>{" "}
                <span className="text-sm ml-2 text-[#8C929A]">
                  {Number(age) || 0} {gender?.charAt(0)}
                </span>
              </span>
            );
          },
          size: 300, // Increased width
        },
        {
          header: "Reports",
          id: "reportsCount",
          enableSorting: true,
          meta: {
            className: "hidden md:table-cell",
          },
          accessorFn: (row) => row?.reportsCount,
          cell: ({ row }: any) => {
            return (
              <div className="flex">
                <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] ml-6 mt-1">
                  {row?.original.reportsCount}
                </span>
              </div>
            );
          },
          size: 132,
        },
        {
          header: "Last Report",
          id: "lastReportDate",
          enableSorting: true,
          meta: {
            className: "hidden md:table-cell",
          },
          accessorFn: (row) => moment(row?.lastReportDate).format("ll"),
          cell: ({ row }: any) => {
            return (
              <div className="flex gap-2">
                <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] mt-1">
                  {moment(row?.original?.lastReportDate).format("ll")}
                </span>
              </div>
            );
          },
        },
        {
          header: "Joined",
          id: "createdAt",
          enableSorting: true,
          accessorFn: (row) => moment(row?.createdAt).format("ll"),
          meta: { className: "hidden md:table-cell" },
          cell: ({ row }: any) => {
            return (
              <div className="flex gap-2">
                <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] mt-1">
                  {moment(row?.original?.createdAt).format("ll")}
                </span>
              </div>
            );
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
        baseColumns.push({
          header: "View",
          id: "View",
          enableSorting: false,
          meta: { className: "hidden md:table-cell" },
          cell: ({ row }: any) => {
            return (
              <div className="flex z-50 justify-center">
                <button
                  onClick={() => {
                    if (row.original.reportsCount > 0) {
                      if (row?.original?.healthSummaryId?.clientId) {
                        navigate(
                          `${ROUTES.PATIENTS_OVERALL_HEALTH}?id=${row.original._id}`
                        );
                      } else {
                        console.log("health summary not found");
                      }
                    }
                  }}
                  className={clsx(
                    "font-regular w-5/6 rounded-[30px] border border-[#E6E7E7] mt-[1px] flex items-center text-sm justify-center font-normal text-[#666D79] px-4 py-1 max-w-[120px] whitespace-nowrap hover:!bg-[#e3eef0] hover:border-medistryColor hover:text-medistryColor",
                    row.original.reportsCount > 0 ? "cursor-pointer" : ""
                  )}
                >
                  <p>Full Profile </p>
                  <ChevronRight strokeWidth={"1.5px"} height={"18px"} />
                </button>
              </div>
            );
          },
        });
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
    data: patientList ?? defaultData,
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
    userData?.role?.includes("client") &&
      navigate(`${ROUTES.HEALTHREPORT}?tab=completed`);
    setPatientsList([]);
    setCurrentPage(1); // Reset to first page
    setHasMore(true); // Reset hasMore
    fetchReports(true);
  }, [patientSearch, sorting]);

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
      search: patientSearch,
    });

    try {
      const response: any = await GetReportApi(
        `${API_CONSTANTS.GET_ALL_PATIENTS}?${params}`
      );

      if (response?.data.success) {
        const newPatients = response?.data?.clients?.items || [];
        console.log("🚀 ~ fetchReports ~ newPatients:", newPatients);
        if (currentPage === 1) {
          setPatientsList(newPatients);
        } else {
          setPatientsList((prev) => [...prev, ...newPatients]);
        }
        setHasMore(newPatients?.length === pageSize);
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
          onClick={() => toggleClose()}
          className="relative flex w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none mt-[16px] mb-[16px] mr-[8px] md:mr-[16px] rounded-[30px] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] text-sm"
        >
          <Plus /> Add Patient
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
              {loading && patientList?.length === 0 ? (
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
                          // onClick={() => {
                          //   if (
                          //     userData?.organizationId?.emrEnabled &&
                          //     userData?.organizationId?.emrType ===
                          //     Data_Constcnts.EMR_TYPE
                          //     // && row?.original?.healthSummaryId?.clientId
                          //   ) {
                          //     if (cell.column.columnDef.header === "View") {
                          //       navigate(
                          //         `${ROUTES.PATIENTS_OVERALL_HEALTH}?id=${row.original?._id}`
                          //       );
                          //     } else {
                          //       console.log(
                          //         "🚀 ~ cell.row.original:",
                          //         cell.row.original
                          //       );
                          //       // if (
                          //       //   cell.row.original.reportsCount > 0 ||
                          //       //   cell?.row?.original?.healthSummaryId?.clientId
                          //       // ) {
                          //       if (row.original._id) {
                          //         toggleEdit();
                          //         navigate(
                          //           `${ROUTES.PATIENTS}?id=${row.original._id
                          //           }&summary=${row?.original?.healthSummaryId?.clientId
                          //             ? true
                          //             : false
                          //           }`
                          //         );
                          //       }
                          //       // }
                          //     }
                          //   }
                          // }}
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
                    No Patients to show
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && patientList?.length > 0 && (
            <div className="flex items-center justify-center py-4 space-x-2">
              <span className="text-[#526279">loading patients...</span>
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
        <AddPatient toggleClose={toggleClose} />
      </AppModal>
    </div>
  );
};

export default Patients;
