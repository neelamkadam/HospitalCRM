import React, { useState, useRef, useEffect } from "react";
import { Trash2, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { deleteLatterHead, usePutApi } from "../services/use-api";
import API_CONSTANTS from "../constants/apiConstants";
import { setUserData } from "../redux/AuthSlice";
import AppTooltip from "./AppTooltip";

const UserPDFFooter: React.FC<any> = () => {
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { userData } = useSelector((state: any) => state.authData);
  const { pdfFooter } = userData;
  const { putData: updatePermission } = usePutApi<FormData>({
    path: API_CONSTANTS.GET_USER_UPDATE,
  });

  useEffect(() => {
    if (pdfFooter && !previewUrl) {
      setPreviewUrl(pdfFooter);
    }
  }, [pdfFooter]);

  // Auto upload effect - triggers when selectedImage changes
  useEffect(() => {
    if (selectedImage) {
      handleUpload();
    }
  }, [selectedImage]);

  const handleImageChange = (file: File) => {
    if (file) {
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const triggerFileInput = () => {
    if (!isUploading) {
      // Prevent file selection during upload
      fileInputRef.current?.click();
    }
  };

  const handleDeleteImage = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const result = await deleteLatterHead(
        `${API_CONSTANTS.DELETE_USER_PROFILE_LATTERHEAD}`,
        "footer"
      );
      if (result?.success) {
        setSelectedImage(null);
        setPreviewUrl(null);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        const updatedUserData = {
          ...userData,
          pdfFooter: null,
        };
        dispatch(setUserData(updatedUserData));
      }
    } catch (error) {
      console.error("Error deleting footer:", error);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("pdfFooter", selectedImage);
      //   formData.append("pdfHeader", "footer");
      const response = await updatePermission(formData);
      if (response?.data.success) {
        const uploadedPdfFooter = response?.data?.user?.pdfFooter;
        if (uploadedPdfFooter) {
          const updatedUserData = {
            ...userData,
            pdfFooter: uploadedPdfFooter,
          };
          dispatch(setUserData(updatedUserData));
          setPreviewUrl(uploadedPdfFooter);
        }
      } else {
        throw new Error(`Failed to upload ${selectedImage.name}`);
      }
    } catch (error) {
      console.error(`Error uploading ${selectedImage.name}:`, error);
    } finally {
      setIsUploading(false);
      setSelectedImage(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Do NOT clear previewUrl here
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 bg-white rounded-lg">
      {/* <h1 className="text-2xl font-bold mb-6">Upload Your Letterhead</h1> */}
      <div className="flex justify-center">
        <div className="w-full">
          <div
            className={`border-2 ${
              previewUrl ? "border-solid" : "border-dashed"
            } border-gray-300 rounded-lg p-4 h-48 flex flex-col ${
              isUploading ? "cursor-not-allowed opacity-75" : "cursor-pointer"
            } transition-all hover:border-gray-500`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            {previewUrl ? (
              <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Footer preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all">
                  <span className="text-white opacity-0 hover:opacity-100 font-medium">
                    {isUploading ? "Uploading..." : "Click to replace"}
                  </span>
                </div>
                {!isUploading && (
                  <AppTooltip
                    trigger={
                      <button
                        className="absolute top-2 right-2 p-1 bg-white bg-opacity-80 rounded-full shadow-sm hover:bg-opacity-100 transition-all"
                        onClick={(e) => handleDeleteImage(e)}
                        title="Delete Footer"
                      >
                        <Trash2 className="h-5 w-5 text-red-700" />
                      </button>
                    }
                    tooltip="Remove Footer"
                  ></AppTooltip>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Upload className="h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {isUploading ? "Uploading Footer..." : "Upload a Footer"}
                </h3>
                {/* <p className="mt-1 text-xs text-gray-500">PNG, JPG</p>
                <p className="mt-2 text-xs text-gray-500">
                  Or drag and drop image here
                </p> */}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept="image/png, image/jpg, image/jpeg"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {previewUrl && !isUploading && (
              <p className="mt-2 text-sm text-gray-600 text-center">
                Click on the image to replace it
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPDFFooter;
