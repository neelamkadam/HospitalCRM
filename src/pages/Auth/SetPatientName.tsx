import React from "react";
import AppButton from "../../components/AppButton";
import AppInputField from "../../components/AppInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { SetPatientNameType } from "../../types/form.types";
import { yupResolver } from "@hookform/resolvers/yup";
import { SetPatientNameSchema } from "../../utils/validationSchems";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../redux/store";
import { setRegisterUserData } from "../../redux/RegisterUser";
import { ROUTES } from "../../constants/routesConstants";
import { useNavigate } from "react-router-dom";
import LoginLogo from "./LoginLogo";

const SetPatientName: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { registerUserData } = useSelector(
    (state: any) => state.registerUserData
  );

  const form = useForm<SetPatientNameType>({
    resolver: yupResolver(SetPatientNameSchema),
    defaultValues: {
      patientName: registerUserData?.privatePracticeName || "",
      registerMedicalId: registerUserData?.registeredMedicalID || "",
    },
  });

  const onSubmit: SubmitHandler<SetPatientNameType> = async (
    data: SetPatientNameType
  ) => {
    dispatch(
      setRegisterUserData({
        privatePracticeName: data.patientName,
        registeredMedicalID: data.registerMedicalId,
      })
    );
    navigate(`${ROUTES.COMPLETE_REGISTRATION}`);
  };

  return (
    <div>
      <LoginLogo />
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <AppInputField<SetPatientNameType>
                name="patientName"
                form={form}
                label="Practice Name."
                placeholder="Practice Name"
              />
            </div>
            <div>
              <AppInputField<SetPatientNameType>
                name="registerMedicalId"
                form={form}
                label="Register Medical Id"
                placeholder="Company  Medical Id"
              />
            </div>

            <AppButton
              type="submit"
              className="w-4/5 text-white shadow hover:bg-gray-700 transition !bg-[#293343]"
              label="Set Up Practice"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetPatientName;
