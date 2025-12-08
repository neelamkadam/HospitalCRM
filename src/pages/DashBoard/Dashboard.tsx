import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useGetApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import { useSidebar } from "../../components/ui/sidebar";
import { ChevronDown } from "lucide-react";
import AppButton from "../../components/AppButton";
import DashboardCard from "../../components/DashBoardCard";
import {
  capitalizeFirstLetter,
  roundToDecimalPlace,
} from "../../utils/common-utils";
import PatientDemographics from "../../components/PatientDemographics";
import UserCard from "../../assets/Svgs/UserCard.svg";
import UserSvg from "../../assets/Svgs/User.svg";
import Analytics from "../../assets/Svgs/analytics.svg";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { ROUTES } from "../../constants/routesConstants";
import { useNavigate } from "react-router-dom";
import { Data_Constcnts } from "../../constants/AppConstants";
import CraetedReports from "../../components/CraetedReports";
import { setSelectedPeriod } from "../../redux/DashBoardSlice";

const Dashboard: React.FC = () => {
  const { getData: GetReportsApi, isLoading: isDashBoardLoading } =
    useGetApi<any>("");
  const navigate = useNavigate();
  const { state } = useSidebar();
  const dispatch = useAppDispatch();

  const [dashBoardData, setDashBoardData] = useState<any>({
    growth: "",
    patientDemographics: "",
    patients: "",
    reports: "",
    topConditions: "",
    uploadedCreatedReports: "",
    appointmentsData: "",
  });

  // const [selectedPeriod, setSelectedPeriod] = useState("month");
  const { selectedPeriod } = useAppSelector(
    (state: any) => state.DashBoardData
  );
  const { userData } = useAppSelector((state: any) => state.authData);

  const isEMREnable =
    userData?.organizationId?.emrEnabled &&
    userData?.organizationId?.emrType == Data_Constcnts.EMR_TYPE;

  useEffect(() => {
    userData?.role?.includes("client") &&
      navigate(`${ROUTES.HEALTHREPORT}?tab=completed`);
    fetchDashboardData(selectedPeriod);
  }, []);

  const fetchDashboardData = async (period: string) => {
    if (userData?.role?.includes("client")) {
      return true;
    }
    const response: any = await GetReportsApi(
      `${API_CONSTANTS.DASHBOARD}?filter=${period}`
    );
    if (response?.data?.success) {
      const {
        growth,
        patientDemographics,
        patients,
        reports,
        topConditions,
        uploadedCreatedReports,
        appointmentsData,
        revenueData,
      } = response?.data?.data;
      setDashBoardData({
        growth,
        patientDemographics,
        patients,
        reports,
        topConditions,
        uploadedCreatedReports,
        appointmentsData,
        revenueData,
      });
    }
  };

  const DropdownFiilter = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="text-gray-500 bg-transparent font-normal border-0 shadow-none text-sm flex items-center pl-[12px] pr-[12px] pt-[10px] pb-[10px]">
          <span className="mr-[6px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.3333 8.66666H8V12H11.3333V8.66666ZM10.6667 1.33333V2.66666H5.33333V1.33333H4V2.66666H3.33333C2.59333 2.66666 2.00667 3.26666 2.00667 3.99999L2 13.3333C2 14.0667 2.59333 14.6667 3.33333 14.6667H12.6667C13.4 14.6667 14 14.0667 14 13.3333V3.99999C14 3.26666 13.4 2.66666 12.6667 2.66666H12V1.33333H10.6667ZM12.6667 13.3333H3.33333V5.99999H12.6667V13.3333Z"
                fill="#8C929A"
              />
            </svg>
          </span>
          <span className="mr-[6px] text-[#8C929A]">
            Show :{" "}
            <span className="font-medium text-sm text-[#1A2435]">
              {capitalizeFirstLetter(selectedPeriod)}
            </span>
          </span>{" "}
          <ChevronDown />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto">
        <DropdownMenuGroup>
          {["month", "quarter", "year"].map((period) => (
            <DropdownMenuItem
              key={period}
              className="cursor-pointer text-[#1A2435]"
              style={{ fontSize: "16px" }}
              onClick={() => [
                fetchDashboardData(period as any),
                dispatch(setSelectedPeriod(period)),
              ]}
            >
              {capitalizeFirstLetter(period)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <div
        className={`${
          state == "collapsed"
            ? "flex flex-1 flex-col gap-4 pl-12 pt-0 pr-4 mt-4 !bg=[#f3f4f6]"
            : "flex flex-1 flex-col gap-4 p-4 pt-0 mt-4 !bg=[#f3f4f6]"
        }`}
      >
        <header className="flex justify-end">
          <AppButton className="relative flex w-auto h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#334155] !bg-white border-none mt-[0px] ml-[16px] rounded-[30px] text-sm">
            <DropdownFiilter />
          </AppButton>
        </header>
        <div
          className={`grid auto-rows-min gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 ${
            !userData?.organizationId?.appointmentsEnabled &&
            !userData?.organizationId?.billingEnabled
              ? "xl:grid-cols-3"
              : "xl:grid-cols-4"
          }`}
        >
          <DashboardCard
            title="Patients"
            icon={<img src={UserCard} alt="User" className="w-6 h-6" />}
            value={dashBoardData?.patients?.patients}
            valueLabel="Patients"
            changeCount={roundToDecimalPlace(
              dashBoardData?.patients?.changeCount || 0
            ).toString()}
            changeType={dashBoardData?.patients?.changeType}
            growth={dashBoardData?.patients?.growth}
            isLoading={isDashBoardLoading}
          />
          <DashboardCard
            title="Reports"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M7 17V13"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 17V7"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 17V11"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 3V21H3V3H21Z"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            }
            value={dashBoardData?.reports?.reports}
            valueLabel="Reports Added"
            changeCount={roundToDecimalPlace(
              dashBoardData?.reports?.changeCount || 0
            ).toString()}
            changeType={dashBoardData?.reports?.changeType}
            growth={dashBoardData?.reports?.growth}
            isLoading={isDashBoardLoading}
          />
          {userData?.organizationId?.appointmentsEnabled && (
            <DashboardCard
              title="Appointments"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-calendar-days-icon lucide-calendar-days"
                >
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M3 10h18" />
                  <path d="M8 14h.01" />
                  <path d="M12 14h.01" />
                  <path d="M16 14h.01" />
                  <path d="M8 18h.01" />
                  <path d="M12 18h.01" />
                  <path d="M16 18h.01" />
                </svg>
              }
              value={dashBoardData?.appointmentsData?.appointments || 0}
              valueLabel="Appointments"
              changeCount={roundToDecimalPlace(
                dashBoardData?.appointmentsData?.changeCount || 0
              ).toString()}
              changeType={dashBoardData?.appointmentsData?.changeType}
              growth={dashBoardData?.appointmentsData?.growth || 0}
              isLoading={isDashBoardLoading}
            />
          )}
          {userData?.organizationId?.billingEnabled && (
            <DashboardCard
              title="Revenue"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 19C10.6675 19.6224 8.91707 20 7 20C5.93408 20 4.5 20 2 19V4C4.5 5 5.93408 5 7 5C8.91707 5 10.6675 4.62236 12 4C13.3325 3.37764 15.0829 3 17 3C20 3 22 4 22 4V11.5"
                    stroke="white"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M18.5 21V14M15 17.5H22"
                    stroke="white"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.5 11.5C14.5 12.8807 13.3807 14 12 14C10.6193 14 9.5 12.8807 9.5 11.5C9.5 10.1193 10.6193 9 12 9C13.3807 9 14.5 10.1193 14.5 11.5Z"
                    stroke="white"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.5 12.5V12.509"
                    stroke="white"
                    strokeWidth="1.7"
                    strokeLinecap="square"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              value={dashBoardData?.revenueData?.totalRevenue}
              valueLabel="Revenue"
              changeCount={roundToDecimalPlace(
                dashBoardData?.revenueData?.changeCount || 0
              ).toString()}
              changeType={dashBoardData?.revenueData?.changeType}
              growth={dashBoardData?.revenueData?.growth}
              isLoading={isDashBoardLoading}
            />
          )}
          {(!userData?.organizationId?.appointmentsEnabled ||
            !userData?.organizationId?.billingEnabled) && (
            <DashboardCard
              title="Time Saved"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.5265 6.4184C7.79901 6.19652 8.18905 6.19361 8.46484 6.41139L13.8845 10.691C15.0336 11.5984 15.0395 13.3311 13.8965 14.2462C12.7603 15.1559 11.0637 14.7925 10.4104 13.4879L7.32944 7.33584C7.17208 7.02162 7.25399 6.64028 7.5265 6.4184Z"
                    fill="white"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11 2C11 1.44772 11.4477 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 8.92308 2.26464 6.13972 4.29996 4.14447C4.69434 3.75784 5.32748 3.76414 5.7141 4.15852C6.10072 4.55291 6.09443 5.18604 5.70004 5.57267C4.03263 7.20726 3 9.48214 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.36745 17.5 3.55237 13 3.05493V4.5C13 5.05228 12.5523 5.5 12 5.5C11.4477 5.5 11 5.05228 11 4.5V2Z"
                    fill="white"
                  />
                </svg>
              }
              value={dashBoardData?.growth?.hoursSaved}
              valueLabel="Hours Saved"
              changeCount={roundToDecimalPlace(
                dashBoardData?.growth?.changeCount || 0
              ).toString()}
              changeType={dashBoardData?.growth?.changeType}
              growth={dashBoardData?.growth?.growth}
              isLoading={isDashBoardLoading}
            />
          )}
        </div>
        <div className="grid auto-rows-min gap-4 xl:grid-cols-2">
          {isEMREnable ? (
            <div
              className={`rounded-xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] w-full bg-white ${
                dashBoardData?.topConditions.length > 0 ? "h-fit" : ""
              }`}
              style={{ height: isDashBoardLoading ? "fitContent" : "" }}
            >
              <div className="flex justify-start flex-col rounded-t-lg p-4">
                <h2 className="font-normal text-lg text-start text-[#1A2435]">
                  Top Conditions
                </h2>
                <span className="text-start cursor-pointer text-[#84818A]">
                  {/* From Dec 12, 2024 — Jan 29, 2025 */}
                  {/* <Dropdown periodKey="topConditions" /> */}
                </span>
              </div>
              {isDashBoardLoading ? (
                <div
                  className="animate-pulse space-y-4 shadow-lg rounded-xl"
                  style={{ height: `calc(100vh - 402px)` }}
                >
                  {Array(3)
                    .fill(null)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="flex justify-between p-6 border-b items-center"
                      >
                        <span className="bg-gray-300 rounded-md w-1/3 h-4"></span>
                        <span className="bg-gray-300 rounded-md w-1/6 h-4"></span>
                      </div>
                    ))}
                </div>
              ) : (
                <div
                  className="overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white bg-white rounded-b-2xl"
                  style={{ height: `calc(100vh - 405px)` }}
                >
                  {dashBoardData?.topConditions && (
                    <table className="table-auto w-full text-left">
                      {/* <thead>
                      <th className="p-4"></th>
                      <th className="p-4 text-[#cccccc]">Report Count</th>
                      <th className="p-4 ">Count</th>
                    </thead> */}
                      <tbody>
                        {dashBoardData.topConditions.map((val: any) => (
                          <tr
                            key={val?._id}
                            className="hover:bg-gray-100 h-[49px] border-b border-[#E6E7E9] flex-1 items-center last:border-b-0"
                          >
                            <td className="p-4 flex">
                              <span className="ml-[5px] bg-[#F2F3F3] rounded-full w-[23px] h-[23px] flex items-center justify-center shrink-0">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M12 5.33333H4.00001C3.26363 5.33333 2.66668 5.93029 2.66668 6.66667V12C2.66668 12.7364 3.26363 13.3333 4.00001 13.3333H12C12.7364 13.3333 13.3333 12.7364 13.3333 12V6.66667C13.3333 5.93029 12.7364 5.33333 12 5.33333ZM4.00001 4C2.52725 4 1.33334 5.19391 1.33334 6.66667V12C1.33334 13.4728 2.52725 14.6667 4.00001 14.6667H12C13.4728 14.6667 14.6667 13.4728 14.6667 12V6.66667C14.6667 5.19391 13.4728 4 12 4H4.00001Z"
                                    fill="#8C929A"
                                  />
                                  <path
                                    d="M8.00001 6.66666C7.63182 6.66666 7.33334 6.96513 7.33334 7.33332V8.66666H6.00001C5.63182 8.66666 5.33334 8.96513 5.33334 9.33332C5.33334 9.70151 5.63182 9.99999 6.00001 9.99999H7.33334V11.3333C7.33334 11.7015 7.63182 12 8.00001 12C8.3682 12 8.66668 11.7015 8.66668 11.3333V9.99999H10C10.3682 9.99999 10.6667 9.70151 10.6667 9.33332C10.6667 8.96513 10.3682 8.66666 10 8.66666H8.66668V7.33332C8.66668 6.96513 8.3682 6.66666 8.00001 6.66666Z"
                                    fill="#8C929A"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6.66666 2.66668C6.29847 2.66668 5.99999 2.96515 5.99999 3.33334V4.00001C5.99999 4.3682 5.70151 4.66668 5.33332 4.66668C4.96513 4.66668 4.66666 4.3682 4.66666 4.00001V3.33334C4.66666 2.22877 5.56209 1.33334 6.66666 1.33334H9.33332C10.4379 1.33334 11.3333 2.22877 11.3333 3.33334V4.00001C11.3333 4.3682 11.0348 4.66668 10.6667 4.66668C10.2985 4.66668 9.99999 4.3682 9.99999 4.00001V3.33334C9.99999 2.96515 9.70151 2.66668 9.33332 2.66668H6.66666Z"
                                    fill="#8C929A"
                                  />
                                </svg>
                              </span>
                              <span className="ml-3 text-[#1A2435] font-[16px]">
                                {val?._id}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-evenly items-center">
                                <span className="w-[23px] h-[23px] flex items-center justify-center">
                                  <img
                                    src={Analytics}
                                    alt="Analytics"
                                    className="w-5"
                                  />
                                </span>
                                <span className="text-sm text-[#1A2435] ml-1">
                                  {val?.reportCount}{" "}
                                </span>
                                <span className="text-[#8C929A] text-sm ml-2">
                                  Reports
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-evenly items-center">
                                <span className="w-[23px] h-[23px] flex items-center justify-center">
                                  <img
                                    src={UserSvg}
                                    alt="User"
                                    className="w-5"
                                  />
                                </span>
                                <span className="text-sm text-[#1A2435] ml-1">
                                  {val?.count}{" "}
                                </span>
                                <span className="text-[#8C929A] text-sm ml-2">
                                  Patients
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ) : (
            <CraetedReports
              uploadedCreatedReports={dashBoardData?.uploadedCreatedReports}
            />
          )}
          <div className="rounded-xl w-full">
            <div className="shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl p-4 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="font-normal text-lg text-[#1A2435]">
                  Patient Demographics
                </h2>
                <span className="text-gray-300">
                  {/* <Dropdown periodKey="patientDemographics" /> */}
                  <div className="flex justify-end space-x-4">
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-[#CEF1F8] rounded-sm mr-2"></span>
                      Men
                    </span>
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-[#FFE0EE] rounded-sm mr-2"></span>
                      Women
                    </span>
                  </div>
                </span>
              </div>
              {isDashBoardLoading ? (
                <div className="p-4 space-y-4 shadow-lg rounded-xl bg-white">
                  <div className="flex justify-end space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-2 animate-pulse"></div>
                      <div className="bg-gray-300 h-4 w-16 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-2 animate-pulse"></div>
                      <div className="bg-gray-300 h-4 w-16 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-end space-x-4 justify-center">
                    {[...Array(6)].map((_, index) => (
                      <div
                        key={index}
                        className="bg-gray-300 rounded animate-pulse"
                        style={{
                          width: "20px",
                          height: `${Math.random() * 120 + 40}px`,
                        }}
                      ></div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gray-300 h-6 rounded w-3/4 animate-pulse"></div>
                    <div className="bg-gray-300 h-6 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <div
                  className="overflow-hidden overflow-x-scroll overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-white"
                  style={{
                    height: `calc(100vh - 405px)`,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <PatientDemographics
                    chartData={dashBoardData?.patientDemographics}
                  />
                  <p className="w-full text-center text-[#8C929A] text-sm">
                    Patients
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
