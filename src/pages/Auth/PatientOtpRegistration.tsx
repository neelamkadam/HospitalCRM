import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import AppInputField from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import { usePostApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import AppLoader from "../../components/AppLoader";
import { useDispatch, useSelector } from "react-redux";
import { decrementResendOtpTimer } from "../../redux/AuthSlice";
import { Eye, EyeOff } from "lucide-react";
import { yupResolver } from "@hookform/resolvers/yup";
import { PatientOtpRegistrationSchema } from "../../utils/validationSchems";
import { toast } from "react-toastify";
import { TOASTER_CONFIG } from "../../constants/commanConstants";

interface OTPFormType {
  otp: any;
  newPassword: string;
  confirmNewPassword: string;
}

const PatientOtpRegistration: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const phone = searchParams.get("phone");
  //   const form = useForm<OTPFormType>();
  const form = useForm<OTPFormType>({
    resolver: yupResolver(PatientOtpRegistrationSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });
  const { postData: verifyOtp, isLoading } = usePostApi<any>({
    path: API_CONSTANTS.AUTH.PATIENT_RESET_PWD,
    options: { isToaster: true },
  });
  const { postData: resendOtp, isLoading: loading } = usePostApi<any>({
    path: API_CONSTANTS.AUTH.PATIENT_SEND_OTP,
  });
  const { resendOtpTimer } = useSelector((state: any) => state?.authData);

  const onSubmit: SubmitHandler<OTPFormType> = async (data: OTPFormType) => {
    try {
      const payload = {
        otp: parseInt(data.otp),
        password: data.newPassword,
      };
      const res: any = await verifyOtp(payload);
      if (res.data.success) {
        // toast.success(res.data.message, TOASTER_CONFIG);
        toast.success("Successfully reset password", TOASTER_CONFIG);
        navigate(ROUTES.PATIENT_LOGIN);
      }
    } catch (error) {
      console.log(error);
      form.setValue("otp", "");
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendOtpTimer > 0) {
      interval = setInterval(() => {
        dispatch(decrementResendOtpTimer());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendOtpTimer, dispatch]);

  const handleResendOtp = async () => {
    if (resendOtpTimer > 0) return;
    try {
      const payload = {
        countryCode: "+91",
        phone: phone,
      };
      await resendOtp(payload);
      form.setValue("otp", "");
    } catch (error) {
      form.setValue("otp", "");
    }
  };

  return (
    <>
      {loading && <AppLoader />}
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8">
          <h2 className="text-4xl font-light text-center mb-6 text-[#394557]">
            Set New Password
          </h2>
          <p className="text-center text-sm font-light text-[#526279] mb-6">
            Please enter the 6-digit OTP sent to your mobile number
            <span className="font-medium text-[#394557]"> {phone}</span>
          </p>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <AppInputField<OTPFormType>
                name="otp"
                form={form}
                label="Enter OTP"
                placeholder="Enter 6-digit OTP"
                type="text"
                maxLength={6}
                validation={{
                  required: "OTP is required",
                  pattern: {
                    value: /^[0-9]{6}$/, // Regex for 6-digit OTP validation
                    message: "Please enter a valid 6-digit OTP",
                  },
                }}
              />
            </div>
            <div className="relative">
              <AppInputField<OTPFormType>
                name="newPassword"
                form={form}
                label={"Enter new password"}
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
              <AppInputField<OTPFormType>
                name="confirmNewPassword"
                form={form}
                label={"Confirm new password"}
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
              label="Set New Password"
              className="w-full text-white shadow hover:bg-gray-700 transition !bg-[#293343] !text-base"
              disable={isLoading}
            />
          </form>
          <div className="text-center mt-4">
            <span className="text-sm cursor-pointer font-light text-[#526279]">
              Didn't receive OTP?{" "}
              {resendOtpTimer > 0 ? (
                <span className="text-gray-400">
                  Resend in {resendOtpTimer}s
                </span>
              ) : (
                <a
                  className="text-[#394557] font-semibold hover:underline cursor-pointer"
                  onClick={handleResendOtp}
                >
                  Resend OTP
                </a>
              )}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientOtpRegistration;
