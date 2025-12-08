import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import AppInputField from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import { usePostApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import AppLoader from "../../components/AppLoader";
import { useSelector, useDispatch } from "react-redux";
import {
  setResendOtpTimer,
  decrementResendOtpTimer,
} from "../../redux/AuthSlice";

interface OTPFormType {
  otp: any;
}

const OtpVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userData, resendOtpTimer } = useSelector(
    (state: any) => state?.authData
  );
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("query");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const platform = searchParams.get("platform");
  const redirectUrl = searchParams.get("redirect");
  const token = searchParams.get("token");
  const decodedPass = token ? atob(token) : null;
  const form = useForm<OTPFormType>();
  const { postData: verifyOtp, isLoading } = usePostApi<any>({
    path: API_CONSTANTS.OTP_VERIFY,
  });
  const { postData: patientVerifyOtp, isLoading: patientLoading } =
    usePostApi<any>({
      path: API_CONSTANTS.PATIENTS.PATIENT_OTP_VERIFY,
    });
  const { postData: resendOtp, isLoading: loading } = usePostApi<any>({
    path: API_CONSTANTS.OTP_RESEND,
  });
  const { postData: patientResendOtp, isLoading: patientResentLoading } =
    usePostApi<any>({
      path: API_CONSTANTS.PATIENTS.PATIENT_RESEND_OTP,
    });

  const onSubmit: SubmitHandler<OTPFormType> = async (data: OTPFormType) => {
    try {
      const payload = {
        otp: parseInt(data.otp),
        password: platform === "patient" ? decodedPass : undefined,
      };
      if (platform === "patient") {
        const res: any = await patientVerifyOtp(payload);
        if (res.data.success) {
          if (userData.name === undefined || null) {
            navigate(ROUTES.ADD_PATIENT_INFORMATION);
            window.scrollTo(0, 0);
          } else {
            const finalUrl =
              redirectUrl || `${ROUTES.HEALTHREPORT}?tab=completed`;
            navigate(finalUrl);
            window.scrollTo(0, 0);
          }
        }
      } else {
        const res: any = await verifyOtp(payload);
        if (res.data.success) {
          if (query === ROUTES.SIGNUP) {
            navigate(ROUTES.DASHBOARD);
          } else if (query === "client" || userData.role === "client") {
            navigate(`${ROUTES.HEALTHREPORT}?tab=completed`);
          } else if (userData?.isSuperAdmin) {
            navigate(ROUTES.Organization);
          } else {
            if (
              userData?.permissions[0] === "admin" ||
              userData?.permissions[0] === "dashboard"
            ) {
              navigate(ROUTES.DASHBOARD);
            } else {
              navigate(`/${userData.permissions[0]}`);
            }
          }
          window.scrollTo(0, 0);
        }
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
      dispatch(setResendOtpTimer(30));
      if (platform === "patient") {
        await patientResendOtp();
      } else {
        await resendOtp();
      }
      form.setValue("otp", "");
    } catch (error) {
      form.setValue("otp", "");
    }
  };

  return (
    <>
      {(loading || patientResentLoading) && <AppLoader />}
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8">
          <h2 className="text-4xl font-light text-center mb-6 text-[#394557]">
            OTP Verification
          </h2>
          <p className="text-center text-sm font-light text-[#526279] mb-6">
            Please enter the 6-digit OTP sent to your{" "}
            {email ? "email address" : "mobile number"}{" "}
            {email ? (
              <span className="font-medium text-[#394557]">{email}</span>
            ) : (
              <span className="font-medium text-[#394557]">{phone}</span>
            )}
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
            <AppButton
              type="submit"
              label="Verify OTP"
              className="w-full text-white shadow hover:bg-gray-700 transition !bg-[#293343] !text-base"
              disable={isLoading || patientLoading}
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

export default OtpVerification;
