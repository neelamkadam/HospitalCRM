import React, { useEffect, useState } from "react";
import AppButton from "./AppButton";
import AppInputField from "./AppInput";
import { ReportTypeForm } from "../types/form.types";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addReportTypeSchema } from "../utils/validationSchems";
import { AuthResponseBodyDataModel } from "../types/response.types";
import { usePostApi, usePutApi } from "../services/use-api";
import API_CONSTANTS from "../constants/apiConstants";
import { Check, Plus, Trash, X } from "lucide-react";
import { cn, parseStructure } from "../lib/utils";

const AddReportType: React.FC<{
  setIsreportTypeModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  fetchReportTypes: () => void;
  setReportType: React.Dispatch<React.SetStateAction<string>>;
  mode?: "view" | "edit" | "create";
  reportTypeData?: any;
  closeModal: () => void;
}> = ({
  fetchReportTypes,
  setReportType,
  mode = "create",
  reportTypeData,
  closeModal,
}) => {
  const [structure, setStructure] = useState<
    { header: string; subheaders: string[] }[]
  >([]);

  const [subheading, setSubheadings] = useState<{
    [key: number]: string;
  }>({});
  const [editingSubheadingIndex, setEditingSubheadingIndex] = useState<{
    [headingIndex: number]: number | null;
  }>({});
  const [inlineEditingSubheading, setInlineEditingSubheading] = useState<{
    [key: string]: string;
  }>({});

  const { postData: CreateReportTyesList } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.REPORTS.USER_REPORT_TYPES,
    });

  const { putData: UpdateReportType } = usePutApi<AuthResponseBodyDataModel>({
    path: reportTypeData?._id
      ? `${API_CONSTANTS.REPORTS.USER_REPORT_TYPES}/${reportTypeData._id}`
      : API_CONSTANTS.REPORTS.USER_REPORT_TYPES,
  });

  const form = useForm<ReportTypeForm>({
    resolver: yupResolver(addReportTypeSchema),
    defaultValues: {
      reportType: "",
      heading: "",
    },
  });

  useEffect(() => {
    if (mode !== "create" && reportTypeData) {
      form.reset({ reportType: reportTypeData.name });

      const rawStructure = reportTypeData?.structure;
      let reportStructure;
      if (typeof rawStructure === "string") {
        reportStructure = parseStructure(rawStructure) || [];
      } else {
        reportStructure = rawStructure || [];
      }

      if (
        Array.isArray(reportStructure) &&
        reportStructure.length > 0 &&
        typeof reportStructure[0] === "object"
      ) {
        const normalized = reportStructure.map((s: any) => ({
          header: String(s.header ?? ""),
          subheaders: Array.isArray(s.subheaders) ? s.subheaders : [],
        }));
        setStructure(normalized);
      } else {
        const legacyHeadings = Array.isArray(reportStructure)
          ? reportStructure
          : [];
        const convertedStructure = legacyHeadings.map((heading) => ({
          header: String(heading),
          subheaders: [],
        }));
        setStructure(convertedStructure);
      }
    } else if (mode === "create") {
      setStructure([{ header: "", subheaders: [] }]);
    }
  }, [mode, reportTypeData]);

  const onSubmit: SubmitHandler<ReportTypeForm> = async (
    data: ReportTypeForm
  ) => {
    const filteredStructure = structure
      .filter((item) => item.header.trim())
      .map((item) => ({
        header: item.header,
        subheaders: item.subheaders.filter((sub) => sub.trim()),
      }));

    const payload = {
      name: data.reportType,
      structure: filteredStructure,
    };

    try {
      let resData;
      if (mode === "create") {
        resData = await CreateReportTyesList(payload);
      } else if (mode === "edit") {
        resData = await UpdateReportType(payload);
      }

      if (resData?.data?.success) {
        setReportType(data.reportType);
        resetFormState();
        closeModal();
        fetchReportTypes();
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  const handleHeadingAdd = (): void => {
    setStructure((prev) => [...prev, { header: "", subheaders: [] }]);
  };

  const handleHeadingDelete = (index: number) => {
    setStructure((prev) => prev.filter((_, i) => i !== index));
  };

  const handleHeadingChange = (index: number, value: string) => {
    setStructure((prev) =>
      prev.map((item, i) => (i === index ? { ...item, header: value } : item))
    );
  };

  const handleTempSubheadingChange = (headingIndex: number, value: string) => {
    setSubheadings((prev) => ({ ...prev, [headingIndex]: value }));
  };

  const handleConfirmSubheading = (headingIndex: number) => {
    const value = subheading[headingIndex]?.trim();
    if (!value) return;

    setStructure((prev) =>
      prev.map((item, i) =>
        i === headingIndex
          ? {
              ...item,
              subheaders:
                editingSubheadingIndex[headingIndex] !== null &&
                editingSubheadingIndex[headingIndex] !== undefined
                  ? item.subheaders.map((sub, idx) =>
                      idx === editingSubheadingIndex[headingIndex] ? value : sub
                    ) // Update existing subheading
                  : [...item.subheaders, value], // Add new subheading
            }
          : item
      )
    );

    setSubheadings((prev) => ({ ...prev, [headingIndex]: "" }));
    setEditingSubheadingIndex((prev) => ({ ...prev, [headingIndex]: null }));
  };

  const handleSubheadingDelete = (headingIndex: number, subIndex: number) => {
    setStructure((prev) =>
      prev.map((item, i) =>
        i === headingIndex
          ? {
              ...item,
              subheaders: item.subheaders.filter((_, j) => j !== subIndex),
            }
          : item
      )
    );
  };

  const handleInlineEditStart = (
    headingIndex: number,
    subIndex: number,
    currentValue: string
  ) => {
    const key = `${headingIndex}-${subIndex}`;
    setInlineEditingSubheading((prev) => ({
      ...prev,
      [key]: currentValue,
    }));
  };

  const handleInlineEditSave = (headingIndex: number, subIndex: number) => {
    const key = `${headingIndex}-${subIndex}`;
    const newValue = inlineEditingSubheading[key]?.trim();

    if (newValue) {
      setStructure((prev) =>
        prev.map((item, i) =>
          i === headingIndex
            ? {
                ...item,
                subheaders: item.subheaders.map((sub, idx) =>
                  idx === subIndex ? newValue : sub
                ),
              }
            : item
        )
      );
    }

    setInlineEditingSubheading((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleInlineEditCancel = (headingIndex: number, subIndex: number) => {
    const key = `${headingIndex}-${subIndex}`;
    setInlineEditingSubheading((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleInlineEditChange = (
    headingIndex: number,
    subIndex: number,
    value: string
  ) => {
    const key = `${headingIndex}-${subIndex}`;
    setInlineEditingSubheading((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFormState = () => {
    setStructure([{ header: "", subheaders: [] }]);
    setSubheadings({});
    setInlineEditingSubheading({});
    form.reset({
      reportType: "",
      heading: "",
    });
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    resetFormState();
    closeModal();
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-xl font-semibold text-[#1A2435]">
          {mode === "view"
            ? "View Template"
            : mode === "edit"
            ? "Edit Template"
            : "Report Template"}
        </h2>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Title Section */}
          <div className="space-y-1">
            <AppInputField<ReportTypeForm>
              name="reportType"
              form={form}
              label="Title"
              placeholder="Enter Title"
              readonly={mode === "view"}
              className="h-10"
            />
          </div>

          {/* Structure Section */}
          <div className="">
            {structure?.map((item, index) => (
              <div key={`section-${index}`} className="mb-2">
                {/* Heading Input */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <AppInputField
                      name={`heading-${index}`}
                      form={form}
                      label={`Heading ${
                        structure?.length > 1 ? index + 1 : ""
                      }`}
                      placeholder="Enter Heading"
                      value={item.header}
                      onChange={(e) =>
                        mode !== "view" &&
                        handleHeadingChange(index, e.target.value)
                      }
                      readonly={mode === "view"}
                      className="h-10"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    {index === structure?.length - 1 && mode !== "view" && (
                      <button
                        type="button"
                        className="p-2 text-gray-400 rounded-lg border border-gray-200 hover:text-blue-600 hover:border-blue-200 transition-colors"
                        onClick={handleHeadingAdd}
                        title="Add new heading"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                    {structure.length > 1 && mode !== "view" && (
                      <button
                        type="button"
                        className="p-2 text-gray-400 rounded-lg border border-gray-200 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleHeadingDelete(index)}
                        // disabled={mode === "view"}
                        title="Delete heading"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subheadings Section */}
                {item.header.trim() && (
                  <div className="ml-4 space-y-3">
                    {/* Subheading List */}
                    {item.subheaders.length > 0 && (
                      <div
                        className={`space-y-2 ${mode === "view" ? "mb-5" : ""}`}
                      >
                        <h4 className="text-sm font-medium text-gray-600">
                          Subheadings:
                        </h4>
                        <ul className="space-y-2">
                          {item.subheaders.map((subheader, subIndex) => {
                            const editKey = `${index}-${subIndex}`;
                            const isEditing =
                              inlineEditingSubheading.hasOwnProperty(editKey);

                            return (
                              <li
                                key={`subheading-${index}-${subIndex}`}
                                className="flex items-center gap-3 p-2 bg-gray-50 rounded-md w-2/3"
                              >
                                <span className="text-sm font-medium text-gray-500 min-w-[20px]">
                                  {subIndex + 1}.
                                </span>

                                {isEditing ? (
                                  <>
                                    <input
                                      type="text"
                                      value={
                                        inlineEditingSubheading[editKey] || ""
                                      }
                                      onChange={(e) =>
                                        handleInlineEditChange(
                                          index,
                                          subIndex,
                                          e.target.value
                                        )
                                      }
                                      className="text-sm text-gray-700 flex-1 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-100 hover:none"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      className="text-gray-400 hover:text-green-600 transition-colors"
                                      onClick={() =>
                                        handleInlineEditSave(index, subIndex)
                                      }
                                      title="Save"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      className="text-gray-400 hover:text-red-600 transition-colors"
                                      onClick={() =>
                                        handleInlineEditCancel(index, subIndex)
                                      }
                                      title="Cancel"
                                    >
                                      <X size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <span
                                      className={`text-sm text-gray-700 flex-1 ${
                                        mode !== "view"
                                          ? "cursor-pointer hover:bg-gray-100 rounded px-1 py-1"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        mode !== "view" &&
                                        handleInlineEditStart(
                                          index,
                                          subIndex,
                                          subheader
                                        )
                                      }
                                      title={
                                        mode !== "view" ? "Click to edit" : ""
                                      }
                                    >
                                      {subheader}
                                    </span>
                                    {mode !== "view" && (
                                      <button
                                        type="button"
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                        onClick={() =>
                                          handleSubheadingDelete(
                                            index,
                                            subIndex
                                          )
                                        }
                                        title="Delete subheading"
                                      >
                                        <Trash size={14} />
                                      </button>
                                    )}
                                  </>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Add Subheading Button/Input */}
                    {mode !== "view" && (
                      <div>
                        {!subheading.hasOwnProperty(index) ? (
                          <button
                            type="button"
                            className="text-sm text-medistryColor hover:underline font-medium pb-5"
                            onClick={() =>
                              handleTempSubheadingChange(index, "")
                            }
                          >
                            + Add Subheading
                          </button>
                        ) : (
                          <div className="space-y-2 mb-4">
                            {/* <label className="block text-sm font-medium text-[#1A2435]">
                              Enter Subheading
                            </label> */}
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={subheading[index] || ""}
                                onChange={(e) =>
                                  handleTempSubheadingChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                placeholder="Enter Subheading"
                                className={cn(
                                  "block h-10 w-2/3 px-3 py-3 border border-[#E6E7E9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#526279] focus:border-transparent text-black"
                                )}
                              />
                              <div className="inset-y-0 right-2 flex items-center gap-1">
                                <button
                                  type="button"
                                  className="p-2 text-gray-400 rounded-lg border border-gray-200 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                  onClick={() => handleConfirmSubheading(index)}
                                  disabled={!subheading[index]?.trim()}
                                  title="Confirm subheading"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  type="button"
                                  className="p-2 text-gray-400 rounded-lg border border-gray-200 hover:text-red-600 hover:border-red-200 transition-colors"
                                  onClick={() => {
                                    setSubheadings((prev) => {
                                      const copy = { ...prev };
                                      delete copy[index];
                                      return copy;
                                    });
                                    setEditingSubheadingIndex((prev) => ({
                                      ...prev,
                                      [index]: null,
                                    }));
                                  }}
                                  title="Cancel"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          {(mode === "edit" || mode === "create") && (
            <div className="flex gap-4 pt-4 border-gray-100">
              <AppButton
                onClick={handleCancel}
                label="Cancel"
                className="flex-1 !bg-[#f3f4f6] !text-gray-900 hover:!bg-gray-200 mt-0"
              />
              <AppButton
                loaddingClass="flex"
                type="submit"
                label={mode === "edit" ? "Update" : "Submit"}
                className="flex-1 mt-0"
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddReportType;
