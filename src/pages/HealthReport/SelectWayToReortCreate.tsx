// import React, { useState } from "react";
// import LoginImage from "../../assets/Medistry Logo.svg";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import { Card, CardContent } from "../../components/ui/card";
import CreateImage from "../../assets/CreatReport.svg";
import UpoladImage from "../../assets/Upload.svg";
// import Lottie from "lottie-react";
// import FileUpload from "../../assets/annimationJSON/FileUpload.json";
// import createweb from "../../assets/annimationJSON/createweb.json";

import { useSelector } from "react-redux";
// import AppModal from "../../components/AppModal";
// import FileUpload from "./FileUpload";

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
    <div className="">
      <div className="text-xl text-[#1A2435] font-medium px-6 py-3 text-left">
        Add a Report
      </div>
      <div className="flex items-center gap-4 w-full px-6 pb-6">
        {(userData?.organizationId?.createReportEnabled ||
          userData?.role != "client") && (
          <>
            <Card
              className="transition hover:bg-[#f9fafb] cursor-pointer"
              onClick={() =>
                navigate(
                  patientId
                    ? `${ROUTES.CREATE_REPORT}?id=${patientId}&summary=true`
                    : `${ROUTES.CREATE_REPORT}`
                )
              }
            >
              <CardContent className="flex flex-col items-center justify-center h-full py-8">
                <span className="mb-4">
                  <img src={CreateImage}></img>
                  {/* <Lottie animationData={createweb} loop={true} /> */}
                </span>
                <div className="flex flex-col items-center justify-center gap-2">
                  <h3 className="text-lg font-medium text-[#1A2435]">
                    Create New Report
                  </h3>
                  <p className="text-[#8C929A] text-sm text-center font-normal">
                    Write the report with the help of AI
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="text-gray-400">Or</div>
          </>
        )}
        <Card
          className="transition hover:bg-[#f9fafb] cursor-pointer "
          onClick={() => onSelectOption("fileUpload")}
        >
          <CardContent className="flex flex-col items-center justify-center h-full py-8">
            <span className="mb-4 cursor-pointer">
              {/* <div className="w-48 h-48"> */}
              {/* <Lottie animationData={FileUpload} loop={true} /> */}
              {/* </div> */}
              <img src={UpoladImage}></img>
            </span>
            <div className="flex flex-col items-center justify-center gap-2">
              <h3 className="text-lg font-medium text-[#1A2435]">
                Upload Report
              </h3>
              <p className="text-[#8C929A] text-sm text-center font-normal">
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
