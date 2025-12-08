import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { ROUTES } from "../../constants/routesConstants";
import { useGetApi } from "../../services/use-api";
import moment from "moment";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API_CONSTANTS from "../../constants/apiConstants";

const AIObservations: React.FC = () => {
  const navigate = useNavigate();
  const [patientList, setPatientsList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const defaultData = React.useMemo(() => [], []);
  const [pagination, setPagination] = useState<any>({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const { getData: GetReportApi, isLoading: loading } = useGetApi<any>("");
  const { patientSearch } = useSelector((state: any) => state.searchData);

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Report id",
        id: "Report id",
        enableSorting: true,
        cell: ({ row }: any) => {
          return (
            <div className="flex gap-2 z-50">
              <span className="text-[14px] font-normal truncate text-sm text-[#8C929A]">
                {row?.original?._id}
              </span>
            </div>
          );
        },
      },
      {
        header: "File name",
        id: "Original report",
        enableSorting: true,
        accessorFn: (row) => row?.reportsCount,
        cell: ({ row }: any) => {
          return (
            <div className="flex">
              <span className="text-[14px] font-regular truncate text-sm text-[#8C929A] ml-6 mt-1">
                {row?.original.fileName}
              </span>
            </div>
          );
        },
        size: 132,
      },
      {
        header: "Report Date",
        id: "reportDate",
        size: 150,
        enableSorting: true,
        accessorFn: (row) => {
          const reportDate =
            row?.reportInterpretation?.reportIdentification?.reportDate ||
            row?.reportDate;
          return reportDate;
        },
        cell: ({ getValue }) => {
          const rawDate = getValue();
          return (
            <span className="text-[14px] font-normal truncate text-sm text-[#8C929A]">
              {rawDate ? moment(rawDate).format("ll") : "-"}
            </span>
          );
        },
      },
      {
        header: "Uploaded",
        id: "createdAt",
        accessorFn: (row) => moment(row?.createdAt).format("ll"),
        enableSorting: true,
        cell: ({ row }: any) => (
          <div className="flex gap-2 z-50 w-[100px]">
            <span className="text-[14px] font-normal truncate text-sm text-[#8C929A]">
              {moment(row?.original?.createdAt).format("ll")}
            </span>
          </div>
        ),
        size: 160,
      },
    ],
    []
  );

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
    setPatientsList([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchReports(true);
  }, [patientSearch, sorting]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchReports();
    }
  }, [currentPage]);

  const fetchReports = async (currentPageValue = false) => {
    const pageSize = 15;
    const page = currentPageValue ? "1" : currentPage.toString();
    const params = new URLSearchParams({
      per_page: pageSize.toString(),
      page: page,
      sortBy: sorting[0]?.id || "",
      sortOrder: sorting[0]?.desc ? "desc" : "asc",
      search: patientSearch,
      status: "completed",
    });

    try {
      const response: any = await GetReportApi(
        `${API_CONSTANTS.GET_ALL_REPORT}?${params}`
      );

      if (response?.data.success) {
        const newPatients = response?.data?.reports?.items || [];
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
    <div className="p-4">
      <div
        className="rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white overflow-hidden overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white overflow-x-auto w-full"
        ref={tableContainerRef}
        style={{
          height: "calc(100vh - 100px)",
          overflowY: "auto",
        }}
      >
        <table className="w-full min-w-[900px] text-left table-fixed">
          <thead className="sticky top-0 bg-white z-10 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-[#E6E6E8]">
                {headerGroup.headers.map((header, index, arr) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={`p-3 font-manrope text-base  font-medium text-[#666D79] 
                  ${index === arr?.length - 1 ? "text-left" : "text-left"} 
                  ${
                    header.id === "name"
                      ? "w-[25%]"
                      : header.id === "PrimaryCondition"
                      ? "w-[18%]"
                      : header.id === "reportsCount"
                      ? "w-[10%]"
                      : header.id === "lastReportDate"
                      ? "w-[12%]"
                      : header.id === "createdAt"
                      ? "w-[12%]"
                      : header.id === "View"
                      ? "w-[13%] text-center"
                      : ""
                  }`}
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
                                <ChevronUp
                                  strokeWidth={1.5}
                                  className="w-4 h-4 text-gray-500 pl-1 shrink-0"
                                />
                              ),
                              desc: (
                                <ChevronDown
                                  strokeWidth={1.5}
                                  className="w-4 h-4 text-gray-500 pl-1 shrink-0"
                                />
                              ),
                              false: (
                                <ChevronsUpDown
                                  strokeWidth={1.5}
                                  className="w-4 h-4 text-gray-500 pl-1 shrink-0"
                                />
                              ),
                            }[header.column.getIsSorted() as string] ?? null}
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
            {loading && patientList?.length === 0 ? (
              Array.from({ length: 15 }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-100 bg-[#f4f4f4] animate-pulse"
                >
                  {table.getHeaderGroups()[0].headers.map(() => (
                    <td
                      className="px-4 py-2"
                      // style={{
                      //   width: header.column.columnDef.width || '150px',
                      // }}
                    >
                      <div className="shimmer h-4 rounded w-full"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel()?.rows?.length > 0 ? (
              table.getRowModel()?.rows?.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-gray-100 bg-[#ffffff] transition-colors"
                  style={{ cursor: "pointer" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        // width: cell.column.columnDef.width || '150px',
                        padding: "17px 12px",
                        verticalAlign: "top",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      className={`px-3 py-2 text-gray-700 
                      ${
                        cell.column.id === "name"
                          ? "w-[25%]"
                          : cell.column.id === "PrimaryCondition"
                          ? "w-[18%]"
                          : cell.column.id === "reportsCount"
                          ? "w-[10%]"
                          : cell.column.id === "lastReportDate"
                          ? "w-[12%]"
                          : cell.column.id === "createdAt"
                          ? "w-[12%]"
                          : cell.column.id === "View"
                          ? "w-[13%]"
                          : ""
                      }`}
                      onClick={() => {
                        navigate(
                          `${ROUTES.VIEW_OBSERVATION}?id=${row.original?._id}`,
                          {
                            replace: true,
                          }
                        );
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
                  colSpan={table.getHeaderGroups()[0]?.headers?.length}
                  className="text-center py-4 text-gray-500 h-[30rem]"
                >
                  No Patient To Show
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {loading && patientList?.length > 0 && (
          <div className="flex items-center justify-center py-4 space-x-2">
            <span className="text-[#526279">Loading patient...</span>
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
  );
};

export default AIObservations;
