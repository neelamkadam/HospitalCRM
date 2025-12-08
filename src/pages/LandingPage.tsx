import React from "react";
import AppButton from "../components/AppButton";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routesConstants";
import AppLoader from "../components/AppLoader";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-lg p-8 space-y-8 text-center">
          <h1 className="text-4xl font-semibold mb-4">Welcome</h1>
          <div className="flex justify-center">
            <AppButton
              className="py-3 mr-4 text-lg font-medium"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Login
            </AppButton>
            <AppButton
              className="py-3 text-lg font-medium"
              onClick={() => navigate(ROUTES.SIGNUP)}
            >
              Sign Up
            </AppButton>
          </div>
        </div>
      </div>
      {false && <AppLoader />}
    </div>
  );
};

export default LandingPage;
