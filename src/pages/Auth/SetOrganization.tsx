import React from "react";
import AppButton from "../../components/AppButton";
import AppInputField from "../../components/AppInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { SetOrganizationType } from "../../types/form.types";
import { yupResolver } from "@hookform/resolvers/yup";
import { SetOrganizationSchema } from "../../utils/validationSchems";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../redux/store";
import { ROUTES } from "../../constants/routesConstants";
import { setRegisterUserData } from "../../redux/RegisterUser";
import LoginLogo from "./LoginLogo";

const SetOrganization: React.FC = () => {
  const { registerUserData } = useSelector(
    (state: any) => state.registerUserData
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const form = useForm<SetOrganizationType>({
    resolver: yupResolver(SetOrganizationSchema),
    defaultValues: {
      organizationName: registerUserData?.organizationName || "",
      companyRegisterId: registerUserData?.companyRegistrationID || "",
    },
  });

  const onSubmit: SubmitHandler<SetOrganizationType> = async (
    data: SetOrganizationType
  ) => {
    dispatch(
      setRegisterUserData({
        organizationName: data.organizationName,
        companyRegistrationID: data.companyRegisterId,
      })
    );
    navigate(`${ROUTES.COMPLETE_REGISTRATION}`);
  };

  return (
    <>
      <div className="flex items-center justify-center h-full">
        <div className="set-org-form w-full">
          <LoginLogo />
          <div className="flex items-center justify-center ">
            <div className="w-full max-w-md p-8">
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div>
                  <AppInputField<SetOrganizationType>
                    name="organizationName"
                    form={form}
                    label="Organization Name"
                    placeholder="Organization Name"
                  />
                </div>
                <div>
                  <AppInputField<SetOrganizationType>
                    name="companyRegisterId"
                    form={form}
                    label="Company Registration Id"
                    placeholder="Company Registration Id"
                  />
                </div>

                <AppButton
                  type="submit"
                  className="w-4/5 text-white shadow hover:bg-gray-700 transition !bg-[#293343] !text-base"
                  label="Set Up Organization"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SetOrganization;
