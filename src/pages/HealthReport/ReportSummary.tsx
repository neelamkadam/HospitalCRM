import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  EllipsisVertical,
  Share,
  SquareArrowOutUpRight,
} from "lucide-react";
import {
  // cn,
  ConditionsStatusOrder,
} from "../../lib/utils";
import { deleteReport, useGetApi, usePostApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import { ROUTES } from "../../constants/routesConstants";
import AppButton from "../../components/AppButton";
import AppDeleteDialog from "../../components/AppDeleteDialog";
import { useSidebar } from "../../components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import idImage from "../../assets/id.svg";
import moment from "moment";
// import { cn } from "../../lib/utils";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { TOASTER_CONFIG } from "../../constants/commanConstants";
import { toast } from "react-toastify";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { CheckCircle2, Edit } from "lucide-react";

const ReportSummary: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useSelector((state: any) => state.authData);
  const orgPermission = userData?.organizationId;
  const searchParams = new URLSearchParams(location.search);
  const reportId = searchParams.get("id");
  const { getData: GetReportApi, isLoading: isLoading } = useGetApi<any>("");
  const { getData: GetReportAddToPatientApi } = useGetApi<any>("");
  const [reportDataInfo, setReportDataInfo] = useState<any>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const { postData: getPresigned, isLoading: isLoadingUrl } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.REPORT_PRESIGNED_URL,
    });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const response: any = await GetReportApi(
      `${API_CONSTANTS.GET_ALL_REPORT}/${reportId}`
    );
    if (response?.data.success) {
      setReportDataInfo(response.data.report);
    }
    console.log(
      "🚀 ~ fetchReports ~ response.data.report:",
      response.data.report
    );
  };

  const { postData: sendReportChangeRequest } = usePostApi<any>({
    path: `${API_CONSTANTS.PATIENTS.REPORT_DATA}/${reportDataInfo?._id}`,
  });

  const { postData: sendReportNumberChangeRequest } = usePostApi<any>({
    path: `${API_CONSTANTS.PATIENTS.REPORT_DATA_NUMBER}/${reportDataInfo?._id}`,
  });

  const handleDelete = async () => {
    setDeleteLoading(true);
    const result = await deleteReport(
      `${API_CONSTANTS.DELETE_REPORT}${reportDataInfo?.reportInterpretation?.reportId}`
    );
    if (result.success) {
      navigate(ROUTES.HEALTHREPORT);
    }
    setDeleteLoading(false);
  };

  // const handleOpenPdf = () => {
  //   const fileUrl = reportDataInfo?.filePath;
  //   if (fileUrl) {
  //     window.open(fileUrl, "_blank");
  //   } else {
  //     console.log("file url not present");
  //   }
  // };

  const handleOpenPdf = async () => {
    const payload = {
      reportId: reportDataInfo?._id,
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

  const { state } = useSidebar();

  const handleShareReport = async () => {
    const response: any = await GetReportAddToPatientApi(
      `${API_CONSTANTS.REPORTS.ADD_TO_PATIENT}/${reportId}`
    );
    console.log(
      "🚀 ~ handleShareReport ~ response?.data.success:",
      response?.data.success
    );
    if (response?.data.success) {
      toast.success("Report shared successfully.", TOASTER_CONFIG);
      // setReportDataInfo(response.data.report);
    }
  };

  const DropdownFiilter = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="text-gray-500 font-normal border-0 shadow-none text-sm flex items-center p-1">
          <EllipsisVertical />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto mr-4">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer text-[#1A2435]"
            style={{ fontSize: "16px" }}
            onClick={() => handleShareReport()}
          >
            <Share /> Share Report
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const [loader, setLoader] = useState(false);
  const [isEditingOverallHealthSummary, setIsEditingOverallHealthSummary] = useState(false);
  const [isEditingConditions, setIsEditingConditions] = useState(false);
  const [editableData, setEditableData] = useState<any>();
  const [openItems, setOpenItems] = useState<string[]>([])
  const [editableMetrics, setEditableMetrics] = useState<any>({});
  const [metricChanges, setMetricChanges] = useState<any[]>([]);


  const [changes, setChanges] = useState<any[]>([]);

  const sortedConditions = reportDataInfo?.reportInterpretation?.testsAndConditions?.sort(
    (a: any, b: any) => {
      const indexA = ConditionsStatusOrder.indexOf(a.status);
      const indexB = ConditionsStatusOrder.indexOf(b.status);
      return (
        (indexA === -1 ? ConditionsStatusOrder.length : indexA) -
        (indexB === -1 ? ConditionsStatusOrder.length : indexB)
      );
    }
  );

  useEffect(() => {
    if (reportDataInfo) {
      setEditableData({
        conditions: sortedConditions || [],
        reportSummary: reportDataInfo?.reportInterpretation?.reportSummary || "",
      });
    }
  }, [reportDataInfo, sortedConditions]);

  const toggleItem = (value: string) => {
    setOpenItems((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const handleToggleEdit = (section: "history" | "conditions" | "organs" | "reportSummary", isEditing: boolean) => {
    // if (section === "history") setIsEditingHistory(isEditing);
    if (section === "conditions") setIsEditingConditions(isEditing);
    // if (section === "organs") setIsEditingOrgans(isEditing);
    if (section === "reportSummary") setIsEditingOverallHealthSummary(isEditing);

    if (isEditing) {
      // Cancel edits — revert all
      setEditableData({
        // medicalHistory: reportDataInfo?.medicalHistory || [],
        conditions: sortedConditions || [],
        // organs: reportDataInfo?.organSystemCards || [],
        reportSummary: reportDataInfo?.reportInterpretation?.reportSummary || "",
      });
      setChanges([]);
    }
  };

  const handleInputChange = (
    section: "history" | "conditions" | "organs" | "reportSummary",
    outerIndex: number,
    innerIndex: number,
    subIndex: number | null,
    field: string,
    value: string
  ) => {
    const newData = JSON.parse(JSON.stringify(editableData));
    if (section === "history") {
      if (subIndex !== null) {
        newData.medicalHistory[outerIndex].testsAndConditions[innerIndex].metrics[subIndex][field] = value;
      } else {
        if (field === "condition") {
          newData.medicalHistory[outerIndex].testsAndConditions[innerIndex].name = value;
        } else {
          newData.medicalHistory[outerIndex].testsAndConditions[innerIndex][field] = value;
        }
      }
    }
    else if (section === "conditions") {
      if (field === "condition") {
        newData.conditions[outerIndex].name = value;
      }
      else if (field === "name") {
        newData.conditions[outerIndex][field] = value;
      }
      else if (subIndex !== null) {
        newData.conditions[outerIndex].metrics[subIndex][field] = value;
      }
      else {
        newData.conditions[outerIndex].observations[innerIndex] = value;
      }
    }
    else if (section === "organs") {
      if (subIndex !== null) {
        // Editing a metric inside metrics array
        newData.organs[outerIndex].metrics[subIndex][field] = value;
      } else {
        // Editing top-level organ fields (like organ name)
        newData.organs[outerIndex][field] = value;
      }
    }
    else if (section === "reportSummary") {
      newData.reportSummary = value;
    }
    setEditableData(newData);
  };

  const handleBlurChange = async (
    entity: string,
    originalValue: string,
    updatedValue: string
  ) => {
    if (originalValue !== updatedValue) {
      setChanges((prev) => {
        // 🟢 If it's reportSummary, handle directly
        if (entity === "reportSummary") {
          const existingIndex = prev.findIndex((item) => item.entity === "reportSummary");
          if (existingIndex !== -1) {
            // Replace existing summary change
            const updatedChanges = [...prev];
            updatedChanges[existingIndex] = { entity, originalValue, updatedValue };
            return updatedChanges;
          } else {
            // Add new summary change
            return [...prev, { entity, originalValue, updatedValue }];
          }
        }

        // 🟡 Default logic for others
        const existingIndex = prev.findIndex(
          (item) => item.originalValue === originalValue
        );
        if (existingIndex !== -1) {
          const updatedChanges = [...prev];
          updatedChanges[existingIndex] = { entity, originalValue, updatedValue };
          return updatedChanges;
        } else {
          return [...prev, { entity, originalValue, updatedValue }];
        }
      });
    }
  };

  const handleMetricBlur = (
    section: "history" | "conditions" | "organs",
    outerIndex: number, // organIndex / hIndex / cIndex
    innerIndex: number, // only used for history, ignored for organs
    mIndex: number,     // metric index
    field: string
  ) => {
    let liveValue;

    if (section === "organs") {
      liveValue = editableMetrics?.[section]?.[outerIndex]?.[mIndex]?.[field];
    } else {
      liveValue = editableMetrics?.[section]?.[outerIndex]?.[innerIndex]?.[mIndex]?.[field];
    }

    let originalMetric: any;
    let metricKey: string | undefined;

    if (section === "history") {
      originalMetric = reportDataInfo.medicalHistory[outerIndex].testsAndConditions[innerIndex].metrics[mIndex];
      metricKey = originalMetric.metric;
    } else if (section === "conditions") {
      originalMetric = reportDataInfo?.reportInterpretation?.testsAndConditions[outerIndex].metrics[mIndex];
      metricKey = originalMetric.metric;
    } else if (section === "organs") {

      originalMetric = reportDataInfo.organSystemCards[outerIndex].metrics[mIndex];
      metricKey = originalMetric.metric;
    }

    // If value didn't change, do nothing
    if (liveValue === undefined || liveValue === originalMetric[field]) return;

    const newChange = {
      metric: metricKey,
      updateColumn: field,
      originalValue: originalMetric[field],
      updatedValue: liveValue,
      value: originalMetric.value ?? null,
      unit: originalMetric.unit ?? null,
      range: originalMetric.range ?? null,
      highRisk: true,
      mIndex: mIndex,
      innerIndex: innerIndex,
      outerIndex: outerIndex,
    };

    setMetricChanges((prev) => {
      const existingIndex = prev.findIndex(
        (c) => c.metric === metricKey && c.updateColumn === field && c.outerIndex === outerIndex && c.innerIndex === innerIndex && c.mIndex === mIndex
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = newChange;
        return updated;
      } else {
        return [...prev, newChange];
      }
    });
  };

  const handleMetricChange = (
    section: "history" | "conditions" | "organs",
    outerIndex: number,  // hIndex or cIndex (history/condition container)
    innerIndex: number,  // cIndex for history.testsAndConditions
    mIndex: number,      // metric index
    field: string,
    value: string
  ) => {

    setEditableMetrics((prev: any) => {
      const copy = { ...prev };
      if (section === "organs") {
        if (!copy[section]) copy[section] = [];
        while (copy[section].length <= outerIndex) copy[section].push([]);
        while (copy[section][outerIndex].length <= mIndex) copy[section][outerIndex].push({});
        copy[section][outerIndex][mIndex][field] = value;
      } else {
        if (!copy[section]) copy[section] = {};
        if (!copy[section][outerIndex]) copy[section][outerIndex] = {};
        if (!copy[section][outerIndex][innerIndex]) copy[section][outerIndex][innerIndex] = {};
        if (!copy[section][outerIndex][innerIndex][mIndex]) copy[section][outerIndex][innerIndex][mIndex] = {};

        copy[section][outerIndex][innerIndex][mIndex][field] = value;
      }
      return copy;
    });
  };

  const handleSubmit = async (finalData: any) => {
    setLoader(true);
    const updatedMetrics = metricChanges.map((metricItem) => {
      const match = finalData.find(
        (fItem: any) => fItem.originalValue === metricItem.metric
      );
      if (match) {
        return { ...metricItem, metric: match.updatedValue };
      }
      return metricItem;
    });
    try {
      let resData: any = null;
      let resNumberData: any = null;

      // ✅ Call first API only if finalData has items
      if (finalData.length > 0) {
        resData = await sendReportChangeRequest(finalData);
      }

      // ✅ Call second API only if updatedMetrics has items
      if (updatedMetrics.length > 0) {
        resNumberData = await sendReportNumberChangeRequest(updatedMetrics);
      }

      // ✅ Only proceed if any API call actually happened and succeeded
      if (resData || resNumberData) {
        fetchReports();
        setChanges([]);
        setMetricChanges([]);
        setLoader(false);
      } else {
        setLoader(false);
        console.log("No changes to submit — skipping API calls.");
      }
    } catch (error) {
      setLoader(false);
      console.error("Error during report submission:", error);
    }
  };

  return (
    <div
      className={`${state == "collapsed"
        ? "p-6 shadow-none rounded-lg transition-all text-gray-800 dark:bg-gray-800 dark:text-white ml-6"
        : "px-4 shadow-none rounded-lg transition-all text-gray-800 dark:bg-gray-800 dark:text-white"
        }`}
    >
      <header className="flex justify-between -mt-6">
        <AppButton
          onClick={() => navigate(-1)}
          className="py-3 rounded-[30px] w-[130px] h-[40px] !bg-white !text-[#293343] border-none flex items-center justify-center pl-1 text-sm"
        >
          <ArrowLeft className="w-7 h-7" />
          Back
        </AppButton>
        <span
          className={`cursor-pointer bg-white rounded-full text-[#293343] hover:text-[#293343] p-1 mt-10 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]`}
        >
          <DropdownFiilter />
        </span>
      </header>

      {/* Report Summary Loader boxes start from here */}
      {isLoading ? (
        <div className="mt-4 shimmer-box">
          <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
            <div className="rounded-full bg-gray-200 h-10 w-10 animate-pulse"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            </div>
          </div>
          <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
          <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <section className="shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
            <div className="py-6 px-6 mt-4">
              <h2 className="text-[32px] font-semibold text-[#1A2435] text-start">
                {reportDataInfo?.reportInterpretation?.reportTitle}{" "}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xl font-normal text-[#1A2435] mt-1">
                <span className="text-[20px]">
                  {reportDataInfo?.clientId?.name}
                </span>
                <span className="text-[#8C929A] text-[20px]">
                  {Number(reportDataInfo?.clientId?.age) || 0},{" "}
                  {reportDataInfo?.clientId?.gender}
                </span>
              </div>
              <p className="flex flex-wrap md:flex-nowrap text-[16px] text-[#8C929A] font-medium gap-x-4 gap-y-2 items-center mt-2">
                <div className="flex gap-2 items-center text-left">
                  <CalendarDays size={18} />
                  <span className="font-normal">
                    {moment(
                      reportDataInfo?.reportInterpretation?.reportIdentification
                        ?.reportDate
                    ).format("LL")}
                  </span>
                </div>

                <div className="flex gap-2 items-center text-left">
                  <img src={idImage}></img>
                  <span className="font-normal">
                    Report ID {reportDataInfo?.reportInterpretation?.reportId}
                  </span>
                </div>
              </p>
              {/* <Separator className="my-3" /> */}
              <p className="text-[16px] text-[#8C929A] font-normal text-left my-2">
                Ordering Physician :{" "}
                <span className="font-normal text-[#666D79]">
                  {
                    reportDataInfo?.reportInterpretation?.reportIdentification
                      ?.orderingPhysician?.name
                  }
                </span>
              </p>
            </div>
          </section>

          {reportDataInfo?.reportInterpretation?.reportSummary && (
            <section className="mt-6 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
              <div className="grid grid-cols-1 p-6 mt-6">
                <h2 className="flex justify-between text-[24px] font-semibold text-[#1A2435] mb-1 text-start">
                  <span className="font-normal">Report Summary</span>
                  <span className="mt-[5px]">
                    {orgPermission?.allowPatientDataEdit &&
                      userData?.permissions.includes(
                        "allowPatientDataEdit"
                      ) &&
                      <TooltipProvider>
                        {!isEditingOverallHealthSummary ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Edit
                                className="w-5 h-5 text-gray-300 cursor-pointer"
                                onClick={() => handleToggleEdit("reportSummary", true)}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Edit</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CheckCircle2
                                className="w-6 h-6 text-[#016B83] cursor-pointer"
                                onClick={() => { handleSubmit(changes); handleToggleEdit("reportSummary", false) }}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Save</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>}
                  </span>
                </h2>
                <p className="flex text-start text-[16px] text-[#1A2435] font-normal">


                  {isEditingOverallHealthSummary ? (
                    <>
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-col w-full"
                      >
                        <textarea
                          rows={4}
                          value={editableData?.reportSummary ?? ""}
                          onChange={(e) =>
                            handleInputChange(
                              "reportSummary",
                              0,
                              0,
                              null,
                              "reportSummary",
                              e.target.value
                            )
                          }
                          onBlur={(e) =>
                            handleBlurChange(
                              "reportSummary",
                              reportDataInfo?.reportInterpretation?.reportSummary,
                              e.target.value
                            )
                          }
                          className="border p-2 rounded text-[16px] w-full resize-none focus:outline-none focus:border-[#016B83]"
                        // placeholder="Enter health summary..."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {reportDataInfo?.reportInterpretation?.reportSummary}
                    </>
                  )}
                </p>
              </div>
            </section>
          )}

          {reportDataInfo?.reportInterpretation?.testsAndConditions?.length >
            0 && (
              <section className="mt-6 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                <div className="grid grid-cols-1 py-4 px-6 mt-6">
                  <div className="">
                    <div className="flex justify-between items-center mb-[21px]">
                      <h2 className="flex text-[24px] font-semibold text-[#1A2435] mb-[21px] text-start">
                        <span className="font-normal">Medical Conditions</span>
                      </h2>
                      {orgPermission?.allowPatientDataEdit &&
                        userData?.permissions.includes(
                          "allowPatientDataEdit"
                        ) && <TooltipProvider>
                          {!isEditingConditions ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Edit
                                  className="w-5 h-5 text-gray-300 cursor-pointer"
                                  onClick={() => handleToggleEdit("conditions", true)}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Edit</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CheckCircle2
                                  className="w-6 h-6 text-[#016B83] cursor-pointer"
                                  onClick={() => {
                                    handleSubmit(changes);
                                    handleToggleEdit("conditions", false);
                                  }}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Save</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TooltipProvider>}
                    </div>
                    <div>
                      {reportDataInfo?.reportInterpretation?.testsAndConditions
                        ?.length > 0 && (
                          <section className="mb-4">
                            <Accordion
                              type="multiple"
                              className="w-full"
                              value={openItems}
                              onValueChange={setOpenItems}
                            >
                              {loader ?
                                <div className="mb-4 shimmer-box">
                                  <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                                    <div className="rounded-full bg-gray-200 h-10 w-10 animate-pulse"></div>
                                    <div className="flex-1 space-y-4 py-1">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                      <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                                    <div className="flex-1 space-y-4 py-1">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                      <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-4 mt-4 w-2/4">
                                    <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    <div className="bg-white p-4 rounded-full w-1/2 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-4 py-6 px-6 mt-4 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                                    <div className="flex-1 space-y-4 py-1">
                                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                      <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                :


                                editableData.conditions?.map(
                                  (item: any, cIndex: number) => {
                                    const value = `condition-${cIndex}`
                                    return (
                                      <AccordionItem
                                        key={cIndex}
                                        value={value}
                                        className="data-[state=closed]:bg-[#fff] data-[state=open]:bg-[#016B8333] rounded-t-lg rounded-b-lg mb-[10px]"
                                      >
                                        <AccordionTrigger
                                          className="bg-[#F8F9FA] border border-[#EDEFF1] rounded-lg data-[state=open]:bg-[#CCE1E6] data-[state=open]:text-[#016B83] text-[#394557] pt-[11px] pb-[11px]"
                                          onClick={() => toggleItem(value)} // manually control open/close
                                        >

                                          <div className="w-full flex justify-between items-center">
                                            <div className="flex items-center">
                                              <span className="bg-[#fff] rounded-full w-7 h-7 flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]">
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
                                                </svg>
                                              </span>

                                              {isEditingConditions ? (
                                                <input
                                                  type="text"
                                                  value={item.name}
                                                  onChange={(e) =>
                                                    handleInputChange(
                                                      "conditions",
                                                      cIndex,
                                                      0,
                                                      null,
                                                      "condition",
                                                      e.target.value
                                                    )
                                                  }
                                                  onBlur={(e) =>
                                                    handleBlurChange(
                                                      "condition",
                                                      sortedConditions[cIndex].name,
                                                      e.target.value
                                                    )
                                                  }
                                                  onClick={(e) => e.stopPropagation()}
                                                  className="border border-gray-300 rounded px-2 py-1 ml-3 text-[18px] font-medium focus:outline-none focus:border-[#016B83]"
                                                />
                                              ) : (
                                                <p className="font-medium ml-3 text-[18px] mt-[1px]">
                                                  {item.name}
                                                </p>
                                              )}

                                              <span className="bg-[#EBECEE] text-xs font-medium text-[#8C929A] px-2 py-1.5 rounded-md ml-3">
                                                {item.status}
                                              </span>
                                            </div>

                                            <span className="text-sm hidden md:block">
                                              {item?.lastReportedDate &&
                                                moment(item.lastReportedDate).format("LL")}
                                            </span>
                                          </div>
                                        </AccordionTrigger>

                                        <AccordionContent
                                          className="text-[#394557] cursor-pointer"
                                          style={{ padding: "10px" }}
                                          onClick={(e) => {
                                            const target = e.target as HTMLElement
                                            if (
                                              target.closest("input") ||
                                              target.closest("button") ||
                                              target.closest("table") ||
                                              target.closest("tr") ||
                                              target.closest("td")
                                            ) {
                                              return // do nothing if clicking inside input/table
                                            }
                                            setOpenItems((prev) => prev.filter((v) => v !== value)) // close this accordion
                                          }}
                                        >
                                          <div className="rounded-lg overflow-hidden">
                                            {/* Metrics Table */}
                                            {item?.metrics?.length > 0 && (
                                              <div
                                                className={`rounded-lg bg-white ${item?.observations?.length > 0
                                                  ? "rounded-b-none border-b-0"
                                                  : ""
                                                  }`}
                                              >
                                                <table className="w-full text-left">
                                                  <tbody>
                                                    {item.metrics.map((metric: any, mIndex: number) => (
                                                      <tr
                                                        key={mIndex}
                                                        className="border-b last:border-0 [&:only-child]:border-0"
                                                      >
                                                        <td className="px-5 py-3 font-semibold w-[30%] text-gray-700">
                                                          {isEditingConditions ? (
                                                            <input
                                                              type="text"
                                                              value={metric.metric}
                                                              onChange={(e) =>
                                                                handleInputChange(
                                                                  "conditions",
                                                                  cIndex,
                                                                  0,
                                                                  mIndex,
                                                                  "metric",
                                                                  e.target.value
                                                                )
                                                              }
                                                              onBlur={(e) =>
                                                                handleBlurChange(
                                                                  "metric",
                                                                  sortedConditions[cIndex].metrics[mIndex]
                                                                    .metric,
                                                                  e.target.value
                                                                )
                                                              }
                                                              className="p-1 rounded w-full border border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                            />
                                                          ) : (
                                                            metric.metric
                                                          )}
                                                        </td>

                                                        <td className="px-4 py-2 text-gray-700 w-[20%]">
                                                          {isEditingConditions ? (
                                                            <>
                                                              <input
                                                                type="text"
                                                                value={
                                                                  editableMetrics?.conditions?.[cIndex]?.[
                                                                    mIndex
                                                                  ]?.[mIndex]?.value ?? metric.value
                                                                }
                                                                onChange={(e) =>
                                                                  handleMetricChange(
                                                                    "conditions",
                                                                    cIndex,
                                                                    mIndex,
                                                                    mIndex,
                                                                    "value",
                                                                    e.target.value
                                                                  )
                                                                }
                                                                onBlur={() =>
                                                                  handleMetricBlur(
                                                                    "conditions",
                                                                    cIndex,
                                                                    mIndex,
                                                                    mIndex,
                                                                    "value"
                                                                  )
                                                                }
                                                                className="border p-1 rounded w-[60px] border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                              />
                                                              <input
                                                                type="text"
                                                                value={
                                                                  editableMetrics?.conditions?.[cIndex]?.[
                                                                    mIndex
                                                                  ]?.[mIndex]?.unit ?? metric.unit
                                                                }
                                                                onChange={(e) =>
                                                                  handleMetricChange(
                                                                    "conditions",
                                                                    cIndex,
                                                                    mIndex,
                                                                    mIndex,
                                                                    "unit",
                                                                    e.target.value
                                                                  )
                                                                }
                                                                onBlur={() =>
                                                                  handleMetricBlur(
                                                                    "conditions",
                                                                    cIndex,
                                                                    mIndex,
                                                                    mIndex,
                                                                    "unit"
                                                                  )
                                                                }
                                                                className="border p-1 rounded w-[65px] border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                              />
                                                            </>
                                                          ) : (
                                                            <>
                                                              <span
                                                                className={`${metric.highRisk
                                                                  ? "text-[#f5604a]"
                                                                  : "text-gray-700"
                                                                  }`}
                                                              >
                                                                {metric.value}
                                                              </span>{" "}
                                                              {metric.unit}
                                                            </>
                                                          )}
                                                        </td>

                                                        <td className="px-4 py-2 text-[#8C929A] w-[30%]">
                                                          {isEditingConditions ? (
                                                            <input
                                                              type="text"
                                                              value={
                                                                editableMetrics?.conditions?.[cIndex]?.[
                                                                  mIndex
                                                                ]?.[mIndex]?.range ?? metric.range
                                                              }
                                                              onChange={(e) =>
                                                                handleMetricChange(
                                                                  "conditions",
                                                                  cIndex,
                                                                  mIndex,
                                                                  mIndex,
                                                                  "range",
                                                                  e.target.value
                                                                )
                                                              }
                                                              onBlur={() =>
                                                                handleMetricBlur(
                                                                  "conditions",
                                                                  cIndex,
                                                                  mIndex,
                                                                  mIndex,
                                                                  "range"
                                                                )
                                                              }
                                                              className="p-1 rounded w-full border border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                            />
                                                          ) : (
                                                            metric.range
                                                          )}
                                                        </td>
                                                        <td className="px-4 py-2 text-[#8C929A] text-start">
                                                          {/* {moment(metric.historicDate).format("LL")} */}
                                                          {metric?.historicDate ? moment(metric.historicDate).format("LL") : null}
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            )}

                                            {/* Observations */}
                                            {item?.observations?.length > 0 && (
                                              <div className="bg-white border rounded-lg rounded-t-none p-3 border-t-1 border-x-0 border-b-0">
                                                <ul className="pl-2 space-y-1">
                                                  {item.observations.map(
                                                    (observation: any, oIndex: number) => (
                                                      <li key={oIndex} className="text-start">
                                                        {isEditingConditions ? (
                                                          <input
                                                            type="text"
                                                            value={observation}
                                                            onChange={(e) =>
                                                              handleInputChange(
                                                                "conditions",
                                                                cIndex,
                                                                oIndex,
                                                                null,
                                                                "observation",
                                                                e.target.value
                                                              )
                                                            }
                                                            onBlur={(e) =>
                                                              handleBlurChange(
                                                                "observation",
                                                                sortedConditions[cIndex].observations[
                                                                oIndex
                                                                ],
                                                                e.target.value
                                                              )
                                                            }
                                                            className="p-1 rounded w-full border border-white focus:border-[rgb(1,87,106)] focus:outline-none"
                                                          />
                                                        ) : (
                                                          observation
                                                        )}
                                                      </li>
                                                    )
                                                  )}
                                                </ul>
                                              </div>
                                            )}
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>)
                                  }
                                )}
                            </Accordion>
                          </section>
                        )}
                    </div>
                  </div>
                </div>
              </section>
            )}
          {userData?.role != "client" && (
            <>
              {reportDataInfo?.reportInterpretation?.testsAndConditions
                ?.length > 0 &&
                reportDataInfo?.reportInterpretation?.testsAndConditions?.some(
                  (val: any) => val?.treatment !== null
                ) && (
                  <section className="mt-6 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                    <div className="grid grid-cols-1 p-6 mt-6">
                      <h2 className="flex text-[24px] font-semibold text-[#1A2435] text-start">
                        <span className="font-normal">Treatment</span>
                      </h2>
                      <ul className="mt-4 space-y-1 text-sm text-[#1A2435]">
                        {reportDataInfo?.reportInterpretation?.testsAndConditions?.map(
                          (item: any, index: number) => (
                            <li key={index}>
                              <p className="flex text-start text-[16px] text-[#1A2435] pb-3 font-normal">
                                {item.treatment}
                              </p>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </section>
                )}
            </>
          )}
          {userData?.role != "client" && (
            <>
              {reportDataInfo?.reportInterpretation?.aiMedicalInsights?.length >
                0 && (
                  <section className="mt-6 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-xl bg-white">
                    <div className="grid grid-cols-1 p-6 mt-6">
                      <h2 className="flex text-[24px] font-semibold text-[#1A2435] text-start">
                        <span className="font-normal"> Medistry Insights</span>
                      </h2>
                      <ul className="mt-4 space-y-1 text-sm text-[#1A2435]">
                        {reportDataInfo?.reportInterpretation?.aiMedicalInsights?.map(
                          (insight: any, index: number) => {
                            return (
                              <li key={index}>
                                <p className="flex text-start text-[16px] text-[#1A2435] pb-3 font-normal">
                                  {insight}
                                </p>
                              </li>
                            );
                          }
                        )}
                      </ul>
                    </div>
                  </section>
                )}
            </>
          )}

          <div className="flex justify-between pb-4 items-center mt-4 gap-4">
            {/* {userData?.role != "client" && ( */}
            {reportDataInfo?.deletedAt ? (
              <div></div>
            ) : (
              <AppButton
                className="-mt-0 w-2/4 md:w-auto transition !text-base !bg-[#f3f4f6] hover:!bg-white shadow-none"
                onClick={() => setDeleteModal(true)}
              >
                <span className="cursor-pointer text-[#ADB1B7]">
                  Delete Report
                </span>
              </AppButton>
            )}
            {/* )} */}
            <AppButton
              className="-mt-0 w-2/4 md:w-auto shadow-none hover:bg-gray-700 transition !text-base"
              onClick={() => handleOpenPdf()}
              disable={isLoadingUrl}
            >
              View Original Report
              <SquareArrowOutUpRight size={20} />
            </AppButton>
          </div>
          <AppDeleteDialog
            isLoading={deleteLoading}
            isOpen={deleteModal}
            title="Delete Report"
            description="Are you sure you want to delete this report ?"
            onConfirm={() => handleDelete()}
            onClose={() => setDeleteModal(false)}
          />
        </>
      )}
    </div>
  );
};

export default ReportSummary;
