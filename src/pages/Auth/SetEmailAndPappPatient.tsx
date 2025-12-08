import React, { useState } from "react";
import AppButton from "../../components/AppButton";
import AppInputField from "../../components/AppInput";
import LoginLogo from "./LoginLogo";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginFormType } from "../../types/form.types";
import { setEmailSchema } from "../../utils/validationSchems";
import { Eye, EyeOff } from "lucide-react";
import API_CONSTANTS from "../../constants/apiConstants";
import { usePostApi } from "../../services/use-api";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";

const SetEmailAndPappPatient: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const form = useForm<LoginFormType>({
    resolver: yupResolver(setEmailSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { postData: updateUserPass, isLoading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.UPDATE_EMAIL_PASSWORD,
    });

  const onSubmit: SubmitHandler<LoginFormType> = async (
    data: LoginFormType
  ) => {
    const payload = {
      email: data.email,
      password: data.password,
    };
    try {
      const data1: any = await updateUserPass(payload);
      if (data1.data.success) {
        const params = new URLSearchParams({
          query: "client",
          email: data.email,
        });
        navigate(`${ROUTES.OTP_VERIFICATION}/?${params.toString()}`);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };
  return (
    <>
      <LoginLogo />
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <AppInputField<LoginFormType>
                name="email"
                form={form}
                label="Email Id"
                placeholder="Email"
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
                {!showPassword ? <EyeOff height={15} /> : <Eye height={15} />}
              </button>
            </div>

            <AppButton
              type="submit"
              disable={isLoading}
              className="w-4/5 text-white shadow hover:bg-gray-700 transition !bg-[#293343] !text-base"
              label="Update Email & Password"
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default SetEmailAndPappPatient;
