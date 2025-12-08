import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetApi, usePostApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import moment from "moment";
import AppButton from "../../components/AppButton";
import { ROUTES } from "../../constants/routesConstants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { CalendarDays, SquareArrowOutUpRight } from "lucide-react";
import { cn } from "../../utils/common-utils";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import { useAppSelector } from "../../redux/store";

interface HealthReportSidePannelProps {
  selectedReportId?: string | null;
}

const HealthReportSidePannel: React.FC<HealthReportSidePannelProps> = ({ selectedReportId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const reportId = selectedReportId ? selectedReportId : searchParams.get("id");
  console.log("🚀 ~ HealthReportSidePannel ~ reportId:", reportId);

  const { getData: GetReportApi, isLoading: loading } = useGetApi<any>("");
  const [reportDataInfo, setReportDataInfo] = useState<any>([]);
  const { userData } = useAppSelector((state: any) => state.authData);
  const { postData: getPresigned, isLoading: isLoadingUrl } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.REPORT_PRESIGNED_URL,
    });

  // Fetch reports data
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
  };

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Content Area */}
      <div className="flex-1 w-full">
        {loading ? (
          <div className="mt-4 shimmer-box">
            {/* Shimmer content */}
            <div className="flex space-x-4 mt-4 px-[15px] xl:px-[33px] py-[25px]">
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
            <hr />
            <div className="flex space-x-4 px-[15px] xl:px-[33px] py-[25px]">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            </div>
            <hr />
            <div className="flex space-x-4 px-[15px] xl:px-[33px] py-[25px]">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            </div>
            <hr />
          </div>
        ) : (
          <section className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg gap-2">
            {/* Report Header */}
            <div className="px-[15px] xl:px-[33px] py-[25px]">
              <h2 className="text-[26px] font-medium text-[#1A2435]">
                {reportDataInfo?.reportInterpretation?.reportTitle}
              </h2>

              <div className="flex-wrap gap-2 text-xl mt-1 text-[22px] font-normal text-[#394557] mb-[9px] flex items-center">
                <span className="text-[24px] font-normal text-[#1A2435] ">
                  {reportDataInfo?.clientId?.name}
                </span>
                <span className="text-[#8C929A] text-[24px] font-normal ">
                  {Number(reportDataInfo?.clientId?.age) || 0},{" "}
                  {reportDataInfo?.clientId?.gender || "N/A"}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-[#8C929A] text-base mt-2">
                <div className="flex items-center gap-2">
                  <CalendarDays size={20} />
                  {moment(
                    reportDataInfo?.reportInterpretation?.reportIdentification
                      ?.reportDate
                  ).format("LL")}
                </div>
              </div>

              <p className="text-base text-[#8C929A] font-normal pt-2">
                Ordering Physician :{" "}
                <span className="font-normal text-[#666D79]">
                  {
                    reportDataInfo?.reportInterpretation?.reportIdentification
                      ?.orderingPhysician?.name
                  }
                </span>
              </p>
            </div>
            <hr />

            {/* Report Summary */}
            {reportDataInfo?.reportInterpretation?.reportSummary && (
              <>
                <section className="px-[15px] xl:px-[33px] py-[25px]">
                  <h2 className="text-[24px] font-normal text-[#1A2435] mb-[9px] flex items-center gap-2">
                    Report Summary
                  </h2>
                  <p className="text-base/6 text-[#1A2435] space-y-1 leading-22">
                    {reportDataInfo?.reportInterpretation?.reportSummary ||
                      "No summary available."}
                  </p>
                </section>
                <hr />
              </>
            )}

            {/* Tests & Conditions */}
            {reportDataInfo?.reportInterpretation?.testsAndConditions?.length >
              0 && (
                <>
                  <section className="px-[15px] xl:px-[33px] py-[25px]">
                    <h2 className="flex text-[24px] font-semibold text-[#1A2435] mb-[19px]">
                      <span className="font-normal">Tests & Conditions</span>
                    </h2>
                    <Accordion type="multiple" className="w-full">
                      {reportDataInfo?.reportInterpretation?.testsAndConditions?.map(
                        (item: any, index: number) => (
                          <AccordionItem
                            value={`item-${index}`}
                          className="data-[state=closed]:bg-[#fff] data-[state=open]:bg-[#016B8333] rounded-t-lg rounded-b-lg"
                          style={{ marginBottom: "10px" }}
                          >
                          <AccordionTrigger className="bg-[#F8F9FA] border border-[#EDEFF1] rounded-lg data-[state=open]:bg-[#CCE1E6] data-[state=open]:text-[#016B83] text-[#394557] pt-[11px] pb-[11px] ">
                              <div className="w-full flex row justify-between items-center">
                                <div className="flex items-center">
                                  <span className="bg-[#fff] rounded-full w-6 h-6 flex items-center justify-center">
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
                                  <p className="font-semibold ml-2 items-center justify-center text-[18px] mt-[1px]">
                                    {item?.name}
                                  </p>
                                  <span className="bg-[#EBECEE] text-xs font-normal text-[#8C929A] px-2 py-[2px] leading-5 rounded-md ml-3 md:mt-1">
                                    {item?.status}
                                  </span>
                                </div>
                              </div>
                            </AccordionTrigger>

                            <AccordionContent
                              className="text-[#394557]"
                              style={{ padding: "10px" }}
                            >
                              <div className="rounded-lg overflow-hidden">
                                {item?.metrics?.length > 0 && (
                                  <div
                                    className={cn(
                                      "rounded-lg bg-white",
                                      item?.observations.length > 0 &&
                                      "rounded-b-none"
                                    )}
                                  >
                                    <table className="w-full text-left overflow-hidden">
                                      <tbody>
                                        {item?.metrics?.map(
                                          (metricItem: any, metricIndex: number) => (
                                            <tr
                                              key={`${index}-${metricIndex}`}
                                              className="border-b last:border-0 [&:only-child]:border-0"
                                            >
                                              <td className="px-3 md:px-5 py-3 text-gray-700 font-semibold">
                                                {metricItem?.metric}
                                              </td>
                                              <td className="px-3 md:px-4 py-2 text-semibold text-gray-700">
                                                <span
                                                  className={`${metricItem.highRisk === true
                                                      ? " text-[#f5604a]"
                                                      : " text-gray-700 hover:bg-gray-100"
                                                    }`}
                                                >
                                                  {metricItem?.value}
                                                </span>{" "}
                                                {metricItem.unit}
                                              </td>
                                              <td className="px-3 md:px-4 py-2 text-[#8C929A]">
                                                {metricItem?.range}
                                              </td>
                                            </tr>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                                {item?.observations?.length > 0 && (
                                  <div className="bg-white border rounded-lg rounded-t-none p-3 border-t-1 border-x-0 border-b-0">
                                    <ul className="pl-1 space-y-1">
                                      {item?.observations.map(
                                        (observation: any, observationIndex: number) => (
                                          <li key={observationIndex} className="pb-2 last:pb-0">
                                            {observation}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )
                      )}
                    </Accordion>
                  </section>
                  {!userData?.role?.includes("client") && <hr />}
                </>
              )}
            {userData?.role !== "client" &&
              reportDataInfo?.reportInterpretation?.testsAndConditions?.length >
              0 &&
              reportDataInfo?.reportInterpretation?.testsAndConditions?.some(
                (val: any) => val?.treatment !== null
              ) && (
                <>
                  <section className="px-[15px] md:px-[33px] py-[25px]">
                    <h2 className="text-[24px] font-normal text-[#1A2435] mb-[9px] flex items-center gap-2">
                      Treatment
                    </h2>
                    <ul className="space-y-1 text-base/6 text-[#1A2435]">
                      {reportDataInfo?.reportInterpretation?.testsAndConditions?.map(
                        (item: any, index: number) =>
                          item?.treatment && (
                            <li key={index} className="pb-2">
                              {item?.treatment}
                            </li>
                          )
                      )}
                    </ul>
                  </section>
                  <hr />
                </>
              )}
            {!userData?.role?.includes("client") && (
              <section className="px-[15px] xl:px-[33px] py-[25px]">
                <h2 className="text-[24px] font-normal text-[#1A2435] mb-[9px] flex items-center gap-2">
                  Medistry Insights
                </h2>
                {reportDataInfo?.reportInterpretation?.aiMedicalInsights
                  ?.length > 0 ? (
                  <ul className="space-y-1 text-base/6 text-[#1A2435]">
                    {reportDataInfo?.reportInterpretation?.aiMedicalInsights?.map(
                      (insight: any, index: number) => {
                        return (
                          <li key={index} className="pb-2">
                            {insight}
                          </li>
                        );
                      }
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-[#394557]">
                    {/* No Al Insight history available. */}
                  </p>
                )}
              </section>
            )}
          </section>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="md:flex justify-between px-[15px] xl:px-[33px] pb-[25px]">
        <AppButton
          className="!bg-[#01576A] text-white px-4 py-2 rounded-full shadow-md w-full mt-0 mb-4 md:mb-0"
          onClick={() =>
            navigate(
              `${ROUTES.REPORT_SUMMARY}?id=${reportDataInfo?.reportInterpretation?.reportId}`
            )
          }
        >
          View Full Report
        </AppButton>

        <AppButton
          className="!bg-[#01576A] px-4 py-2 rounded-full shadow-md w-full md:ml-2 mt-0"
          onClick={() => handleOpenPdf()}
          disable={isLoadingUrl}
        >
          View Original Report
          <SquareArrowOutUpRight size={20} />
        </AppButton>
      </div>
    </div>
  );
};

export default HealthReportSidePannel;
