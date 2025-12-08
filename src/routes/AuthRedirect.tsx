import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getTokenFromLocalStorage } from "../utils/common-utils";
import { ROUTES } from "../constants/routesConstants";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthToken = getTokenFromLocalStorage();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const source = searchParams.get("source");

  if (!isAuthToken) {
    if (source === "patient") {
      return (
        <Navigate
          to={ROUTES.PATIENT_LOGIN}
          state={{ from: location }}
        />
      );
    }

    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
