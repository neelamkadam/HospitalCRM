import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { deleteReport, useGetApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import {
  Plus,
  EllipsisVertical,
  Edit,
  Trash2,
  ReceiptIndianRupeeIcon,
  IndianRupee,
  EyeIcon,
  ArrowLeft,
} from "lucide-react";
import AppButton from "../../components/AppButton";
import { useSidebar } from "../../components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import AppDeleteDialog from "../../components/AppDeleteDialog";
// import { useAppSelector } from "../../redux/store";
import AppModal from "../../components/AppModal";
import { useSelector } from "react-redux";
import AdminAddPaidInvoice from "../../components/AdminAddPaidInvoice";
import moment from "moment";
// import moment from "moment";

export const AdminInvoiceTable: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useSidebar();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastScrollTop = useRef(0);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const { getData: GetInvoiceApi, isLoading: loading } = useGetApi<any>("");

  const [pagination, setPagination] = useState<any>({
    pageIndex: 1,
    pageSize: 25,
    totalPages: 0,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const { OrgnazationSearch } = useSelector((state: any) => state.searchData);

  const fetchData = useCallback(
    async (page: number, resetData = false) => {
      if (isLoadingMore && !resetData) return;
      setIsLoadingMore(true);

      const params = new URLSearchParams({
        // status: "paid,unpaid",
        per_page: pagination.pageSize.toString(),
        page: page.toString(),
        search: OrgnazationSearch?.length ? OrgnazationSearch : "",
      });

      try {
        const response: any = await GetInvoiceApi(
          `${API_CONSTANTS.ADMIN.GET_ADMIN_INVOICE}?${params}`
        );
        if (response?.data.success) {
          const newData = response?.data?.organizationPayments?.items || [];
          console.log("🚀 ~ AdminInvoiceTable ~ response:", newData);

          const totalPages =
            response?.data?.organizationPayments?.totalPages || 0;

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
    [GetInvoiceApi, OrgnazationSearch, pagination.pageSize]
  );

  const toggleClose = () => {
    setIsModalOpen((prev) => !prev);
  };
  // Initial data fetch and search change handler
  useEffect(() => {
    // Reset pagination and current page when search changes
    setCurrentPage(1);
    setHasMore(true);
    fetchData(1, true);
  }, [OrgnazationSearch]);

  // Fetch more data when currentPage changes (except for initial load)
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
    return undefined;
  }, [handleTableScroll]);

  // Action handlers
  const handleView = (row: any) => {
    row.invoiceLink && window.open(row.invoiceLink, "_blank");
  };

  const handleEdit = (row: any) => {
    navigate(
      `${ROUTES.ADMIN_INVOICE_CREATE}?id=${row._id}&name=${row.organizationDetails.organizationName}`
    );
  };

  const handleDelete = (row: any) => {
    setDeleteModal(true);
    setSelectedRow(row);
  };

  const handlePaid = useCallback((row: any) => {
    setInvoiceData(row);
    setIsModalOpen(true);
  }, []);

  const handleViewDetails = useCallback((row: any) => {
    setInvoiceData({
      ...row,
      viewDetails: true,
    });
    setIsModalOpen(true);
  }, []);

  const columns = React.useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        header: "Org Name",
        accessorKey: "organizationDetails.organizationName",
        cell: ({ getValue }) => (
          <div className="w-full">
            <span className="capitalize font-medium text-[#1A2435] text-sm break-words">
              {getValue() as string}
            </span>
          </div>
        ),
        size: 200,
      },

      {
        header: "Paid By",
        accessorKey: "userDetails.name",
        cell: ({ getValue, row }) => {
          let isActive = row.original.status == "paid";
          const name = getValue() as number;
          return (
            <span className="font-normal text-[#8C929A] text-sm">
              {isActive ? name ?? "-" : "-"}
            </span>
          );
        },
        size: 150,
      },
      {
        header: "Email",
        accessorKey: "organizationDetails.email",
        cell: ({ getValue, row }) => {
          let isActive = row.original.status == "paid";
          const email = getValue() as string;
          return (
            <span className="font-normal text-[#8C929A] text-sm break-words">
              {isActive
                ? row?.original?.isManuallyMarkedPaid
                  ? row?.original?.userDetails?.email
                  : email
                : "-"}
            </span>
          );
        },
        size: 220,
      },
      {
        header: "Amount",
        accessorKey: "totalAmount",
        cell: ({ getValue }) => {
          const amount = getValue() as number;
          return (
            <span className="font-normal text-[#8C929A] text-sm">{amount}</span>
          );
        },
        size: 100,
      },
      {
        header: "Payment Date",
        accessorKey: "paymentDate",
        cell: ({ getValue }) => {
          const dateValue = getValue() as string;
          if (!dateValue)
            return (
              <div className="w-full">
                <div className="flex gap-2 z-50 w-[100px]">
                  <span className="text-[14px] font-normal truncate text-sm text-[#8C929A]">
                    -
                  </span>
                </div>
              </div>
            );

          const date = new Date(dateValue);
          const isValidDate = !isNaN(date.getTime());

          return (
            <div className="w-full">
              <div className="flex gap-2 z-50 w-[100px]">
                <span className="text-[14px] font-normal truncate text-sm text-[#8C929A]">
                  {isValidDate ? moment(date).format("ll") : "-"}
                </span>
              </div>
            </div>
          );
        },
        size: 100,
      },
      {
        header: "Status",
        accessorKey: "status",
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
        size: 100,
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          return (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors border-2 border-solid"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EllipsisVertical className="h-4 w-4 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  {row.original.status !== "paid" && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePaid(row.original);
                      }}
                      className="cursor-pointer"
                    >
                      <IndianRupee className="mr-2 h-4 w-4" />
                      Paid
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(row.original);
                    }}
                    className="cursor-pointer"
                  >
                    <ReceiptIndianRupeeIcon className="mr-2 h-4 w-4" />
                    {row.original.status == "paid" ? "Receipt" : "Invoice"}
                  </DropdownMenuItem>
                  {row.original.status == "paid" && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(row.original);
                      }}
                      className="cursor-pointer"
                    >
                      <EyeIcon className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                  )}

                  {row.original.status !== "paid" && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(row.original);
                      }}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(row.original);
                    }}
                    className="cursor-pointer text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 80,
        meta: {
          className: "w-[80px]",
        },
      },
    ];

    return baseColumns;
  }, [handleDelete, handleEdit, handlePaid, handleView]);

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

  const handleDeleteInvioce = async () => {
    setDeleteLoading(true);
    const result = await deleteReport(
      `${API_CONSTANTS.ADMIN.DELETE_ADMIN_INVOICE}/${selectedRow._id}`
    );
    if (result.success) {
      fetchData(currentPage);
    }
    setDeleteLoading(false);
    setDeleteModal(false);
  };

  return (
    <div
      className=" !bg-[#F5F6F6]"
      style={{ marginLeft: state == "collapsed" ? "28px" : "" }}
    >
      <header className="flex justify-between ">
        <AppButton
          onClick={() => navigate(ROUTES.Organization)}
          className="py-3 rounded-[30px] w-[50px] sm:w-[130px] h-[40px] !bg-white !text-[#293343] border-none flex items-center justify-center text-sm mt-[16px] mb-[16px] ml-[8px] md:ml-[16px] "
        >
          <ArrowLeft className="w-7 h-7" />
          <span className="hidden sm:inline ml-1">Back</span>
        </AppButton>

        <AppButton
          className="relative flex w-[147px] sm:w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none rounded-[30px] text-sm mt-[16px] mb-[16px] mr-[8px] md:mr-[16px] "
          onClick={() => navigate(ROUTES.ADMIN_INVOICE_CREATE)}
        >
          <Plus /> Create Invoice
        </AppButton>
      </header>
      <div className="px-2 md:px-4">
        <div
          ref={tableContainerRef}
          className={`rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] bg-white overflow-y-auto overflow-x-auto md:overflow-x-visible scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white border !border-[#E6E7E9]`}
          style={{
            height: "calc(100vh - 152px)",
          }}
        >
          <table className="w-full text-left md:table-fixed">
            <colgroup>
              <col className="md:w-[18%]" style={{ minWidth: "150px" }} />
              <col className="md:w-[18%]" style={{ minWidth: "120px" }} />
              <col className="md:w-[24%]" style={{ minWidth: "180px" }} />
              <col className="md:w-[12%]" style={{ minWidth: "100px" }} />
              <col className="md:w-[12%]" style={{ minWidth: "120px" }} />
              <col className="md:w-[8%]" style={{ minWidth: "80px" }} />
              <col className="md:w-[8%]" style={{ minWidth: "80px" }} />
            </colgroup>

            <thead className="sticky top-0 bg-white z-10 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-[#E6E6E8]">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={`px-4 py-3 text-sm font-medium text-[#666D79] ${
                        header.id === "actions" ? "text-center" : ""
                      }`}
                    >
                      {!header.isPlaceholder &&
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {loading && data?.length === 0 ? ( // Show shimmer only for initial load
                Array.from({ length: 10 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-100 bg-[#f4f4f4]"
                  >
                    {Array.from({ length: 5 }).map((_, cellIndex) => (
                      <td key={cellIndex} className="px-2 py-2 md:px-4 md:py-3">
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
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-[#8C929A]">
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
                          <span className="ml-2 text-xs md:text-sm">
                            Loading more...
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {/* End of data indicator */}
                  {!hasMore && data.length > 0 && (
                    <tr>
                      <td
                        colSpan={table.getHeaderGroups()[0].headers.length}
                        className="text-center py-4 text-gray-400 bg-[#ffffff] text-xs md:text-sm"
                      >
                        {/* <div>No more Payments to load</div> */}
                      </td>
                    </tr>
                  )}
                </>
              ) : (
                <tr>
                  <td
                    colSpan={table.getHeaderGroups()[0].headers.length}
                    className="text-center py-4 text-gray-500 bg-[#ffffff] text-xs md:text-sm"
                    style={{ height: "calc(100vh - 200px)" }}
                  >
                    No Invoice to show
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AppDeleteDialog
        isLoading={deleteLoading}
        isOpen={deleteModal}
        title="Delete Invoice"
        description={`Are you sure you want to delete the invoice for ${selectedRow?.organizationDetails?.organizationName}?`}
        onConfirm={() => handleDeleteInvioce()}
        onClose={() => setDeleteModal(false)}
      />
      <AppModal isOpen={isModalOpen} toggle={toggleClose} title="">
        <AdminAddPaidInvoice
          invoiceData={invoiceData}
          setIsModalOpen={setIsModalOpen}
          fetchData={fetchData}
        />
      </AppModal>
    </div>
  );
};
