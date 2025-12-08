import React, { useEffect, useState } from "react";
import AppButton from "../../components/AppButton";
import AppInputField from "../../components/AppInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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
import * as yup from "yup";
import "intl-tel-input/build/css/intlTelInput.css";

type CombinedRegistration = {
  organizationName: string;
  companyRegisterId: string;
  secretKay: string;
  password: string;
};

const combinedSchema = yup.object().shape({
  organizationName: yup.string().required("Organization name is required"),
  companyRegisterId: yup.string().required("Company registration ID is required"),
  secretKay: yup.string().required("Secret key is required"),
  password: yup.string().required("Password is required"),
});

const CompleteRegistration: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { registerUserData } = useSelector(
    (state: any) => state.registerUserData
  );

  const form = useForm<CombinedRegistration>({
    resolver: yupResolver(combinedSchema),
    defaultValues: {
      organizationName: registerUserData?.organizationName || "",
      companyRegisterId: registerUserData?.companyRegistrationID || "",
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

  const onSubmit: SubmitHandler<CombinedRegistration> = async (data) => {
    dispatch(
      setRegisterUserData({
        organizationName: data.organizationName,
        companyRegistrationID: data.companyRegisterId,
      })
    );
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
              organizationName: data.organizationName,
              companyRegistrationID: data.companyRegisterId,
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
                  <AppInputField<CombinedRegistration>
                    name="organizationName"
                    form={form}
                    label="Organization Name"
                    placeholder="Organization Name"
                  />
                </div>
                <div>
                  <AppInputField<CombinedRegistration>
                    name="companyRegisterId"
                    form={form}
                    label="Company Registration Id"
                    placeholder="Company Registration Id"
                  />
                </div>
                <div>
                  <AppInputField<CombinedRegistration>
                    name="secretKay"
                    form={form}
                    label="Medistry Secret Key"
                    placeholder="Medistry Secret Key"
                  />
                </div>
                <div className="relative">
                  <AppInputField<CombinedRegistration>
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
