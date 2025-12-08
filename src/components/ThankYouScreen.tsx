import React from "react";
import { CheckCircle } from "lucide-react"; // Importing Lucide React icon
import AppButton from "./AppButton";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routesConstants";

const ThankYouScreen: React.FC = () => {
  //   const handleGoToDashboard = () => {
  //     alert("Redirecting to the dashboard...");
  //     // Replace the below line with actual navigation logic
  //     window.location.href = "/dashboard";
  //   };
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent !bg-[#f3f4f6]">
      <div className="p-6 rounded-lg shadow-lg w-full max-w-md text-center bg-white">
        <div className="flex justify-center mb-4">
          <CheckCircle className="text-green-500 w-16 h-16" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-[#394557]">
          Thank You!
        </h2>
        <p className="text-gray-400 mb-6">
          Your action has been successfully completed. You can now proceed to
          explore more.
        </p>
        <AppButton onClick={() => navigate(ROUTES.LOGIN)}>Login</AppButton>
      </div>
    </div>
  );
};

export default ThankYouScreen;
