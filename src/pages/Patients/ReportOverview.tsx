import React, { useEffect, useRef, useState, useMemo } from "react";
import moment from "moment";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";
import CustomSheet from "../../components/AppSheet";
import HealthReportSidePannel from "../HealthReport/HealthReportSidePannel";
import { useSidebar } from "../../components/ui/sidebar";

interface ReportOverviewProps {
  reportsList: any[];
  isReportLoading: any;
  pagination: any;
}

const ReportOverview: React.FC<ReportOverviewProps> = ({
  reportsList,
  isReportLoading,
  pagination,
}) => {
  const { state: sidebarState } = useSidebar();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  console.log(selectedReportId);
  const [petientDetailSidepanel, setPetientDetailSidepanel] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // const pagination = useMemo(
  //   () => ({
  //     pageIndex: 1,
  //     pageSize: 25,
  //     totalPages: 0,
  //   }),
  //   []
  // );

  const columnsCompleted = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Report Title",
        id: "reportTitle",
        enableSorting: true,
        accessorFn: (row) =>
          row?.reportInterpretation?.reportTitle || row?.reportTitle,
        cell: ({ getValue }) => (
          <div
            className="w-[170px] md:w-[300px] truncate font-medium text-[#1A2435] text-sm"
            title={getValue() as string}
          >
            {getValue() as string}
          </div>
        ),
        size: 400,
      },
      {
        header: "Patient Name",
        id: "patientName",
        enableSorting: true,
        accessorFn: (row) => row?.client?.name || row?.clientName,
        cell: ({ getValue }) => (
          <div
            className="w-[140px] md:w-[180px] truncate font-medium text-[#1A2435] text-sm"
            title={getValue() as string}
          >
            {getValue() as string}
          </div>
        ),
        size: 240,
      },
      {
        header: "Report Date",
        id: "reportDate",
        size: 150,
        meta: { className: "hidden md:table-cell" },
        enableSorting: true,
        accessorFn: (row) =>
          row?.reportInterpretation?.reportIdentification?.reportDate ||
          row?.reportDate,
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
        meta: { className: "hidden md:table-cell" },
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

  const defaultData = useMemo(() => [], []);
  const table = useReactTable({
    data: reportsList ?? defaultData,
    columns: columnsCompleted,
    rowCount: pagination.pageSize,
    state: { pagination, sorting },
    onPaginationChange: () => {},
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  useEffect(() => {
    setPetientDetailSidepanel(false);
    setSelectedReportId(null);
  }, []);

  const togglePetientSidepanel = () => {
    setPetientDetailSidepanel((prev) => {
      if (prev) {
        setSelectedReportId(null);
      }
      return !prev;
    });
  };

  const handleRowClick = (row: any) => {
    const reportId = row.original?._id;
    if (!reportId) return;

    setSelectedReportId(reportId);
    // navigate(`${location.pathname}?&id=${reportId}`, {
    //   replace: true,
    // });

    setPetientDetailSidepanel(true);
  };

  return (
    <div style={{ marginLeft: sidebarState === "collapsed" ? "28px" : "" }}>
      <div className="">
        <div
          ref={tableContainerRef}
          className="rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white"
          style={{
            maxHeight: "calc(100vh - 152px)",
            backgroundColor: "white",
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
                                      ${
                                        header.id === "View"
                                          ? "w-[13%] text-center"
                                          : ""
                                      } ${
                          header.column.columnDef.meta?.className || ""
                        } ${header.id === "Edit" ? "pl-16" : ""}`}
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
              {isReportLoading && reportsList?.length === 0 ? (
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
              ) : reportsList?.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b hover:bg-gray-100 bg-[#ffffff] transition-colors"
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => handleRowClick(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`px-3 py-2 text-gray-700 !font-medium ${
                          cell.column.columnDef.meta?.className || ""
                        } ${
                          cell.column.columnDef.header === "edit" ? "w-0" : ""
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
                    className="text-center py-8 text-gray-500 bg-[#ffffff]"
                    style={{ height: "calc(100vh - 210px)" }}
                  >
                    No Reports to show
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {isReportLoading && reportsList?.length > 0 && (
            <div className="flex items-center justify-center py-4 space-x-2">
              <span className="text-[#526279">loading reports...</span>
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

      <CustomSheet
        title=""
        isOpen={petientDetailSidepanel}
        toggle={togglePetientSidepanel}
        className="dark:bg-gray-800 dark:text-gray-100"
        content={<HealthReportSidePannel selectedReportId={selectedReportId} />}
      />
    </div>
  );
};

export default ReportOverview;
