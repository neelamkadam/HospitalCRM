import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import AppButton from "../../components/AppButton";
import { useSidebar } from "../../components/ui/sidebar";
import Select from "react-select";
import "../../index.css";
import { customSelectStyles } from "../../utils/common-utils";
import API_CONSTANTS from "../../constants/apiConstants";
import { useGetApi, usePostApi } from "../../services/use-api";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import AppModal from "../../components/AppModal";
import AddServicesForInvoice from "../../components/AddServicesForInvoice";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import { useAppSelector } from "../../redux/store";
import { SelectServiceInvoice } from "./SelectServiceInvoice";

interface InvoiceItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  tax?: number;
}

interface ServiceOption {
  value: string | null;
  label: string | null;
  price?: number;
}

interface Service {
  _id: string;
  name: string;
  price?: number;
  tax?: number;
}

const CustomSingleValue = ({ data }: any) => {
  return (
    <div className="flex items-center gap-2 mt-[-22px]">
      <Search className="w-5 h-5 text-gray-500" />
      <span className="text-[16px]">{data.label}</span>
    </div>
  );
};

const CustomPlaceholder = () => {
  return (
    <div className="flex items-center gap-2 text-[#526279] mt-[-22px]">
      <Search className="w-5 h-5 text-gray-500" />
      <span className="text-[16px]">Search Organization Name</span>
    </div>
  );
};

export const AdminCreateInvoice: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const invioceId = searchParams.get("id");
  const invioceOrgName = searchParams.get("name");
  const { state } = useSidebar();
  const { userData } = useAppSelector((state: any) => state.authData);
  const permissions = userData.permissions;
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastScrollTop = useRef(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [organizationName, setOrganizationName] = useState<any>([]);
  const { getData: GetOrganizationApi, isLoading: orgLoading } =
    useGetApi<any>("");
  console.log("🚀 ~ AdminCreateInvoice ~ orgLoading:", orgLoading);
  const { getData: GetServices } = useGetApi<any>("");
  const [servicesList, setServiseList] = useState<Service[]>([]);
  const [servicesSelect, setServiseSelect] = useState<ServiceOption>({
    value: null,
    label: null,
  });
  const [pagination, setPagination] = useState<any>({
    pageIndex: 1,
    pageSize: 25,
    totalPages: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalSelectServiceOpen, setIsModalSelectServiceOpen] =
    useState<boolean>(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const { getData: GetInvioceApi } = useGetApi<any>("");

  const { postData: invoice, isLoading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.ADMIN.GET_ADMIN_INVOICE,
    });

  const fetchInvoice = async () => {
    if (invioceId) {
      const response: any = await GetInvioceApi(
        `${API_CONSTANTS.ADMIN.GET_ADMIN_INVOICE}/${invioceId}`
      );

      if (response?.data.success) {
        const transformedData = response?.data.invoice.items.map(
          (item: any) => ({
            ...item,
            id: item.id || crypto.randomUUID(), // Ensure each item has an ID
            product: item.name,
            name: undefined, // optional: removes the old 'name' key
          })
        );

        const paymentDate = new Date(response?.data.invoice.paymentDueDate)
          .toISOString()
          .split("T")[0];

        setSelectedOption({
          value: response?.data.invoice.organizationId,
          label: response?.data.invoice.clientId?.name ?? invioceOrgName,
        });

        setPaymentDate(paymentDate);
        console.log(
          "🚀 ~ fetchInvoice ~ response?.data.invoice:",
          response?.data.invoice
        );

        setData(transformedData);
      }
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, []);

  const [data, setData] = useState<InvoiceItem[]>([]);
  console.log("🚀 ~ AdminCreateInvoice ~ data:", data);

  const [paymentDate, setPaymentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // format: yyyy-mm-dd
  });

  // Function to calculate amount including tax
  const calculateAmountWithTax = (
    quantity: number,
    unitPrice: number,
    tax: number = 0
  ) => {
    const baseAmount = quantity * unitPrice;
    const taxAmount = (baseAmount * tax) / 100;
    return baseAmount + taxAmount;
  };

  // Function to update quantity
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return; // Prevent negative or zero quantities

    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const fetchData = useCallback(
    async (page: number, resetData = false) => {
      console.log("🚀 ~ page:", page);
      if (isLoadingMore && !resetData) return;

      setIsLoadingMore(true);

      try {
        // Your fetch logic here
      } catch (error) {
        console.error("Error fetching report data:", error);
        setHasMore(false);
      } finally {
        setIsLoadingMore(false);
      }
    },
    [isLoadingMore, pagination.pageSize]
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

  const handleSelectChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedOption(option);
  };

  const handleServiceSelect = (option: ServiceOption | null) => {
    setServiseSelect(option || { value: null, label: null });
  };

  const fetchOrganizationData = async () => {
    try {
      const organizationRes = await GetOrganizationApi(
        `${API_CONSTANTS.ADMIN.GET_ORGANIZATION}`
      );
      if (organizationRes?.status === 200) {
        const transformedData =
          organizationRes?.data?.organizations?.map((org: any) => ({
            label: org.organizationName,
            value: org._id,
            ...org,
          })) || [];

        setOrganizationName(transformedData);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response: any = await GetServices(
        `${API_CONSTANTS.ADMIN.GET_SERVICES}`
      );
      if (response.data.success) {
        setServiseList(response.data.services);
        // console.log(
        //   "🚀 ~ fetchServices ~ response.data.services:",
        //   response.data.services
        // );
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  useEffect(() => {
    fetchOrganizationData();
    fetchServices();
  }, []);

  const columns = React.useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      {
        id: "Service",
        header: "Service",
        accessorKey: "product",
        cell: ({ getValue }) => (
          <div className="w-full break-words text-left">
            {" "}
            {/* Keep Service left-aligned */}
            <span className="font-medium text-[#1A2435] text-sm leading-relaxed">
              {getValue() as string}
            </span>
          </div>
        ),
      },
      {
        header: "Qty",
        id: "Qty",
        accessorKey: "quantity",
        cell: ({ row }) => {
          const rowData = row.original as InvoiceItem;
          return (
            <div className="flex items-center gap-1 justify-center">
              {" "}
              {/* Center Qty column */}
              <button
                onClick={() => updateQuantity(rowData.id, rowData.quantity - 1)}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold"
                disabled={rowData.quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={rowData.quantity}
                onChange={(e) => {
                  const newQty = parseInt(e.target.value) || 1;
                  updateQuantity(rowData.id, newQty);
                }}
                className="w-12 text-center text-sm text-[#8C929A] font-normal border rounded px-1 py-0.5"
                min="1"
              />
              <button
                onClick={() => updateQuantity(rowData.id, rowData.quantity + 1)}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold"
              >
                +
              </button>
            </div>
          );
        },
      },
      {
        header: "Price",
        accessorKey: "unitPrice",
        cell: ({ getValue }) => (
          <div className="text-center">
            {" "}
            {/* Center Price column */}
            <span className="text-sm text-[#8C929A] font-normal">
              ₹{(getValue() as number).toFixed(2)}
            </span>
          </div>
        ),
      },
      {
        header: "Tax(%)",
        accessorKey: "tax",
        cell: ({ getValue }) => {
          return (
            <div className="text-center">
              {" "}
              {/* Center Tax column */}
              <span className="font-normal text-sm text-[#8C929A]">
                {getValue() ? `${getValue()}%` : "0%"}
              </span>
            </div>
          );
        },
      },
      {
        header: "Amount",
        cell: ({ row }) => {
          const rowData = row.original as InvoiceItem;
          const amount = calculateAmountWithTax(
            rowData.quantity,
            rowData.unitPrice,
            rowData.tax || 0
          );
          return (
            <div className="text-center">
              {" "}
              {/* Center Amount column */}
              <span className="font-normal text-sm text-[#8C929A]">
                ₹{amount.toFixed(2)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "id",
        header: "",
        cell: ({ row }) => {
          const rowData = row.original as InvoiceItem;
          return (
            <div className="flex gap-2 z-50 text-sm text-[#8C929A] font-normal justify-center">
              {" "}
              {/* Center Actions column */}
              <button
                onClick={() => handleDelete(rowData.id)}
                className="p-1 hover:bg-transparent"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </div>
          );
        },
      },
    ];

    return baseColumns;
  }, []);

  // Fixed handleDelete function
  const handleDelete = (id: string) => {
    setData((prevData) => {
      // Add debugging to see what's happening
      console.log("Before delete - prevData:", prevData);
      console.log("Deleting ID:", id);

      // Ensure prevData is an array and has items
      if (!Array.isArray(prevData) || prevData.length === 0) {
        console.log("prevData is not a valid array or is empty");
        return prevData;
      }

      // Filter out the item with the matching id
      const filteredData = prevData.filter((item) => {
        // Ensure item exists and has an id
        if (!item || !item.id) {
          console.log("Item or item.id is missing:", item);
          return true; // Keep items without proper structure
        }
        return item.id !== id;
      });

      console.log("After delete - filteredData:", filteredData);
      return filteredData;
    });
  };

  const handleAddItem = () => {
    // Check if a service is selected
    if (!servicesSelect.value) {
      // Optionally show an error message or toast
      console.log("Please select a service first");
      return;
    }

    // Find the selected service to get additional data like price
    const selectedService = servicesList.find(
      (service: any) => service.name === servicesSelect.value
    ) as any;

    // Check if the service already exists in the data
    const existingItemIndex = data.findIndex(
      (item) => item.product === servicesSelect.value
    );

    if (existingItemIndex !== -1) {
      // If service already exists, increase its quantity
      setData((prevData) =>
        prevData.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // If service doesn't exist, add new item
      const newData: InvoiceItem = {
        id: crypto.randomUUID(),
        product: servicesSelect.value as string,
        quantity: 1,
        unitPrice: selectedService?.price || 100, // Use actual service price
        tax: selectedService?.tax || 0,
      };

      // Add the new item to the data
      setData((prevData) => [...prevData, newData]);
    }

    // Reset the selected service
    setServiseSelect({ value: null, label: null });

    // Close the modal
    setIsModalSelectServiceOpen(false);
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
    manualSorting: true,
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  const toggleClose = () => {
    setIsModalOpen((prev) => !prev);
  };

  // Calculate grand total including tax
  const grandTotal = data.reduce(
    (total, item) =>
      total +
      calculateAmountWithTax(item.quantity, item.unitPrice, item.tax || 0),
    0
  );

  // Calculate total tax amount
  const totalTaxAmount = data.reduce((total, item) => {
    const baseAmount = item.quantity * item.unitPrice;
    const taxAmount = (baseAmount * (item.tax || 0)) / 100;
    return total + taxAmount;
  }, 0);

  // Calculate subtotal (without tax)
  const subtotal = data.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0
  );

  const handleCreateInvoice = async () => {
    try {
      // Transform items: rename `product` to `name` and recalculate totalPrice
      const updatedItems = data.map(
        ({ id, product, unitPrice, tax = 0, quantity, ...rest }) => ({
          ...rest,
          name: product,
          description: "",
          unitPrice,
          quantity,
          tax,
          totalPrice: calculateAmountWithTax(quantity, unitPrice, tax),
        })
      );

      // Build payload
      const payload = {
        organizationId: selectedOption.value,
        items: updatedItems,
        amount: subtotal,
        status: "unpaid",
        notes: "",
        // insuranceCode: "",
        taxAmount: totalTaxAmount,
        discount: 5,
        totalAmount: parseFloat(grandTotal.toFixed(2)),
        paymentDueDate: paymentDate,
        // billingDate: paymentDate,
      };

      // API call: update or create invoice
      const url = invioceId
        ? `${API_CONSTANTS.ADMIN.UPDATE_ADMIN_INVOICE}/${invioceId}`
        : undefined;

      const response: any = await invoice(payload, url);

      if (response?.data?.success) {
        navigate(ROUTES.ADMIN_INVOICE);
      } else {
        console.error("Invoice creation/update failed", response);
      }
    } catch (error) {
      console.error("Invoice API error", error);
    }
  };

  const handleServiceDelete = (deletedId: string) => {
    setServiseList((prev) =>
      prev.filter((service) => service._id !== deletedId)
    );
  };

  return (
    <div
      className=" !bg-[#F5F6F6]"
      style={{ marginLeft: state == "collapsed" ? "28px" : "" }}
    >
      <header className="flex justify-between">
        <div className="ml-[8px] md:ml-[17px] flex">
          <AppButton
            onClick={() => navigate(ROUTES.ADMIN_INVOICE)}
            className="relative flex w-[50px] sm:w-[130px] h-[40px] px-3 justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none mt-[16px] mb-[16px] mr-[8px] md:mr-[16px] rounded-[30px] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] text-sm"
          >
            <ArrowLeft />
            <span className="hidden sm:inline ml-1">Back</span>
          </AppButton>
        </div>
        {(permissions.includes("full_billing") ||
          permissions.includes("admin")) && (
          <div className="flex">
            <AppButton
              className="relative flex w-[147px] sm:w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none mt-[16px] mb-[16px] mr-[8px] md:mr-[16px] rounded-[30px] text-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus /> Add Services
            </AppButton>
          </div>
        )}
      </header>
      <div className="px-2 md:px-4">
        <div
          className="bg-white rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white"
          style={{
            height: "calc(100vh - 150px)",
          }}
        >
          {/* Form Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-[1px] mt-[1px] md:mb-1 lg:mb-4 xl:mb-4 2xl:mb-4 ">
            <div className="text-left">
              <label className="font-medium text-sm mb-2 text-[#1A2435] text-left">
                Select Organization
              </label>

              <div
                className="border py-[3px] px-[13px] rounded-md cursor-pointer focus-within:border-0 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279] mt-2"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Select
                  value={selectedOption}
                  onChange={handleSelectChange}
                  options={organizationName}
                  className="search-patient"
                  components={{
                    SingleValue: CustomSingleValue,
                    Placeholder: CustomPlaceholder,
                  }}
                  isSearchable={true}
                  isClearable={true}
                  placeholder="Search Organization name"
                  menuPortalTarget={document.body}
                  closeMenuOnSelect={true} // Close menu after selection
                  blurInputOnSelect={true} // Blur input after selection
                  openMenuOnClick={true}
                  openMenuOnFocus={false} // Don't auto-open on focus
                  autoFocus={false}
                  styles={{
                    ...customSelectStyles,
                    control: (base) => ({
                      ...base,
                      border: "none",
                      boxShadow: "none",
                      backgroundColor: "transparent",
                      fontSize: "16px",
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
              </div>
            </div>

            <div className="text-left">
              <label
                className="font-medium text-sm mb-2 text-[#1A2435] text-left"
                htmlFor="paymentDate"
              >
                Payment Due Date
              </label>
              <div className="border py-[9px] px-[13px] rounded-md cursor-pointer focus-within:border-0 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279] mt-2">
                <input
                  type="date"
                  id="paymentDate"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="bg-white w-full outline-none cursor-pointer text-[#1A2435]"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>
          {/* Add Item Button */}
          <div className="text-right bg-white mb-[1px] md:mb-1 lg:mb-4 xl:mb-4 2xl:mb-4">
            <AppButton
              className="!text-gray-900 w-[130px] h-[40px] px-3 justify-center items-center gap-[8px] flex-shrink-0  border-none mt-[16px] mb-[16px] rounded-[30px] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] text-sm"
              onClick={() => setIsModalSelectServiceOpen(true)}
              variant="secondary"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              Add Item
            </AppButton>
          </div>

          {/* Table Section */}
          <div className=" mb-[1px] md:mb-1 lg:mb-4 xl:mb-4 2xl:mb-4">
            <div
              ref={tableContainerRef}
              className="rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] overflow-y-auto md:overflow-x-visible overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white border !border-[#E6E7E9]"
              style={{
                height: "calc(68vh - 200px)",
              }}
            >
              <table className="w-full text-left md:table-fixed">
                <colgroup>
                  <col className="md:w-[40%]" style={{ minWidth: "150px" }} /> {/* Service */}
                  <col className="md:w-[20%]" style={{ minWidth: "120px" }} /> {/* Qty */}
                  <col className="md:w-[10%]" style={{ minWidth: "80px" }} /> {/* Price */}
                  <col className="md:w-[15%]" style={{ minWidth: "80px" }} /> {/* Tax */}
                  <col className="md:w-[10%]" style={{ minWidth: "100px" }} /> {/* Amount */}
                  <col className="md:w-[5%]" style={{ minWidth: "60px" }} /> {/* Actions */}
                </colgroup>
                <thead className="sticky top-0 bg-white z-10 border-b">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-[#E6E6E8]">
                      {headerGroup.headers.map((header, index) => {
                        return (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            className={`p-2 sm:p-3 font-manrope text-sm sm:text-base font-medium text-[#666D79] ${
                              index === 0 ? "text-left" : "text-center" // Keep first column (Service) left-aligned, center others
                            }`}
                          >
                            {!header.isPlaceholder && (
                              <div
                                className={
                                  header.column.getCanSort()
                                    ? `cursor-pointer select-none flex items-center space-x-2 ${
                                        index === 0
                                          ? "justify-start"
                                          : "justify-center"
                                      }`
                                    : `${
                                        index === 0
                                          ? "text-left"
                                          : "text-center"
                                      }`
                                }
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {/* Rest of your tbody content remains the same */}
                  {table.getRowModel().rows.length > 0 ? (
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
                              className="px-2 sm:px-4 py-2 text-[#8C929A] !font-normal text-xs sm:text-[14px] align-top"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {/* Summary rows - fix colspan to match actual column count */}
                      <tr className="border-t border-[#E6E7E9]">
                        <td colSpan={4} className="px-2 sm:px-4 py-2">
                          <div className="text-right">
                            <span className="font-medium text-[#8C929A] text-sm">
                              Subtotal (Before Tax)
                            </span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2">
                          <div className="text-center">
                            {" "}
                            {/* Center the amount */}
                            <span className="font-medium text-sm text-[#8C929A]">
                              ₹{subtotal.toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2"></td>
                      </tr>
                      {/* Tax Row */}
                      <tr className="border-b border-[#E6E7E9]">
                        <td colSpan={4} className="px-2 sm:px-4 py-2">
                          <div className="text-right">
                            <span className="font-medium text-[#8C929A] text-sm">
                              Total Tax
                            </span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2">
                          <div className="text-center">
                            {" "}
                            {/* Center the amount */}
                            <span className="font-medium text-sm text-[#8C929A]">
                              ₹{totalTaxAmount.toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2"></td>
                      </tr>
                      {/* Grand Total Row */}
                      <tr className="border-t-2 border-[#E6E7E9] bg-gray-50">
                        <td colSpan={4} className="px-2 sm:px-4 py-3">
                          <div className="text-right">
                            <span className="font-semibold text-[#1A2435] text-lg">
                              Grand Total
                            </span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3">
                          <div className="text-center">
                            {" "}
                            {/* Center the amount */}
                            <span className="font-bold text-lg text-medistryColor">
                              ₹{grandTotal.toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3"></td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td
                        colSpan={6} // Update to match actual column count
                        className="text-center py-4 text-gray-500 bg-[#ffffff]"
                        style={{ height: "calc(100vh - 600px)" }}
                      >
                        No Services to show
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className=" flex justify-between">
            <div></div>
            <div className="bg-white sm:w-auto">
              <div className="flex items-center justify-between gap-6">
                <AppButton
                  onClick={() => handleCreateInvoice()}
                  label={invioceId ? "Update Invoice" : "Create Invoice"}
                  className="  !text-white w-[130px] h-[40px] px-3 justify-center items-center gap-[8px] flex-shrink-0  border-none mt-4 rounded-[30px] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] text-sm"
                  disable={
                    isLoading || (data?.length > 0 && selectedOption?.value)
                      ? false
                      : true
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <AppModal isOpen={isModalOpen} toggle={toggleClose} title="">
        <AddServicesForInvoice
          fetchData={fetchServices}
          setIsModalOpen={setIsModalOpen}
        />
      </AppModal>
      <AppModal
        isOpen={isModalSelectServiceOpen}
        toggle={() => setIsModalSelectServiceOpen((prev) => !prev)}
        title=""
      >
        <SelectServiceInvoice
          servicesList={servicesList}
          value={servicesSelect}
          onChange={handleServiceSelect}
          close={setIsModalSelectServiceOpen}
          submit={handleAddItem}
          onServiceDelete={handleServiceDelete}
          fetchData={fetchServices}
          isOpen={isModalSelectServiceOpen}
        />
      </AppModal>
    </div>
  );
};
