import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSidebar } from "../../components/ui/sidebar";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowLeft,
  ArrowUp,
  ChevronRight,
} from "lucide-react";
import { useGetApi, usePostApi } from "../../services/use-api";
import AppButton from "../../components/AppButton";
import API_CONSTANTS from "../../constants/apiConstants";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import { cn } from "../../lib/utils";
import { useSelector } from "react-redux";
import BroadcastMessageView from "./BroadcastMessageView";

const TeamLoges: React.FC = () => {
  interface RowData {
    name: string;
    Name: string;
    Access: string;
    role?: string;
    email: string;
    status: string;
    permission: string[];
  }

  const [pagination, setPagination] = useState<any>({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { state } = useSidebar();
  const { getData: GetTeamLogsData, isLoading: loading } = useGetApi<any>("");
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const { postData: getPresigned } = usePostApi<AuthResponseBodyDataModel>({
    path: API_CONSTANTS.REPORT_PRESIGNED_URL,
  });
  const { teamLogsSearch } = useSelector((state: any) => state.searchData);
  const [broadcastMessageView, setBroadcastMessageView] =
    useState<boolean>(false);
  const [broadcastMessageData, setBroadcastMessageData] = useState<any>([]);

  useEffect(() => {
    setRowData([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchTeamsLog(true);
  }, [teamLogsSearch]);

  useEffect(() => {
    if (currentPage >= 1) {
      fetchTeamsLog();
    }
  }, [currentPage]);

  const fetchTeamsLog = async (currentPageValue = false) => {
    const pageSize = 10;
    const page = currentPageValue ? "1" : currentPage.toString();
    const params = new URLSearchParams({
      per_page: pageSize.toString(),
      page: page,
      search:
        teamLogsSearch && teamLogsSearch !== "undefined" ? teamLogsSearch : "",
    });
    try {
      const response: any = await GetTeamLogsData(
        `${API_CONSTANTS.TEAMS_LOGS}?${params}`
      );
      if (response?.data.success) {
        const newPatients = response?.data?.data?.items || [];
        if (currentPage === 1) {
          setRowData(newPatients);
        } else {
          setRowData((prev) => [...prev, ...newPatients]);
        }
        setHasMore(newPatients.length === pageSize);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      setHasMore(false);
    }
  };

  const handleBtnClick = (rowdata: any) => {
    console.log("🚀 ~ handleBtnClick ~ rowdata:", rowdata);
    if (rowdata.resource === "REPORT") {
      if (rowdata.resourceId.status === "completed") {
        navigate(`${ROUTES.REPORT_SUMMARY}?id=${rowdata.resourceId._id}`);
      }
    }
    if (rowdata.resource === "PATIENT") {
      navigate(
        `${ROUTES.PATIENTS_OVERALL_HEALTH}?id=${rowdata.resourceId._id}`
      );
    }
  };

  const handleOpenPdf = async (rowdata: any) => {
    const payload = {
      reportId: rowdata.resourceId?._id,
    };
    const resData: any = await getPresigned(payload);
    if (resData?.data?.success) {
      const fileUrl = resData?.data?.data;
      if (fileUrl) {
        window.open(fileUrl, "_blank");
      } else {
        console.log("file url not present");
      }
    }
  };

  const handleShowBroadcastData = (data: any) => {
    setBroadcastMessageData(data);
    setBroadcastMessageView(true);
  };

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Message",
        id: "message",
        enableSorting: false,
        accessorFn: (row) => row?.original.message,
        cell: ({ row }: any) => {
          return (
            <div className="flex gap-2">
              <span className="font-medium text-[#1A2435] text-sm">
                {row?.original.message}
              </span>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Resource",
        id: "resource",
        enableSorting: false,
        accessorFn: (row) => row?.original.resource,
        cell: ({ row }: any) => {
          return (
            <div className="flex gap-2">
              <span className="font-medium text-[#1A2435] text-sm">
                {row?.original.resource}
              </span>
            </div>
          );
        },
        size: 150,
      },
      {
        header: "Joined On",
        id: "Joined On",
        enableSorting: false,
        accessorFn: (row) => moment(row?.original?.createdAt).format("ll"),
        cell: ({ row }: any) => {
          return (
            <div className="flex gap-2">
              <span className="text-[14px] font-regular truncate text-sm font-light text-[#8C929A]">
                {moment(row?.original?.createdAt).format("ll")}
              </span>
            </div>
          );
        },
        size: 100,
      },
      {
        header: "Update At",
        id: "Update At",
        enableSorting: false,
        accessorFn: (row) => moment(row?.original?.updatedAt).format("ll"),
        cell: ({ row }: any) => {
          return (
            <div className="flex gap-2">
              <span className="text-[14px] font-regular truncate text-sm font-light text-[#8C929A]">
                {moment(row?.original?.updatedAt).format("ll")}
              </span>
            </div>
          );
        },
        size: 100,
      },
      {
        header: "Action",
        id: "Action",
        enableSorting: false,
        cell: ({ row }: any) => {
          const { resource, resourceId } = row.original;
          const isPending = resourceId?.status === "pending";
          const isCompleted = resourceId?.status === "completed";
          const handleClick = () => {
            if (resource === "PATIENT" || isCompleted || isPending) {
              handleBtnClick(row.original);
            } else {
              handleOpenPdf(row.original);
            }
          };

          return (
            <div className="flex gap-2 items-center">
              {resource === "BROADCAST" ? (
                <button
                  onClick={() => handleShowBroadcastData(row.original)}
                  className={cn(
                    "font-regular rounded-[30px] border border-[#E6E7E7] shadow-sm hover:bg-gray-200 min-w-[200px] flex items-center justify-between px-4 py-2",
                    isPending && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span className="text-sm font-normal text-[#666D79] flex-1 text-center">
                    View Message
                  </span>

                  <ChevronRight strokeWidth={"1.5px"} height={"18px"} />
                </button>
              ) : resource !== "REPORT" ? (
                ""
              ) : (
                <button
                  disabled={isPending}
                  onClick={handleClick}
                  className={cn(
                    "font-regular rounded-[30px] border border-[#E6E7E7] shadow-sm hover:bg-gray-200 min-w-[200px] flex items-center justify-between px-4 py-2",
                    isPending && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span className="text-sm font-normal text-[#666D79] flex-1 text-center">
                    {isCompleted || isPending
                      ? "View Full Report"
                      : "View Flagged Report"}
                  </span>

                  <ChevronRight strokeWidth={"1.5px"} height={"18px"} />
                </button>
              )}
            </div>
          );
        },
        size: 200,
      },
    ],
    []
  );
  const table = useReactTable({
    data: rowData,
    columns,
    rowCount: pagination.pageSize,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);
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

  return (
    <div
      className=" !bg-[#f3f4f6]"
      style={{ marginLeft: state == "collapsed" ? "28px" : "" }}
    >
      <header className="flex justify-start">
        <AppButton
          className="w-[130px] h-[40px] m-4 rounded-[30px] !bg-white !text-[#293343] border-none flex items-center justify-center pl-1 text-sm"
          onClick={() => navigate(ROUTES.PROFILE)}
        >
          <ArrowLeft className="w-7 h-7" />
          Back
        </AppButton>
      </header>
      <div className="px-4">
        <div
          className="rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white"
          ref={tableContainerRef}
          style={{
            height: "calc(100vh - 152px)",
            overflowY: "auto",
          }}
        >
          <div className="">
            <table className="w-full text-left table-fixed">
              <thead className="sticky top-0 bg-white z-10 border-b">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-[#E6E6E8]">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className="p-3 text-left text-base font-medium text-[#666D79]"
                        style={{
                          width: `${header.getSize()}px`,
                          minWidth: `${header.getSize()}px`,
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none flex items-center space-x-2"
                                : "",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <>
                                {{
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
                                  null}
                              </>
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {loading && rowData?.length === 0 ? (
                  Array.from({ length: 15 }).map((_, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-100 bg-[#f4f4f4] animate-pulse"
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
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b hover:bg-gray-100 bg-[#ffffff] transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-2 text-gray-700 !font-medium"
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
                      No Logs to show
                    </td>
                  </tr>
                )}
                <>
                  {/* <tr className="border-b hover:bg-gray-100 bg-[#f4f4f4] animate-pulse">
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
                            maxWidth: `${column.getSize() * 1.2}px`,
                          }}
                        ></div>
                      </td>
                    ))}
                  </tr> */}
                </>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {loading && rowData?.length > 0 && (
        <div className="flex items-center justify-center py-4 space-x-2">
          <span className="text-[#526279">Loading Logs...</span>
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
      <BroadcastMessageView
        isOpen={broadcastMessageView}
        onClose={() => setBroadcastMessageView(false)}
        data={broadcastMessageData}
      />
    </div>
  );
};

export default TeamLoges;
