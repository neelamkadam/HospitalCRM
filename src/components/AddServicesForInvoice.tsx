import React from "react";
import AppButton from "./AppButton";
import AppInputField from "./AppInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addServiceInvoiceSchema } from "../utils/validationSchems";
import { AuthResponseBodyDataModel } from "../types/response.types";
import { usePostApi } from "../services/use-api";
import API_CONSTANTS from "../constants/apiConstants";
import { AddServiceReportType } from "../types/form.types";

const AddServicesForInvoice: React.FC<{
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchData: () => void;
}> = ({ setIsModalOpen, fetchData }) => {
  const adminPage = window.location.href.includes("create-admin-invoice");

  const { postData: CreateServiceList, isLoading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: adminPage
        ? API_CONSTANTS.ADMIN.POST_SERVICES
        : API_CONSTANTS.BILLINGS.SERVICE,
    });

  const form = useForm<AddServiceReportType>({
    resolver: yupResolver(addServiceInvoiceSchema),
    defaultValues: {
      service: "",
      price: undefined,
      tax: undefined,
    },
  });

  const onSubmit: SubmitHandler<AddServiceReportType> = async (
    data: AddServiceReportType
  ) => {
    const payload = {
      name: data.service,
      price: data.price,
      tax:
        typeof data.tax === "number"
          ? data.tax
          : data.tax
          ? parseFloat(data.tax)
          : 0,
    };
    try {
      const resData: any = await CreateServiceList(payload);
      if (resData?.data?.success) {
        setIsModalOpen(false);
        fetchData();
        resetFormState();
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  const resetFormState = () => {
    form.reset();
  };

  return (
    <div className="">
      <div className="text-xl text-[#1A2435] font-medium px-6 py-3 text-left">
        Add a Service
      </div>
      <div className="w-full px-6 pb-6">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <AppInputField<AddServiceReportType>
              name="service"
              form={form}
              label="Service"
              placeholder="Enter Service"
            />
          </div>

          <div>
            <AppInputField<AddServiceReportType>
              name="price"
              type="number"
              form={form}
              label="Price"
              placeholder="Enter Price"
            />
          </div>

          <div>
            <AppInputField<AddServiceReportType>
              name="tax"
              type="number"
              form={form}
              label="Tax(%)"
              placeholder="Enter Tax "
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:justify-around">
            <AppButton
              onClick={() => {
                setIsModalOpen(false);
                resetFormState();
              }}
              label="Cancel"
              className="mt-[10px] text-base w-full sm:flex-1 !bg-[#f3f4f6] !text-gray-900"
            />
            <AppButton
              loaddingClass="flex"
              type="submit"
              className="mt-[10px] text-base w-full sm:flex-1"
              disable={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServicesForInvoice;
