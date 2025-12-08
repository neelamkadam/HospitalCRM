import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGetApi, usePostApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import { RefreshCcw } from "lucide-react";
import { HealthSummaryRequestsStatus } from "../../types/response.types";
import AppButton from "../../components/AppButton";
import AppModal from "../../components/AppModal";
import AcceptDoctorrequest from "../../components/AcceptDoctorrequest";
import AppDeleteDialog from "../../components/AppDeleteDialog";
import { useSelector } from "react-redux";

export const PatientRequest: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastScrollTop = useRef(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { userData } = useSelector((state: any) => state.authData);
  // For Delete Dialog
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState<boolean>(false);
  const [reportDataInfo, setReportDataInfo] = useState<any>([]);
  const [selectedConditions, setSelectedConditions] = useState<Set<string>>(
    new Set()
  );

  const [selectedRequest, setSelectedRequest] = useState<{
    id: string;
    action: string;
  } | null>(null);
  const { getData: GetHealthSummaryRequestApi, isLoading: loading } =
    useGetApi<any>("");

  const { postData: getAccept } = usePostApi<HealthSummaryRequestsStatus>({
    path: API_CONSTANTS.PATIENTS.PATIENT_HEALTH_SUMMARY_REQUEST_STATUS,
  });

  const id = selectedRequest?.id;
  const { postData: SendSelectedReport, isLoading: patientRequestLoading } =
    usePostApi<any>({
      path: `${API_CONSTANTS.PATIENTS.PATIENT_HEALTH_SUMMARY_REQUEST}/${id}`,
    });

  const { getData: GetMedicalCondition, isLoading: medicalConditionLoading } =
    useGetApi<any>("", {
      isToaster: false,
    });

  const fetchMedicalCondition = async () => {
    try {
      const response: any = await GetMedicalCondition(
        `${API_CONSTANTS.OVERALL_PATIENTS_REPORT}/${userData._id}`
      );
      if (response?.data.success) {
        setReportDataInfo(response.data.overAllHealth);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchMedicalCondition();
  }, []);

  const toggleClose = () => {
    setIsModalOpen(false);
    setSelectedConditions(new Set());
  };

  const [pagination, setPagination] = useState<any>({
    pageIndex: 1,
    pageSize: 25,
    totalPages: 0,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const fetchData = useCallback(
    async (page: number, resetData = false) => {
      if (isLoadingMore && !resetData) return;

      setIsLoadingMore(true);

      const params = new URLSearchParams({
        per_page: pagination.pageSize.toString(),
        page: page.toString(),
      });

      try {
        const response: any = await GetHealthSummaryRequestApi(
          `${API_CONSTANTS.PATIENTS.PATIENT_GET_HEALTH_SUMMARY_REQUEST}?${params}`
        );

        if (response?.data.success) {
          const newData = response?.data?.requests?.items || [];
          const totalPages = response?.data?.requests?.totalPages || 0;

          if (resetData || page === 1) {
            setData(newData);
          } else {
            setData((prev) => [...prev, ...newData]);
          }

          setPagination((prevPagination: any) => ({
            ...prevPagination,
            totalPages: totalPages,
          }));

          setHasMore(
            page < totalPages && newData.length === pagination.pageSize
          );
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
        setHasMore(false);
      } finally {
        setIsLoadingMore(false);
      }
    },
    [GetHealthSummaryRequestApi]
  );

  useEffect(() => {
    fetchData(1, true);
  }, [fetchData]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchData(currentPage);
    }
  }, [currentPage]);

  const handleTableScroll = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isScrollingDown = scrollTop > lastScrollTop.current;
    lastScrollTop.current = scrollTop;

    if (isScrollingDown && scrollHeight - scrollTop - clientHeight < 100) {
      setCurrentPage((prevPage) => {
        const nextPage = prevPage + 1;
        if (pagination.totalPages > 0 && nextPage > pagination.totalPages) {
          return prevPage;
        }
        return nextPage;
      });
    }
  }, [isLoadingMore, hasMore, pagination.totalPages]);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleTableScroll);
      return () => container.removeEventListener("scroll", handleTableScroll);
    }
  }, [handleTableScroll]);

  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    setData([]);
    fetchData(1, true);
  }, [fetchData]);

  const columns = React.useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        header: "Doctor",
        accessorKey: "requestedBy.name",
        cell: ({ getValue }) => (
          <div className="w-60 truncate">
            <span className="capitalize font-medium text-[#1A2435] text-sm">
              {getValue() as string}
            </span>
          </div>
        ),
      },
      {
        header: "Org Name",
        accessorKey: "organizationId.organizationName",
        cell: ({ getValue }) => (
          <div className="w-60 truncate">
            <span className="capitalize font-medium text-[#1A2435] text-sm">
              {getValue() as string}
            </span>
          </div>
        ),
      },
      {
        header: "Requested Date",
        accessorKey: "createdAt",
        cell: ({ getValue }) => {
          const dateValue = new Date(getValue() as string).toLocaleDateString();
          return (
            <span className="font-normal text-[#394557]">{dateValue}</span>
          );
        },
      },
    ];

    baseColumns.push({
      header: "Action",
      accessorKey: "requestedBy.status",
      cell: ({ row }) => {
        const status = row.original.status;
        const id = row.original._id;
        return (
          <span className="font-normal text-[#394557] flex gap-2">
            {status === "accepted" ? (
              <span className="inline-flex items-center justify-center text-center px-2 py-1 text-md font-medium text-green-700 ring-inset">
                Accepted
              </span>
            ) : status === "rejected" ? (
              <span className="inline-flex items-center justify-center text-center text-md font-medium text-red-700 px-2 py-1 ring-inset">
                Rejected
              </span>
            ) : (
              <>
                {/* Accept Button */}
                <button
                  type="button"
                  onClick={() => handleAcceptAction(id)}
                  className="font-regular w-full rounded-[30px] border border-[#E6E7E7] 
                   text-sm font-normal text-[#666D79] items-center p-1 
                   whitespace-nowrap max-w-[100px] bg-white flex justify-center gap-2"
                >
                  Accept
                </button>

                <button
                  type="button"
                  onClick={() => handleRejectAction(id)}
                  className="font-regular w-full rounded-[30px] border border-[#E6E7E7] 
                   text-sm font-normal text-[#666D79] items-center p-1 
                   whitespace-nowrap max-w-[100px] bg-white flex justify-center gap-2"
                >
                  Reject
                </button>
              </>
            )}
          </span>
        );
      },
    });
    return baseColumns;
  }, []);

  const updateRequestStatus = (requestId: string, status: string) => {
    setData((prevData) =>
      prevData.map((item) =>
        item._id === requestId ? { ...item, status } : item
      )
    );
  };

  const handleAction = async () => {
    if (!selectedRequest) return;

    const { id, action } = selectedRequest;
    setRejectLoading(true);

    // Optimistically update UI
    updateRequestStatus(id, action);

    try {
      const payload = { status: action };
      await getAccept(
        payload,
        `${API_CONSTANTS.PATIENTS.PATIENT_HEALTH_SUMMARY_REQUEST_STATUS}${id}`
      );
      setRejectModal(false);
    } catch (err) {
      // Revert on error
      handleRefresh();
    } finally {
      setRejectLoading(false);
      setSelectedRequest(null);
      fetchData(currentPage);
    }
  };

  const handleAcceptAction = (id: string) => {
    setSelectedRequest({ id, action: "accepted" });
    setIsModalOpen(true);
  };

  const handleRejectAction = (id: string) => {
    setSelectedRequest({ id, action: "rejected" });
    setRejectModal(true);
  };

  const handleAccept = async () => {
    if (!selectedRequest) return;

    const { id, action } = selectedRequest;
    const selectedReports = [];

    for (const conditionId of selectedConditions) {
      const [historyIndex, conditionIndex] = conditionId.split("-").map(Number);
      const history = reportDataInfo.medicalHistory[historyIndex];
      if (history) {
        const condition = history.testsAndConditions[conditionIndex];
        if (condition) {
          selectedReports.push(condition.name);
        }
      }
    }

    try {
      // Optimistically update UI
      updateRequestStatus(id, action);

      const payload = {
        status: action,
        conditionsToInclude: selectedReports,
      };

      await SendSelectedReport(payload);
      setIsModalOpen(false);
      setSelectedConditions(new Set());
    } catch (error) {
      // Revert on error
      handleRefresh();
    }
  };

  const defaultData = React.useMemo(() => [], []);

  const table = useReactTable({
    data: data ?? defaultData,
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
    manualSorting: false,
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  return (
    <div className="pl-4 pr-4">
      <header className="flex justify-between">
        <div></div>
        <div className="flex">
          <AppButton
            className="relative flex w-[120px] sm:w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none mt-[16px] mb-[16px] rounded-[30px] text-sm"
            onClick={handleRefresh}
          >
            <RefreshCcw />Refresh
          </AppButton>
        </div>
      </header>
      <div
        ref={tableContainerRef}
        className="rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] bg-white overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white border !border-[#E6E7E9]"
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
                      className={`p-3 font-manrope text-base font-medium text-[#666D79] whitespace-nowrap 
                       ${header.id === "Action" ? "w-[13%] text-center" : ""}
                       ${header.column.columnDef.meta?.className || ""}`}
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
                          {/* {header.column.getCanSort() &&
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
                              null)} */}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading && data?.length === 0 ? ( // Show shimmer only for initial load
              Array.from({ length: 10 }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-100 bg-[#f4f4f4] animate-pulse"
                >
                  {Array.from({ length: 4 }).map((_, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2">
                      <div className="shimmer h-4 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b hover:bg-gray-100 bg-[#ffffff] transition-colors"
                    style={{ cursor: "pointer" }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-2 text-[#8C929A] !font-normal text-[14px]"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Loading indicator for infinite scroll */}
                {isLoadingMore && hasMore && (
                  <tr>
                    <td
                      colSpan={table.getHeaderGroups()[0].headers.length}
                      className="text-center py-4 text-gray-500 bg-[#ffffff]"
                    >
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading more...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {/* End of data indicator */}
                {/* {!hasMore && data.length > 0 && (
                  <tr>
                    <td
                      colSpan={table.getHeaderGroups()[0].headers.length}
                      className="text-center py-4 text-gray-400 bg-[#ffffff]"
                    >
                      <div className="text-sm">No more Requests to load</div>
                    </td>
                  </tr>
                )} */}
              </>
            ) : (
              <tr>
                <td
                  colSpan={table.getHeaderGroups()[0].headers.length}
                  className="text-center py-4 text-gray-500 bg-[#ffffff]"
                  style={{ height: "calc(100vh - 200px)" }}
                >
                  No requests to show
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AppModal isOpen={isModalOpen} toggle={toggleClose} title="">
        <AcceptDoctorrequest
          setIsModalOpen={setIsModalOpen}
          onAccept={handleAccept}
          medicalConditionLoading={medicalConditionLoading}
          reportDataInfo={reportDataInfo}
          patientRequestLoading={patientRequestLoading}
          selectedConditions={selectedConditions}
          setSelectedConditions={setSelectedConditions}
        />
      </AppModal>
      <AppDeleteDialog
        isLoading={rejectLoading}
        isOpen={rejectModal}
        title="Reject Doctor Request"
        confirmTitle="Reject"
        description={`Are you sure you want to reject doctor request?`}
        onConfirm={handleAction}
        onClose={() => setRejectModal(false)}
      />
    </div>
  );
};
