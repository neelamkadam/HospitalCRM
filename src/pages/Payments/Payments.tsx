import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGetApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import { ArrowLeft, IndianRupee, SquareArrowOutUpRight } from "lucide-react";
import AppButton from "../../components/AppButton";
import { useAppSelector } from "../../redux/store";
import moment from "moment";
import { useSidebar } from "../../components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import clsx from "clsx";

export const Payments: React.FC = () => {
  const { state } = useSidebar();
  const { userData }: any = useAppSelector((state) => state.authData);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastScrollTop = useRef(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const showPayNow =
    !userData?.organizationId?.renewalDate ||
    (moment(userData?.organizationId?.renewalDate).isValid() &&
      moment(userData?.organizationId?.renewalDate).isBefore(
        moment().add(7, "days").endOf("day")
      ));

  const showClientPayNow =
    !userData?.renewalDate ||
    (moment(userData?.renewalDate).isValid() &&
      moment(userData?.renewalDate).isBefore(
        moment().add(7, "days").endOf("day")
      ));

  const { getData: GetPaymentsApi, isLoading: loading } = useGetApi<any>("");
  const { getData: GetClientPaymentsApi, isLoading: clientLoading } =
    useGetApi<any>("");
  const { getData: GetPaymentsRenewApi, isLoading: loadingRenew } =
    useGetApi<any>("");
  const { getData: GetClientPaymentsRenewApi, isLoading: clientLoadingRenew } =
    useGetApi<any>("");

  const [pagination, setPagination] = useState<any>({
    pageIndex: 1,
    pageSize: 25,
    totalPages: 0,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const fetchClienttData = useCallback(
    async (page: number, resetData = false) => {
      if (isLoadingMore && !resetData) return; // Prevent multiple simultaneous calls

      setIsLoadingMore(true);

      const params = new URLSearchParams({
        per_page: pagination.pageSize.toString(),
        page: page.toString(),
        status: "paid,unpaid",
        // sortBy: sorting[0]?.id || "",
        // sortOrder: sorting[0]?.desc ? "desc" : "asc",
        // search: patientSearch,
      });

      try {
        const response: any = await GetClientPaymentsApi(
          `${API_CONSTANTS.PAYMENTS.CLIENT_PAYMENT}?${params}`
        );
        if (response?.data.success) {
          const newData = response?.data?.clientPayments?.items || [];

          const totalPages = response?.data?.clientPayments?.totalPages || 0;

          if (resetData || page === 1) {
            setData(newData);
          } else {
            setData((prev) => [...prev, ...newData]);
          }

          setPagination((prevPagination: any) => ({
            ...prevPagination,
            totalPages: totalPages,
          }));
          // Stop loading more if we've reached the last page or got less data than expected
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
    [GetClientPaymentsApi]
  );

  const fetchData = useCallback(
    async (page: number, resetData = false) => {
      if (isLoadingMore && !resetData) return; // Prevent multiple simultaneous calls

      setIsLoadingMore(true);

      const params = new URLSearchParams({
        per_page: pagination.pageSize.toString(),
        page: page.toString(),
        status: "paid,unpaid",
        // sortBy: sorting[0]?.id || "",
        // sortOrder: sorting[0]?.desc ? "desc" : "asc",
        // search: patientSearch,
      });

      try {
        const response: any = await GetPaymentsApi(
          `${API_CONSTANTS.PAYMENTS.ORGANIZATION_PAYMENTS}?${params}`
        );
        if (response?.data.success) {
          const newData = response?.data?.organizationPayments?.items || [];
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
          // Stop loading more if we've reached the last page or got less data than expected
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
    [GetPaymentsApi]
  );

  const fetchPaymentRenew = async () => {
    try {
      const response: any = await GetPaymentsRenewApi(
        `${API_CONSTANTS.PAYMENTS.ORGANIZATION_PAYMENTS_RENEW}`
      );
      if (response?.data.success) {
        const newData = response?.data || [];
        window.location.href = newData.paymentLink;
      }
    } catch (error) {
      console.error("Error fetching renew data:", error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const fetchClientPaymentRenew = async () => {
    try {
      const response: any = await GetClientPaymentsRenewApi(
        `${API_CONSTANTS.PAYMENTS.CLIENT_PAYMENTS_RENEW}`
      );
      if (response?.data.success) {
        const newData = response?.data || [];
        window.location.href = newData.paymentLink;
      }
    } catch (error) {
      console.error("Error fetching renew data:", error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (userData?.role !== "client") {
      fetchData(1, true);
    } else {
      fetchClienttData(1, true);
    }
  }, [fetchData, fetchClienttData]);

  // Fetch more data when currentPage changes (except for initial load)
  useEffect(() => {
    if (currentPage > 1) {
      console.log("🚀 ~ Payments ~ userData:", userData);
      if (userData?.role !== "client") {
        fetchData(currentPage);
      } else {
        fetchClienttData(currentPage);
      }
    }
  }, [currentPage]);

  const handleTableScroll = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isScrollingDown = scrollTop > lastScrollTop.current;
    lastScrollTop.current = scrollTop;

    // Check if user scrolled near the bottom
    if (isScrollingDown && scrollHeight - scrollTop - clientHeight < 100) {
      setCurrentPage((prevPage) => {
        const nextPage = prevPage + 1;
        // Only increment if we haven't reached the max pages
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

  const handlePaymentRenew = () => {
    fetchPaymentRenew();
  };
  const handleClientPaymentRenew = () => {
    fetchClientPaymentRenew();
  };

  const columns = React.useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        header: "Organisation",
        accessorKey: "organizationDetails.organizationName",
        size: 200,
        cell: ({ getValue }) => (
          <div className="truncate">
            <span className="capitalize font-medium text-[#1A2435] text-sm">
              {getValue() as string}
            </span>
          </div>
        ),
      },
      {
        header: "Paid By",
        accessorKey: "userDetails.name",
        size: 150,
        cell: ({ getValue, row }) => (
          <div className="truncate">
            <span className="capitalize font-medium text-[#1A2435] text-sm">
              {row.original.isManuallyMarkedPaid ? "-" : (getValue() as string)}
            </span>
          </div>
        ),
      },
      {
        header: "Email",
        accessorKey: "userDetails.email",
        size: 220,
        cell: ({ getValue, row }) => (
          <div className="truncate">
            <span className="font-normal text-[#1A2435] text-sm">
              {row.original.isManuallyMarkedPaid ? "-" : (getValue() as string)}
            </span>
          </div>
        ),
      },
      {
        header: "Payment Date",
        accessorKey: "paymentDate",
        size: 130,
        cell: ({ getValue }) => {
          const value = getValue() as string;

          // If no value, return blank
          if (!value) {
            return <span className="!font-medium text-[#394557]"></span>;
          }

          const formatted = new Date(value).toLocaleDateString();

          return (
            <span className="!font-medium text-[#394557]">{formatted}</span>
          );
        },
      },
      {
        header: "Amount",
        accessorKey: "totalAmount",
        size: 100,
        cell: ({ getValue }) => {
          const amount = getValue() as number;
          return (
            <span className="font-normal text-[#394557]">
              {amount ? amount : 0}
            </span>
          );
        },
      },
      {
        header: "Status",
        id: "status",
        size: 100,
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => row?.status,
        cell: ({ getValue }: any) => {
          const status = getValue() as any;
          let isActive = status == "paid";

          return (
            <div className="flex">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {status}
              </span>
            </div>
          );
        },
      },
      {
        header: "",
        id: "View",
        size: 120,
        enableSorting: false,
        meta: { className: "hidden md:table-cell" },
        cell: ({ row }: any) => {
          return (
            <div className="flex z-50 justify-center">
              <button
                disabled={!row.original.invoiceLink}
                onClick={() => {
                  window.open(row.original.invoiceLink, "_blank");
                }}
                className={clsx(
                  "font-regular rounded-[30px] border border-[#E6E7E7] mt-[1px] flex items-center text-sm justify-center font-normal text-[#666D79] px-4 py-1 whitespace-nowrap hover:!bg-[#e3eef0] hover:border-medistryColor hover:text-medistryColor",
                  "cursor-pointer"
                )}
              >
                <p>{row.original.status == "paid" ? "Receipt" : "Invoice"} </p>
                <SquareArrowOutUpRight strokeWidth={"1.5px"} height={"18px"} />
              </button>
            </div>
          );
        },
      },
    ];

    return baseColumns;
  }, []);

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
    manualSorting: true,
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  return (
    <div
      className=" !bg-[#F5F6F6]"
      style={{ marginLeft: state == "collapsed" ? "28px" : "" }}
    >
      <header className="flex justify-between min-h-[72px] ">
        <div className="ml-[8px] md:ml-[17px] flex">
          {userData?.role !== "client" && (
            <AppButton
              onClick={() => navigate(ROUTES.PROFILE)}
              className="relative flex w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none mt-[16px] mb-[16px] mr-[8px] md:mr-[16px] rounded-[30px] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] text-sm"
            >
              <ArrowLeft />
              Back
            </AppButton>
          )}
        </div>
        <div className="flex">
          {/* Fixed button rendering logic: */}
          {userData?.role === "client" && showClientPayNow ? (
            <AppButton
              disable={clientLoadingRenew}
              className="relative flex w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none mt-[16px] mb-[16px] mr-[8px] md:mr-[16px] rounded-[30px] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] text-sm"
              onClick={handleClientPaymentRenew}
            >
              <IndianRupee />
              Pay Now
            </AppButton>
          ) : userData?.role !== "client" && showPayNow ? (
            <AppButton
              disable={loadingRenew}
              className="relative flex w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none mt-[16px] mb-[16px] mr-[8px] md:mr-[16px] rounded-[30px] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] text-sm"
              onClick={handlePaymentRenew}
            >
              <IndianRupee />
              Pay Now
            </AppButton>
          ) : null}
        </div>
      </header>
      <div className={`px-2 md:px-4  `}>
        <div
          ref={tableContainerRef}
          className={`rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white border !border-[#E6E7E9]`}
          style={{
            height: "calc(100vh - 152px)",
          }}
        >
          <table className="w-full text-left table-fixed">
            <thead className="sticky top-0 bg-white z-10 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-[#E6E6E8]">
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{ width: header.column.columnDef.size }}
                        className={`p-3 font-manrope text-base font-medium text-[#666D79] ${
                          header.column.columnDef.meta?.className || ""
                        }`}
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
              {(userData?.role === "client" ? clientLoading : loading) &&
              data?.length === 0 ? ( // Show shimmer only for initial load
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
                  {!hasMore && data.length > 0 && (
                    <tr>
                      <td
                        colSpan={table.getHeaderGroups()[0].headers.length}
                        className="text-center py-4 text-gray-400 bg-[#ffffff]"
                      >
                        {/* <div className="text-sm">No more Payments to load</div> */}
                      </td>
                    </tr>
                  )}
                </>
              ) : (
                <tr>
                  <td
                    colSpan={table.getHeaderGroups()[0].headers.length}
                    className="text-center py-4 text-gray-500 bg-[#ffffff]"
                    style={{ height: "calc(100vh - 210px)" }}
                  >
                    No Payments to show
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
