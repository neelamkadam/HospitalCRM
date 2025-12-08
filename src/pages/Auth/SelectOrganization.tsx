import React, { useState } from "react";
import AppButton from "../../components/AppButton";
import { setRegisterUserData } from "../../redux/RegisterUser";
import { useAppDispatch } from "../../redux/store";
import { ROUTES } from "../../constants/routesConstants";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginLogo from "./LoginLogo";
import { User, Building } from "lucide-react"; // Import Lucide React icons

const SelectOrganization: React.FC = () => {
  const { registerUserData } = useSelector(
    (state: any) => state.registerUserData
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>(
    registerUserData?.role || ""
  ); // State for selected option
  const [error, setError] = useState<string>(""); // State for validation error

  const handleSelectClick = () => {
    if (!selected) {
      setError("Please select an option before proceeding.");
    } else {
      setError("");
      dispatch(
        setRegisterUserData({
          role: selected,
        })
      );
      if (selected === "individual") {
        navigate(`${ROUTES.SET_UP_PATIENT}`);
      } else {
        navigate(`${ROUTES.SET_ORGANIZATION}`);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <LoginLogo />
        {/* Title */}
        <p className="mb-12 text-2xl font-medium text-[#293343] mt-[37px]">
          I would like to register as an:
        </p>

        {/* Registration Options */}
        <div className="flex gap-10">
          {/* Individual Box */}
          <div
            className={`flex flex-col items-center ${
              selected === "individual"
                ? "border-border-[#293343]"
                : "border-gray-200"
            }`}
            onClick={() => setSelected("individual")}
          >
            <div
              className={`flex items-center justify-center bg-gray-100 border rounded-md shadow-md cursor-pointer transition ${
                selected === "individual"
                  ? "border-[#293343]"
                  : "border-gray-200"
              }`}
              style={{ height: "6rem", width: "6rem" }}
            >
              <User size={48} className="text-[#293343]" />{" "}
              {/* Individual Icon */}
            </div>
            <span className="mt-2 text-gray-700">Individual</span>
          </div>

          {/* Organization Box */}
          <div
            className={`flex flex-col items-center ${
              selected === "organization"
                ? "border-[#293343]"
                : "border-gray-200"
            }`}
            onClick={() => setSelected("organization")}
          >
            <div
              className={`flex items-center justify-center bg-gray-100 border rounded-md shadow-md cursor-pointer transition ${
                selected === "organization"
                  ? "border-[#293343]"
                  : "border-gray-200"
              }`}
              style={{ height: "6rem", width: "6rem" }}
            >
              <Building size={48} className="text-[#293343]" />{" "}
              {/* Organization Icon */}
            </div>
            <span className="mt-2 text-gray-700">Organization</span>
          </div>
        </div>

        {/* Validation Error Message */}
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

        {/* Select Button */}
        <AppButton
          className="mt-10 px-8 py-3 w-1/5 text-white shadow hover:bg-gray-700 transition !bg-[#293343] !text-base"
          onClick={handleSelectClick}
        >
          Select
        </AppButton>
      </div>
    </>
  );
};

export default SelectOrganization;
