import AppButton from "./AppButton";
import moment from "moment";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { Checkbox } from "./ui/checkbox";
import { useMemo } from "react";

interface AcceptDoctorrequestProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onAccept: any;
  medicalConditionLoading: boolean;
  reportDataInfo: any;
  patientRequestLoading: any;
  selectedConditions: Set<string>;
  setSelectedConditions: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const AcceptDoctorrequest: React.FC<AcceptDoctorrequestProps> = ({
  setIsModalOpen,
  onAccept,
  medicalConditionLoading,
  reportDataInfo,
  patientRequestLoading,
  selectedConditions,
  setSelectedConditions,
}) => {
  // Get all condition IDs
  const allConditionIds = useMemo(() => {
    if (!reportDataInfo?.medicalHistory) return [];

    const ids: string[] = [];
    reportDataInfo.medicalHistory.forEach(
      (history: any, historyIndex: number) => {
        history.testsAndConditions.forEach((_: any, conditionIndex: number) => {
          ids.push(`${historyIndex}-${conditionIndex}`);
        });
      }
    );
    return ids;
  }, [reportDataInfo]);

  // Check if all conditions are selected
  const isAllSelected = useMemo(() => {
    return (
      allConditionIds.length > 0 &&
      allConditionIds.every((id) => selectedConditions.has(id))
    );
  }, [allConditionIds, selectedConditions]);

  // Check if some conditions are selected (for indeterminate state)
  const isSomeSelected = useMemo(() => {
    return allConditionIds.some((id) => selectedConditions.has(id));
  }, [allConditionIds, selectedConditions]);

  const toggleCondition = (id: string) => {
    setSelectedConditions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedConditions(() => {
      if (isAllSelected) {
        // Deselect all
        return new Set();
      } else {
        // Select all
        return new Set(allConditionIds);
      }
    });
  };

  return (
    <div className="max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Share Your Medical History
        </h2>
        <p className="text-gray-600 text-xs sm:text-sm mt-1">
          Select what you want to share with your doctor
        </p>
      </div>

      <div className="p-4 sm:p-6 flex-1 overflow-hidden flex flex-col">
        <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
              {/* <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600"
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
                Medical History
              </h3> */}

              {/* Select All Checkbox */}
              {!medicalConditionLoading && allConditionIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={
                      isAllSelected
                        ? true
                        : isSomeSelected
                        ? "indeterminate"
                        : false
                    }
                    onCheckedChange={handleSelectAll}
                    className="w-5 h-5 data-[state=checked]:bg-medistryColor data-[state=checked]:border-medistryColor"
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Select All
                  </label>
                </div>
              )}
            </div>

            {medicalConditionLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4993A4]"></div>
              </div>
            )}

            {!medicalConditionLoading && (
              <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden shadow-sm flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white">
                <div className="p-4 sm:p-4">
                  <div className="relative border-s-[2px] border-[#4993A4]">
                    {reportDataInfo?.medicalHistory?.map(
                      (history: any, historyIndex: number) => (
                        <div key={historyIndex} className="pb-4 relative">
                          <div className="flex items-start">
                            {/* Timeline dot */}
                            <div className="absolute left-[-7px] mt-1.5 w-3 h-3 bg-[#4993A4] rounded-full border border-[#4993A4] dark:border-gray-900 dark:bg-gray-700"></div>

                            <div className="ml-3 sm:ml-5 flex-1">
                              <time className="text-xs text-medistryColor">
                                {moment(
                                  history?.reportIdentification?.reportDate
                                ).format("LL")}
                              </time>

                              <div className="mt-1 space-y-3">
                                {history.testsAndConditions.map(
                                  (item: any, conditionIndex: number) => {
                                    const conditionId = `${historyIndex}-${conditionIndex}`;
                                    return (
                                      <div
                                        key={conditionIndex}
                                        className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200"
                                      >
                                        <Accordion
                                          type="multiple"
                                          className="w-full"
                                        >
                                          <AccordionItem
                                            value={`item-${conditionId}`}
                                          >
                                            <div className="flex items-center justify-center gap-2 sm:gap-3 h-4">
                                              <Checkbox
                                                id={`condition-${conditionId}`}
                                                checked={selectedConditions.has(
                                                  conditionId
                                                )}
                                                onCheckedChange={() =>
                                                  toggleCondition(conditionId)
                                                }
                                                className="mt-0.5 w-4 h-4 data-[state=checked]:bg-medistryColor data-[state=checked]:border-medistryColor"
                                              />
                                              <div className="flex-1">
                                                <AccordionTrigger className="w-full text-left">
                                                  <div className="flex items-center justify-between">
                                                    <label
                                                      htmlFor={`condition-${conditionId}`}
                                                      className="font-medium text-gray-900 cursor-pointer"
                                                    >
                                                      {item.name}
                                                    </label>
                                                  </div>
                                                </AccordionTrigger>
                                              </div>
                                            </div>
                                          </AccordionItem>
                                        </Accordion>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
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
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <AppButton
              onClick={() => setIsModalOpen(false)}
              label="Cancel"
              className="w-full sm:flex-1 !bg-gray-100 !text-gray-700 hover:!bg-gray-200 border border-gray-300 mt-0"
            />
            <AppButton
              onClick={onAccept}
              isLoading={patientRequestLoading}
              loaddingClass="flex"
              label={patientRequestLoading ? "Processing..." : "Accept Request"}
              className="w-full sm:flex-1 shadow-sm mt-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptDoctorrequest;
