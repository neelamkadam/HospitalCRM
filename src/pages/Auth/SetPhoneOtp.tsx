import React, { useCallback, useEffect, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { SetPhoneOtpType } from "../../types/form.types";
import AppInputField from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { NavLink, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import { useSelector } from "react-redux";
import {  setPhoneNumber } from "../../utils/validationSchems";
import { yupResolver } from "@hookform/resolvers/yup";
import { setRegisterUserData } from "../../redux/RegisterUser";
import { useAppDispatch } from "../../redux/store";
import LoginLogo from "./LoginLogo";
import API_CONSTANTS from "../../constants/apiConstants";
import { usePostApi } from "../../services/use-api";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/build/css/intlTelInput.css";
import "./signUp.css"

const SetPhoneOtp: React.FC = () => {
    const { registerUserData } = useSelector((state: any) => state.registerUserData);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const phoneInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<SetPhoneOtpType>({
        resolver: yupResolver(setPhoneNumber),
        defaultValues: {
            countryCode: registerUserData.countryCode || "",
            phone: registerUserData.phone || "",
        },
    });

    const { postData: emailValidate } = usePostApi<AuthResponseBodyDataModel>({
        path: API_CONSTANTS.EMAIL_VALIDATION,
    });

    const onSubmit: SubmitHandler<SetPhoneOtpType> = async (data) => {
        try {
            // Ensure form is valid
            await form.trigger();
            if (!form.formState.isValid) return;

            // Check email existence
            const checkRes = await emailValidate({ phone: data.phone });
            if (!checkRes?.data?.emailExists === undefined) {
                throw new Error("Invalid API response");
            }

            if (checkRes?.data?.phoneExists) {
                form.setError("phone", {
                    type: "manual",
                    message: "phone is already in use"
                });
                return;
            }

            dispatch(setRegisterUserData({
                countryCode: data.countryCode,
                phone: data.phone,
            }));

            navigate(ROUTES.SET_ORGANIZATION);
        } catch (error) {
            form.setError("phone", {
                type: "manual",
                message: "Error checking email. Please try again.",
            });
        }
    };

    const onEmailHandle = useCallback(async () => {
        const payload = { email: form.watch("phone") };
        if (form.watch("phone")) {
            const checkRes: any = await emailValidate(payload);
            if (checkRes.data.emailExists) {
                form.setError("phone", {
                    type: "custom",
                    message: "phone is already in use",
                });
            } else {
                form.clearErrors("phone");
            }
        }
    }, [form.watch, form.setError, form.clearErrors]);

    useEffect(() => {
        if (phoneInputRef.current) {
            const iti = intlTelInput(phoneInputRef.current, {
                initialCountry: "in",
                separateDialCode: true,
            });

            const initialCountry = iti.getSelectedCountryData();
            form.setValue("countryCode", `+${initialCountry.dialCode}`);

            const handlePhoneChange = () => {
                const phoneNumber = phoneInputRef.current?.value.replace(/\D/g, '') || "";
                form.setValue("phone", phoneNumber, { shouldValidate: true });
            };

            const handleCountryChange = () => {
                const countryData = iti.getSelectedCountryData();
                form.setValue("countryCode", `+${countryData.dialCode}`, { shouldValidate: true });
            };

            phoneInputRef.current.addEventListener('input', handlePhoneChange);
            phoneInputRef.current.addEventListener('countrychange', handleCountryChange);

            return () => {
                phoneInputRef.current?.removeEventListener('input', handlePhoneChange);
                phoneInputRef.current?.removeEventListener('countrychange', handleCountryChange);
                iti.destroy();
            };
        }
    }, [form]);

    return (
        <>
            <LoginLogo />
            <div className="flex items-center justify-center">
                <div className="w-full max-w-md p-8">
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                        <div>
                            <label className="flex text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                ref={phoneInputRef}
                                type="tel"
                                className="w-[380px] h-[50px] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#293343]"
                                placeholder="Your phone number"
                                onBlurCapture={() => onEmailHandle()}
                            />
                            {form.formState.errors.phone && (
                                <p className="text-sm text-red-500 mt-1">
                                    {form.formState.errors.phone.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <AppInputField<SetPhoneOtpType>
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

                        <div style={{ marginTop: "-3px" }}>
                            <AppButton
                                type="submit"
                                label="Start Registration"
                                className="w-full text-white shadow hover:bg-gray-800 transition !bg-[#293343] !text-base"
                            />
                        </div>

                        <div className="text-center mt-4">
                            <span className="text-sm font-light text-[#526279]">
                                Already have an account?{" "}
                                <NavLink to={ROUTES.LOGIN} className="text-[#394557] font-semibold hover:underline">
                                    Log in
                                </NavLink>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SetPhoneOtp;

