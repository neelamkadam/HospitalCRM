import React, { useCallback, useEffect, useRef, useState } from "react";
import API_CONSTANTS from "../../constants/apiConstants.ts";
import { useGetApi } from "../../services/use-api.ts";
import moment from "moment";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowDownUp, ArrowUp, ChevronRight, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useSidebar } from "../../components/ui/sidebar.tsx";
import socketService from "../../utils/socket";
import { deleteChat } from "../../services/use-api";
import { useAppDispatch, useAppSelector } from "../../redux/store.ts";
// import clsx from "clsx";
import { openChat } from "../../redux/chatSlice.ts";
import AppDeleteDialog from "../../components/AppDeleteDialog.tsx";

const ChatBotTable: React.FC = () => {
  const { getData: GetReportApi, isLoading: loading } = useGetApi<any>("");
  const [chatList, setChatList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { userData } = useAppSelector((state: any) => state.authData);
  const { state } = useSidebar();
  const { patientSearch } = useSelector((state: any) => state.searchData);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>({});
  const payload = { clientId: userData?._id };


  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Title",
        id: "title",
        enableSorting: false,
        accessorFn: (row) => `${row?.original?.title}`,
        cell: ({ row }: any) => {
          const dispatch = useAppDispatch();

          const handleOpenChat = () => {
            if (window.innerWidth <= 768) {
              // Mobile → open chat in mobile layout
              dispatch(openChat(row.original?._id));
            }
          };

          return (
            <span onClick={handleOpenChat} className="cursor-pointer">
              <span className="font-medium text-[#1A2435] text-sm">
                {row?.original?.title}
              </span>
            </span>
          );
        },
        size: 300,
      },

      {
        header: "Date",
        id: "createdAt",
        enableSorting: false,
        accessorFn: (row) => moment(row?.createdAt).format("ll"),
        cell: ({ row }: any) => (
          <span className="text-sm text-[#8C929A]">
            {moment(row?.original?.createdAt).format("ll")}
          </span>
        ),
        size: 160,
      },
      {
        header: "View",
        id: "View",
        enableSorting: false,
        meta: { className: "hidden md:table-cell" },
        cell: ({ row }: any) => {
          const dispatch = useAppDispatch();
          return (
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  if (row.original?.conversation?.length > 0) {
                    dispatch(openChat(row.original?._id));
                  }
                }}
                className="font-regular w-full rounded-[30px] border border-[#E6E7E7] text-sm justify-center font-normal ps-4 pe-[7px] py-1 text-[#666D79] flex items-center whitespace-nowrap max-w-[120px] hover:border-medistryColor hover:text-medistryColor hover:!bg-[#e3eef0]"
              >
                Continue
                <ChevronRight strokeWidth={"1.5px"} height={"18px"} />
              </button>
              <div
                className="cursor-pointer text-[#1A2435]"
                style={{ marginTop: "2px" }}
                onClick={() => handleDeleteChat(row.original)}
              >
                <Trash2 className="text-red-400 h-5 mt-[2px]" />
              </div>
            </div >
          );
        },
      },
    ],
    [userData]
  );

  const [pagination, setPagination] = useState<any>({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const defaultData = React.useMemo(() => [], []);

  const handleDeleteChat = (row: any) => {
    setDeleteModal(true);
    setSelectedRow(row);
  };

  const handleDeleteChatMain = async () => {
    setDeleteLoading(true);
    const result = await deleteChat(
      `${API_CONSTANTS.CHATAI.DELETE_CHAT}/${selectedRow._id}`
    );
    if (result.success) {
      setChatList((prevChats) =>
        prevChats.filter((chat) => chat._id !== selectedRow._id)
      );
    }
    setDeleteLoading(false);
    setDeleteModal(false);
  };

  const table = useReactTable({
    data: chatList ?? defaultData,
    columns,
    rowCount: pagination.pageSize,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
  });

  const fetchChats = async (pageNum: number) => {
    const pageSize = 15;
    const params = new URLSearchParams({
      per_page: pageSize.toString(),
      page: pageNum.toString(),
      search: patientSearch,
    });

    try {
      const response: any = await GetReportApi(
        `${API_CONSTANTS.GET_ALL_CHAT}?${params}`
      );

      if (response?.data.success) {
        const newChats = response?.data?.data?.items || [];
        if (pageNum === 1) {
          setChatList(newChats);
        } else {
          setChatList((prev) => [...prev, ...newChats]);
        }
        setHasMore(newChats?.length === pageSize);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setHasMore(false);
    }
  };

  // 🔹 Initial data load
  useEffect(() => {
    setChatList([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchChats(1);
  }, [patientSearch, sorting]);

  useEffect(() => {
    if (currentPage > 1) fetchChats(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (!payload.clientId) return;

    socketService.connectchat(payload.clientId);

    socketService.on("connect", () => {
      console.log("⚡ Socket connected with clientId:", payload.clientId);
    });

    const onChatTitleUpdate = (data: any) => {
      console.log("📩 Chat title update received:", data);
      fetchChats(1);
    };

    socketService.on("chatTitleUpdate", onChatTitleUpdate);

    return () => {
      socketService.off("chatTitleUpdate", onChatTitleUpdate);
      socketService.disconnect();
    };
  }, [payload.clientId]);


  // 🔹 Infinite scroll
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
      className="!bg-[#F5F6F6]"
      style={{ marginLeft: state === "collapsed" ? "28px" : "" }}
    >
      <div className="p-4">
        <div
          className="rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white overflow-hidden overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white overflow-x-auto w-full"
          ref={tableContainerRef}
          style={{ height: "calc(100vh - 97px)", overflowY: "auto" }}
        >
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white z-10 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-[#E6E6E8]">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={`p-3 font-manrope text-base font-medium text-[#666D79] ${header.id === "View" ? "w-[13%] text-center" : ""
                        } ${header.column.columnDef.meta?.className || ""}`}
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
                            }[header.column.getIsSorted() as string] ?? null)}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {loading && chatList?.length === 0 ? (
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
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`px-3 pt-2 pb-[0.6rem] text-gray-700 !font-medium ${cell.column.columnDef.meta?.className || ""
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
                    className="text-center py-4 text-gray-500 h-[20rem] flex-1 bg-[#ffffff]"
                  >
                    No Patients to show
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
        title="Delete Chat"
        description={`Are you sure you want to delete the chat ?`}
        onConfirm={() => handleDeleteChatMain()}
        onClose={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default ChatBotTable;
