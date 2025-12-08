import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import AppButton from "./AppButton";
import AppInputField from "./AppInput";
import { addApiKeySchema } from "../utils/validationSchems";
import API_CONSTANTS from "../constants/apiConstants";
import { usePostApi } from "../services/use-api";
import { AuthResponseBodyDataModel } from "../types/response.types";

export interface AddApiKey {
  lable: string;
}

export interface AddPatientProps {
  toggleClose: () => void;
  fetchReports: () => void;
}

const AppApiKeyModal: React.FC<AddPatientProps> = ({
  toggleClose,
  fetchReports,
}) => {
  const { postData: addApiKeys, isLoading: loading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.API_KEYS.API_KEY,
    });

  const form = useForm<AddApiKey>({
    resolver: yupResolver(addApiKeySchema),
    defaultValues: {
      lable: "",
    },
  });

  const onSubmit: SubmitHandler<AddApiKey> = async (data: AddApiKey) => {
    const payload = {
      label: data.lable,
    };
    const resData: any = await addApiKeys(payload);
    if (resData?.data?.success) {
      toggleClose();
      fetchReports();
    }
  };

  return (
    <div className="p-0">
      <header className="mb-0">
        <h1 className="text-xl text-[#1A2435] font-medium px-6 py-4 border-b text-left">
          Generate Key
        </h1>
      </header>
      <form
        className="space-y-6 text-[#1A2435] font-bolder text-[16px] p-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div>
          <AppInputField<AddApiKey>
            name="lable"
            form={form}
            label="Add Kay Name"
            placeholder="Kay Name"
          />
        </div>
        <div>
          <AppButton
            isLoading={loading}
            type="submit"
            className="w-full mt-0 text-base"
            label="Create Key"
          />
        </div>
      </form>
    </div>
  );
};

export default AppApiKeyModal;
