import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import AppInputField from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import { usePostApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import LoginLogo from "./LoginLogo";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { TOASTER_CONFIG } from "../../constants/commanConstants";

interface SetNewNewPasswordForm {
  password: string;
}

const PatientPasswordVerify: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<SetNewNewPasswordForm>();
  const { postData: sendPwdRequest, isLoading } = usePostApi<any>({
    path: API_CONSTANTS.AUTH.VERIFY_PATIENT_PASSWORD,
  });

  const onSubmit: SubmitHandler<SetNewNewPasswordForm> = async (
    data: SetNewNewPasswordForm
  ) => {
    const payload = {
      password: data.password,
    };
    const res: any = await sendPwdRequest(payload);
    if (res.data.success) {
      if (res.data.passwordCorrect) {
        const params = new URLSearchParams(location.search);
        params.set("token", btoa(data.password));
        navigate(`${ROUTES.OTP_VERIFICATION}/?${params.toString()}`);
      } else {
        toast.error("Incorrect Password", TOASTER_CONFIG);
      }
    }
  };

  return (
    <>
      {/* {isLoading && <AppLoader />} */}
      <div className="flex items-center justify-center h-full">
        <div className="z-50 w-full">
          <LoginLogo />
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md p-8">
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="relative">
                  <AppInputField<SetNewNewPasswordForm>
                    name="password"
                    type={showPassword ? "text" : "password"}
                    form={form}
                    label="Password"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#394557] hover:text-gray-700 focus:outline-none mt-[12px]"
                  >
                    {!showPassword ? (
                      <EyeOff height={15} />
                    ) : (
                      <Eye height={15} />
                    )}
                  </button>
                </div>
                <div
                  className="text-sm text-right"
                  style={{ marginTop: "-7px" }}
                >
                  <NavLink
                    to={ROUTES.PAtTIENT_SEND_OTP}
                    className="text-[#999999] hover:underline text-[14px]"
                  >
                    Forgot Password?
                  </NavLink>
                </div>
                <AppButton
                  disable={isLoading}
                  type="submit"
                  className="w-full text-white shadow hover:bg-gray-700 transition !bg-[#293343] !text-base"
                  label="Submit"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientPasswordVerify;
