import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import AppInputField from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
// import { getUserDetailFromLocalStorage } from "../../utils/common-utils";
import { usePostApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import AppLoader from "../../components/AppLoader";
import LoginLogo from "./LoginLogo";
import { Eye, EyeOff } from "lucide-react";

interface SetNewNewPasswordForm {
  newPassword: string;
  confirmNewPassword: string;
  token: string;
}

const SetNewPasswordScreen: React.FC = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("query");
  const platform = searchParams.get("platform");
  const form = useForm<SetNewNewPasswordForm>();
  const { postData: sendPwdResetRequest, isLoading } = usePostApi<any>({
    path: API_CONSTANTS.SET_NEW_PWD,
  });

  // useEffect(() => {
  //   if (location.search.split("?").length > 0) {
  //     const pathVariable = location.search.split("?")[1].split("=");
  //     if (pathVariable[0] === "token") {
  //       form.setValue("token", pathVariable[1]);
  //     }
  //   }
  // }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      form.setValue("token", token);
    }
  }, [location.search, form]);

  const onSubmit: SubmitHandler<SetNewNewPasswordForm> = async (
    data: SetNewNewPasswordForm
  ) => {
    if (platform === "patient") {
      const params = new URLSearchParams(location.search);
      params.set("token", btoa(data.newPassword));
      navigate(`${ROUTES.OTP_VERIFICATION}/?${params.toString()}`);
    } else {
      const payload = {
        password: data.newPassword,
        token: data.token,
      };
      const res: any = await sendPwdResetRequest(payload);
      if (res.data.success) {
        if (query == ROUTES.SIGNUP) {
          navigate(ROUTES.TEAMMANAGEMENT);
        } else {
          navigate(ROUTES.DASHBOARD);
        }
      }
    }
  };

  return (
    <>
      {isLoading && <AppLoader />}
      <div className="flex items-center justify-center h-full">
        <div className="z-50 w-full">
          <LoginLogo />
          {platform !== "patient" && (
            <h4 className="text-4xl font-light text-center mt-8">
              Password Reset
            </h4>
          )}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md p-8">
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="relative">
                  <AppInputField<SetNewNewPasswordForm>
                    name="newPassword"
                    form={form}
                    label={
                      platform === "patient"
                        ? "Create Password"
                        : "Enter new password"
                    }
                    placeholder="Create a strong password"
                    type={showNewPassword ? "text" : "password"}
                    validation={{
                      required: "Password is required",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#394557] hover:text-gray-700 focus:outline-none mt-[12px]"
                  >
                    {!showNewPassword ? (
                      <EyeOff height={15} />
                    ) : (
                      <Eye height={15} />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <AppInputField<SetNewNewPasswordForm>
                    name="confirmNewPassword"
                    form={form}
                    label={
                      platform === "patient"
                        ? "Confirm Password"
                        : "Confirm new password"
                    }
                    placeholder="Confirm new Password"
                    type={showConfirmPassword ? "text" : "password"}
                    validation={{
                      required: "Passwords should match",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#394557] hover:text-gray-700 focus:outline-none mt-[12px]"
                  >
                    {!showConfirmPassword ? (
                      <EyeOff height={15} />
                    ) : (
                      <Eye height={15} />
                    )}
                  </button>
                </div>
                <AppButton
                  type="submit"
                  label="Submit"
                  className="w-full text-white shadow hover:bg-gray-700 transition !bg-[#293343] !text-base"
                  isLoading={isLoading}
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SetNewPasswordScreen;
