import { useState, useMemo } from "react";
import moment from "moment";
import AppButton from "./AppButton";
import { Checkbox } from "./ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { cn } from "../utils/common-utils";
import API_CONSTANTS from "../constants/apiConstants";
import { ENV_VARIABLES } from "../services/config";

interface AppDialogProps {
  reportDataInfo: Record<string, any>;
  togglePatientsDownloadClose: any;
}

const PatienDownloadData = ({
  reportDataInfo,
  togglePatientsDownloadClose,
}: AppDialogProps) => {
  const options = [
    { key: "overallHealthSummary", label: "Health Summary" },
    { key: "medicalHistory", label: "Medical History" },
  ];

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<Set<string>>(
    new Set()
  );
  const [isDownloading, setIsDownloading] = useState(false);

  // Collect all conditionIds for medical history
  const allConditionIds = useMemo(() => {
    const ids = new Set<string>();
    reportDataInfo?.medicalHistory?.forEach(
      (history: any, historyIndex: number) => {
        history.testsAndConditions.forEach((_: any, conditionIndex: number) => {
          ids.add(`${historyIndex}-${conditionIndex}`);
        });
      }
    );
    return ids;
  }, [reportDataInfo]);

  // Get parent state for medicalHistory (checked / indeterminate / unchecked)
  const medicalHistoryParentState = useMemo(() => {
    if (selectedConditions.size === 0) return false; // unchecked
    if (selectedConditions.size === allConditionIds.size) return true; // fully checked
    return "indeterminate"; // partially checked
  }, [selectedConditions, allConditionIds]);

  // Toggle top-level option
  const handleToggle = (key: string) => {
    if (key === "medicalHistory") {
      if (medicalHistoryParentState === true) {
        // remove parent and all children
        setSelectedKeys((prev) =>
          prev.filter((item) => item !== "medicalHistory")
        );
        setSelectedConditions(new Set());
      } else {
        // add parent and all children
        if (!selectedKeys.includes("medicalHistory")) {
          setSelectedKeys((prev) => [...prev, "medicalHistory"]);
        }
        setSelectedConditions(new Set(allConditionIds));
      }
    } else {
      // for other top-level options
      setSelectedKeys((prev) =>
        prev.includes(key)
          ? prev.filter((item) => item !== key)
          : [...prev, key]
      );
    }
  };

  // Toggle all top-level
  const handleToggleAll = () => {
    if (
      selectedKeys.includes("overallHealthSummary") &&
      medicalHistoryParentState === true
    ) {
      setSelectedKeys([]);
      setSelectedConditions(new Set());
    } else {
      setSelectedKeys(options.map((o) => o.key));
      setSelectedConditions(new Set(allConditionIds));
    }
  };

  // Toggle individual condition
  const toggleCondition = (conditionId: string) => {
    setSelectedConditions((prev) => {
      const updated = new Set(prev);
      if (updated.has(conditionId)) {
        updated.delete(conditionId);
      } else {
        updated.add(conditionId);
      }
      return updated;
    });

    // ensure parent medicalHistory is in selectedKeys when any child is checked
    setSelectedKeys((prev) => {
      if (!prev.includes("medicalHistory")) {
        return [...prev, "medicalHistory"];
      }
      return prev;
    });
  };

  // Handle download
  const handleDownload = async () => {
    const finalData: Record<string, any> = {};

    if (
      selectedKeys.includes("overallHealthSummary") &&
      reportDataInfo.overallHealthSummary
    ) {
      finalData["overallHealthSummary"] = reportDataInfo.overallHealthSummary;
    }

    if (
      selectedKeys.includes("medicalHistory") &&
      reportDataInfo.medicalHistory
    ) {
      finalData["medicalHistory"] = reportDataInfo.medicalHistory
        .map((history: any, historyIndex: number) => ({
          ...history,
          testsAndConditions: history.testsAndConditions.filter(
            (_: any, conditionIndex: number) =>
              selectedConditions.has(`${historyIndex}-${conditionIndex}`)
          ),
        }))
        .filter((h: any) => h.testsAndConditions.length > 0);
    }

    // wrap in "data" with clientId
    const FinalDataToSend = {
      data: {
        ...finalData,
        clientId: reportDataInfo?.clientId,
      },
    };
    try {
      setIsDownloading(true);
      const response = await fetch(
        `${ENV_VARIABLES.API_BASE}${API_CONSTANTS.PATIENTS.DOWNLOAD_PATIENT_DATA}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify(FinalDataToSend),
        }
      );

      togglePatientsDownloadClose();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      console.log("Response content-type:", contentType);

      const fileName = `${
        reportDataInfo?.clientId?.name || "Patient"
      } Health Report.pdf`;

      if (contentType?.includes("application/pdf")) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Handle JSON response with PDF data
        const jsonData = await response.json();
        if (
          jsonData?.data &&
          typeof jsonData.data === "string" &&
          jsonData.data.startsWith("%PDF")
        ) {
          const uint8Array = new Uint8Array(jsonData.data.length);
          for (let i = 0; i < jsonData.data.length; i++) {
            uint8Array[i] = jsonData.data.charCodeAt(i);
          }
          const blob = new Blob([uint8Array], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-4 py-2 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Share Your Medical History
        </h2>
        <p className="text-gray-600 text-xs sm:text-sm mt-1">
          Select what you want to share with your Patient
        </p>
      </div>

      {/* Top-level checkboxes */}
      <div className="space-y-3 mt-3 px-4">
        {/* All option */}
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={
              selectedKeys.includes("overallHealthSummary") &&
              medicalHistoryParentState === true
            }
            onCheckedChange={handleToggleAll}
            className="mt-0.5 w-4 h-4 cursor-pointer data-[state=checked]:bg-medistryColor data-[state=checked]:border-medistryColor"
          />
          <span
            className="font-medium text-gray-700 cursor-pointer"
            onClick={handleToggleAll}
          >
            All
          </span>
        </div>

        {/* Dynamic options */}
        {options.map((option) => (
          <div key={option.key} className="flex items-center space-x-2">
            <Checkbox
              checked={
                option.key === "medicalHistory"
                  ? medicalHistoryParentState
                  : selectedKeys.includes(option.key)
              }
              onCheckedChange={() => handleToggle(option.key)}
              className="mt-0.5 w-4 h-4 cursor-pointer data-[state=checked]:bg-medistryColor data-[state=checked]:border-medistryColor"
            />
            <span
              className="font-medium text-gray-700 cursor-pointer"
              onClick={() => handleToggle(option.key)}
            >
              {option.label}
            </span>
          </div>
        ))}
      </div>

      {/* Medical History conditions */}
      <div className="bg-white m-4 !mb-0 rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden shadow-sm flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white">
        <div className="p-4 sm:p-4">
          <div className="relative border-s-[2px] border-[#4993A4]">
            {reportDataInfo?.medicalHistory?.map(
              (history: any, historyIndex: number) => (
                <li key={historyIndex} className="ms-4 text-[white]">
                  <div className="flex">
                    <div className="absolute w-3 h-3 bg-[#4993A4] rounded-full ml-[-22.5px] mt-[1px] border border-[#4993A4] dark:border-gray-900 dark:bg-gray-700"></div>
                    <time className="block my-2 mt-[-0px] text-sm font-normal leading-none text-[#016B83] !text-start">
                      {moment(history?.reportIdentification?.reportDate).format(
                        "LL"
                      )}
                    </time>
                  </div>

                  {history.testsAndConditions.map(
                    (item: any, conditionIndex: number) => {
                      const conditionId = `${historyIndex}-${conditionIndex}`;

                      return (
                        <Accordion
                          key={conditionId}
                          type="multiple"
                          className="w-full"
                          style={{ marginBottom: "10px" }}
                        >
                          <AccordionItem
                            value={`item-${historyIndex}-${conditionIndex}`}
                          >
                            {/* Accordion Header with checkbox */}
                            <AccordionTrigger className="bg-white data-[state=open]:bg-[#016B8333] data-[state=open]:text-[#016B83] text-[#394557] rounded-t-lg py-2">
                              <div className="flex items-start gap-3 text-start w-full">
                                {/* Condition checkbox */}
                                <Checkbox
                                  id={`condition-${conditionId}`}
                                  checked={selectedConditions.has(conditionId)}
                                  onCheckedChange={() =>
                                    toggleCondition(conditionId)
                                  }
                                  onClick={(e) => e.stopPropagation()} // ⬅️ prevent accordion toggle
                                  className="mt-1 w-4 h-4 data-[state=checked]:bg-medistryColor data-[state=checked]:border-medistryColor"
                                />

                                <div className="flex flex-col">
                                  <p className="font-semibold text-[14px]">
                                    {item.name}
                                  </p>
                                  <p className="text-[12px] !text-[#394557] dark:text-gray-400 font-normal">
                                    {item.quickSummary}
                                  </p>
                                </div>
                              </div>
                            </AccordionTrigger>

                            {/* Accordion Content */}
                            <AccordionContent className="text-[#394557] bg-[#CCE1E6] rounded-b-lg">
                              <div className="rounded-lg overflow-hidden">
                                {item?.metrics?.length > 0 && (
                                  <div
                                    className={cn(
                                      "rounded-lg bg-white",
                                      item?.observations?.length > 0 &&
                                        "rounded-b-none"
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
                                              <td className="px-4 py-2 text-[#394557] font-semibold w-[40%]">
                                                {metricItem?.metric}
                                              </td>
                                              <td className="px-4 py-2 text-semibold text-gray-700 w-[32%]">
                                                <span
                                                  className={`${
                                                    metricItem.highRisk
                                                      ? " text-[#f5604a]"
                                                      : " text-gray-700 hover:bg-gray-100"
                                                  }`}
                                                >
                                                  {metricItem?.value}
                                                </span>{" "}
                                                {metricItem.unit}
                                              </td>
                                              <td className="px-4 py-2 text-[#8C929A]">
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
                                    <ul className="pl-1 space-y-1 text-start">
                                      {item?.observations.map(
                                        (
                                          observation: any,
                                          observationIndex: number
                                        ) => (
                                          <li key={observationIndex}>
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
                                      className="w-5 h-5 mr-2"
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
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      );
                    }
                  )}
                </li>
              )
            )}
          </div>

          {reportDataInfo?.medicalHistory?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-2">No medical history records found</p>
            </div>
          )}
        </div>
      </div>

      <div className="m-4">
        <AppButton
          disable={isDownloading || selectedKeys.length === 0}
          label={isDownloading ? "Downloading..." : "Download"}
          type="button"
          onClick={handleDownload}
          className="w-full mt-0"
        />
      </div>
    </div>
  );
};

export default PatienDownloadData;
