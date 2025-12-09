// AppNavbar.tsx - Fixed version
import React, { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CircleUserRound,
  LogOut,
  Search,
  X,
  Repeat,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  capitalizeFirstLetter,
  clearLocalStorage,
  setUserDetailsInLocalStorage,
} from "../../utils/common-utils";
import { ROUTES } from "../../constants/routesConstants";
import { useGetApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { UserInitialName } from "../../lib/utils";
import {
  resetAuthSlice,
  setAuthToken,
  setUserData,
} from "../../redux/AuthSlice";
import { Separator } from "@radix-ui/react-separator";
import { Input } from "../ui/input";
import { debounce } from "lodash";
import {
  resetSearchDataSlice,
  setPatientSearch,
  setReportsSearch,
  setTeamLogsSearch,
  setOrgnazationSearch,
  setBillingSearch,
} from "../../redux/GlobalSearch";
import { useSidebar } from "../ui/sidebar";
import BurgerMenu from "../../assets/Svgs/burger-menu.svg";
import AppNotification from "../AppNotification";

const AppNavbar: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const newpath = window.location.href;
  const cleanedPath = pathname.replace(/\/$/, "");
  let lastSegment = cleanedPath.substring(cleanedPath.lastIndexOf("/") + 1);
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const isSearchable = searchParams.get("isSearchable");
  const { state, toggleSidebar } = useSidebar();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [patientSearchValue, setPatientSearchValue] = useState("");
  const [reportSearchValue, setReportSearchValue] = useState("");
  const [teamsLogSearchValue, setTeamsLogSearchValue] = useState("");
  const [organizationSearchValue, setOrganizationSearchValue] = useState("");
  const [billingSearchValue, setBillingSearchValue] = useState("");

  const { userData }: any = useAppSelector((state) => state.authData);
  const { getData: SwitchAccount } = useGetApi<any>("");

  const handleLogout = async () => {
    sessionStorage.removeItem("tooltipShownForThisPage");
    clearLocalStorage();
    dispatch(resetAuthSlice());
    userData.role === "client"
      ? navigate(ROUTES.PATIENT_LOGIN)
      : navigate(ROUTES.LOGIN);
  };

  useEffect(() => {
    setOrganizationSearchValue("");
  }, [newpath]);

  const handleSwitch = async () => {
    const res: any = await SwitchAccount(
      `${API_CONSTANTS.PATIENTS.SWITCH_ACCOUNT}`
    );
    if (res.data.success) {
      dispatch(setAuthToken(res?.data?.token));
      dispatch(setUserData(res?.data?.user));
      setUserDetailsInLocalStorage({
        token: res?.data?.token,
      });
      res?.data?.user?.role === "organization"
        ? navigate(ROUTES.DASHBOARD)
        : navigate(
            `${ROUTES.PATIENTS_OVERALL_HEALTH}?id=${res?.data?.user?._id}`
          );
    }
  };

  const debouncedPatientSearch = useCallback(
    debounce((value: string) => {
      dispatch(setPatientSearch(value));
    }, 850),
    [dispatch]
  );

  const debouncedReportSearch = useCallback(
    debounce((value: string) => {
      dispatch(setReportsSearch(value));
    }, 850),
    [dispatch]
  );

  const debouncedTeamLogsSearch = useCallback(
    debounce((value: string) => {
      dispatch(setTeamLogsSearch(value));
    }, 850),
    [dispatch]
  );

  const debouncedOrganizationSearch = useCallback(
    debounce((value: string) => {
      dispatch(setOrgnazationSearch(value));
    }, 850),
    [dispatch]
  );

  // FIXED: Changed from setReportsSearch to setBillingSearch
  const debouncedBillingSearch = useCallback(
    debounce((value: string) => {
      dispatch(setBillingSearch(value));
    }, 850),
    [dispatch]
  );

  useEffect(() => {
    // Reset search state and input values when the route changes
    dispatch(resetSearchDataSlice());
    setPatientSearchValue("");
    setReportSearchValue("");
    setTeamsLogSearchValue("");
    setOrganizationSearchValue("");
    setBillingSearchValue(""); // FIXED: Added missing reset for billing search
  }, [location?.pathname, dispatch]);

  const handlePatientSearchChange = (value: string) => {
    setPatientSearchValue(value);
    debouncedPatientSearch(value);
  };

  const handleReportSearchChange = (value: string) => {
    setReportSearchValue(value);
    debouncedReportSearch(value);
  };

  const handleTeamLogsSearchChange = (value: string) => {
    setTeamsLogSearchValue(value);
    debouncedTeamLogsSearch(value);
  };

  const handleOrganizationSearchChange = (value: string) => {
    setOrganizationSearchValue(value);
    debouncedOrganizationSearch(value);
  };

  // FIXED: Changed function name from hanldeBillingSearch to handleBillingSearchChange
  const handleBillingSearchChange = (value: string) => {
    setBillingSearchValue(value);
    debouncedBillingSearch(value);
  };

  const clearPatientSearch = () => {
    setPatientSearchValue("");
    dispatch(setPatientSearch(""));
  };

  const clearReportSearch = () => {
    setReportSearchValue("");
    dispatch(setReportsSearch(""));
  };

  const clearTeamLogsSearch = () => {
    setTeamsLogSearchValue("");
    dispatch(setTeamLogsSearch(""));
  };

  const clearOrganizationSearch = () => {
    dispatch(setOrgnazationSearch(""));
    setOrganizationSearchValue("");
  };

  const clearBillingSearch = () => {
    dispatch(setBillingSearch(""));
    setBillingSearchValue("");
  };

  const orgBroadCastPlaceHolderText = (tab: string | null) => {
    switch (tab) {
      case "organization":
        return "search by Organization Name, Email";
      case "doctor":
        return "search by Doctor Name, Email";
      default:
        return "search by Name, Email";
    }
  };

  return (
    <header
      className="flex h-16 items-center justify-between border-b bg-gradient-to-r from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] px-4 md:ps-6 dark:bg-gray-900"
      style={{ marginLeft: state == "collapsed" ? "28px" : "" }}
    >
      <div className="flex items-center mr-1 md:w-[200px]">
        {" "}
        <Separator orientation="vertical" className="h-4" />
        <div
          className="mr-2 cursor-pointer block md:hidden"
          onClick={() => toggleSidebar()}
        >
          <img
            src={BurgerMenu}
            alt="Mobile menu"
            className="w-6 max-w-none fill-slate-400"
          />
        </div>
        <span className="md:text-lg font-medium text-[#1A2435] !mr-1">
          {lastSegment ? capitalizeFirstLetter(lastSegment) : "Dashboard"}
        </span>
      </div>

      <div className="relative flex lg:w-1/2 max-w-lg items-center mr-[10px] md:mr-[10%]">
        {lastSegment === "patients" && !userData?.role?.includes("client") && (
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3 h-5 w-5 top-[11px] md:top-[8px] text-gray-500 dark:text-[#8C929A]" />
            <Input
              value={patientSearchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handlePatientSearchChange(e.target.value)
              }
              type="text"
              placeholder="search by patient, condition, id"
              className="w-full rounded-full px-4 py-2 pl-10 pr-10 !text-[14px] placeholder-[#8C929A] placeholder:text-sm bg-[#EEEFF0] border-none !focus:outline-none focus-visible:ring-0 text-[#1A2435]"
            />
            {patientSearchValue && (
              <X
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-[#8C929A]"
                onClick={clearPatientSearch}
              />
            )}
          </div>
        )}

        {lastSegment === "reports" && !userData?.role?.includes("client") && (
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3 h-5 w-5 top-[11px] md:top-[8px] text-gray-500 dark:text-[#8C929A]" />
            <Input
              value={reportSearchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleReportSearchChange(e.target.value)
              }
              style={{ fontSize: "16px !important" }}
              type="text"
              placeholder="search by report type, patient, condition, id"
              className="w-full rounded-full px-4 py-2 pl-10 pr-10 !text-[14px] placeholder-[#8C929A] placeholder:text-sm bg-[#EEEFF0] border-none !focus:outline-none focus-visible:ring-0 text-[#1A2435]"
            />
            {reportSearchValue && (
              <X
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-[#8C929A]"
                onClick={clearReportSearch}
              />
            )}
          </div>
        )}

        {lastSegment === "teams-logs" &&
          !userData?.role?.includes("client") && (
            <div className="relative w-full flex items-center">
              <Search className="absolute left-3 h-5 w-5 top-[11px] md:top-[8px] text-gray-500 dark:text-[#8C929A]" />
              <Input
                value={teamsLogSearchValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleTeamLogsSearchChange(e.target.value)
                }
                style={{ fontSize: "16px !important" }}
                type="text"
                placeholder="search by name"
                className="w-full rounded-full px-4 py-2 pl-10 pr-10 !text-[14px] placeholder-[#8C929A] placeholder:text-sm bg-[#EEEFF0] border-none !focus:outline-none focus-visible:ring-0 text-[#1A2435]"
              />
              {teamsLogSearchValue && (
                <X
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-[#8C929A]"
                  onClick={clearTeamLogsSearch}
                />
              )}
            </div>
          )}

        {lastSegment === "organization" && userData?.isSuperAdmin && (
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3 h-5 w-5 top-[11px] md:top-[8px] text-gray-500 dark:text-[#8C929A]" />
            <Input
              value={organizationSearchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleOrganizationSearchChange(e.target.value)
              }
              type="text"
              placeholder="search by Doctor, Organization"
              className="w-full rounded-full px-4 py-2 pl-10 pr-10 !text-[14px] placeholder-[#8C929A] placeholder:text-sm bg-[#EEEFF0] border-none !focus:outline-none focus-visible:ring-0 text-[#1A2435]"
            />
            {organizationSearchValue && (
              <X
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-[#8C929A]"
                onClick={clearOrganizationSearch}
              />
            )}
          </div>
        )}
        {lastSegment === "admin-invoice" && userData?.isSuperAdmin && (
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3 h-5 w-5 top-[11px] md:top-[8px] text-gray-500 dark:text-[#8C929A]" />
            <Input
              value={organizationSearchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleOrganizationSearchChange(e.target.value)
              }
              type="text"
              placeholder="search by Organization, Paid By, Email"
              className="w-full rounded-full px-4 py-2 pl-10 pr-10 !text-[14px] placeholder-[#8C929A] placeholder:text-sm bg-[#EEEFF0] border-none !focus:outline-none focus-visible:ring-0 text-[#1A2435]"
            />
            {organizationSearchValue && (
              <X
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-[#8C929A]"
                onClick={clearOrganizationSearch}
              />
            )}
          </div>
        )}

        {lastSegment === "org-broadcast" &&
          userData?.isSuperAdmin &&
          tab &&
          isSearchable !== "no" && (
            <div className="relative w-full flex items-center">
              <Search className="absolute left-3 h-5 w-5 top-[11px] md:top-[8px] text-gray-500 dark:text-[#8C929A]" />
              <Input
                value={organizationSearchValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleOrganizationSearchChange(e.target.value)
                }
                type="text"
                placeholder={orgBroadCastPlaceHolderText(tab)}
                className="w-full rounded-full px-4 py-2 pl-10 pr-10 !text-[14px] placeholder-[#8C929A] placeholder:text-sm bg-[#EEEFF0] border-none !focus:outline-none focus-visible:ring-0 text-[#1A2435]"
              />
              {organizationSearchValue && (
                <X
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-[#8C929A]"
                  onClick={clearOrganizationSearch}
                />
              )}
            </div>
          )}

        {lastSegment === "billings" && (
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3 h-5 w-5 top-[11px] md:top-[8px] text-gray-500 dark:text-[#8C929A]" />
            <Input
              value={billingSearchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleBillingSearchChange(e.target.value)
              }
              style={{ fontSize: "16px !important" }}
              type="text"
              placeholder="search by name, invoice number, Patient ID"
              className="w-full rounded-full px-4 py-2 pl-10 pr-10 !text-[14px] placeholder-[#8C929A] placeholder:text-sm bg-[#EEEFF0] border-none !focus:outline-none focus-visible:ring-0 text-[#1A2435]"
            />
            {billingSearchValue && (
              <X
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-[#8C929A]"
                onClick={clearBillingSearch}
              />
            )}
          </div>
        )}
      </div>
      <div className="relative flex items-center gap-2">
        {userData?.role === "client" && (
          <div>
            <AppNotification />
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarImage
                src={userData?.organizationId?.logo || userData?.profilePicture}
                alt="User Avatar"
                className="border-[0.5px] border-solid border-gray-400 rounded-full"
              />
              <AvatarFallback className="bg-[#e5e7eb] text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {UserInitialName(userData?.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            {userData?.role === "client" ? (
              <>
                {userData?.enableSwitchAccount && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => handleSwitch()}
                  >
                    <Repeat className="text-gray-600 dark:text-gray-400" />
                    <span className="block w-full text-sm cursor-pointer">
                      {userData.role === "client"
                        ? "Switch to Doctor"
                        : "Switch to Patient"}
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => navigate(ROUTES.PATIENTPROFILE)}
                >
                  <CircleUserRound className="text-gray-600 dark:text-gray-400" />
                  <span className="block w-full text-sm cursor-pointer">
                    My Account
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => handleLogout()}
                >
                  <LogOut className="text-gray-600 dark:text-gray-400" />
                  <span className="block w-full text-sm cursor-pointer">
                    Logout
                  </span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                {userData?.enableSwitchAccount && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => handleSwitch()}
                  >
                    <Repeat className="text-gray-600 dark:text-gray-400" />
                    <span className="block w-full text-sm cursor-pointer">
                      {userData.role === "client"
                        ? "Switch to Doctor"
                        : "Switch to Patient"}
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => navigate(ROUTES.PROFILE)}
                >
                  <Building2 className="text-gray-600 dark:text-gray-400" />
                  <span className="block w-full text-sm cursor-pointer">
                    Organization Profile
                    {/* {userData?.organizationId?.organizationName ||
                      "Organization"} */}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => navigate(ROUTES.USERPROFILE)}
                >
                  <CircleUserRound className="text-gray-600 dark:text-gray-400" />
                  <span className="block w-full text-sm cursor-pointer">
                    My Profile
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => handleLogout()}
                >
                  <LogOut className="text-gray-600 dark:text-gray-400" />
                  <span className="block w-full text-sm cursor-pointer">
                    Logout
                  </span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppNavbar;
