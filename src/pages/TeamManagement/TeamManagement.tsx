import React, { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import AppButton from "../../components/AppButton";
import AppModal from "../../components/AppModal";
import { SubmitHandler, useForm } from "react-hook-form";
import AppInputField from "../../components/AppInput";
import {
  deleteMember,
  useGetApi,
  usePostApi,
  usePutApi,
} from "../../services/use-api";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import API_CONSTANTS from "../../constants/apiConstants";
import { addTeamMember } from "../../utils/validationSchems";
import { accessOptions } from "../../constants/AppConstants";
import { Checkbox } from "../../components/ui/checkbox";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
// import { Plus } from "lucide-react";
import AppDeleteDialog from "../../components/AppDeleteDialog";
import { useSidebar } from "../../components/ui/sidebar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import PDFHeaderUpload from "./PdfPreview";
import { Plus } from "lucide-react";
import DropDownSelect from "../../components/DropdownSelect";
import {
  AddMemberRoles,
  // HospitalDepartments,
} from "../../constants/commanConstants";
import { setUserData } from "../../redux/AuthSlice";
import { TeamManagementSwitch } from "../../components/TeamManagementSwitch";

interface RowData {
  name: string;
  Name: string;
  Access: string;
  role?: string;
  email: string;
  status: string;
  permission: string[];
}

export interface AddMemer {
  email: string;
  registrationNumber?: string;
  access: Record<string, boolean>;
  role?: string;
  // department: string;
}

const TeamManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const [rowData, setRowData] = useState<RowData[]>([]);
  const { getData: GetinviteMember, isLoading: loading } = useGetApi<any>("");
  const { userData } = useSelector((state: any) => state.authData);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLetterheadModalOpen, setIsLetterheadModalOpen] = useState(false);
  const { theme } = useAppSelector((state) => state.theme);
  const { organizationId } = useAppSelector((state) => state.authData.userData);
  const [selectedData, setSelectedData] = useState<any>();
  const [edit, setEdit] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const { state } = useSidebar();
  const [fullAccess, setFullAccess] = useState(false);
  const [fullAppointment, setFullAppointment] = useState(false);
  const [fullBilling, setFullBilling] = useState(false);
  const [fullTeams, setFullTeams] = useState(false);
  const { getData: getUserData } = useGetApi<any>("");
  const editPermission =
    userData?.permissions?.includes("admin") ||
    userData?.permissions?.includes("full_teams");

  const isEditingAdmin = selectedData?.permissions?.includes("admin");
  const canEditAdmin = userData?.permissions?.includes("admin");

  const { postData: inviteMember, isLoading: isLoading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.INVITE_MEMBER,
    });

  const { putData: updatePermission, isLoading: isLoadingUdate } =
    usePutApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.UPDATE_USER_PERMISSION,
    });

  const form = useForm<AddMemer>({
    resolver: yupResolver(addTeamMember),
    defaultValues: {
      email: "",
      role: "",
      access: Object.fromEntries(
        accessOptions.map((option) => [option.key, false])
      ),
    },
  });

  const isAdmin =
    selectedData?.permissions?.includes("admin") &&
    edit &&
    selectedData?.email === userData?.email;

  const isOrganizationAdmin = userData?.role === "organization";

  const isCurrentUserAdmin = userData?.permissions?.includes("admin");
  const isTargetUserAdmin = selectedData?.permissions?.includes("admin");

  const cannotRemoveOwnAdmin = isOrganizationAdmin && isAdmin;
  const isTargetOrganizationRole = selectedData?.role === "organization";

  const toggleClose = () => {
    form.reset();
    setIsModalOpen((prev) => !prev);
  };

  const toggleLetterheadClose = () => {
    setIsLetterheadModalOpen((prev) => !prev);
  };

  useEffect(() => {
    userData?.role?.includes("client") &&
      navigate(`${ROUTES.HEALTHREPORT}?tab=completed`);
    fetchData();
  }, []);

  useEffect(() => {
    // if (isAdmin) {
    accessOptions.forEach((option) => {
      form.setValue(`access.${option.key}`, true);
    });
    setFullAccess(true);
    setFullAppointment(true);
    setFullBilling(true);
    setFullTeams(true);
    // }
  }, [form]);

  const fetchData = async () => {
    if (userData?.role?.includes("client")) {
      return true;
    }
    const resData = await GetinviteMember(API_CONSTANTS.GET_ALL_MEMBER);
    if (resData?.data?.success) {
      setRowData(resData?.data?.data?.invitations);
    }
  };

  const handleSelectedData = (data: any) => {
    if (!editPermission) {
      return;
    }

    setFullAccess(
      data.permissions.some((permission: any) => permission === "full_access")
    );
    setFullAppointment(
      data.permissions.some(
        (permission: any) => permission === "full_appointment_access"
      )
    );
    setFullBilling(
      data.permissions.some((permission: any) => permission === "full_billing")
    );
    setFullTeams(
      data.permissions.some((permission: any) => permission === "full_teams") ||
        (isCurrentUserAdmin && data.permissions?.includes("admin"))
    );
    setSelectedData(data);
    const { permissions, email, registrationNumber, internalRole } = data;
    form.setValue("email", email);
    form.setValue("registrationNumber", registrationNumber);
    form.setValue("role", internalRole);
    const access = accessOptions?.reduce((acc, option) => {
      if (
        option.key === "teams" &&
        isCurrentUserAdmin &&
        data.permissions?.includes("admin")
      ) {
        acc[option.key] = true;
      } else {
        acc[option.key] = permissions?.includes(option.key);
      }
      return acc;
    }, {} as Record<string, boolean>);
    form.setValue("access", access);
    setEdit(true);
    setIsModalOpen(true);
  };

  const onSubmit: SubmitHandler<AddMemer> = async (data: AddMemer) => {
    const trueAccess = Object.entries(data.access)
      .filter(([, value]) => value === true)
      .map(([key]) => key);

    let permissions = [...trueAccess];

    // Add access level permissions
    if (fullAccess) {
      permissions.push("full_access");
    } else {
      permissions.push("limited_access");
    }

    // Add appointment permissions
    if (fullAppointment) {
      permissions.push("full_appointment_access");
    } else {
      permissions.push("limited_appointment_access");
    }

    // Add billing permissions
    if (fullBilling) {
      permissions.push("full_billing");
    } else {
      permissions.push("limited_billing");
    }

    // Add teams permissions
    if (fullTeams) {
      permissions.push("full_teams");
    } else {
      permissions.push("limited_teams");
    }

    // Preserve admin permission if user being edited is admin and current user doesn't have admin rights
    if (
      edit &&
      selectedData?.permissions?.includes("admin") &&
      !userData?.permissions?.includes("admin")
    ) {
      permissions.push("admin");
    }

    // Add admin permission if current user is admin and editing themselves
    // if (
    //   userData?.permissions?.includes("admin") &&
    //   edit &&
    //   form.watch("email") === userData?.email
    // ) {
    //   permissions.push("admin");
    // }

    // Prevent organization admin from removing their own admin permission
    if (cannotRemoveOwnAdmin) {
      permissions.push("admin");
    }

    // Prevent any admin from removing admin permission of organization role users
    if (
      edit &&
      isTargetOrganizationRole &&
      selectedData?.permissions?.includes("admin")
    ) {
      permissions.push("admin");
    }

    // Prevent any user from removing teams access of organization role users
    if (edit && isTargetOrganizationRole) {
      permissions.push("teams");
    }

    // Remove duplicates
    permissions = [...new Set(permissions)];

    try {
      if (edit) {
        const payload = {
          memberId: selectedData._id,
          permissions,
          internalRole: data.role,
          registrationNumber: data?.registrationNumber,
        };

        if (!selectedData?._id) {
          console.error("No member ID found for update");
          return;
        }

        const resData: any = await updatePermission(payload);

        if (resData?.success || resData?.data?.success) {
          await fetchData();
          toggleClose();
          form.reset();
          isAdmin && (await fetchApi());
        } else {
          console.error("Update failed:", resData);
        }
      } else {
        const payload = {
          email: data?.email,
          registrationNumber: data?.registrationNumber,
          organizationId: organizationId,
          permissions,
          internalRole: data.role,
        };
        const resData: any = await inviteMember(payload);
        if (resData?.data?.success) {
          await fetchData();
          toggleClose();
          form.reset();
        }
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  const fetchApi = async () => {
    const userDataRes = await getUserData(API_CONSTANTS.GET_USER_INFO);
    if (userDataRes?.data?.success) {
      dispatch(setUserData(userDataRes?.data?.user));
    }
  };

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => {
      const baseColumns: ColumnDef<any>[] = [
        {
          header: "Name",
          accessorKey: "name",
          cell: ({ getValue }) => (
            <div className="w-60 truncate">
              <span className="capitalize font-medium text-[#1A2435] text-sm">
                {getValue() as string}
              </span>
            </div>
          ),
        },
        {
          header: "Email",
          accessorKey: "email",
          cell: ({ getValue }) => (
            <span className="font-normal text-[#394557]">
              {getValue() as string}
            </span>
          ),
        },
        {
          header: "Access",
          accessorFn: (row) =>
            row.permissions
              .map((permission: string) =>
                permission
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")
              )
              .join(", "),
          cell: ({ getValue }) => (
            <span className="capitalize font-medium text-[#394557]">
              {getValue() as string}
            </span>
          ),
        },
        {
          header: "Status",
          accessorKey: "status",
          cell: ({ getValue, row }) => {
            return (
              <span
                className={`capitalize font-normal ${
                  getValue() === "accepted"
                    ? "text-[#999999]"
                    : "text-[#e4c579]"
                }`}
              >
                {!row.original?.permissions.includes("admin")
                  ? (getValue() as string)
                  : "accepted"}
              </span>
            );
          },
          size: 120,
        },
      ];

      if (editPermission) {
        baseColumns.push({
          header: "Actions",
          id: "actions",
          cell: ({ row }: any) => {
            return (
              <div className="justify-between">
                <span
                  className="font-medium text-[#999999] hover:underline cursor-pointer"
                  onClick={() => {
                    handleSelectedData(row.original);
                  }}
                  aria-label={`Edit row ${row.original.id}`}
                >
                  Edit
                </span>
              </div>
            );
          },
          size: 120,
        });
      }

      return baseColumns;
    },
    [userData] // Dependencies ensure the memoized value updates if userData changes
  );

  const defaultData = React.useMemo(() => [], []);
  const table = useReactTable({
    data: rowData ?? defaultData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const result = await deleteMember(
        API_CONSTANTS.DELETE_MEMBER,
        selectedData._id
      );
      if (result.success) {
        fetchData();
        setDeleteModal(false);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error during deletion:", error);
      setDeleteModal(false);
    }
    setDeleteLoading(false);
  };

  const handleFullAccessChange = (checked: boolean) => {
    setFullAccess(checked);
  };

  const handleFullAppoimentChange = (checked: boolean) => {
    setFullAppointment(checked);
  };

  const handleFullBillingChange = (checked: boolean) => {
    setFullBilling(checked);
  };

  const handleFullTeamsChange = (checked: boolean) => {
    setFullTeams(checked);
  };

  return (
    <div
      className="!bg-[#ffffff]"
      style={{ marginLeft: state == "collapsed" ? "28px" : "" }}
    >
      <header className="flex justify-between">
        <div className="ml-[0px]">
          <AppButton
            onClick={() => navigate(`${ROUTES.TEAMLOGES}`)}
            className="relative flex w-[147px] h-[40px] ml-4 py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#ffffff] !bg-[#01576A] border-none mt-[16px] mb-[16px] mr-[16px] rounded-[30px] text-sm"
          >
            Team Logs
          </AppButton>
        </div>
        <div className="md:flex">
          {/* <AppButton
            onClick={() => toggleLetterheadClose()}
            className="relative flex w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none mt-[16px] mb-[16px] mr-[16px] rounded-[30px] text-sm"
          >
            Letterhead
          </AppButton> */}
          {editPermission && (
            <AppButton
              onClick={() => [
                toggleClose(),
                setEdit(false),
                setFullAccess(false),
                setFullAppointment(false),
                setFullBilling(false),
                setFullTeams(false),
              ]}
              className="relative flex w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#ffffff] !bg-[#01576A] border-none mt-[16px] mb-[16px] mr-[16px] rounded-[30px] text-sm"
            >
              <Plus /> Add Member
            </AppButton>
          )}
        </div>
      </header>
      <div className="pl-4 pr-4">
        <div
          className="rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] bg-white overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white border !border-[#E6E7E9]"
          style={{
            height: "calc(100vh - 300px)",
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
              {loading && !rowData?.length ? ( // Conditional rendering for shimmer UI during loading
                Array.from({ length: 10 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-100 bg-[#f4f4f4] animate-pulse"
                  >
                    {Array.from({ length: 5 }).map((_, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2">
                        <div className="shimmer h-4 rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
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
                <tr>
                  <td
                    colSpan={table.getHeaderGroups()[0].headers.length}
                    className="text-center py-4 text-gray-500  bg-[#ffffff]"
                    style={{ height: "calc(100vh - 200px)" }}
                  >
                    No Member to show
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AppModal
        isOpen={isModalOpen}
        toggle={toggleClose}
        title=""
        theme={theme}
        className="!scrollbar-thumb-transparent !scrollbar-track-transparent !max-w-2xl !max-h-[95vh]"
      >
        <div className="rounded-md shadow-sm">
          <header
            className={`text-xl text-[#1A2435] font-medium px-6  border-b text-left ${
              edit ? "py-2" : "py-1.5"
            }`}
          >
            <h1>{edit ? "Update Member" : "Add Member"}</h1>
            <p className="text-sm text-[#394557]">
              {edit ? "" : "Invite a new member to your organization"}
            </p>
          </header>
          <form
            className={`text-[#394557] font-bolder text-[17px] px-6 pb-3 pt-3  ${
              edit ? "!pb-3" : "!pb-3"
            }`}
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div>
              <AppInputField<AddMemer>
                name="email"
                form={form}
                readonly={edit}
                label="Email id"
                placeholder="Enter your Email Id"
              />
              <DropDownSelect
                name="role"
                form={form}
                label="Role"
                placeholder="Select Role"
                options={AddMemberRoles}
                autoFocus={false}
              />
              {form.watch(`role`) === "doctor" && (
                <AppInputField<AddMemer>
                  name="registrationNumber"
                  form={form}
                  label="Doctor DMC Number"
                  placeholder="Enter your Doctor DMC Number"
                />
              )}
              {/* <DropDownSelect
                name="department"
                form={form}
                label="Department"
                placeholder="Select Department"
                options={HospitalDepartments}
                autoFocus={false}
              /> */}
            </div>
            <label className="block text-sm font-medium text-[#1A2435] text-left !mt-0">
              Access Options
            </label>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-1 !mt-1">
              {accessOptions?.map((option) => (
                <div
                  key={option.key}
                  className="flex items-center justify-start"
                >
                  <Checkbox
                    id={option.key}
                    checked={
                      option.key === "admin" &&
                      (cannotRemoveOwnAdmin || isTargetOrganizationRole)
                        ? true
                        : !!form.watch(`access.${option.key}`)
                    }
                    disabled={
                      (option.key === "admin" &&
                        !userData?.permissions?.includes("admin")) ||
                      (option.key === "admin" && cannotRemoveOwnAdmin) ||
                      (option.key === "admin" && isTargetOrganizationRole) ||
                      (isAdmin && option.key === "teams") ||
                      (isEditingAdmin &&
                        !canEditAdmin &&
                        option.key === "admin") ||
                      (option.key === "teams" && !isCurrentUserAdmin) ||
                      (option.key === "teams" &&
                        isTargetUserAdmin &&
                        !isCurrentUserAdmin)
                    }
                    onCheckedChange={(checked) => {
                      // if (option.key === "admin") {
                      //   const allChecked = checked === true;
                      //   accessOptions.forEach((accessOption) => {
                      //     form.setValue(
                      //       `access.${accessOption.key}`,
                      //       allChecked
                      //     );
                      //   });
                      // } else {
                      form.setValue(`access.${option.key}`, checked === true);

                      // if (!checked && form.watch("access.admin")) {
                      //   form.setValue("access.admin", false);
                      // }
                      if (
                        (option.key === "patients" ||
                          option.key === "reports") &&
                        checked === false
                      ) {
                        setFullAccess(false);
                      }
                      if (option.key === "appointments" && checked === false) {
                        setFullAppointment(false);
                      }
                      if (option.key === "billing" && checked === false) {
                        setFullBilling(false);
                      }
                      if (option.key === "teams") {
                        setFullTeams(checked === true ? false : false);
                      }

                      if (
                        option.key === "admin" &&
                        !userData?.permissions?.includes("admin")
                      )
                        return;
                      if (isAdmin && option.key === "teams") return;
                      if (option.key === "teams" && !isCurrentUserAdmin) return;
                      if (
                        option.key === "teams" &&
                        isTargetUserAdmin &&
                        !isCurrentUserAdmin
                      )
                        return;
                      // }
                    }}
                    className="mr-2 data-[state=checked]:!bg-medistryColor"
                  />
                  <label
                    htmlFor={option.key}
                    className="text-sm text-[#1A2435] text-left"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {form.formState.errors.access && (
              <p className="text-red-600 text-sm mt-1 text-left">
                At least one permission is required
              </p>
            )}
            {form.getValues().access?.patients ||
            form.getValues().access?.reports ||
            isAdmin ? (
              <div className="!mt-3 !mb-2">
                <TeamManagementSwitch
                  id="full_access"
                  label="Full Patient Access"
                  checked={fullAccess}
                  onCheckedChange={handleFullAccessChange}
                />
              </div>
            ) : (
              " "
            )}
            {form.getValues().access?.appointments && (
              <div className="lg:!mt-0 !mb-2">
                <TeamManagementSwitch
                  id="full_appointments"
                  label="Full Appointments"
                  checked={fullAppointment}
                  onCheckedChange={handleFullAppoimentChange}
                />
              </div>
            )}
            {form.getValues().access?.billing && (
              <div className="lg:!mt-0 !mb-2">
                <TeamManagementSwitch
                  id="full_billing"
                  label="Full Billing"
                  checked={fullBilling}
                  onCheckedChange={handleFullBillingChange}
                />
              </div>
            )}

            {form.getValues().access?.teams && (
              <div className="lg:!mt-0 ">
                <TeamManagementSwitch
                  id="full_teams"
                  label="Full Teams"
                  checked={fullTeams}
                  disabled={
                    (isAdmin && selectedData?.email === userData?.email) ||
                    (isEditingAdmin && !canEditAdmin)
                  }
                  onCheckedChange={handleFullTeamsChange}
                />
              </div>
            )}
            <div
              className={`${
                edit && !isAdmin
                  ? "grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 !gap-2"
                  : ""
              }`}
            >
              {edit && !isAdmin && (
                <AppButton
                  disable={deleteLoading}
                  className={`w-full !bg-[#f68f80] !border-[#f68f80] text-base text-white !mt-3 `}
                  onClick={() => [handleDelete()]}
                >
                  Delete Member
                </AppButton>
              )}
              <AppButton
                disable={isLoading || isLoadingUdate}
                type="submit"
                className="w-full text-base !mt-3"
              >
                {edit ? "Update" : "Submit"}
              </AppButton>
            </div>
          </form>
        </div>
      </AppModal>
      <AppDeleteDialog
        isLoading={deleteLoading}
        isOpen={deleteModal}
        title="Member Delete"
        description="Are you sure you want to delete this member ?"
        onConfirm={() => handleDelete()}
        onClose={() => setDeleteModal(false)}
      />

      <AppModal
        isOpen={isLetterheadModalOpen}
        toggle={toggleLetterheadClose}
        title=""
        theme={theme}
      >
        <div className="rounded-md shadow-sm">
          <header className="text-xl text-[#1A2435] font-medium px-6 py-4 border-b text-left">
            <h1>Upload Your Letterhead</h1>
          </header>
          <PDFHeaderUpload toggle={toggleLetterheadClose} />
        </div>
      </AppModal>
    </div>
  );
};

export default TeamManagement;
