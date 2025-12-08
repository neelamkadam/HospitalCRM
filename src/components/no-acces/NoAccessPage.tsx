import React from "react";
// import { clearLocalStorage } from "../../utils/common-utils";
import { useNavigate } from "react-router-dom";
// import { useUserContext } from "../../context/UserProvider";
import { ShieldX } from "lucide-react";
import AppButton from "../AppButton";
import { ROUTES } from "../../constants/routesConstants";

interface NoAccessPageProps {
  btnLabel?: string;
  onClick?: () => void;
}

const NoAccessPage: React.FC = ({
  btnLabel = "Log out",
  onClick,
}: NoAccessPageProps) => {
  //   const { setUserData } = useUserContext();
  const navigate = useNavigate();
  const logout = () => {
    // clearLocalStorage();
    // setUserData(null);
    navigate(ROUTES.LOGIN, {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full  shadow-lg rounded-lg p-8 text-center">
        <ShieldX
          color="red"
          width={80}
          height={80}
          className="flex justify-center items-center w-full"
        />
        <h2 className="mt-6 text-3xl font-extrabold">Access Denied</h2>
        <p className="mt-2 text-sm text-white">
          Sorry, you don't have access to this page. If you believe this is an
          error, please contact support.
        </p>
        <AppButton
          onClick={onClick ?? logout}
          label={btnLabel}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default NoAccessPage;
