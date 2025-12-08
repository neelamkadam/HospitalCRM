import React, { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { PatientLoginFormType } from "../../types/form.types";
import AppButton from "../../components/AppButton";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import { usePostApi } from "../../services/use-api";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import API_CONSTANTS from "../../constants/apiConstants";
import { useDispatch } from "react-redux";
import { setAuthToken, setUserData } from "../../redux/AuthSlice";
import { setUserDetailsInLocalStorage } from "../../utils/common-utils";
import { yupResolver } from "@hookform/resolvers/yup";
import LoginLogo from "./LoginLogo";
import { patientLogin } from "../../utils/validationSchems";
// import { BackgroundBeams } from "../../components/ui/background-beams";
import { cn } from "../../lib/utils";
import intlTelInput from "intl-tel-input";
import { ArrowLeft } from "lucide-react";

const PatientLogin: React.FC = () => {
  const form = useForm<PatientLoginFormType>({
    resolver: yupResolver(patientLogin),
    defaultValues: {
      countryCode: "+91",
      phone: "",
    },
  });
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const itiInstance = useRef<intlTelInput.Plugin | null>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [phoneInitialized, setPhoneInitialized] = useState(false);
  const isLoginScreen = location.pathname === ROUTES.PATIENT_LOGIN;
  const { postData: login, isLoading } = usePostApi<AuthResponseBodyDataModel>({
    path: API_CONSTANTS.PATIENTS.PATIENT_LOGIN,
  });
  const { postData: PatientSendOtp, isLoading: isLoadingOtp } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.AUTH.PATIENT_SEND_OTP,
    });

  const onSubmit: SubmitHandler<PatientLoginFormType> = async (
    data: PatientLoginFormType
  ) => {
    const payload = {
      countryCode: data.countryCode,
      phone: data.phone,
    };
    if (isLoginScreen) {
      try {
        const data1: any = await login(payload);
        if (data1.data.success) {
          dispatch(setAuthToken(data1?.data?.token));
          dispatch(setUserData(data1?.data?.patient));
          setUserDetailsInLocalStorage({
            token: data1?.data?.token,
          });

          // if (!data1?.data?.patient?.otp.verified) {
          const params = new URLSearchParams({
            query: "signup",
            phone: data.phone,
            platform: "patient",
          });

          if (location.state?.from) {
            params.set(
              "redirect",
              `${location.state.from.pathname}${location.state.from.search}`
            );
          }

          // navigate(`${ROUTES.OTP_VERIFICATION}/?${params.toString()}`);
          if (data1.data.patient.requirePasswordChange) {
            navigate(`${ROUTES.SET_NEW_PWD}?${params.toString()}`);
          } else {
            navigate(`${ROUTES.SET_PATIENT_PWD}?${params.toString()}`);
          }
          // } else {
          //   navigate(`${ROUTES.HEALTHREPORT}?tab=completed`);
          // }
        }
      } catch (error) {
        console.error("Login failed", error);
      }
    } else {
      try {
        const data1: any = await PatientSendOtp(payload);
        if (data1.data.success) {
          navigate(
            `${ROUTES.PATIENT_OTP_REGISTRATION}?phone=${data.phone}&platform=patient-rest-password`
          );
        }
      } catch (error) {
        console.error("Request Reset Password failed", error);
      }
    }
  };
  useEffect(() => {
    const input = phoneInputRef.current;
    if (!input || itiInstance.current) return;

    // Add CSS styles to fix dropdown issues
    const style = document.createElement("style");
    style.textContent = `
      .iti__country-list {
        z-index: 9999 !important;
        position: absolute !important;
        max-height: 200px !important;
        overflow-y: auto !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        border: 1px solid #d1d5db !important;
      }
      .iti__flag-container {
        cursor: pointer !important;
      }
      .iti {
        width: 100% !important;
      }
    `;
    document.head.appendChild(style);

    itiInstance.current = intlTelInput(input, {
      initialCountry: "in",
      utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
      separateDialCode: true,
      preferredCountries: ["in", "us", "gb", "au"],
      dropdownContainer: document.body,
    });

    const handlePhoneChange = () => {
      if (!itiInstance.current || !phoneInputRef.current) return;
      const countryData = itiInstance.current.getSelectedCountryData();
      const nationalNumber = phoneInputRef.current.value.replace(/\D/g, "");

      form.setValue("countryCode", `+${countryData.dialCode}`, {
        shouldValidate: false,
      });
      form.setValue("phone", nationalNumber, { shouldValidate: false });

      if (nationalNumber.length === 10) {
        form.clearErrors("phone");
      }
    };

    input.addEventListener("input", handlePhoneChange);
    input.addEventListener("countrychange", handlePhoneChange);

    setTimeout(() => {
      setPhoneInitialized(true);
    }, 100);

    return () => {
      input.removeEventListener("input", handlePhoneChange);
      input.removeEventListener("countrychange", handlePhoneChange);
      itiInstance.current?.destroy();
      itiInstance.current = null;
      document.head.removeChild(style);
    };
  }, []);
  return (
    <>
      {/* <header className="flex justify-between"> */}
      <div className="min-h-screen flex flex-col bg-white overflow-hidden">
        <AppButton
          onClick={() =>
            isLoginScreen ? navigate(ROUTES.LOGIN) : navigate(-1)
          }
          className="py-3 mx-4 mt-4 self-start rounded-[30px] w-[130px] h-[40px] !bg-white !text-[#293343] border-none flex items-center justify-center pl-1 text-sm"
        >
          <ArrowLeft className="w-7 h-7" />
          Back
        </AppButton>

        <div className="flex flex-1 items-center justify-center">
          <div className="z-50 w-full">
            <LoginLogo />
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md p-8">
                <form
                  className="space-y-6"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="mb-[13px]">
                    <label className="flex text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      className={cn(
                        `w-full px-4 h-[46.22px] py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#526279] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] placeholder:text-[17px]`,
                        phoneInitialized && form.formState.errors.phone
                          ? "!border-red-500 bg-[#fff2f4] focus:ring-red-500"
                          : ""
                      )}
                      placeholder="Enter phone number"
                      onBlur={() => {}}
                    />
                  </div>
                  <AppButton
                    disable={isLoading || isLoadingOtp}
                    type="submit"
                    className="w-full text-white shadow hover:bg-gray-700 transition !bg-[#293343] !text-base"
                    label={isLoginScreen ? "Log In" : "Request OTP"}
                  />
                </form>
              </div>
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

export default PatientLogin;
