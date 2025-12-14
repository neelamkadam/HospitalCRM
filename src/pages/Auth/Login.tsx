import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { LoginFormType } from "../../types/form.types";
import AppInputField from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { NavLink, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import { usePostApi } from "../../services/use-api";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import API_CONSTANTS from "../../constants/apiConstants";
import { useDispatch } from "react-redux";
import { setAuthToken, setUserData } from "../../redux/AuthSlice";
import { setUserDetailsInLocalStorage } from "../../utils/common-utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../utils/validationSchems";
import { resetRegisterDataSlice } from "../../redux/RegisterUser";
import LoginLogo from "./LoginLogo";
// import { BackgroundBeams } from "../../components/ui/background-beams";
import { Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormType>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { postData: login, isLoading } = usePostApi<AuthResponseBodyDataModel>({
    path: API_CONSTANTS.LOGIN,
  });

  const onSubmit: SubmitHandler<LoginFormType> = async (data) => {
    const payload = {
      email: data.email,
      password: data.password,
    };

    try {
      const data1: any = await login(payload);

      if (data1.data.success) {
        dispatch(setAuthToken(data1?.data?.token));
        dispatch(setUserData(data1?.data?.user));
        setUserDetailsInLocalStorage({
          token: data1?.data?.token,
        });

        const user = data1?.data?.user;

        if (user?.requirePasswordChange) {
          navigate(`${ROUTES.UPDATE_EMAIL_PASSWORD}`);
        } else if (!user?.isEmailVerified || !user?.otp?.verified) {
          const params = new URLSearchParams({
            query: "signup",
            email: data.email,
          });
          navigate(`${ROUTES.OTP_VERIFICATION}/?${params.toString()}`);
        } else if (user?.isSuperAdmin) {
          navigate(ROUTES.Organization);
        } else {
          navigate(`${ROUTES.DASHBOARD}`);
        }
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-full">
        <div className="z-50 w-full">
          <LoginLogo />
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md p-8">
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div>
                  <AppInputField<LoginFormType>
                    name="email"
                    form={form}
                    label="Email Id"
                    placeholder="Email Id"
                  />
                </div>
                <div className="relative">
                  <AppInputField<LoginFormType>
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
                    to={ROUTES.RESET_PWD}
                    className="text-[#999999] hover:underline text-[14px]"
                  >
                    Forgot Password?
                  </NavLink>
                </div>
                <AppButton
                  disable={isLoading}
                  type="submit"
                  className="w-full text-white shadow hover:bg-gray-700 transition !bg-[#293343] !text-base"
                  label="Log In"
                />
                <div className="text-center mt-4">
                  <span className="text-sm font-light text-[#526279]">
                    Don't have an account?{" "}
                    <NavLink
                      to={ROUTES.SIGNUP}
                      onClick={() => dispatch(resetRegisterDataSlice())}
                      className="text-[#394557] font-semibold hover:underline"
                    >
                      Sign up
                    </NavLink>
                  </span>
                </div>
                <div className="text-center !mt-2">
                  <span className="text-sm font-light text-[#526279]">
                    <NavLink
                      to={ROUTES.PATIENT_LOGIN}
                      onClick={() => dispatch(resetRegisterDataSlice())}
                      className="text-[#394557] font-semibold hover:underline"
                    >
                      Login
                    </NavLink>{" "}
                    to your personal account.{" "}
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="absolute inset-0 -z-10">
        <BackgroundBeams />
      </div> */}
    </>
  );
};

export default Login;
