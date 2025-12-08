import React, { useCallback, useEffect, useRef, useState } from "react";
import API_CONSTANTS from "../../constants/apiConstants.ts";
import { deleteApiKey, useGetApi } from "../../services/use-api.ts";
import { ROUTES } from "../../constants/routesConstants.ts";
import { useNavigate } from "react-router-dom";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Check,
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Copy,
  DeleteIcon,
  EllipsisVertical,
  Plus,
} from "lucide-react";
import { useSidebar } from "../../components/ui/sidebar.tsx";
import { useAppSelector } from "../../redux/store.ts";
import AppButton from "../../components/AppButton.tsx";
import AppModal from "../../components/AppModal.tsx";
import AppApiKeyModal from "../../components/AppApi-keyModal.tsx";
import moment from "moment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu.tsx";
import AppDeleteDialog from "../../components/AppDeleteDialog.tsx";
import { CopyToClipboard } from "react-copy-to-clipboard";

const ApiKeys: React.FC = () => {
  const navigate = useNavigate();
  const { getData: GetApiKeyslist, isLoading: loading } = useGetApi<any>("");
  const [dataList, setDataList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { userData } = useAppSelector((state: any) => state.authData);
  const { state } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>({});
  const [isCopied, setIsCopied] = useState(false);

  const columns = React.useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        header: "label",
        accessorKey: "label",
        size: 35,
        cell: ({ row }) => (
          <div className="w-60 truncate">
            <span className="capitalize font-medium text-[#1A2435] text-sm">
              {row?.original?.label}
            </span>
          </div>
        ),
      },
      {
        header: "Kay",
        accessorKey: "key",
        cell: ({ row }) => (
          <span className="font-normal text-[#394557]">
            {row?.original?.key}
          </span>
        ),
      },
      {
        header: "Action",
        accessorFn: (row) => moment(row?.createdAt).format("ll"),
        enableSorting: false,
        size: 10,
        cell: ({ row }: any) => (
          <div className="flex gap-2 z-50 w-[10px]">
            <DropdownFiilter data={row} />
          </div>
        ),
      },
    ];
    return baseColumns;
  }, [userData]);

  const [pagination, setPagination] = useState<any>({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const defaultData = React.useMemo(() => [], []);

  const table = useReactTable({
    data: dataList ?? defaultData,
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
    setDataList([]);
    setCurrentPage(1); // Reset to first page
    setHasMore(true); // Reset hasMore
    fetchData(true);
  }, [sorting]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchData();
    }
  }, [currentPage]);

  const fetchData = async (currentPageValue = false) => {
    const pageSize = 15;
    const page = currentPageValue ? "1" : currentPage.toString();
    const params = new URLSearchParams({
      per_page: pageSize.toString(),
      page: page,
      //   sortBy: sorting[0]?.id || "",
      //   sortOrder: sorting[0]?.desc ? "desc" : "asc",
    });

    try {
      const response: any = await GetApiKeyslist(
        `${API_CONSTANTS.API_KEYS.API_KEY}?${params}`
      );

      if (response?.data.success) {
        const newData = response?.data?.data?.items || [];
        if (currentPage === 1) {
          setDataList(newData);
        } else {
          setDataList((prev) => [...prev, ...newData]);
        }
        setHasMore(newData?.length === pageSize);
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

  const toggleClose = () => {
    setIsModalOpen((prev) => !prev);
  };

  const DropdownFiilter = ({ data }: any) => {
    setSelectedRow(data?.original);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div className="text-gray-500 font-normal border-0 shadow-none text-sm flex items-center p-1">
            <EllipsisVertical />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto mr-4">
          <DropdownMenuGroup>
            <CopyToClipboard
              text={data?.original?.key}
              onCopy={() => {
                setIsCopied(true);
                setTimeout(() => {
                  setIsCopied(false);
                }, 2000);
              }}
            >
              <DropdownMenuItem
                className="cursor-pointer text-[#1A2435]"
                style={{ fontSize: "16px" }}
              >
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy Key
              </DropdownMenuItem>
            </CopyToClipboard>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer text-[#1A2435]"
              style={{ fontSize: "16px" }}
              onClick={() => setDeleteModal(true)}
            >
              <DeleteIcon color="red" />
              Remove Key
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const result = await deleteApiKey(
        `${API_CONSTANTS.API_KEYS.API_KEY}/${selectedRow?._id}`
      );
      if (result.success) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
    } finally {
      setDeleteModal(false);
      setDeleteLoading(false);
    }
  };

  return (
    <div
      className=" !bg-[#F5F6F6]"
      style={{ marginLeft: state == "collapsed" ? "28px" : "" }}
    >
      <header className="flex justify-between">
        <div></div>
        <AppButton
          onClick={() => toggleClose()}
          className="relative flex w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none mt-[16px] mb-[16px] mr-[16px] rounded-[30px] text-sm"
        >
          <Plus /> Genreate Kays
        </AppButton>
      </header>
      <div className="px-4">
        <div
          className="rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white overflow-hidden overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white overflow-x-auto w-full"
          ref={tableContainerRef}
          style={{
            height: "calc(100vh - 152px)",
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
                      style={{ width: header.getSize() }}
                      className={`p-3 font-manrope text-base  font-medium text-[#666D79] 
                        ${
                          index === arr?.length - 1 ? "text-left" : "text-left"
                        } 
                  `}
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
              {loading && dataList?.length === 0 ? (
                Array.from({ length: 15 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-100 bg-[#f4f4f4] animate-pulse"
                  >
                    {table.getHeaderGroups()[0].headers.map(() => (
                      <td className="px-4 py-2">
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
                    style={{
                      cursor: row.original.reportsCount > 0 ? "pointer" : "",
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-2 text-[#8C929A] !font-normal text-[14px]"
                        style={{ width: cell.column.getSize() }}
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
                    No Keys To Show
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {loading && dataList?.length > 0 && (
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
      <AppModal isOpen={isModalOpen} toggle={toggleClose} title="">
        <AppApiKeyModal
          toggleClose={() => toggleClose()}
          fetchReports={() => fetchData()}
        />
      </AppModal>
      <AppDeleteDialog
        isLoading={deleteLoading}
        isOpen={deleteModal}
        title="Remove Key"
        description="Are you sure you want to remove this key?"
        onConfirm={() => handleDelete()}
        onClose={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default ApiKeys;
