// import { SignJWT } from "jose";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
// import { useSidebar } from "../../components/ui/sidebar.tsx";
import CustomSingleValue from "../../components/CustomSingleValue.tsx";
import { CustomOrganizationPlaceholder } from "../../components/CustomPlaceholder.tsx";
import {
  capitalizeFirstLetter,
  customSelectStylesDocter,
} from "../../utils/common-utils.ts";
import { useGetApi } from "../../services/use-api.ts";
import API_CONSTANTS from "../../constants/apiConstants.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu.tsx";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { periodOptions } from "../../constants/AppConstants.ts";
import AppButton from "../../components/AppButton.tsx";
import Piechart from "../../components/Piechart.tsx";
import BarChart from "../../components/BarChart.tsx";
import { useSidebar } from "../../components/ui/sidebar.tsx";
import { useNavigate } from "react-router-dom";

const AdminAnalytics: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const { getData: GetOrganizationApi, isLoading: orgLoading } =
    useGetApi<any>("");
  const { getData: GetAdminAnalyticsData, isLoading: analyticsLoading } =
    useGetApi<any>("");
  const [barChartReportData, setBarChartReportData] = useState<any>([]);
  const [barChartPatientData, setBarChartPatientData] = useState<any>([]);
  const [barChartAppointmentData, setBarChartAppointmentData] = useState<any>(
    []
  );
  const [barChartInvoiceData, setBarChartInvoiceData] = useState<any>([]);
  const [pieChartData, setPieChartData] = useState<any>({
    series: [],
    labels: [],
  });
  const [organizationName, setOrganizationName] = useState<any>([]);
  const { state } = useSidebar();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("semi_annual");
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("All");
  const selectRef = useRef<any>(null);
  const adminAnalyticsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const handleSelectChange = (
    option: {
      label: string;
      value: string;
      _id: string;
      organizationName: string;
    } | null
  ) => {
    setSelectedOption(option);
    // if (option) {
    //   setErrors((prev: any) => ({ ...prev, organization: false }));
    // }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    if (endDate && newStartDate && new Date(endDate) < new Date(newStartDate)) {
      setEndDate("");
    }
    if (newStartDate && !endDate) {
      setEndDate(getTodayDate());
    }
    setIsStartDatePickerOpen(false);
    // setDatesSetByUser(true);
  };

  const handleStartDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (isStartDatePickerOpen) {
      e.currentTarget.blur();
      setIsStartDatePickerOpen(false);
    } else {
      e.currentTarget.showPicker();
      setIsStartDatePickerOpen(true);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setIsEndDatePickerOpen(false);
    // setDatesSetByUser(true);
  };

  const handleEndDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (isEndDatePickerOpen) {
      e.currentTarget.blur();
      setIsEndDatePickerOpen(false);
    } else {
      e.currentTarget.showPicker();
      setIsEndDatePickerOpen(true);
    }
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

  const fetchData = async () => {
    try {
      let queryParams = "";

      if (selectedOption) {
        queryParams += `organizationId=${selectedOption._id}`;
      }

      if (startDate) {
        queryParams += `${queryParams ? "&" : ""}startDate=${startDate}`;
      }
      if (endDate) {
        queryParams += `${queryParams ? "&" : ""}endDate=${endDate}`;
      }

      if (selectedPeriod) {
        queryParams += `${queryParams ? "&" : ""}date_range=${selectedPeriod}`;
      }

      const url = queryParams
        ? `${API_CONSTANTS.ADMIN.GET_ADMIN_ANALYTICS}?${queryParams}`
        : `${API_CONSTANTS.ADMIN.GET_ADMIN_ANALYTICS}`;

      const res: any = await GetAdminAnalyticsData(url);
      console.log("🚀 ~ fetchData ~ res:", res);

      if (res?.status === 200) {
        setBarChartReportData(res?.data?.data?.reports_data || []);
        setBarChartPatientData(res?.data?.data?.patients_data || []);
        setBarChartAppointmentData(res?.data?.data?.appointments_data || []);
        setBarChartInvoiceData(res?.data?.data?.invoice_data || []);

        // if (res?.data?.data?.dates && !datesSetByUser) {
        //   setStartDate(res?.data?.data?.dates?.startDate || "");
        //   setEndDate(res?.data?.data?.dates?.endDate || "");
        // }

        setPieChartData({
          series: res?.data?.data?.status_data?.series || [],
          labels:
            res?.data?.data?.status_data?.labels?.map((label: string) =>
              capitalizeFirstLetter(label)
            ) || [],
        });
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setBarChartReportData([]);
      setPieChartData({ series: [], labels: [] });
    }
  };

  useEffect(() => {
    fetchOrganizationData();
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedOption, startDate, endDate, selectedPeriod]);

  const getSelectedPeriodLabel = () => {
    return (
      periodOptions.find((option) => option.value === selectedPeriod)?.label ||
      "Daily"
    );
  };

  const getBarChartCategories = () => {
    if (!barChartReportData || barChartReportData.length === 0) {
      return [];
    }

    return barChartReportData.map(
      (item: any) => item.label || item.organizationName
    );
  };

  const createReportData = barChartReportData.map(
    (item: any) => item.createdReports
  );
  const uploadedReportData = barChartReportData.map(
    (item: any) => item.uploadedReports
  );

  const chartSeries = [
    {
      name: "Create Report",
      data: createReportData || [],
    },
    {
      name: "Upload Report",
      data: uploadedReportData || [],
    },
  ];

  // const hasData =
  //   barChartReportData &&
  //   (createReportData?.length > 0 || uploadedReportData?.length > 0);

  // patient data

  const getBarChartPatientCategories = () => {
    if (!barChartPatientData || barChartPatientData.length === 0) {
      return [];
    }

    return barChartPatientData.map(
      (item: any) => item.label || item.organizationName
    );
  };

  const createPatientData = barChartPatientData.map((item: any) => item.count);

  const patientChartSeries = [
    {
      name: "Patient Count",
      data: createPatientData || [],
    },
  ];

  // const hasPatientData = barChartPatientData && createReportData?.length > 0;

  // appointments_data
  const getBarChartAppointmentCategories = () => {
    if (!barChartAppointmentData || barChartAppointmentData.length === 0) {
      return [];
    }

    return barChartAppointmentData.map(
      (item: any) => item.label || item.organizationName
    );
  };

  const createClientAppointmentData = barChartAppointmentData.map(
    (item: any) => item.createdByClientCount
  );
  const createDoctorAppointmentData = barChartAppointmentData.map(
    (item: any) => item.createdByDoctorCount
  );

  const chartAppointmentSeries = [
    {
      name: "Client Count",
      data: createClientAppointmentData || [],
    },
    {
      name: "Doctor Count",
      data: createDoctorAppointmentData || [],
    },
  ];

  // const hasAppointmentData =
  //   barChartAppointmentData &&
  //   (createClientAppointmentData?.length > 0 ||
  //     createDoctorAppointmentData?.length > 0);

  // invoice data

  const getBarChartInvoiceCategories = () => {
    if (!barChartInvoiceData || barChartInvoiceData.length === 0) {
      return [];
    }

    return barChartInvoiceData.map(
      (item: any) => item.label || item.organizationName
    );
  };

  const paidCountData = barChartInvoiceData.map((item: any) => item.paidCount);
  const unpaidCountData = barChartInvoiceData.map(
    (item: any) => item.unpaidCount
  );

  const chartInvoiceSeries = [
    {
      name: "Paid Count",
      data: paidCountData || [],
    },
    {
      name: "Unpaid Count",
      data: unpaidCountData || [],
    },
  ];

  // const hasInvoiceData =
  //   barChartInvoiceData &&
  //   (paidCountData?.length > 0 || unpaidCountData?.length > 0);

  const DropdownFiilter = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="text-gray-500 bg-transparent font-normal border border-gray-200 text-sm flex items-center !bg-white rounded-md cursor-pointer focus-within:border-0 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279] p-[15px] justify-between h-[54px]">
          <span className="flex gap-4 flex-1 min-w-0">
            <span className="text-[17px] font-medium text-[#526279] flex gap-4 flex-1 min-w-0 whitespace-nowrap">
              Show :{" "}
              <span className="font-medium text-[17px] text-[#1A2435] truncate">
                {getSelectedPeriodLabel()}
              </span>
            </span>
          </span>

          <ChevronDown className="flex-shrink-0" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto">
        <DropdownMenuGroup>
          {periodOptions.map((period) => (
            <DropdownMenuItem
              key={period.value}
              className="cursor-pointer text-[#1A2435]"
              style={{ fontSize: "16px" }}
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // const [url, setUrl] = React.useState<string>("");

  // React.useEffect(() => {
  //   const generateUrl = async () => {
  //     const METABASE_SITE_URL =
  //       "http://ec2-15-207-54-52.ap-south-1.compute.amazonaws.com:3004";
  //     const METABASE_SECRET_KEY =
  //       "5a4ef7b19896eb7bed0d19a08b48ae57e4dcb356753a302f53bb694723243914";

  //     const payload = {
  //       resource: { dashboard: 2 },
  //       params: {},
  //       exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minute expiration
  //     };

  //     const secret = new TextEncoder().encode(METABASE_SECRET_KEY);
  //     const token = await new SignJWT(payload)
  //       .setProtectedHeader({ alg: "HS256" })
  //       .setExpirationTime("10m")
  //       .sign(secret);

  //     const generatedUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;
  //     setUrl(generatedUrl);
  //   };

  //   generateUrl();
  // }, []);

  return (
    // <div className="w-full h-full p-4">
    //   {url && (
    //     <iframe
    //       src={url}
    //       frameBorder={0}
    //       width="100%"
    //       height="650"
    //       allowTransparency
    //       className="border-0"
    //     />
    //   )}
    // </div>
    <>
      <div
        className=" !bg-[#F5F6F6] mt-4"
        style={{ marginLeft: state == "collapsed" ? "30px" : "" }}
      >
        <div className="px-2 sm:px-3 md:px-4 mt-4 pb-4 mb-1">
          <header className="mb-4 flex justify-between items-center -mt-10">
            <AppButton
              onClick={() => navigate(-1)}
              className="py-3 rounded-[30px] w-[50px] sm:w-[130px] h-[40px] !bg-white !text-[#293343] border-none flex items-center justify-center text-sm"
            >
              <ArrowLeft className="w-7 h-7" />
              <span className="hidden sm:inline ml-1">Back</span>
            </AppButton>
          </header>

          <div
            className="rounded-xl shadow-sm bg-white overflow-hidden"
            ref={adminAnalyticsRef}
          >
            <div className="px-3 sm:px-4 md:px-6 pt-4 pb-6 text-left ">
              <div className="space-y-4">
                <div>
                  <label className="font-medium text-base text-[#1A2435] text-left">
                    Select Organization
                    {/* <span className="text-red-500 ml-1">*</span> */}
                  </label>
                  <div className="mt-1 border p-[7px] rounded-md cursor-pointer focus-within:border-0 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279]">
                    <Select
                      value={selectedOption}
                      onChange={handleSelectChange}
                      options={organizationName}
                      ref={selectRef}
                      className="search-patient"
                      getOptionLabel={(option: any) => option.organizationName}
                      getOptionValue={(option: any) => option._id}
                      components={{
                        SingleValue: CustomSingleValue,
                        Placeholder: CustomOrganizationPlaceholder,
                      }}
                      isSearchable={true}
                      isClearable={true}
                      closeMenuOnSelect={true}
                      blurInputOnSelect={true}
                      openMenuOnClick={true}
                      openMenuOnFocus={false}
                      isLoading={orgLoading}
                      isDisabled={orgLoading}
                      placeholder="Search and select organization..."
                      menuPortalTarget={document.body}
                      styles={{
                        ...customSelectStylesDocter,
                        control: (base) => ({
                          ...base,
                          border: "none",
                          boxShadow: "none",
                          fontSize: "14px",
                          backgroundColor: "transparent",
                        }),
                        menu: (base) => ({
                          ...base,
                          maxHeight: "500px",
                        }),
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                      }}
                    />
                  </div>
                  {/* {errors.organization && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    Please select an organization
                  </p>
                )} */}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-base font-medium text-[#1A2435] mb-1">
                      Start Date
                    </label>
                    <div className="border p-[13px] rounded-md focus-within:border-0 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279]">
                      <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={handleStartDateChange}
                        max={getTodayDate()}
                        onKeyDown={(e) => e.preventDefault()}
                        onClick={handleStartDateClick}
                        className="bg-white w-full outline-none cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:cursor-pointer text-[17px] font-medium text-[#526279]"
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-base font-medium text-[#1A2435] mb-1">
                      End Date
                    </label>
                    <div className="border p-[13px] rounded-md focus-within:border-0 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279]">
                      <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={handleEndDateChange}
                        min={startDate || undefined}
                        max={getTodayDate()}
                        onKeyDown={(e) => e.preventDefault()}
                        onClick={handleEndDateClick}
                        className="bg-white w-full outline-none cursor-pointer text-[17px] font-medium text-[#526279] disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:light] [&::-webkit-datetime-edit]:text-[#526279] [&::-webkit-datetime-edit-year-field]:text-[#526279] [&::-webkit-datetime-edit-month-field]:text-[#526279] [&::-webkit-datetime-edit-day-field]:text-[#526279] [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-base font-medium text-[#1A2435] mb-1 opacity-0">
                      Show
                    </label>
                    <DropdownFiilter />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 mb-4 flex flex-wrap gap-2 2xl:flex-nowrap ">
          <AppButton
            className={`w-13 h-10 mt-0 rounded-3xl border flex justify-center shadow-none ${
              selectedTab === "All"
                ? "!bg-[#CCE1E6] !text-[#016B83] !border-[#CCE1E6]"
                : "!bg-white !text-[#666D79] border-[#E6E6E8]"
            }`}
            onClick={() => setSelectedTab("All")}
          >
            All
          </AppButton>

          <AppButton
            className={`h-10 w-20 mt-0 rounded-3xl border flex justify-center shadow-none ${
              selectedTab === "Report"
                ? "!bg-[#CCE1E6] !text-[#016B83] !border-[#CCE1E6]"
                : "!bg-white !text-[#666D79]"
            }`}
            onClick={() => setSelectedTab("Report")}
          >
            Report
          </AppButton>

          <AppButton
            className={`h-10 w-20 mt-0 rounded-3xl border flex justify-center shadow-none ${
              selectedTab === "Patient"
                ? "!bg-[#CCE1E6] !text-[#016B83] !border-[#CCE1E6]"
                : "!bg-white !text-[#666D79]"
            }`}
            onClick={() => setSelectedTab("Patient")}
          >
            Patient
          </AppButton>

          <AppButton
            className={`h-10 mt-0 rounded-3xl border flex justify-center shadow-none ${
              selectedTab === "Appointments"
                ? "!bg-[#CCE1E6] !text-[#016B83] !border-[#CCE1E6]"
                : "!bg-white !text-[#666D79]"
            }`}
            onClick={() => setSelectedTab("Appointments")}
          >
            Appointments
          </AppButton>

          <AppButton
            className={`h-10 w-20 mt-0 rounded-3xl border flex justify-center shadow-none ${
              selectedTab === "Invoice"
                ? "!bg-[#CCE1E6] !text-[#016B83] !border-[#CCE1E6]"
                : "!bg-white !text-[#666D79]"
            }`}
            onClick={() => setSelectedTab("Invoice")}
          >
            Invoice
          </AppButton>
        </div>

        {(selectedTab === "All" || selectedTab === "Report") && (
          <section className="px-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-4">
              <h2 className="flex text-xl font-medium text-[#1A2435]">
                <span className="mb-2">Report</span>
              </h2>
              {/* Bar Chart*/}
              <BarChart
                series={chartSeries}
                categories={getBarChartCategories()}
                isLoading={analyticsLoading}
                // hasData={hasData}
                title="Report Distribution"
                yaxisTitle="Number of Report"
                colors={["#BDE7FF", "#BDC6FF"]}
                tooltipFormatter={(val: number) =>
                  `${val} report${val !== 1 ? "s" : ""}`
                }
              />
              {selectedTab === "Report" && (
                <div className="mt-10 border-t-2 border-t-gray-100 pt-6">
                  {/* Pie Chart */}
                  <Piechart
                    analyticsLoading={analyticsLoading}
                    pieChartData={pieChartData}
                  />
                </div>
              )}
            </div>
          </section>
        )}
        {(selectedTab === "All" || selectedTab === "Patient") && (
          <section className="px-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-4">
              <h2 className="flex text-xl font-medium text-[#1A2435]">
                <span className="mb-2">Patient</span>
              </h2>
              {/* Bar Chart*/}
              <BarChart
                series={patientChartSeries}
                categories={getBarChartPatientCategories()}
                isLoading={analyticsLoading}
                // hasData={hasPatientData}
                title="Patient Distribution"
                yaxisTitle="Number of Patient"
                colors={["#EDE7F6"]}
                tooltipFormatter={(val: number) =>
                  `${val} Patient${val !== 1 ? "s" : ""}`
                }
              />
            </div>
          </section>
        )}
        {(selectedTab === "All" || selectedTab === "Appointments") && (
          <section className="px-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-4">
              <h2 className="flex text-xl font-medium text-[#1A2435]">
                <span className="mb-2">Appointments</span>
              </h2>
              {/* Bar Chart*/}
              <BarChart
                series={chartAppointmentSeries}
                categories={getBarChartAppointmentCategories()}
                isLoading={analyticsLoading}
                // hasData={hasAppointmentData}
                title="Appointments Distribution"
                yaxisTitle="Number of Appointments"
                colors={["#A5D8FF", "#B2F2BB"]}
                tooltipFormatter={(val: number) =>
                  `${val} Appointment${val !== 1 ? "s" : ""}`
                }
              />
            </div>
          </section>
        )}
        {(selectedTab === "All" || selectedTab === "Invoice") && (
          <section className="px-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-4">
              <h2 className="flex text-xl font-medium text-[#1A2435]">
                <span className="mb-2">Invoice</span>
              </h2>
              <BarChart
                series={chartInvoiceSeries}
                categories={getBarChartInvoiceCategories()}
                isLoading={analyticsLoading}
                // hasData={hasInvoiceData}
                title="Invoice Distribution"
                yaxisTitle="Number of Invoice"
                colors={["#FFE0E0", "#FFE0B2"]}
                tooltipFormatter={(val: number) =>
                  `${val} Invoice${val !== 1 ? "s" : ""}`
                }
              />
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default AdminAnalytics;
