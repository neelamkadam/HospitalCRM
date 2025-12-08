import React, { useEffect, useState } from "react";
import AppButton from "../../components/AppButton";
import AppInputField from "../../components/AppInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { completeRegistration } from "../../types/form.types";
import { completeRegistrationShema } from "../../utils/validationSchems";
import { usePostApi } from "../../services/use-api";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import API_CONSTANTS from "../../constants/apiConstants";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../redux/store";
import { setAuthToken } from "../../redux/AuthSlice";
import { setUserDetailsInLocalStorage } from "../../utils/common-utils";
import { ROUTES } from "../../constants/routesConstants";
import { useSelector } from "react-redux";
import {
  resetRegisterDataSlice,
  setRegisterUserData,
} from "../../redux/RegisterUser";
import LoginLogo from "./LoginLogo";
import { Eye, EyeOff } from "lucide-react";
import "intl-tel-input/build/css/intlTelInput.css";

const CompleteRegistration: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { registerUserData } = useSelector(
    (state: any) => state.registerUserData
  );
  const form = useForm<completeRegistration>({
    resolver: yupResolver(completeRegistrationShema),
    defaultValues: {
      secretKay: "",
      password: "",
    },
  });

  const { postData: signup, isLoading } = usePostApi<AuthResponseBodyDataModel>(
    {
      path: API_CONSTANTS.SIGNUP,
    }
  );

  useEffect(() => {
    dispatch(
      setRegisterUserData({
        role: "organization",
      })
    );
  }, []);

  const onSubmit: SubmitHandler<completeRegistration> = async (
    data: completeRegistration
  ) => {
    try {
      // Common payload fields
      const basePayload = {
        password: data.password,
        referralCode: data.secretKay,
        name: registerUserData?.name,
        email: registerUserData?.email,
        timezone: "Asia/Kolkata",
        role: registerUserData?.role,
        countryCode: registerUserData.countryCode,
        phone: registerUserData.phone,
      };

      // Extend base payload based on role
      const payload =
        registerUserData.role !== "individual"
          ? {
              ...basePayload,
              organizationName: registerUserData?.organizationName,
              companyRegistrationID: registerUserData?.companyRegistrationID,
            }
          : {
              ...basePayload,
              privatePracticeName: registerUserData?.privatePracticeName,
              registeredMedicalID: registerUserData?.registeredMedicalID,
            };

      const resData = await signup(payload);

      if (resData?.data?.success) {
        const token = resData?.data?.token;

        // Update auth state and local storage
        dispatch(setAuthToken(token));
        dispatch(resetRegisterDataSlice());
        setUserDetailsInLocalStorage({ token });

        // Navigate to OTP verification
        const params = new URLSearchParams({
          query: ROUTES.SIGNUP,
          email: registerUserData?.email,
        });
        navigate(`${ROUTES.OTP_VERIFICATION}?${params.toString()}`);
      }
    } catch (error) {
      // Handle error appropriately
      console.error("Registration failed:", error);
      // You might want to show an error message to the user
    }
  };
  return (
    <>
      <div className="flex items-center justify-center h-full">
        <div className="set-org-form w-full">
          <LoginLogo />
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md p-8">
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div>
                  <AppInputField<completeRegistration>
                    name="secretKay"
                    form={form}
                    label="Medistry Secret Key"
                    placeholder="Medistry Secret Key"
                  />
                </div>
                {/* <div>
                  <div className="flex flex-col mb-4">
                    <label className="mb-2 font-medium text-sm text-[#1A2435] text-start">
                      Phone Number
                    </label>
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      className={cn(
                        `w-full px-4 h-[46.22px] py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#526279] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] placeholder:text-[17px]`,
                        form.formState.errors.phone
                          ? "!border-red-500 bg-[#fff2f4] focus:ring-red-500"
                          : ""
                      )}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div> */}
                <div className="relative">
                  <AppInputField<completeRegistration>
                    name="password"
                    type={showPassword ? "text" : "password"}
                    form={form}
                    label="Create Your Password"
                    placeholder="Create Your Password"
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

                <AppButton
                  type="submit"
                  disable={isLoading}
                  className="w-4/5 text-white shadow hover:bg-gray-700 transition !bg-[#293343]"
                  label="Complete Registration"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompleteRegistration;
