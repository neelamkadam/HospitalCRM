import React, { useState, useEffect } from "react";
import { useFileUpload } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import AppButton from "../../components/AppButton";
import { useSidebar } from "../../components/ui/sidebar";
import UploadImage from "../../assets/uploadFile.svg";
import Excel from "../../assets/Excel.svg";

const BATCH_SIZE = 10;

const ServiceUpload: React.FC<{
  setOpenFile?: React.Dispatch<React.SetStateAction<boolean>> | undefined;
  setUploadFile?: React.Dispatch<React.SetStateAction<boolean>> | undefined;
  setRowData:any;
  setShowTable:any;
}> = (props) => {
  const { setOpenFile, setUploadFile, setRowData, setShowTable } = props || {};
  const { uploadFile } = useFileUpload({
    path: API_CONSTANTS.UPLOAD_SERVICE_FILE,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState({
    total: 0,
    uploaded: 0,
    failed: 0,
  });

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
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

  const processBatch = async (files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await uploadFile(formData);
        if (response?.status === 200) {
          setProgress((prev) => ({ ...prev, uploaded: prev.uploaded + 1 }));
          setRowData(response?.data);
          setShowTable(true);
          return true;
        }
        throw new Error(`Failed to upload ${file.name}`);
      } catch (error) {
        setProgress((prev) => ({ ...prev, failed: prev.failed + 1 }));
        return false;
      }
    });

    return Promise.all(uploadPromises);
  };

  const handleFileUpload = async () => {
    if (selectedFiles?.length === 0) return;

    try {
      setIsUploading(true);
      setUploadFile && setUploadFile(true);
      setProgress({
        total: selectedFiles?.length,
        uploaded: 0,
        failed: 0,
      });

      for (let i = 0; i < selectedFiles?.length; i += BATCH_SIZE) {
        const batch = selectedFiles?.slice(i, i + BATCH_SIZE);
        await processBatch(batch);
      }

      setSelectedFiles([]);
      setOpenFile && setOpenFile(false);
    } catch (error) {
      alert("Some files failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadFile && setUploadFile(false);
    }
  };

  const { state } = useSidebar();

  return (
    <>
      {isDragOver && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleLocalDrop}
        />
      )}

      <div className={`${state === "collapsed" ? "pl-12 pt-0 pr-4 mt-4" : ""}`}>
        <div className="pl-[14px] pt-[7px] pb-[12px]">
          <p className="text-xl text-[#1A2435] font-medium text-left">
            Upload Service
          </p>
        </div>
        
        <div
          className="border border-dashed border-[#D4D6D9] bg-[#F8F8F8] rounded-lg mt-1 ml-3 mr-3 p-10 flex flex-col items-center cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleLocalDrop}
          onClick={() => document.getElementById("fileInput")?.click()}
          role="button"
          tabIndex={0}
        >
          <img src={UploadImage} className="cursor-pointer w-32" alt="Upload" />
          <p className="text-lg text-[#1A2435] py-1 mt-[-10px]">
            <span className="font-medium">Drag & Drop</span> or{" "}
            <span className="font-medium">Click to Upload</span>
          </p>
          <input
            id="fileInput"
            type="file"
            multiple
            hidden
            disabled={isUploading}
            onChange={handleFileSelection}
          />
          <p className="text-xs text-[#8C929A]">Max file size 15MB</p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4 ml-3 mr-3 space-y-2 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white max-h-28 overflow-hidden overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between border border[#ededef] p-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <img src={Excel} alt="Excel Icon" />
                  <p className="text-sm text-[#1A2435] font-medium truncate max-w-xs md:max-w-md">
                    {file.name}
                  </p>
                </div>
                {isUploading && (
                  <div className="loader h-4 w-4 border-2 border-[#cccccc] border-t-transparent rounded-full animate-spin" />
                )}
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
            className="!text-[#1A2435] px-4 py-2 rounded-full shadow-none flex-1 !bg-white !mt-4 text-base"
            onClick={() => setOpenFile && setOpenFile(false)}
          >
            Cancel
          </AppButton>
          <AppButton
            disable={isUploading || selectedFiles?.length === 0}
            loadingText="Uploading..."
            className="bg-teal-500 text-white px-4 py-2 rounded-full shadow-none ml-auto flex-1 !mt-4 text-base"
            onClick={handleFileUpload}
          >
            Upload Files
          </AppButton>
        </div>
      </div>
    </>
  );
};

export default ServiceUpload;