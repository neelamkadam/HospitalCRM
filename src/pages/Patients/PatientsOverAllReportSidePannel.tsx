import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import AppButton from "../../components/AppButton";
import { ROUTES } from "../../constants/routesConstants";
import moment from "moment";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import MangementIcon from "../../assets/mangesment.svg";
import { cn, ConditionsStatusOrder } from "../../lib/utils";

interface PatientsOverAllReportSidePannelProps {
  isFullViewProfileShow?: boolean;
}

const PatientsOverAllReportSidePannel: React.FC<
  PatientsOverAllReportSidePannelProps
> = ({ isFullViewProfileShow = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const patientId = searchParams.get("id");
  // const healthSummary = searchParams.get("summary");
  const { getData: GetPatientApi, isLoading: loading } = useGetApi<any>("", {
    isToaster: false,
  });
  const [patientData, setPatientData] = useState<any>(null);
  console.log(
    "🚀 ~ PatientsOverAllReportSidePannel ~ patientData:",
    patientData
  );
  const sortedConditions = patientData?.conditions.sort((a: any, b: any) => {
    const indexA = ConditionsStatusOrder.indexOf(a.status);
    const indexB = ConditionsStatusOrder.indexOf(b.status);
    return (
      (indexA === -1 ? ConditionsStatusOrder?.length : indexA) -
      (indexB === -1 ? ConditionsStatusOrder?.length : indexB)
    );
  });
  const [selectedTab, setSelectedTab] = useState("All");

  useEffect(() => {
    // if (healthSummary == "true") {
    fetchPatientData();
    // }
  }, []);

  const fetchPatientData = async () => {
    const response: any = await GetPatientApi(
      `${API_CONSTANTS.OVERALL_PATIENTS_REPORT}/${patientId}`
    );
    if (response?.data.success) {
      setPatientData(response.data.overAllHealth);
    }
  };

  return (
    <>
      {/* {healthSummary == "false" ? (
        <div className="max-w-4xl bg-white text-gray-800 dark:bg-gray-800 dark:text-white rounded-lg">
          <section className="px-[15px] xl:px-[33px] py-[25px]">
            <h2 className="text-[32px] font-semibold text-[#1A2435]">
              <span className="ml-2 text-[#8C929A]">No EMR History Added</span>
            </h2>
          </section>
        </div>
      ) : ( */}
      <>
        {loading ? (
          <div className="shimmer-box">
            <div className="flex space-x-4 px-[15px] xl:px-[33px] py-[25px]">
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
            <div className="flex space-x-4 py-4 w-3/4 px-[15px] xl:px-[33px]">
              <div className="bg-white p-4 rounded-full w-1/2 border border-slate-200">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="bg-white p-4 rounded-full w-1/2 border border-slate-200">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="bg-white p-4 rounded-full w-1/2 border border-slate-200">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
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
          </div>
        ) : (
          <div className="max-w-4xl bg-white text-gray-800 dark:bg-gray-800 dark:text-white rounded-lg flex flex-col h-full">
            <section className="px-[15px] xl:px-[33px] py-[25px]">
              <h2 className="text-[32px] font-semibold text-[#1A2435]">
                {patientData?.clientId?.name}
                <span className="ml-2 text-[#8C929A]">
                  {Number(patientData?.clientId?.age) || 0},{" "}
                  {patientData?.clientId?.gender}
                </span>
              </h2>
            </section>

            <hr></hr>

            {/* Overall Health Summary */}
            {patientData?.overallHealthSummary && (
              <>
                <section className="px-[15px] xl:px-[33px] py-[25px]">
                  <h2 className="flex text-[24px] font-medium text-[#1A2435] mb-[12px]">
                    {/* <img src={GroupImage}></img>  */}
                    <span className="">Health Summary</span>
                  </h2>
                  <p className="text-[16px] leading-[22px] font-normal text-[#1A2435]">
                    {patientData?.overallHealthSummary ||
                      "No summary available."}
                  </p>
                </section>
                <hr></hr>
              </>
            )}

            <div className="px-[15px] xl:px-[33px] flex flex-wrap gap-2 mt-8 2xl:flex-nowrap">
              {(sortedConditions?.length > 0 ||
                patientData?.medicalHistory?.length > 0 ||
                patientData?.topInsights > 0) && (
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
              )}

              {patientData?.medicalHistory?.length > 0 && (
                <AppButton
                  className={`h-10 mt-0 rounded-3xl border flex justify-center shadow-none ${
                    selectedTab === "Medical History"
                      ? "!bg-[#CCE1E6] !text-[#016B83] !border-[#CCE1E6]"
                      : "!bg-white !text-[#666D79]"
                  }`}
                  onClick={() => setSelectedTab("Medical History")}
                >
                  Medical History
                </AppButton>
              )}
              {sortedConditions?.length > 0 && (
                <AppButton
                  className={`h-10 mt-0 rounded-3xl border flex justify-center shadow-none ${
                    selectedTab === "Medical Conditions"
                      ? "!bg-[#CCE1E6] !text-[#016B83] !border-[#CCE1E6]"
                      : "!bg-white !text-[#666D79]"
                  }`}
                  onClick={() => setSelectedTab("Medical Conditions")}
                >
                  Tests & Conditions
                </AppButton>
              )}
              {patientData?.topInsights > 0 && (
                <AppButton
                  className={`h-10 w-20 mt-0 rounded-3xl border flex justify-center shadow-none ${
                    selectedTab === "Medical Insights"
                      ? "!bg-[#CCE1E6] !text-[#016B83] !border-[#CCE1E6]"
                      : "!bg-white !text-[#666D79]"
                  }`}
                  onClick={() => setSelectedTab("Medical Insights")}
                >
                  Insights
                </AppButton>
              )}
            </div>

            {/* Medical History */}
            {(selectedTab === "All" || selectedTab === "Medical History") &&
              patientData?.medicalHistory?.length > 0 && (
                <>
                  <section className="px-[15px] xl:px-[33px] py-[25px]">
                    <h2 className="flex text-[24px] font-medium text-[#1A2435]">
                      {/* <img src={GroupImage}></img> */}
                      <span className="mb-2">Medical History</span>
                    </h2>
                    <ol className="relative border-s-[2px] border-[#4993A4] ml-1">
                      {patientData?.medicalHistory?.map(
                        (history: any, historyIndex: number) => (
                          <li key={historyIndex} className="mb-3 ms-4">
                            <div className="flex">
                              <div className="absolute w-3 h-3 bg-[#4993A4] rounded-full ml-[-23px] mt-[1px] border border-[#4993A4] dark:border-gray-900 dark:bg-gray-700"></div>
                              <time className="block my-2 mt-[-0px] text-sm font-medium leading-none text-[#016B83] !text-start">
                                {moment(
                                  history?.reportIdentification?.reportDate
                                ).format("LL")}
                              </time>
                            </div>

                            {history?.testsAndConditions?.map(
                              (item: any, conditionIndex: number) => {
                                return (
                                  <Accordion
                                    type="multiple"
                                    className={`w-full ${
                                      conditionIndex ===
                                      history?.testsAndConditions?.length - 1
                                        ? "mb-4"
                                        : "mb-2"
                                    }`}
                                  >
                                    <AccordionItem
                                      value={`item-${historyIndex}`}
                                    >
                                      <AccordionTrigger className="bg-white data-[state=open]:bg-[#CCE1E6] rounded-t-lg  data-[state=open]:text-[#016B83] text-[#394557] py-2">
                                        <div className="flex flex-col text-start">
                                          <p className="text-[16px] font-semibold">
                                            {item.name}
                                          </p>
                                          <p className="text-[14px] dark:text-gray-400 font-normal  !text-[#394557]">
                                            {item.quickSummary}
                                          </p>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent className="text-[#394557] bg-[#CCE1E6]  rounded-b-lg">
                                        <>
                                          <div className="rounded-lg overflow-hidden">
                                            <div
                                              key={conditionIndex}
                                              className=""
                                            >
                                              {item?.metrics?.length > 0 && (
                                                <div
                                                  className={cn(
                                                    "rounded-lg bg-white",
                                                    item?.observations?.length >
                                                      0 && "rounded-b-none"
                                                  )}
                                                >
                                                  <table className="w-full text-left border-collapse overflow-hidden rounded-lg">
                                                    <tbody>
                                                      {item?.metrics?.map(
                                                        (
                                                          metricItem: any,
                                                          metricIndex: number
                                                        ) => (
                                                          <tr
                                                            key={metricIndex}
                                                            className="bg-white text-[14px] border-b last:border-0 [&:only-child]:border-0"
                                                          >
                                                            <td className="px-3 md:px-4 py-2 text-[#394557] font-semibold w-[32%]">
                                                              {
                                                                metricItem?.metric
                                                              }
                                                            </td>
                                                            <td className="px-3 md:px-4 py-2 text-semibold text-gray-700 w-[32%]">
                                                              <span
                                                                className={`${
                                                                  metricItem.highRisk ===
                                                                  true
                                                                    ? " text-[#f5604a]"
                                                                    : " text-gray-700 hover:bg-gray-100"
                                                                }`}
                                                              >
                                                                {
                                                                  metricItem?.value
                                                                }
                                                              </span>{" "}
                                                              {metricItem.unit}
                                                            </td>
                                                            <td className="px-3 md:px-4 py-2 text-[#8C929A]">
                                                              {
                                                                metricItem?.range
                                                              }
                                                            </td>
                                                          </tr>
                                                        )
                                                      )}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              )}
                                            </div>

                                            {item?.observations?.length > 0 && (
                                              <div className="bg-white border rounded-lg rounded-t-none p-3 border-t-1 border-x-0 border-b-0">
                                                <ul className="pl-1 space-y-1">
                                                  {item?.observations.map(
                                                    (
                                                      observation: any,
                                                      observationIndex: number
                                                    ) => (
                                                      <li
                                                        key={observationIndex}
                                                        className="pb-2 last:pb-0"
                                                      >
                                                        {observation}
                                                      </li>
                                                    )
                                                  )}
                                                </ul>
                                              </div>
                                            )}
                                          </div>
                                          {item?.treatment && (
                                            <div className="text-start pt-2">
                                              <p className="font-medium text-[#394557] flex">
                                                <img
                                                  src={MangementIcon}
                                                  className="w-5 h-5 mr-1"
                                                  alt="Management Icon"
                                                />
                                                <span className="font-semibold">
                                                  Treatment:{" "}
                                                  <span className="font-normal ml-1">
                                                    {item?.treatment}
                                                  </span>
                                                </span>
                                              </p>
                                            </div>
                                          )}
                                        </>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </Accordion>
                                );
                              }
                            )}
                          </li>
                        )
                      )}
                    </ol>
                  </section>
                  <hr></hr>
                </>
              )}

            {/*Known Condition */}
            {(selectedTab === "All" || selectedTab === "Medical Conditions") &&
              sortedConditions?.length > 0 && (
                <>
                  <section className="px-[15px] xl:px-[33px] py-[25px]">
                    <h2 className="flex text-[24px] font-medium text-[#1A2435] mb-[12px]">
                      {/* <img src={GroupImage}></img> */}
                      <span className="">Tests & Conditions</span>
                    </h2>
                    <Accordion
                      type="multiple"
                      className="w-full overflow-hidden overflow-x-auto"
                    >
                      {sortedConditions?.map((item: any, index: number) => {
                        return (
                          <AccordionItem
                            key={`item-${index}`}
                            value={`item-${index}`}
                            className="data-[state=closed]:bg-[#fff] data-[state=open]:bg-[#CCE1E6] rounded-t-lg  rounded-b-lg w-full"
                            style={{ marginBottom: "10px" }}
                          >
                            <AccordionTrigger className="bg-[#F8F9FA] border border-[#EDEFF1] rounded-lg data-[state=open]:bg-[#CCE1E6] data-[state=open]:text-[#016B83] text-[#394557] pt-[11px] pb-[11px]">
                              <div className="w-full flex row justify-between">
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
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M6.66666 2.66668C6.29847 2.66668 5.99999 2.96515 5.99999 3.33334V4.00001C5.99999 4.3682 5.70151 4.66668 5.33332 4.66668C4.96513 4.66668 4.66666 4.3682 4.66666 4.00001V3.33334C4.66666 2.22877 5.56209 1.33334 6.66666 1.33334H9.33332C10.4379 1.33334 11.3333 2.22877 11.3333 3.33334V4.00001C11.3333 4.3682 11.0348 4.66668 10.6667 4.66668C10.2985 4.66668 9.99999 4.3682 9.99999 4.00001V3.33334C9.99999 2.96515 9.70151 2.66668 9.33332 2.66668H6.66666Z"
                                        fill="#8C929A"
                                      />
                                    </svg>
                                  </span>
                                  <p className="font-medium ml-3 items-center justify-center text-[14px] md:text-[18px]">
                                    {item?.name}
                                  </p>
                                  <span className="bg-[#EBECEE] text-xs font-normal text-[#8C929A] px-2 py-[2px] leading-5 rounded-md ml-3 md:mt-1">
                                    {item?.status}
                                  </span>
                                </div>
                              </div>
                            </AccordionTrigger>

                            <AccordionContent className="text-[#394557]">
                              <div className="rounded-lg overflow-hidden">
                                {item?.metrics?.length > 0 && (
                                  <div
                                    className={cn(
                                      "border-0 rounded-lg bg-white overflow-x-auto",
                                      item?.observations?.length > 0 &&
                                        "rounded-b-none border-b-0"
                                    )}
                                  >
                                    <table className="w-full text-left overflow-hidden">
                                      <tbody>
                                        {item?.metrics?.map(
                                          (
                                            metricItem: any,
                                            metricIndex: number
                                          ) => {
                                            return (
                                              <tr
                                                key={`${index}-${metricIndex}`}
                                                className="border-b last:border-0 [&:only-child]:border-0"
                                              >
                                                <td
                                                  className="px-3 md:px-5 py-3 text-gray-700 w-[32%] font-semibold"
                                                  style={{ fontSize: "400" }}
                                                >
                                                  {metricItem?.metric}
                                                </td>
                                                <td className="px-3 md:px-4 py-2 text-semibold text-gray-700 w-[32%]">
                                                  <span
                                                    className={`${
                                                      metricItem.highRisk ===
                                                      true
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
                                                {/* <td className="px-4 py-2 text-gray-700">
                                                {metricItem?.riskLevel}
                                           </td> */}
                                              </tr>
                                            );
                                          }
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                )}

                                {item?.observations?.length > 0 && (
                                  <div className="bg-white border rounded-lg rounded-t-none p-3 border-t-1 border-x-0 border-b-0">
                                    <ul className="pl-2 space-y-1">
                                      {item.observations.map(
                                        (
                                          observation: any,
                                          observationIndex: number
                                        ) => (
                                          <li
                                            key={observationIndex}
                                            className="pb-2 last:pb-0"
                                          >
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
                        );
                      })}
                    </Accordion>
                  </section>
                </>
              )}

            {(selectedTab === "All" || selectedTab === "Medical Insights") &&
              patientData?.topInsights > 0 && (
                <section className="px-[15px] xl:px-[33px] py-[25px]">
                  <h2 className="flex text-[24px] font-medium text-[#1A2435] mb-[12px]">
                    {/* <img src={GroupImage}></img>  */}
                    <span className="">Medistry Insights</span>
                  </h2>
                  <ul className="space-y-1 text-[16px] font-normal text-[#394557] leading-22">
                    {patientData?.topInsights?.map(
                      (insight: any, index: number) => {
                        return (
                          <li className="mb-4" key={index}>
                            {insight.insight}
                          </li>
                        );
                      }
                    )}
                  </ul>
                </section>
              )}

            {/* Footer */}
            {isFullViewProfileShow && (
              <footer className="mt-auto flex justify-end px-[15px] xl:px-[33px] pb-[25px]">
                <AppButton
                  className="px-4 py-2 mt-0 rounded-full shadow-md text-white w-full"
                  onClick={() =>
                    navigate(
                      `${ROUTES.PATIENTS_OVERALL_HEALTH}?id=${patientId}`
                    )
                  }
                >
                  <p className="text-base">View Full Profile</p>
                </AppButton>
              </footer>
            )}
          </div>
        )}
      </>
      {/* )} */}
    </>
  );
};

export default PatientsOverAllReportSidePannel;
