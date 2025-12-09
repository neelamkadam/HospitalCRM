// import React, { useState } from "react";
// import LoginImage from "../../assets/Medistry Logo.svg";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import { Card, CardContent } from "../../components/ui/card";
// import Lottie from "lottie-react";
// import FileUpload from "../../assets/annimationJSON/FileUpload.json";
// import createweb from "../../assets/annimationJSON/createweb.json";

import { useSelector } from "react-redux";
// import AppModal from "../../components/AppModal";
// import FileUpload from "./FileUpload";

// Create Report Icon - Document with pencil
const CreateReportIcon = () => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="80" height="80" rx="16" fill="#EEF2FF" />
    <path
      d="M24 22C24 19.7909 25.7909 18 28 18H44L56 30V58C56 60.2091 54.2091 62 52 62H28C25.7909 62 24 60.2091 24 58V22Z"
      fill="#6366F1"
      fillOpacity="0.2"
    />
    <path
      d="M44 18L56 30H48C45.7909 30 44 28.2091 44 26V18Z"
      fill="#6366F1"
      fillOpacity="0.4"
    />
    <path
      d="M28 22C28 20.8954 28.8954 20 30 20H42L52 30V56C52 57.1046 51.1046 58 50 58H30C28.8954 58 28 57.1046 28 56V22Z"
      stroke="#6366F1"
      strokeWidth="2"
    />
    <path
      d="M33 38H47M33 44H43M33 50H40"
      stroke="#6366F1"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="54" cy="54" r="12" fill="#6366F1" />
    <path
      d="M50 54H58M54 50V58"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Upload Icon - Cloud with arrow
const UploadIcon = () => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="80" height="80" rx="16" fill="#F0FDF4" />
    <path
      d="M28 50C22.4772 50 18 45.5228 18 40C18 35.2261 21.3181 31.2554 25.7773 30.2942C26.2758 24.5011 31.0735 20 37 20C41.0691 20 44.6496 22.1114 46.6876 25.2809C47.4372 25.0978 48.2072 25 49 25C55.6274 25 61 30.3726 61 37C61 37.3401 60.9865 37.6773 60.96 38.0111C63.3902 39.6231 65 42.3385 65 45.4286C65 50.1381 61.1381 54 56.4286 54H28V50Z"
      fill="#22C55E"
      fillOpacity="0.2"
    />
    <path
      d="M28 52C23.5817 52 20 48.4183 20 44C20 40.134 22.7178 36.9027 26.3519 36.1766C26.7827 31.0038 31.0025 27 36.25 27C39.7261 27 42.7932 28.8134 44.5427 31.5228C45.1869 31.3473 45.8642 31.25 46.5625 31.25C52.2234 31.25 56.8125 35.8391 56.8125 41.5C56.8125 41.809 56.7976 42.1146 56.7684 42.4162C58.8524 43.8752 60.25 46.2632 60.25 48.9643C60.25 53.1064 56.8564 56.5 52.7143 56.5H28"
      stroke="#22C55E"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M40 64V46M40 46L34 52M40 46L46 52"
      stroke="#22C55E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type SelectWayToReortCreateProps = {
  onSelectOption: (option: string) => void;
  patientId?: string;
};

const SelectWayToReortCreate = ({
  onSelectOption,
  patientId,
}: SelectWayToReortCreateProps) => {
  const navigate = useNavigate();
  const { userData } = useSelector((state: any) => state.authData);

  return (
    <div className="w-full min-w-[350px] sm:min-w-[600px] lg:min-w-[700px]">
      <div className="text-2xl text-[#1A2435] font-semibold px-8 py-6 text-left">
        Add a Report
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full px-8 pb-8">
        {(userData?.organizationId?.createReportEnabled ||
          userData?.role != "client") && (
          <>
            <Card
              className="transition hover:bg-[#f9fafb] hover:shadow-lg cursor-pointer w-full sm:w-[280px] border-2 hover:border-indigo-200"
              onClick={() =>
                navigate(
                  patientId
                    ? `${ROUTES.CREATE_REPORT}?id=${patientId}&summary=true`
                    : `${ROUTES.CREATE_REPORT}`
                )
              }
            >
              <CardContent className="flex flex-col items-center justify-center h-full py-10 px-8">
                <span className="mb-6">
                  <CreateReportIcon />
                </span>
                <div className="flex flex-col items-center justify-center gap-3">
                  <h3 className="text-xl font-semibold text-[#1A2435]">
                    Create New Report
                  </h3>
                  <p className="text-[#8C929A] text-base text-center font-normal max-w-[200px]">
                    Write the report with the help of AI
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        <Card
          className="transition hover:bg-[#f9fafb] hover:shadow-lg cursor-pointer w-full sm:w-[280px] border-2 hover:border-green-200"
          onClick={() => onSelectOption("fileUpload")}
        >
          <CardContent className="flex flex-col items-center justify-center h-full py-10 px-8">
            <span className="mb-6 cursor-pointer">
              <UploadIcon />
            </span>
            <div className="flex flex-col items-center justify-center gap-3">
              <h3 className="text-xl font-semibold text-[#1A2435]">
                Upload Report
              </h3>
              <p className="text-[#8C929A] text-base text-center font-normal max-w-[200px]">
                Upload report file to the system
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SelectWayToReortCreate;
