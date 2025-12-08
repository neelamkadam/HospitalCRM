import React, { useState, useEffect, useRef, useCallback } from "react";
import AppButton from "../../components/AppButton";
import { Edit, Plus, Trash2 } from "lucide-react";
import AppModal from "../../components/AppModal";
import ServiceUpload from "./ServiceUpload";
import { ColumnDef, flexRender, getCoreRowModel } from "@tanstack/react-table";
import { useReactTable } from "@tanstack/react-table";
import { deleteService, useGetApi, usePostApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import { serviceApproved } from "../../types/response.types";
import EditServiceInOrg from "../../components/EditServiceInOrg";
import AppDeleteDialog from "../../components/AppDeleteDialog";
import { useAppSelector } from "../../redux/store";

interface ServiceData {
  _id?: string;
  name: string;
  price: number;
  tax: number;
}

interface RowData {
  services: ServiceData[];
}

export const ServiceInOrg: React.FC = () => {
  const [openFile, setOpenFile] = useState(false);
  const [uploadeFiles, setUploadFile] = useState(false);
  const [rowData, setRowData] = useState<RowData | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [focusNewRow, setFocusNewRow] = useState<number | null>(null);
  const [focusNewExistingRow, setFocusNewExistingRow] = useState<number | null>(
    null
  );
  const [servicesList, setServicesList] = useState<any[]>([]);
  const { getData: GetReportApi, isLoading: IsLoading } = useGetApi<any>("");
  console.log("🚀 ~ ServiceInOrg ~ IsLoading:", IsLoading);
  const extractedRowData: ServiceData[] = rowData?.services || [];
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(
    null
  );
  const { userData } = useAppSelector((state: any) => state.authData);
  const permissions = userData?.permissions;

  const { postData: serviceApprove, isLoading: isLoading } =
    usePostApi<serviceApproved>({
      path: API_CONSTANTS.SERVICE_APPROVED,
    });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const response: any = await GetReportApi(
      `${API_CONSTANTS.BILLINGS.SERVICE_BILLING}`
    );
    if (response?.data.success) {
      setServicesList(response.data.services.items);
    }
  };

  // Wrap functions in useCallback to prevent recreation on every render
  const updateServiceData = useCallback(
    (index: number, field: keyof ServiceData, value: string | number) => {
      setRowData((prevRowData) => {
        if (!prevRowData) return prevRowData;

        const updatedServices = [...prevRowData.services];
        updatedServices[index] = {
          ...updatedServices[index],
          [field]: field === "name" ? value : Number(value),
        };

        return {
          ...prevRowData,
          services: updatedServices,
        };
      });
    },
    []
  );

  const deleteServiceItem = useCallback((name: string) => {
    setRowData((prevRowData) => {
      if (!prevRowData) return prevRowData;

      const updatedServices = prevRowData.services.filter(
        (service) => service.name !== name
      );
      return {
        ...prevRowData,
        services: updatedServices,
      };
    });
  }, []);

  const addNewRow = useCallback(() => {
    setRowData((prevRowData) => {
      if (!prevRowData) {
        setShowTable(true);
        setFocusNewRow(0);
        return {
          services: [{ name: "", price: 0, tax: 0 }],
        };
      } else {
        const updatedServices = [
          ...prevRowData.services,
          { name: "", price: 0, tax: 0 },
        ];
        setFocusNewRow(updatedServices.length - 1);
        return {
          ...prevRowData,
          services: updatedServices,
        };
      }
    });
  }, []);

  const columns = React.useMemo<ColumnDef<ServiceData>[]>(() => {
    const baseColumns: ColumnDef<ServiceData>[] = [
      {
        header: "Sr. No.",
        id: "srNo",
        cell: ({ row }) => (
          <span className="text-sm text-[#8C929A]">{row.index + 1}</span>
        ),
        size: 60,
      },
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ getValue, row }) => {
          const value = getValue() as string;
          const inputRef = useRef<HTMLInputElement>(null);

          useEffect(() => {
            if (
              focusNewRow !== null &&
              focusNewRow === row.index &&
              inputRef.current
            ) {
              setTimeout(() => {
                inputRef.current?.focus();
                setFocusNewRow(null);
              }, 10);
            }
          }, [focusNewRow, row.index]);

          return (
            <div className="w-60">
              <input
                ref={inputRef}
                type="text"
                defaultValue={value}
                onBlur={(e) =>
                  updateServiceData(row.index, "name", e.target.value)
                }
                className="text-sm text-[#1A2435] font-medium border border-gray-200 rounded px-2 py-1 w-full capitalize focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
              />
            </div>
          );
        },
        size: 120,
      },
      {
        header: "Price(₹)",
        accessorKey: "price",
        cell: ({ getValue, row }) => {
          const value = getValue() as number;
          return (
            <input
              type="number"
              defaultValue={value}
              onBlur={(e) =>
                updateServiceData(row.index, "price", e.target.value)
              }
              className="text-sm text-[#394557] border border-gray-200 rounded px-2 py-1 w-24 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
            />
          );
        },
        size: 120,
      },
      {
        header: "Tax(%)",
        accessorKey: "tax",
        cell: ({ getValue, row }) => {
          const value = getValue() as number;
          return (
            <input
              type="number"
              defaultValue={value}
              onBlur={(e) =>
                updateServiceData(row.index, "tax", e.target.value)
              }
              className="text-sm text-[#394557] border border-gray-200 rounded px-2 py-1 w-24 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
            />
          );
        },
        size: 120,
      },
      {
        header: () => (
          <div className="flex items-center justify-between">
            <span>Delete</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addNewRow();
              }}
              className="ml-2 p-1.5 bg-medistryColor rounded-full"
              title="Add new row"
            >
              <Plus size={20} className="text-gray-50" />
            </button>
          </div>
        ),
        id: "delete",
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              deleteServiceItem(row.original.name);
            }}
            className="flex gap-2 z-50 pl-4"
          >
            <Trash2 size={16} color="#df3030" />
          </button>
        ),
        size: 80,
      },
    ];

    return baseColumns;
  }, [addNewRow, updateServiceData, deleteServiceItem, permissions]);

  const addNewRowToExisting = useCallback(() => {
    setServicesList((prev) => {
      const newList = [...prev, { name: "", price: 0, tax: 0, isNew: true }];
      setFocusNewExistingRow(newList.length - 1);
      return newList;
    });
  }, []);

  const updateExistingServiceData = useCallback(
    (index: number, field: keyof ServiceData, value: string | number) => {
      setServicesList((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [field]: field === "name" ? value : Number(value),
        };
        return updated;
      });
    },
    []
  );

  const deleteNewServiceItem = useCallback((index: number) => {
    setServicesList((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const columnsExistingListOfServices = React.useMemo<
    ColumnDef<ServiceData>[]
  >(() => {
    const baseColumns: ColumnDef<ServiceData>[] = [
      {
        header: "Sr. No.",
        id: "srNo",
        cell: ({ row }) => (
          <span className="text-sm text-[#8C929A]">{row.index + 1}</span>
        ),
        size: 60,
      },
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ getValue, row }) => {
          const value = getValue() as string;
          const isNew = (row.original as any).isNew;
          const inputRef = useRef<HTMLInputElement>(null);

          useEffect(() => {
            if (
              focusNewExistingRow !== null &&
              focusNewExistingRow === row.index &&
              inputRef.current
            ) {
              setTimeout(() => {
                inputRef.current?.focus();
                setFocusNewExistingRow(null);
              }, 10);
            }
          }, [focusNewExistingRow, row.index]);

          if (isNew) {
            return (
              <div className="w-60">
                <input
                  ref={inputRef}
                  type="text"
                  defaultValue={value}
                  onBlur={(e) =>
                    updateExistingServiceData(row.index, "name", e.target.value)
                  }
                  className="text-sm text-[#1A2435] font-medium border border-gray-200 rounded px-2 py-1 w-full capitalize focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
                />
              </div>
            );
          }

          return (
            <div className="w-60 truncate">
              <span className="capitalize font-medium text-[#1A2435] text-sm">
                {value}
              </span>
            </div>
          );
        },
        size: 120,
      },
      {
        header: "Price(₹)",
        accessorKey: "price",
        cell: ({ getValue, row }) => {
          const value = getValue() as number;
          const isNew = (row.original as any).isNew;

          if (isNew) {
            return (
              <input
                type="number"
                defaultValue={value}
                onBlur={(e) =>
                  updateExistingServiceData(row.index, "price", e.target.value)
                }
                className="text-sm text-[#394557] border border-gray-200 rounded px-2 py-1 w-24 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
              />
            );
          }

          return <span className="font-normal text-[#394557]">{value}</span>;
        },
        size: 120,
      },
      {
        header: "Tax(%)",
        accessorKey: "tax",
        cell: ({ getValue, row }) => {
          const value = getValue() as number;
          const isNew = (row.original as any).isNew;

          if (isNew) {
            return (
              <input
                type="number"
                defaultValue={value}
                onBlur={(e) =>
                  updateExistingServiceData(row.index, "tax", e.target.value)
                }
                className="text-sm text-[#394557] border border-gray-200 rounded px-2 py-1 w-24 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
              />
            );
          }

          return <span className="font-normal text-[#394557]">{value}</span>;
        },
        size: 120,
      },
      {
        id: "actions",
        header: () => (
          <div className="flex items-center justify-between">
            <span>Action</span>
            {permissions?.includes("full_billing") && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addNewRowToExisting();
                }}
                className="ml-2 p-1.5 bg-medistryColor rounded-full"
                title="Add new row"
              >
                <Plus size={20} className="text-gray-50" />
              </button>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const isNew = (row.original as any).isNew;

          if (isNew) {
            return (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteNewServiceItem(row.index);
                }}
                className="flex gap-2 z-50 pl-4"
              >
                <Trash2 size={16} color="#df3030" />
              </button>
            );
          }

          return (
            <div className="flex">
              <button
                className="cursor-pointer text-medistryColor"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEditService(row.original);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
              </button>
              <button
                className="cursor-pointer text-red-400 focus:text-red-400"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(row.original);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
              </button>
            </div>
          );
        },
        meta: {
          className: "w-[60px]",
        },
      },
    ];

    return baseColumns;
  }, [
    addNewRowToExisting,
    updateExistingServiceData,
    deleteNewServiceItem,
    focusNewExistingRow,
    permissions,
  ]);

  const defaultData = React.useMemo(() => [], []);

  const table = useReactTable({
    data: showTable ? extractedRowData ?? defaultData : servicesList,
    columns: showTable ? columns : columnsExistingListOfServices,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  const toggleClose1 = () => {
    setOpenFile((prev) => !prev);
  };

  const handleReject = async () => {
    setRowData(null);
    setShowTable(false);
    await fetchReports(); // Refresh to remove any new rows
  };

  const handleApproved = async () => {
    try {
      let dataToSend;

      if (showTable && rowData) {
        // Send data from the upload table
        const validServices = rowData.services.filter(
          (service) =>
            service.name.trim() !== "" && (service.price > 0 || service.tax > 0)
        );
        dataToSend = {
          ...rowData,
          services: validServices,
        };
      } else {
        // Send new services from existing table
        const newServices = servicesList.filter(
          (service: any) => service.isNew && service.name.trim() !== ""
        );
        if (newServices.length === 0) return;

        dataToSend = {
          services: newServices.map(({ isNew, ...service }) => service),
        };
      }

      const resData: any = await serviceApprove(dataToSend);
      if (resData?.data?.success) {
        setRowData(null);
        setShowTable(false);
        await fetchReports(); // Refresh the data
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleClose = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleDelete = (service: ServiceData) => {
    setSelectedService(service);
    setDeleteModal(true);
  };

  const handleEditService = (service: ServiceData) => {
    setIsModalOpen(true);
    setSelectedService(service);
  };

  const handleExistingServiceDelete = async () => {
    if (!selectedService) return;

    setDeleteLoading(true);
    try {
      const serviceId = selectedService._id || selectedService.name;
      const result = await deleteService(
        `${API_CONSTANTS.BILLINGS.SERVICE}/${serviceId}`
      );
      if (result.success) {
        setServicesList((prev) =>
          prev.filter(
            (service: any) =>
              (service._id || service.name) !==
              (selectedService._id || selectedService.name)
          )
        );
        setDeleteModal(false);
        setSelectedService(null);
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className=" flex-1">
        <div className="flex mt-4 mb-4 px-4 justify-between pt-4 lg:pt-0">
          <label className="text-[24px] font-normal text-[#1A2435]">
            Services :
          </label>
          {permissions?.includes("full_billing") && (
            <div>
              <AppButton
                onClick={() => setOpenFile(true)}
                className="relative flex w-[147px] !mt-0 h-[40px] px-[10px] py-[6px] justify-center items-center !text-[#ffffff] !bg-[#01576A] border-none rounded-[30px] text-sm"
              >
                <Plus /> Add Service
              </AppButton>
            </div>
          )}
        </div>
        {
          <div className="pl-4 pr-4 pb-4 ">
            <div
              className={`rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] bg-white border !border-[#E6E7E9] ${
                table.getRowModel().rows.length > 0
                  ? "overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white"
                  : ""
              }`}
              style={{
                height: "calc(100vh - 500px)",
                overflowY:
                  table.getRowModel().rows.length > 0 ? "auto" : "hidden",
              }}
            >
              <table className="w-full text-left" key={extractedRowData.length}>
                <thead className="sticky top-0 bg-white z-10 border-b">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-[#E6E6E8]">
                      {headerGroup.headers.map((header) => {
                        return (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            className="p-3 text-left text-base !font-medium text-[#666D79]"
                          >
                            {header.isPlaceholder ? null : (
                              <>
                                <div
                                  {...{
                                    className: header.column.getCanSort()
                                      ? "cursor-pointer select-none flex items-center space-x-2"
                                      : "",
                                    onClick:
                                      header.column.getToggleSortingHandler(),
                                  }}
                                >
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                </div>
                              </>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
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
                    ))
                  ) : (
                    <tr style={{ height: "calc(100vh - 560px)" }}>
                      <td
                        colSpan={table.getHeaderGroups()[0].headers.length}
                        className="text-center text-gray-500 bg-[#ffffff]"
                        style={{ height: "calc(100vh - 560px)", verticalAlign: "middle" }}
                      >
                        No Services to show
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {(showTable ||
              servicesList.some((service: any) => service.isNew)) && (
              <div className="flex justify-end gap-5 pt-4 ">
                <AppButton
                  onClick={handleReject}
                  className="relative flex w-[147px]  h-[40px] px-[10px] py-[6px] justify-center items-center  border-none rounded-[30px] mt-0 text-base !bg-white !text-[#293343] hover:!bg-red-50 hover:!text-red-400 "
                >
                  Reject
                </AppButton>
                <AppButton
                  onClick={() => handleApproved()}
                  disable={isLoading || rowData?.services.length === 0}
                  loadingText="Approving..."
                  className="relative flex w-[147px] !mt-0 h-[40px] px-[10px] py-[6px] justify-center items-center !text-[#ffffff] !bg-[#01576A] border-none rounded-[30px] text-sm"
                >
                  Approve
                </AppButton>
              </div>
            )}
          </div>
        }
      </div>
      <AppModal
        isOpen={openFile}
        toggle={toggleClose1}
        disableOutsideClick={uploadeFiles}
        title=""
        className="p-2"
      >
        <ServiceUpload
          setOpenFile={setOpenFile}
          setUploadFile={setUploadFile}
          setRowData={setRowData}
          setShowTable={setShowTable}
        />
      </AppModal>
      <AppModal isOpen={isModalOpen} toggle={toggleClose} title="">
        <EditServiceInOrg
          selectedService={selectedService}
          setIsModalOpen={setIsModalOpen}
          setServicesList={setServicesList}
        />
      </AppModal>
      <AppDeleteDialog
        isLoading={deleteLoading}
        isOpen={deleteModal}
        title="Delete Service"
        description={`Are you sure you want to delete the service "${selectedService?.name}"?`}
        onConfirm={handleExistingServiceDelete}
        onClose={() => {
          setDeleteModal(false);
          setSelectedService(null);
        }}
      />
    </>
  );
};
