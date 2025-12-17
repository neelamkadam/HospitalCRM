import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteMultipleRport,
  useDeleteApi,
  useGetApi,
  usePostApi,
} from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import AppButton from "../../components/AppButton";
import CustomSheet from "../../components/AppSheet";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import HealthReportSidePannel from "./HealthReportSidePannel";
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
  ChevronRight,
  EllipsisVertical,
  Loader2,
  Plus,
  SquareChartGantt,
  Trash2,
} from "lucide-react";
import { useSelector } from "react-redux";
import AppModal from "../../components/AppModal";
import SelectWayToReortCreate from "./SelectWayToReortCreate";
import { useSidebar } from "../../components/ui/sidebar";
import AppDeleteDialog from "../../components/AppDeleteDialog";
import { capitalizeFirstLetter } from "../../utils/common-utils";
import IndeterminateCheckbox from "../../components/IndeterminateCheckbox";
import FileUpload from "./FileUpload";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import SelectPatient from "../../components/SelectPatient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Data_Constcnts } from "../../constants/AppConstants";

const HealthReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedTab = searchParams.get("tab");
  const [searchParam, setSearchParam] = useState(selectedTab);
  const { userData } = useSelector((state: any) => state.authData);
  const { getData: GetReportApi, isLoading: loading } = useGetApi<any>("");
  const { getData: sendReportToEMR } = useGetApi<AuthResponseBodyDataModel>("");
  const { getData: GetReportCount } = useGetApi<any>("");
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [edit, setEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [pagination, setPagination] = useState<any>({
    pageIndex: 1,
    pageSize: 25,
    totalPages: 0,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [reportCount, setReportCount] = useState<any>();
  const { reportSearch } = useSelector((state: any) => state.searchData);
  const [changedStateReport, setChangedStateReport] = useState<any>({});
  const [openFile, setOpenFile] = useState(false);
  const [uploadeFiles, setUploadFile] = useState(false);
  const lastScrollTop = useRef(0);
  const [selectedReport, setSelectedReport] = useState();
  const [selectedRow, setSelectedRow] = useState<any>("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { postData: getPresigned } = usePostApi<AuthResponseBodyDataModel>({
    path: API_CONSTANTS.REPORT_PRESIGNED_URL,
  });
  const { postData: reportAddPatients } = usePostApi<AuthResponseBodyDataModel>(
    {
      path: API_CONSTANTS.REPORT_ADDPATIENTS,
    }
  );
  const { deleteData: draftDeleteReport } = useDeleteApi({
    path: `${API_CONSTANTS.DELETE_REPORT}`,
  });
  const { postData: getAccept } = usePostApi<AuthResponseBodyDataModel>({
    path: API_CONSTANTS.REPORTS.CHANGE_REPORT_STATUS,
  });

  const [isModalOpenSelectPatient, setIsModalOpenSelectPatient] =
    useState(false);
  const { state } = useSidebar();

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);
  const loadedPages = useRef<Set<number>>(new Set());

  const handleTableScroll = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container || loading || isFetching.current) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    const isScrollingUpward = scrollTop < lastScrollTop.current;
    lastScrollTop.current = scrollTop;

    // Only load next page when scrolling down and near bottom
    if (
      !isScrollingUpward &&
      scrollHeight - scrollTop - clientHeight < 50 &&
      hasMore &&
      !loadedPages.current.has(currentPage + 1)
    ) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [loading, hasMore, currentPage]);

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

  useEffect(() => {
    handleGetReportCount();
  }, [openFile]);

  const toggleClose = () => {
    setIsModalOpen((prev) => !prev);
  };

  const patientToggleClose = () => {
    setIsModalOpenSelectPatient((prev) => !prev);
  };

  const toggleClose1 = () => {
    setOpenFile((prev) => !prev);
  };

  useEffect(() => {
    if (!selectedTab) {
      navigate(`${ROUTES.HEALTHREPORT}?tab=completed`, { replace: true });
    }

    const orgId = userData?.organizationId?._id
      ? userData?.organizationId?._id
      : userData?._id;
    if (!orgId) return;

    if (!socketService.isConnected()) {
      socketService.connect();
    }

    const onOrganizationIdUpdate = (data: any) => {
      console.log("🚀 ~ onOrganizationIdUpdate ~ data:", data);
      if (data.completed) {
        handleGetReportCount();
        setChangedStateReport(data);
        const updatedReport = {
          ...data,
          data: { ...data.data, reportId: data.reportId },
        };
        if (window?.location?.search?.split("=")[1] === "completed")
          setReportsList((prevItems) => [updatedReport.data, ...prevItems]);
      }
      if (data.processing) {
        fetchReports(true);
      }
    };

    socketService.on("connect", () => console.log("Connected"));
    socketService.on("disconnect", (reason: string) => {
      console.log("Disconnected:", reason);
      if (!socketService.isConnected()) {
        setTimeout(() => socketService.connect(), 1000);
      }
    });
    socketService.on("reportProcessingFailed", console.log);
    socketService.on("reportStatus", (data: any) => {
      if (data.completed) fetchReports();
    });
    // socketService.on(orgId, onOrganizationIdUpdate);
    socketService.on(
      userData?.organizationId?._id
        ? userData?.organizationId?._id
        : "patientReportUpdate",
      onOrganizationIdUpdate
    );

    return () => {
      socketService.off("connect", () => console.log("Connected"));
      socketService.off("disconnect", (reason: string) => {
        console.log("Disconnected:", reason);
      });
      socketService.off("reportProcessingFailed", console.log);
      socketService.off("reportStatus", (data: any) => {
        if (data.completed) fetchReports();
      });
      socketService.off(
        userData?.organizationId?._id
          ? userData?.organizationId?._id
          : "patientReportUpdate",
        onOrganizationIdUpdate
      );
    };
  }, []);

  useEffect(() => {
    setReportsList([]);
    setCurrentPage(1);
    handleGetReportCount();
    setHasMore(true);
    fetchReports(true);
  }, [sorting, reportSearch, selectedTab]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchReports();
    }
  }, [currentPage]);

  const handleGetReportCount = async () => {
    try {
      const response: any = await GetReportCount(
        `${API_CONSTANTS.GET_REPORT_COUNT}`
      );
      if (response?.data.success) {
        setReportCount(response?.data?.data);

        switch (window?.location?.search?.split("=")[1]) {
          case "progress":
            if (
              parseInt(response?.data?.data?.pending) +
                parseInt(response?.data?.data?.approval_pending) +
                parseInt(response?.data?.data?.processing) ===
              0
            ) {
              navigate(`${ROUTES.HEALTHREPORT}?tab=completed`, {
                replace: true,
              });
            }
            break;

          case "flagged":
          default:
            if (
              searchParam === "flagged" ||
              (response?.data?.data?.duplicate || 0) +
                (response?.data?.data?.failed || 0) +
                parseInt(response?.data?.data?.approval_pending) +
                (response?.data?.data?.flagged || 0) +
                (response?.data?.data?.invalid || 0) +
                (response?.data?.data?.draft || 0) ===
                0
            ) {
              navigate(`${ROUTES.HEALTHREPORT}?tab=completed`, {
                replace: true,
              });
            }
            break;
        }
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  const fetchReports = async (resetPage = false) => {
    if (isFetching.current) return;
    isFetching.current = true;

    if (resetPage) {
      setCurrentPage(1);
      setReportsList([]);
      setHasMore(true);
      loadedPages.current.clear();
    }
    const current = window?.location?.search?.split("=")[1];
    const pageSize = 25;
    const page = resetPage ? "1" : currentPage.toString();

    // Skip if page already loaded (except for reset)
    if (!resetPage && loadedPages.current.has(parseInt(page))) {
      isFetching.current = false;
      return;
    }

    const params = new URLSearchParams({
      per_page: pageSize.toString(),
      page: page,
      status:
        current === "progress"
          ? "pending,processing,uploading"
          : current === "flagged"
          ? "failed,flagged,duplicate,invalid"
          : current === "draft"
          ? "draft"
          : current === "approval_pending"
          ? "approval_pending"
          : "completed",
      search: reportSearch,
      sortBy: sorting[0]?.id || "",
      sortOrder: sorting[0]?.desc ? "desc" : "asc",
    });

    try {
      const response: any = await GetReportApi(
        `${API_CONSTANTS.GET_ALL_REPORT}?${params}`
      );

      if (response?.data.success) {
        setChangedStateReport({});
        const newReports = response?.data?.reports?.items || [];
        
        // Mark this page as loaded
        loadedPages.current.add(parseInt(page));

        if (resetPage || currentPage === 1) {
          setReportsList(newReports);
        } else {
          // Filter out duplicates when appending
          setReportsList((prev) => {
            const existingIds = new Set(prev.map((item: any) => item._id));
            const uniqueNewReports = newReports.filter(
              (report: any) => !existingIds.has(report._id)
            );
            return [...prev, ...uniqueNewReports];
          });
        }

        setPagination((prevPagination: any) => ({
          ...prevPagination,
          totalPages: response?.data?.reports.totalPages,
        }));

        setHasMore(newReports.length === pageSize);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      setHasMore(false);
    } finally {
      isFetching.current = false;
    }
  };

  const toggleEdit = () => setEdit((prev) => !prev);

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedIds((prevSelected) => {
      if (checked) {
        return [...prevSelected, id];
      } else {
        return prevSelected.filter((selectedId) => selectedId !== id);
      }
    });
  };

  const handleSendReportToEMR = async (reportId: string) => {
    try {
      const data1: any = await sendReportToEMR(
        `${API_CONSTANTS.SEND_REPORT_TO_EMR}${reportId}`
      );
      if (data1.data.success) {
        setTimeout(() => {
          fetchReports();
          handleGetReportCount();
        }, 300);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleAction = async (id: string, action: string) => {
    setLoadingAction(action);
    const payload = { status: action };

    try {
      const resData: any = await getAccept(
        payload,
        `${API_CONSTANTS.REPORTS.CHANGE_REPORT_STATUS}${id}`
      );

      if (resData.data.success) {
        fetchReports();
        handleGetReportCount();
      }
    } catch (err) {
      console.error("Error updating report status:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const columnsCompleted = React.useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
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
        meta: {
          className: "hidden md:table-cell",
        },
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
        meta: {
          className: "hidden md:table-cell",
        },
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
    ];

    if (
      userData?.organizationId?.emrEnabled &&
      userData?.organizationId?.emrType === Data_Constcnts.EMR_TYPE
    ) {
      baseColumns.push({
        header: "View",
        id: "view",
        meta: {
          className: "hidden md:table-cell",
        },
        cell: ({ row }: any) => {
          const { _id } = row.original;
          return (
            <>
              {row?.original?.emrEnabled &&
              row.original.emrType === Data_Constcnts.EMR_TYPE ? (
                <div className="flex gap-2 z-50 text-[#999999] font-normal">
                  <button
                    onClick={() =>
                      navigate(
                        `${ROUTES.REPORT_SUMMARY}?id=${
                          row.original?._id
                            ? row.original?._id
                            : row.original?.reportId
                        }`
                      )
                    }
                    className="font-regular w-full rounded-[30px] border border-[#E6E7E7] text-sm justify-center font-normal ps-4 pe-[7px] py-1 text-[#666D79] flex items-center whitespace-nowrap max-w-[120px] hover:border-medistryColor hover:text-medistryColor hover:!bg-[#e3eef0]"
                  >
                    Full Report
                    <ChevronRight strokeWidth={"1.5px"} height={"18px"} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 z-50 text-[#999999] font-normal">
                  <button
                    onClick={() => handleSendReportToEMR(_id)}
                    className="font-regular w-full rounded-[30px] border border-[#E6E7E7] mt-[-3px] text-sm justify-center font-normal ps-4 pe-[7px] py-1 text-[#666D79] flex items-center whitespace-nowrap max-w-[120px]"
                  >
                    Send to EMR
                    <ChevronRight strokeWidth={"1.5px"} height={"18px"} />
                  </button>
                </div>
              )}
            </>
          );
        },
        size: 180,
      });
    }

    return baseColumns;
  }, []);

  const columnsPending = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "File Name",
        accessorFn: (row) => row?.fileName,
        enableSorting: false,
        cell: ({ getValue }) => (
          <div
            className="w-[250px] truncate text-sm font-medium text-[#1A2435]"
            title={getValue() as string}
          >
            {getValue() as string}
          </div>
        ),
      },
      {
        header: "Report Status",
        accessorFn: (row) => row?.status,
        enableSorting: false,
        cell: ({ getValue, row }) => {
          const value = getValue();
          const rowData = row.original;
          return (
            <div
              className={`w-[180px] truncate text-sm font-medium ${
                value === "failed" ? "text-red-400" : "text-[#394557]"
              }`}
              title={value as string}
            >
              {rowData._id === changedStateReport?.reportId
                ? "Completed"
                : capitalizeFirstLetter(value as string)}
            </div>
          );
        },
      },
      {
        header: "Submitted Date",
        accessorFn: (row) => moment(row?.createdAt).format("ll"),
        enableSorting: false,
        cell: ({ row }: any) => (
          <div className="flex gap-2 z-50 w-[100px]">
            <span className="text-[14px] font-regular truncate text-sm font-light text-[#999999]">
              {moment(row?.original?.createdAt).format("ll")}
            </span>
          </div>
        ),
      },
    ],
    []
  );

  const columnsApprovalPending = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Patient Name",
        id: "patientName",
        enableSorting: true,
        accessorFn: (row) =>
          row?.client?.name ? row?.client?.name : row?.clientName,
        cell: ({ getValue }) => (
          <div
            className="w-[300px]  truncate font-medium text-[#1A2435] text-sm"
            title={getValue() as string}
          >
            {getValue() as string}
          </div>
        ),
        size: 250,
      },
      {
        header: "Uploaded",
        id: "createdAt",
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => moment(row?.createdAt).format("ll"),
        enableSorting: true,
        cell: ({ row }: any) => (
          <div className="flex gap-2 z-50 w-[250px]">
            <span className="text-[14px] font-normal truncate text-sm text-[#8C929A]">
              {moment(row?.original?.createdAt).format("ll")}
            </span>
          </div>
        ),
        size: 200,
      },
      {
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
                    onClick={() => handleAction(id, "processing")}
                    disabled={loadingAction === "pending"}
                    className="font-regular w-full rounded-[30px] border border-[#E6E7E7] 
                   text-sm font-normal text-[#666D79] items-center p-1 
                   whitespace-nowrap max-w-[100px] bg-white flex justify-center gap-2"
                  >
                    {loadingAction === "pending" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Accept
                      </>
                    ) : (
                      "Accept"
                    )}
                  </button>

                  {/* Reject Button */}
                  <button
                    type="button"
                    onClick={() => handleAction(id, "rejected")}
                    disabled={loadingAction === "rejected"}
                    className="font-regular w-full rounded-[30px] border border-[#E6E7E7] 
                   text-sm font-normal text-[#666D79] items-center p-1 
                   whitespace-nowrap max-w-[100px] bg-white flex justify-center gap-2"
                  >
                    {loadingAction === "rejected" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Reject
                      </>
                    ) : (
                      "Reject"
                    )}
                  </button>
                </>
              )}
            </span>
          );
        },
      },
    ],
    []
  );

  const handleOpenPdf = async (reportId: string) => {
    const payload = {
      reportId: reportId,
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

  const DropdownFiilter = ({ data }: any) => {
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
            {data.original.status === "flagged" && (
              <DropdownMenuItem
                className="cursor-pointer text-[#1A2435]"
                style={{ fontSize: "16px" }}
                onClick={() => {
                  setIsModalOpenSelectPatient(true);
                  setSelectedReport(data.original._id);
                  setIsMenuOpen(false);
                }}
              >
                <Plus /> Select Patient
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="cursor-pointer text-[#1A2435]"
              style={{ fontSize: "16px" }}
              onClick={() => handleOpenPdf(data.original._id)}
            >
              <SquareChartGantt />
              Original Report
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const columnsFlagged = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: (e: any) => {
                const isChecked = e.target.checked;
                if (isChecked) {
                  const allIds = table
                    .getRowModel()
                    .rows.map((row) => row.original._id);
                  setSelectedIds(allIds);
                } else {
                  setSelectedIds([]);
                }
                table.getToggleAllRowsSelectedHandler()(e);
              },
            }}
          />
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.original._id,
                onChange: (e: any) => {
                  const isChecked = e.target.checked;
                  handleCheckboxChange(row.original._id, isChecked);
                  row.getToggleSelectedHandler()(e);
                },
              }}
            />
          </div>
        ),
      },
      {
        header: "File Name",
        accessorFn: (row) => row?.fileName,
        enableSorting: false,
        cell: ({ getValue }) => (
          <div
            className="w-[250px] truncate text-sm font-medium text-[#1A2435]"
            title={getValue() as string}
          >
            {getValue() as string}
          </div>
        ),
      },
      {
        header: "Report Status",
        accessorFn: (row) => row?.status,
        enableSorting: false,
        cell: ({ getValue }) => (
          <div
            className={`w-[180px] truncate text-sm font-medium ${
              getValue() === "failed" ? "text-red-400" : "text-[#1A2435]"
            }`}
            title={getValue() as string}
          >
            {(getValue() as string) === "flagged"
              ? "Unidentified"
              : capitalizeFirstLetter(getValue() as string)}
          </div>
        ),
      },
      {
        header: "Submitted Date",
        accessorFn: (row) => moment(row?.createdAt).format("ll"),
        enableSorting: false,
        cell: ({ row }: any) => (
          <div className="flex gap-2 z-50 w-[100px]">
            <span className="text-[14px] font-normal truncate text-sm text-[#8C929A]">
              {moment(row?.original?.createdAt).format("ll")}
            </span>
          </div>
        ),
      },
      {
        header: "Action",
        accessorFn: (row) => moment(row?.createdAt).format("ll"),
        enableSorting: false,
        cell: ({ row }: any) => (
          <>
            <DropdownFiilter data={row} />
          </>
        ),
      },
    ],
    []
  );

  const columnsDarft = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Patient Name",
        id: "patientName",
        enableSorting: true,
        accessorFn: (row) =>
          row?.client?.name ? row?.client?.name : row?.clientName,
        cell: ({ getValue }) => (
          <div
            className="w-[300px]  truncate font-medium text-[#1A2435] text-sm"
            title={getValue() as string}
          >
            {getValue() as string}
          </div>
        ),
        size: 250,
      },
      {
        header: "Uploaded",
        id: "createdAt",
        meta: {
          className: "hidden md:table-cell",
        },
        accessorFn: (row) => moment(row?.createdAt).format("ll"),
        enableSorting: true,
        cell: ({ row }: any) => (
          <div className="flex gap-2 z-50 w-[250px]">
            <span className="text-[14px] font-normal truncate text-sm text-[#8C929A]">
              {moment(row?.original?.createdAt).format("ll")}
            </span>
          </div>
        ),
        size: 200,
      },
      {
        header: "Edit",
        // meta: {
        //   className: "hidden md:table-cell",
        // },
        cell: ({ row }: any) => {
          return (
            <div className="flex gap-2 z-50 text-[#999999] font-normal w-[250px] ml-[10px]">
              <button
                onClick={() =>
                  navigate(
                    `${ROUTES.CREATE_REPORT}?report_id=${
                      row.original?._id
                        ? row.original?._id
                        : row.original?.reportId
                    }`
                  )
                }
                className="font-regular w-full rounded-[30px] border border-[#E6E7E7] text-sm justify-center font-normal ps-4 pe-[7px] py-1 text-[#666D79] flex items-center whitespace-nowrap max-w-[120px] hover:border-medistryColor hover:text-medistryColor hover:!bg-[#e3eef0]"
              >
                Continue
                <ChevronRight strokeWidth={"1.5px"} height={"18px"} />
              </button>
            </div>
          );
        },
        size: 300,
      },
      {
        header: "Action",
        cell: ({ row }: any) => (
          <>
            <button
              className="flex gap-2 z-50 pl-4"
              onClick={() => handleDraftDelete(row.original?._id)}
            >
              <Trash2 size={16} color="#df3030" />
            </button>
          </>
        ),
      },
    ],
    []
  );

  const handleDraftDelete = (report_id: any) => {
    setDeleteModal(true);
    setSelectedRow(report_id);
  };

  const handleDeletedDraft = async () => {
    setDeleteLoading(true);
    try {
      const payload = {
        reportIds: selectedIds, // selectedRow is already an array
      };

      const response = await draftDeleteReport(
        payload, // pass as body
        API_CONSTANTS.DELETE_MULTIPLE_REPORT // keep only the endpoint, no array in URL
      );
      fetchReports();
      if (response?.data?.success) {
        setReportsList((prev) =>
          prev.filter((item: any) => !selectedRow.includes(item?._id))
        );
      }
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
    setDeleteLoading(false);
    setDeleteModal(false);
  };

  const defaultData = React.useMemo(() => [], []);

  const table = useReactTable({
    data: reportsList ?? defaultData,
    columns:
      selectedTab === "completed"
        ? columnsCompleted
        : selectedTab === "flagged"
        ? columnsFlagged
        : selectedTab === "draft"
        ? columnsDarft
        : selectedTab === "approval_pending"
        ? columnsApprovalPending
        : columnsPending,
    rowCount: pagination.pageSize,
    state: {
      pagination,
      sorting,
      // rowSelection,
    },
    enableRowSelection: true,
    // onRowSelectionChange: setRowSelection,
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

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const handleMultipleDelete = async () => {
    setDeleteLoading(true);
    const result = await deleteMultipleRport(
      `${API_CONSTANTS.DELETE_MULTIPLE_REPORT}`,
      selectedIds
    );
    if (result.success) {
      setDeleteModal(false);
      setSelectedIds([]);
      table.resetRowSelection();
      fetchReports();
      handleGetReportCount();
    }
    setDeleteLoading(false);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const selectedTab = searchParams.get("tab");
    setSearchParam(selectedTab);
  }, [selectedTab, location.pathname, location.search]);

  const onSelectPatient = async (patientId: any) => {
    const payload = {
      patientId: patientId.value,
      reportId: selectedReport,
    };
    try {
      const data1: any = await reportAddPatients(payload);
      if (data1.data.success) {
        fetchReports(true);
        setIsModalOpenSelectPatient(false);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div
      className="!bg-[#f3f4f6]"
      style={{ marginLeft: state == "collapsed" ? "28px" : "" }}
    >
      <header className="flex justify-between">
        <div className="ml-[8px] md:ml-[17px]">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
            <li>
              <a
                onClick={() => [
                  navigate(`${ROUTES.HEALTHREPORT}?tab=completed`, {
                    replace: true,
                  }),
                  setDeleteModal(false),
                  setSelectedIds([]),
                  table.resetRowSelection(),
                ]}
                className={`relative flex w-[100px] sm:w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 border-none mt-[16px] mb-[5px] md:mb-[16px] mr-[6px] rounded-[30px] text-sm cursor-pointer shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] ${
                  selectedTab === "completed"
                    ? "bg-white text-[#293343]"
                    : "bg-white text-[#cccccc] hover:text-[#526279] dark:hover:text-gray-300"
                }`}
              >
                {userData?.role == "client" ? "My Reports" : "All Reports"}
                {/* {reportCount?.completed || 0} */}
              </a>
            </li>
            {(reportCount?.duplicate || 0) +
              (reportCount?.failed || 0) +
              (reportCount?.flagged || 0) +
              (reportCount?.invalid || 0) >
              0 &&
              userData?.organizationId?.emrEnabled &&
              userData?.organizationId?.emrType ===
                Data_Constcnts?.EMR_TYPE && (
                <li className="me-0 ml-[4px]">
                  <a
                    onClick={() => [
                      navigate(`${ROUTES.HEALTHREPORT}?tab=flagged`, {
                        replace: true,
                      }),
                      setDeleteModal(false),
                      setSelectedIds([]),
                      table.resetRowSelection(),
                    ]}
                    className={`relative flex w-[80px] sm:w-[147px] h-[40px] px-[5px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 border-none mt-[16px] mb-[16px] mr-[5px] rounded-[30px] text-sm cursor-pointer shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] ${
                      selectedTab === "flagged"
                        ? "bg-white text-[#293343]"
                        : "bg-white text-[#cccccc] hover:text-[#526279] dark:hover:text-gray-300"
                    }`}
                    aria-current="page"
                  >
                    Flagged{" "}
                  </a>
                </li>
              )}
            {(reportCount?.pending || 0) +
              (reportCount?.uploading || 0) +
              (reportCount?.processing || 0) >
              0 &&
              ((userData?.organizationId?.emrEnabled &&
                userData?.organizationId?.emrType ===
                  Data_Constcnts?.EMR_TYPE) ||
                userData?.role == "client") && (
                <li className="ml-[4px]">
                  <a
                    onClick={() => [
                      navigate(`${ROUTES.HEALTHREPORT}?tab=progress`, {
                        replace: true,
                      }),
                      setDeleteModal(false),
                      setSelectedIds([]),
                      table.resetRowSelection(),
                    ]}
                    className={`relative flex min-w-[100px] sm:min-w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[4px] flex-shrink-0 border-none mt-[16px] mb-[5px] md:mb-[16px] mr-[6px] rounded-[30px] text-sm cursor-pointer shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] ${
                      selectedTab === "progress"
                        ? "bg-white text-[#293343]"
                        : "bg-white text-[#cccccc] hover:text-[#526279] dark:hover:text-gray-300"
                    }`}
                    aria-current="page"
                  >
                    In Progress{" "}
                    {(reportCount?.pending || 0) +
                      (reportCount?.processing || 0)}
                  </a>
                </li>
              )}
            {userData?.role !== "client" && (reportCount?.draft ?? 0) > 0 && (
              <li className="ml-[4px]">
                <a
                  onClick={() => {
                    navigate(`${ROUTES.HEALTHREPORT}?tab=draft`, {
                      replace: true,
                    });
                    setDeleteModal(false);
                    setSelectedIds([]);
                    table.resetRowSelection();
                  }}
                  className={`relative flex w-[100px] sm:w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 border-none mt-[16px] mb-[5px] md:mb-[16px] mr-[16px] rounded-[30px] text-sm cursor-pointer shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] ${
                    selectedTab === "draft"
                      ? "bg-white text-[#293343]"
                      : "bg-white text-[#cccccc] hover:text-[#526279] dark:hover:text-gray-300"
                  }`}
                  aria-current="page"
                >
                  Drafts
                </a>
              </li>
            )}

            {(reportCount?.approval_pending || 0) > 0 &&
              userData?.role == "client" && (
                <li className="ml-[4px]">
                  <a
                    onClick={() => [
                      navigate(`${ROUTES.HEALTHREPORT}?tab=approval_pending`, {
                        replace: true,
                      }),
                      setDeleteModal(false),
                      setSelectedIds([]),
                      table.resetRowSelection(),
                    ]}
                    className={`relative flex w-[100px] sm:w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 border-none mt-[16px] mb-[5px] md:mb-[16px] mr-[6px] rounded-[30px] text-sm cursor-pointer shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] ${
                      selectedTab === "approval_pending"
                        ? "bg-white text-[#293343]"
                        : "bg-white text-[#cccccc] hover:text-[#526279] dark:hover:text-gray-300"
                    }`}
                    aria-current="page"
                  >
                    Pending {reportCount?.approval_pending || 0}
                  </a>
                </li>
              )}
          </ul>
        </div>

        <div className="flex">
          {selectedIds?.length ? (
            <AppButton
              className="!bg-[#f68f80] relative flex w-[120px] sm:w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] border-none mt-[16px] mb-[5px] md:mb-[16px] mr-[8px] md:mr-[16px] rounded-[30px] text-sm"
              onClick={() => setDeleteModal(true)}
            >
              Delete Report
            </AppButton>
          ) : null}

          {/* <AppButton
            className="relative flex w-[120px] sm:w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none mt-[16px] mb-[16px] mr-[8px] md:mr-[16px] rounded-[30px] text-sm"
            onClick={() =>
              userData.role === "client"
                ? setOpenFile(true)
                : setIsModalOpen(true)
            }
          >
            <Plus /> Add Report
          </AppButton> */}
        </div>
      </header>
      {
        <div className="px-2 md:px-4">
          <div
            ref={tableContainerRef}
            className="rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white"
            style={{
              height: "calc(100vh - 152px)",
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
                              header.id === "View" ? "w-[13%] text-center" : ""
                            } ${
                            header.column.columnDef.meta?.className || ""
                          } ${header.id === "Edit" ? "pl-16" : ""}`}
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
                {loading && reportsList?.length === 0 ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-100 bg-[#f4f4f4]"
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
                      style={{
                        cursor:
                          selectedTab === "completed" ? "pointer" : "auto",
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`px-3 py-2 text-gray-700 !font-medium ${
                            cell.column.columnDef.meta?.className || ""
                          } ${
                            cell.column.columnDef.header === "edit" ? "w-0" : "" // Adjust width
                          }`}
                          // onClick={() => {
                          //   if (selectedTab === "completed") {
                          //     if (cell.column.columnDef.header === "View") {
                          //       // navigate(
                          //       //   `${ROUTES.REPORT_SUMMARY}?id=${
                          //       //     row.original?._id
                          //       //       ? row.original?._id
                          //       //       : row.original?.reportId
                          //       //   }`
                          //       // );
                          //     } else {
                          //       if (
                          //         row.original?.emrEnabled &&
                          //         row.original?.emrType ===
                          //           Data_Constcnts.EMR_TYPE
                          //       ) {
                          //         if (
                          //           row.original._id ||
                          //           row.original?.reportId
                          //         ) {
                          //           toggleEdit();
                          //           navigate(
                          //             `${ROUTES.HEALTHREPORT}?id=${
                          //               row.original?._id
                          //                 ? row.original?._id
                          //                 : row.original?.reportId
                          //             }&tab=completed`,
                          //             { replace: true }
                          //           );
                          //         }
                          //       } else {
                          //         handleOpenPdf(
                          //           row.original?._id
                          //             ? row.original?._id
                          //             : row.original?.reportId
                          //         );
                          //       }
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
                      style={{ height: "calc(100vh - 210px)" }}
                    >
                      No Reports to show
                    </td>
                  </tr>
                )}
                <>
                  {changedStateReport?.success &&
                    selectedTab === "progress" &&
                    Array.from({ length: 2 }).map((_, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-gray-100 bg-[#f4f4f4]"
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
                                  maxWidth: `${column.getSize() * 1.2}px`,
                                }}
                              ></div>
                            </td>
                          ))}
                      </tr>
                    ))}
                </>
              </tbody>
            </table>
            {loading && reportsList?.length > 0 && (
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
      }

      <CustomSheet
        title=""
        isOpen={edit}
        toggle={toggleEdit}
        className="dark:bg-gray-800 dark:text-gray-100"
        content={<HealthReportSidePannel />}
      />
      <AppModal isOpen={isModalOpen} toggle={toggleClose} title="" className="sm:max-w-2xl lg:max-w-3xl">
        <SelectWayToReortCreate
          onSelectOption={(option) => {
            if (option === "fileUpload") {
              setIsModalOpen(false);
              setOpenFile(true);
            }
          }}
        />
      </AppModal>
      <AppModal
        isOpen={openFile}
        toggle={toggleClose1}
        disableOutsideClick={uploadeFiles}
        title=""
        className="p-2"
      >
        <FileUpload setOpenFile={setOpenFile} setUploadFile={setUploadFile} />
      </AppModal>
      <AppDeleteDialog
        isLoading={deleteLoading}
        isOpen={deleteModal}
        title="Delete Report"
        description="Are you sure you want to delete this report ?"
        onConfirm={() => {
          if (selectedTab === "flagged") {
            handleMultipleDelete();
          } else {
            // handleDelete();
          }
        }}
        onClose={() => setDeleteModal(false)}
      />
      <AppModal
        isOpen={isModalOpenSelectPatient}
        toggle={patientToggleClose}
        title=""
        className="w-[500px] flex flex-col overflow-visible"
      >
        <SelectPatient
          onSelectPatient={(patientId) => onSelectPatient(patientId)}
        />
      </AppModal>
      <AppDeleteDialog
        isLoading={deleteLoading}
        isOpen={deleteModal}
        title="Delete Report"
        description="Are you sure you want to delete this report ?"
        onConfirm={() => handleDeletedDraft()}
        onClose={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default HealthReportsPage;
