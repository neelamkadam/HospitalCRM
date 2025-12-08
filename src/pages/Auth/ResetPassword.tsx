import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import AppInputField from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { usePostApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import AppLoader from "../../components/AppLoader";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";

interface PWDResetRequestFormType {
  email: string;
}

const ResetPassword: React.FC = () => {
  const form = useForm<PWDResetRequestFormType>();
  const { postData: sendPwdResetRequest, isLoading } = usePostApi<any>({
    path: API_CONSTANTS.PWD_RESET,
  });
  const [isPwdResetReqestMade, setPwdResetRequestMade] = useState(false);
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<PWDResetRequestFormType> = async (
    data: PWDResetRequestFormType
  ) => {
    const payload = {
      email: data.email,
    };
    const res: any = await sendPwdResetRequest(payload);
    if (res.data.success) {
      setPwdResetRequestMade(true);
    }
  };

  return (
    <>
      {isLoading && <AppLoader />}

      {!isPwdResetReqestMade ? (
        <div className="h-screen flex flex-col bg-white overflow-hidden relative">
          {/* Back Button - Positioned top-left */}
          <div className="absolute left-4 z-10">
            <AppButton
              onClick={() => navigate(ROUTES.LOGIN)}
              className="py-3 mx-4 mt-4 self-start rounded-[30px] w-[130px] h-[40px] !bg-white !text-[#293343] border-none flex items-center justify-center pl-1 text-sm"
            >
              <ArrowLeft className="w-7 h-7" />
              Back
            </AppButton>
          </div>

          {/* Centered Form Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md p-8">
              <h2 className="text-4xl font-light text-center mb-8 text-[#394557]">
                Password Reset
              </h2>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <div>
                  <AppInputField<PWDResetRequestFormType>
                    name="email"
                    form={form}
                    label="Enter Email"
                    placeholder="Enter your email ID"
                    type="text"
                    validation={{
                      required: "Email is required",
                      pattern: {
                        value: /^[^@]+@[^@]+\.[^@]+$/,
                        message: "Please enter a valid email",
                      },
                    }}
                  />
                </div>
                <AppButton
                  type="submit"
                  label="Submit"
                  className="w-full text-white"
                  isLoading={isLoading}
                />
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center">
          <div className="w-full max-w-md p-8">
            <h2 className="text-4xl font-light text-center mb-8">
              Password Reset Request sent
            </h2>
          </div>
        </div>
      )}


    </>
  );
};

export default ResetPassword;
