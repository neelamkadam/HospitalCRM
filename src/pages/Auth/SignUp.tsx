import React, { useCallback, useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { SignUpFormType } from "../../types/form.types";
import AppInputField from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { NavLink, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import { useSelector } from "react-redux";
import { registerSchema } from "../../utils/validationSchems";
import { yupResolver } from "@hookform/resolvers/yup";
import { setRegisterUserData } from "../../redux/RegisterUser";
import { useAppDispatch } from "../../redux/store";
import LoginLogo from "./LoginLogo";
import API_CONSTANTS from "../../constants/apiConstants";
import { usePostApi } from "../../services/use-api";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import "intl-tel-input/build/css/intlTelInput.css";
import "./signUp.css";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Agreement_url,
  Privacy_policy_url,
  Terms_Condition,
} from "../../constants/AppConstants";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/build/css/intlTelInput.css";
import { cn } from "../../utils/common-utils";

const SignUp: React.FC = () => {
  const { registerUserData } = useSelector(
    (state: any) => state.registerUserData
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const itiInstance = useRef<intlTelInput.Plugin | null>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [phoneInitialized, setPhoneInitialized] = useState(false);

  const form = useForm<SignUpFormType>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: registerUserData.name || "",
      email: registerUserData.email || "",
      privacy: false,
      countryCode: registerUserData.countryCode || "",
      phone: registerUserData.phone || "+91",
    },
    mode: "onSubmit", // Change from onBlur to onSubmit
  });

  const { postData: emailValidate } = usePostApi<AuthResponseBodyDataModel>({
    path: API_CONSTANTS.EMAIL_VALIDATION,
  });

  const onSubmit: SubmitHandler<SignUpFormType> = async (data) => {
    try {
      // Ensure form is valid
      await form.trigger();
      if (!form.formState.isValid) return;

      // Check email existence
      const checkRes = await emailValidate({ email: data.email });
      if (!checkRes?.data?.emailExists === undefined) {
        throw new Error("Invalid API response");
      }

      if (checkRes?.data?.emailExists) {
        form.setError("email", {
          type: "manual",
          message: "Email is already in use",
        });
        return;
      }

      // Dispatch valid data
      dispatch(
        setRegisterUserData({
          name: data.name,
          email: data.email,
          countryCode: data.countryCode,
          phone: data.phone,
        })
      );

      navigate(ROUTES.COMPLETE_REGISTRATION);
    } catch (error) {
      form.setError("email", {
        type: "manual",
        message: "Error checking email. Please try again.",
      });
    }
  };

  const onEmailHandle = useCallback(async () => {
    const payload = { email: form.watch("email") };
    if (form.watch("email")) {
      const checkRes: any = await emailValidate(payload);
      if (checkRes.data.emailExists) {
        form.setError("email", {
          type: "custom",
          message: "Email is already in use",
        });
      } else {
        form.clearErrors("email");
      }
    }
  }, [form.watch, form.setError, form.clearErrors, emailValidate]);

  useEffect(() => {
    const input = phoneInputRef.current;
    if (!input || itiInstance.current) return;

    itiInstance.current = intlTelInput(input, {
      initialCountry: "auto",
      geoIpLookup: (callback) => {
        fetch("https://ipapi.co/json/")
          .then((res) => res.json())
          .then((data) => callback(data.country_code))
          .catch(() => callback("us"));
      },
      utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
      separateDialCode: true,
      preferredCountries: ["us", "gb", "in", "au"],
    });

    const handlePhoneChange = () => {
      if (!itiInstance.current || !phoneInputRef.current) return;
      const countryData = itiInstance.current.getSelectedCountryData();
      const nationalNumber = phoneInputRef.current.value.replace(/\D/g, "");

      form.setValue("countryCode", `+${countryData.dialCode}`, {
        shouldValidate: false,
      });
      form.setValue("phone", nationalNumber, { shouldValidate: false });

      // Clear errors if valid phone number is entered (10 digits)
      if (nationalNumber.length === 10) {
        form.clearErrors("phone");
      }
    };

    input.addEventListener("input", handlePhoneChange);
    input.addEventListener("countrychange", handlePhoneChange);

    // Mark as initialized after setup

    setTimeout(() => {
      setPhoneInitialized(true);
      // If there's data from registerUserData, we need to set the phone input value
      if (registerUserData.phone) {
        input.value = registerUserData.phone;
        handlePhoneChange();
      }
    }, 500);

    return () => {
      input.removeEventListener("input", handlePhoneChange);
      input.removeEventListener("countrychange", handlePhoneChange);
      itiInstance.current?.destroy();
      itiInstance.current = null;
    };
  }, []);

  return (
    <>
      <div className="xl:flex items-center justify-center h-full py-4">
        <div className="signup-form w-full">
          <LoginLogo />
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md px-8 py-2">
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <AppInputField<SignUpFormType>
                  name="name"
                  form={form}
                  label="Full Name"
                  placeholder="Your Full Name"
                />
                <AppInputField<SignUpFormType>
                  name="email"
                  form={form}
                  label="Email Id"
                  placeholder="Your Email"
                  // Remove the onBlure prop to prevent validation on blur
                  onBlure={() => onEmailHandle()}
                />
                <div>
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
                    // Remove validation on blur - only validate on form submission
                    onBlur={() => {}}
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="privacy"
                        {...form.register("privacy")}
                        checked={form.watch("privacy")}
                        onCheckedChange={(checked) => {
                          form.setValue("privacy", !!checked, {
                            shouldValidate: false, // Add this to prevent immediate validation
                          });
                          // Remove the form.trigger line to prevent immediate validation
                        }}
                        className={`mt-1 h-4 w-4 rounded border-2 ${
                          form.formState.errors.privacy
                            ? "border-red-500"
                            : "border-[#CBD5E1]"
                        } data-[state=checked]:border-[#293343]`}
                      />
                      <label
                        htmlFor="privacy"
                        className="text-sm font-light text-[#526279] flex-1 whitespace-normal text-left"
                      >
                        <div className="block w-full">
                          I have read, understand, agree to comply with and
                          consent to the
                          <a
                            target="_blank"
                            href={Terms_Condition}
                            className="hover:underline text-[#394557] font-semibold"
                            rel="noopener noreferrer"
                          >
                            Terms and Conditions
                          </a>
                          {", "}
                          <a
                            target="_blank"
                            href={Agreement_url}
                            className="hover:underline text-[#394557] font-semibold"
                            rel="noopener noreferrer"
                          >
                            End User License Agreement
                          </a>{" "}
                          and{" "}
                          <a
                            target="_blank"
                            href={Privacy_policy_url}
                            className="hover:underline text-[#394557] font-semibold"
                            rel="noopener noreferrer"
                          >
                            Privacy Policy
                          </a>
                          .
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "-3px" }}>
                  <AppButton
                    type="submit"
                    label="Start Registration"
                    className="w-full text-white shadow hover:bg-gray-800 transition !bg-[#293343] !text-base mt-6"
                  />
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm font-light text-[#526279]">
                    Already have an account?{" "}
                    <NavLink
                      to={ROUTES.LOGIN}
                      className="text-[#394557] font-semibold hover:underline"
                    >
                      Log in
                    </NavLink>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
