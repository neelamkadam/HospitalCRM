import React, { useState, useEffect, useRef } from "react";
import { useFileUpload, useGetApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import AppButton from "../../components/AppButton";
import { useSidebar } from "../../components/ui/sidebar";
import UploadImage from "../../assets/uploadFile.svg";
import Pdf from "../../assets/pdf.svg";
import { useAppSelector } from "../../redux/store";
import { useLocation, useNavigate } from "react-router-dom";
import { Data_Constcnts } from "../../constants/AppConstants";
import { BookUser, Plus } from "lucide-react";
import Select from "react-select";
import CustomSingleValue from "../../components/CustomSingleValue";
import CustomPlaceholder from "../../components/CustomPlaceholder";
import { customSelectStylesDocter } from "../../utils/common-utils";
import AppModal from "../../components/AppModal";
import AddPatient from "../Patients/AddPatient";
import CustomSheet from "../../components/AppSheet";
import PatientsOverAllReportSidePannel from "../Patients/PatientsOverAllReportSidePannel";

const BATCH_SIZE = 10;

const FileUpload: React.FC<{
  setOpenFile?: React.Dispatch<React.SetStateAction<boolean>> | undefined;
  setUploadFile?: React.Dispatch<React.SetStateAction<boolean>> | undefined;
}> = (props) => {
  const { setOpenFile, setUploadFile } = props || {};

  const { userData }: any = useAppSelector((state) => state.authData);
  const [clientId, setClientId] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const serviceId = queryParams.get("id");
    if (serviceId) {
      setClientId(serviceId);
      console.log("Service ID:", serviceId);
    }
  }, [location.search]);

  const { uploadFile } = useFileUpload({
    path:
      userData.role === "client"
        ? API_CONSTANTS.PATIENTS.PATIENT_UPLOAD_REPORT
        : API_CONSTANTS.UPLOAD_REPORT,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>({});
  const [patientList, setPatientList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [petientDetailSidepanel, setPetientDetailSidepanel] = useState(false);
  const { getData: GetPatientList } = useGetApi<any>("");

  const navigate = useNavigate();

  const isReport = location.pathname.includes("report");

  const [progress, setProgress] = useState({
    total: 0,
    uploaded: 0,
    failed: 0,
  });

  const EMRStatus =
    userData?.organizationId?.emrEnabled &&
    userData?.organizationId?.emrType === Data_Constcnts?.EMR_TYPE;

  // Full screen drag and drop functionality
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Only hide overlay if leaving the window entirely
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDragOver(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        setSelectedFiles((prev) => [...prev, ...files]);
      }
    };

    // Add event listeners to document
    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  const handleLocalDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const processBatch = async (files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("report", file);
      
      // Always append clientId when available, regardless of user role

      if (isReport && selectedOption?.value) {
        formData.append("clientId", selectedOption.value);
      } else if (clientId) {
        formData.append("clientId", clientId);
      }

      try {
        const response = await uploadFile(formData);
        if (response?.status === 200) {
          setProgress((prev) => ({ ...prev, uploaded: prev.uploaded + 1 }));
          return true;
        }
        throw new Error(`Failed to upload ${file.name}`);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setProgress((prev) => ({ ...prev, failed: prev.failed + 1 }));
        return false;
      }
    });

    return Promise.all(uploadPromises);
  };

  const handleFileUpload = async () => {
    if (selectedFiles?.length === 0) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadFile && setUploadFile(true);
      setProgress({
        total: selectedFiles?.length,
        uploaded: 0,
        failed: 0,
      });

      // Process files in batches
      for (let i = 0; i < selectedFiles?.length; i += BATCH_SIZE) {
        const batch = selectedFiles?.slice(i, i + BATCH_SIZE);
        await processBatch(batch);
      }

      // Clear files and navigate only after all batches are processed
      setSelectedFiles([]);
      setOpenFile && setOpenFile(false);
      // navigate(ROUTES.HEALTHREPORT);
    } catch (error) {
      console.error("Upload process failed:", error);
      alert("Some files failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadFile && setUploadFile(false);
    }
  };

  const { state } = useSidebar();

  const selectRef = useRef<any>(null);

  const toggleClose = () => {
    setIsModalOpen((prev) => !prev);
  };

  const togglePetientSidepanel = () => {
    if (!petientDetailSidepanel && selectedOption?.value) {
      const currentPath = location.pathname;
      navigate(`${currentPath}?id=${selectedOption.value}&summary=${true}`);
    }
    setPetientDetailSidepanel((prev) => !prev);
  };

  const handleSelectChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedOption(option);
  };

  const fetchPatient = async () => {
    try {
      const response: any = await GetPatientList(
        `${API_CONSTANTS.GET_ALL_PATIENTS_WITH_ID}`
      );
      if (response.data.success) {
        const transformedData = response.data.data.clients.map((item: any) => ({
          label: item.name,
          value: item._id,
        }));
        setPatientList(transformedData);

        if (clientId && !selectedOption?.value) {
          const matchedPatient = transformedData.find(
            (patient: any) => patient.value === clientId
          );
          if (matchedPatient) {
            setSelectedOption(matchedPatient);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  useEffect(() => {
    if (!isModalOpen && isReport && userData.role !== "client") {
      fetchPatient();
    }
  }, [isModalOpen, isReport]);

  return (
    <>
      {isDragOver && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleLocalDrop}
        >
          {/* <div className="w-screen h-screen flex items-center justify-center">
            <div className="bg-white rounded-xl p-8 border-4 border-dashed border-medistryColor max-w-md mx-4 text-center shadow-2xl">
              <div className="mb-4">
                <img
                  src={UploadImage}
                  className="w-20 h-20 mx-auto opacity-80"
                  alt="Upload"
                />
              </div>
              <h3 className="text-2xl font-semibold text-[#1A2435] mb-2">
                Drop files here
              </h3>
              <p className="text-[#8C929A] text-sm">
                Release to upload your files
              </p>
            </div>
          </div> */}
        </div>
      )}

      <div className={`${state === "collapsed" ? "pl-12 pt-0 pr-4 mt-4" : ""}`}>
        <div className="pl-3 pt-[7px] pb-[12px]">
          <p className="text-xl text-[#1A2435] font-medium text-left">
            Upload Report
          </p>
        </div>
        <div className="">
          {isReport && userData.role !== "client" && (
            <div className="ml-3 mr-3 ">
              <div className="pt-2 text-start font-medium text-lg text-[#1A2435] flex justify-between items-center mb-3">
                <p>Select Patient</p>
                <div
                  className="hover:underline cursor-pointer pl-[24px]"
                  onClick={() =>
                    selectedOption?.value && EMRStatus
                      ? togglePetientSidepanel()
                      : toggleClose()
                  }
                >
                  <p className="font-medium text-lg text-[#01576A] flex items-center">
                    <span className="">
                      {selectedOption?.value && EMRStatus ? (
                        <BookUser size={17} />
                      ) : (
                        <Plus size={17} />
                      )}
                    </span>
                    {selectedOption?.value && EMRStatus
                      ? "Patient Details"
                      : "Add a Patient"}
                  </p>
                </div>
              </div>
              {/* Patient Select */}
              <div className="relative mb-4">
                <Select
                  value={selectedOption}
                  onChange={handleSelectChange}
                  options={patientList}
                  ref={selectRef}
                  className="search-patient"
                  components={{
                    SingleValue: CustomSingleValue,
                    Placeholder: CustomPlaceholder,
                  }}
                  isSearchable={true}
                  isClearable={true}
                  closeMenuOnSelect={true}
                  blurInputOnSelect={true}
                  openMenuOnClick={true}
                  openMenuOnFocus={false}
                  styles={{
                    ...customSelectStylesDocter,
                    control: (base) => ({
                      ...base,
                      border: "1px solid #e5e7eb",
                      boxShadow: "none",
                      fontSize: "16px",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.375rem",
                      backgroundColor: "#fffff",
                      opacity: 1,
                      cursor: "pointer",
                      "&:hover": {
                        border: "1px solid #e5e7eb",
                      },
                    }),
                    menu: (provided: any) => ({
                      ...provided,
                      backgroundColor: "#E5ECED",
                      borderRadius: "0.375rem",
                      zIndex: 9999,
                    }),
                    option: (provided: any, state: any) => ({
                      ...provided,
                      padding: "0.75rem",
                      fontSize: "1rem",
                      textAlign: "left",
                      transition:
                        "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
                      backgroundColor: state.isSelected
                        ? "#E5ECED"
                        : state.isFocused
                        ? "#E5ECED"
                        : "#fff",
                      color: state.isSelected ? "#01576A" : "#526279",
                    }),
                    placeholder: (provided: any) => ({
                      ...provided,
                      color: "#526279",
                      fontSize: "0.875rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      minHeight: "auto",
                    }),
                    valueContainer: (provided: any) => ({
                      ...provided,
                      padding: "0",
                    }),
                    input: (provided: any) => ({
                      ...provided,
                      margin: "0",
                      padding: "0",
                    }),
                  }}
                />
              </div>
            </div>
          )}
          <div
            className="border border-dashed border-[#D4D6D9] bg-[#F8F8F8] rounded-lg mt-1 ml-3 mr-3 p-10 flex flex-col items-center cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleLocalDrop}
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById("fileInput")?.click();
            }}
            role="button"
            tabIndex={0}
          >
            <div className="">
              <span className="mt-5 cursor-pointer">
                <img src={UploadImage} className="cursor-pointer w-32" alt="Upload" />
              </span>
            </div>
            <p className="text-lg text-[#1A2435] py-1 mt-[-10px]">
              <span className="font-medium">Drag & Drop</span> or{" "}
              <span className="cursor-pointer">
                <span className="font-medium">Click to Upload</span>
              </span>
            </p>
            <input
              id="fileInput"
              type="file"
              multiple
              hidden
              disabled={isUploading}
              onChange={handleFileSelection}
              accept="application/pdf,image/*"
            />
            <p className="text-xs text-[#8C929A]">
              PDF file only - Max file size 15MB
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 ml-3 mr-3 space-y-2 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white max-h-28 overflow-hidden overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between border border[#ededef] p-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <img src={Pdf} alt="PDF Icon" />
                      <p className="text-sm text-[#1A2435] font-medium truncate max-w-xs md:max-w-md">
                        {file.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isUploading && (
                        <div className="loader h-4 w-4 border-2 border-[#cccccc] border-t-transparent rounded-full animate-spin" />
                      )}
                      <button
                        onClick={() => handleRemoveFile(index)}
                        disabled={isUploading}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Remove file"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {isUploading && progress?.total > 0 && (
            <span className="text-xs text-gray-600 m-1 mt-3">
              Uploading: {progress?.uploaded} / {progress?.total}
              {progress.failed > 0 && ` (Failed: ${progress?.failed})`}
            </span>
          )}
          <div className="flex justify-between gap-3 m-2 mb-3">
            <AppButton
              disable={isUploading}
              loadingText="Uploading..."
              className="!text-[#1A2435] px-4 py-2 rounded-full shadow-none flex-1 !bg-white !mt-4 text-base "
              onClick={() => setOpenFile && setOpenFile(false)}
            >
              Cancel
            </AppButton>
            <AppButton
              disable={isUploading || selectedFiles?.length === 0}
              loaddingClass={"!text-white"}
              loadingText="Uploading..."
              className="bg-teal-500 text-white px-4 py-2 rounded-full shadow-none ml-auto flex-1 !mt-4 text-base"
              onClick={handleFileUpload}
            >
              Upload Files
            </AppButton>
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      <AppModal isOpen={isModalOpen} toggle={toggleClose} title="">
        <AddPatient
          toggleClose={toggleClose}
          setNewPatient={(patient: any) => {
            setPatientList((prev) => [...prev, patient]);
            setSelectedOption(patient);
          }}
        />
      </AppModal>

      {/* Patient Details Side Panel */}
      {selectedOption?.value && (
        <CustomSheet
          title=""
          isOpen={petientDetailSidepanel}
          toggle={togglePetientSidepanel}
          className="dark:bg-gray-800 dark:text-gray-100"
          content={
            <PatientsOverAllReportSidePannel isFullViewProfileShow={false} />
          }
        />
      )}
    </>
  );
};

export default FileUpload;