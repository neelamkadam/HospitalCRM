import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { usePostApi } from "../../services/use-api";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import API_CONSTANTS from "../../constants/apiConstants";
import ThankYouScreen from "../../components/ThankYouScreen";
import AppButton from "../../components/AppButton";
import AppInputField from "../../components/AppInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { SetMemberType } from "../../types/form.types";
import { memberVerificationSchems } from "../../utils/validationSchems";
import LoginLogo from "../Auth/LoginLogo";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/build/css/intlTelInput.css";
import { cn } from "../../utils/common-utils";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Agreement_url,
  Privacy_policy_url,
} from "../../constants/AppConstants";

const MemberVerificaitonScreen: React.FC = () => {
  const [isSubmit, setSubmit] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const itiInstance = useRef<intlTelInput.Plugin | null>(null);
  const [phoneInitialized, setPhoneInitialized] = useState(false);


  const form = useForm<SetMemberType>({
    resolver: yupResolver(memberVerificationSchems),
    defaultValues: {
      name: "",
      password: "",
      countryCode: "",
      phone: "",
      privacy: false,
    },
    mode: "onBlur",
  });

  const { postData: inviteMember, isLoading: loading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.ACCEPT_INVITE,
    });

  const onSubmit: SubmitHandler<SetMemberType> = async (
    data: SetMemberType
  ) => {
    const payload = {
      name: data.name,
      password: data.password,
      countryCode: data.countryCode,
      phone: data.phone,
      invitationToken: token,
    };
    try {
      const data1: any = await inviteMember(payload);
      if (data1.data.success) {
        setSubmit(true);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

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
    };


    setTimeout(() => {
      setPhoneInitialized(true);
      handlePhoneChange();
    }, 500);

    input.addEventListener("input", handlePhoneChange);
    input.addEventListener("countrychange", handlePhoneChange);

    return () => {
      input.removeEventListener("input", handlePhoneChange);
      input.removeEventListener("countrychange", handlePhoneChange);
      itiInstance.current?.destroy();
      itiInstance.current = null;
    };
  }, []);

  return (
    <>
      {!isSubmit ? (
        <div className="flex items-center justify-center h-full">
          <div className="signup-form w-full">
            <LoginLogo />
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md p-8">
                <form
                  className="space-y-6"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div>
                    <AppInputField<SetMemberType>
                      name="name"
                      form={form}
                      label="Full Name"
                      placeholder="Full Name"
                    />
                  </div>
                  <div>
                    <AppInputField<SetMemberType>
                      name="password"
                      type="password"
                      form={form}
                      label="Create Password"
                      placeholder="Set Password"
                    />
                  </div>
                  <div>
                    <div className="flex flex-col mb-4">
                      <label className="mb-2 font-medium text-sm text-[#1A2435] text-start">
                        Phone Number
                      </label>
                      <input
                        ref={phoneInputRef}
                        type="tel"
                        onBlur={() => {
                          if (phoneInitialized) {
                            form.trigger(["countryCode", "phone"]);
                          }
                        }}
                        className={cn(
                          `w-full px-4 h-[46.22px] py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#526279] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] placeholder:text-[17px]`,
                          phoneInitialized && form.formState.errors.phone
                            ? "!border-red-500 bg-[#fff2f4] focus:ring-red-500"
                            : ""
                        )}
                        placeholder="Enter phone number"
                      // onBlur={handlePhoneBlur}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="privacy"
                            {...form.register("privacy")}
                            checked={form.watch("privacy")}
                            onCheckedChange={(checked) => {
                              form.setValue("privacy", !!checked);
                              form.trigger("privacy");
                            }}
                            className={`mt-1 h-5 w-5 rounded border-2 ${form.formState.errors.privacy
                              ? "border-red-500"
                              : "border-[#CBD5E1]"
                              } data-[state=checked]:border-[#293343]`}
                          />
                          <label
                            htmlFor="privacy"
                            className="text-sm font-light text-[#526279] flex-1 whitespace-normal text-left"
                          >
                            <div className="block w-full">
                              I have read, understand, and agree to comply with, and
                              consent to, the Updated{" "}
                              <a
                                target="_blank"
                                href={Agreement_url}
                                className="underline text-[#394557] font-semibold"
                                rel="noopener noreferrer"
                              >
                                User License Agreement
                              </a>{" "}
                              and the Updated{" "}
                              <a
                                target="_blank"
                                href={Privacy_policy_url}
                                className="underline text-[#394557] font-semibold"
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
                  </div>
                  <AppButton
                    disable={loading}
                    type="submit"
                    className="w-4/5 text-white shadow hover:bg-gray-700 transition !bg-[#293343] !text-base"
                    label="Accept Invitation"
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ThankYouScreen />
      )}
    </>
  );
};

export default MemberVerificaitonScreen;
