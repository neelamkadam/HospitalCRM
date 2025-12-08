import React, { useEffect } from "react";
import AppButton from "./AppButton";
import AppInputField from "./AppInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addServiceInvoiceSchema } from "../utils/validationSchems";
import { AuthResponseBodyDataModel } from "../types/response.types";
import { usePostApi } from "../services/use-api";
import API_CONSTANTS from "../constants/apiConstants";
import { AddServiceReportType } from "../types/form.types";

const EditServiceInOrg: React.FC<{
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedService: any;
  setServicesList: React.Dispatch<React.SetStateAction<any[]>>;
}> = ({ setIsModalOpen, selectedService, setServicesList }) => {
  const { postData: EditServiceList, isLoading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: `${API_CONSTANTS.BILLINGS.SERVICE}/${selectedService?._id}`,
    });

  const form = useForm<AddServiceReportType>({
    resolver: yupResolver(addServiceInvoiceSchema),
    defaultValues: {
      service: "",
      price: undefined,
      tax: undefined,
    },
  });

  useEffect(() => {
    if (selectedService) {
      form.reset({
        service: selectedService.name || "",
        price: selectedService.price || undefined,
        tax: selectedService.tax || undefined,
      });
    }
  }, [selectedService, form]);

  const onSubmit: SubmitHandler<AddServiceReportType> = async (data) => {
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
      const resData: any = await EditServiceList(payload);
      if (resData?.data?.success) {
        setServicesList((prevServices) =>
          prevServices.map((service) =>
            service._id === selectedService._id
              ? { ...service, ...payload }
              : service
          )
        );
        setIsModalOpen(false);
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
        Edit a Service
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

          <div className="gap-4 flex justify-around">
            <AppButton
              onClick={() => {
                setIsModalOpen(false);
                resetFormState();
              }}
              label="Cancel"
              className="mt-[10px] text-base flex-1 !bg-[#f3f4f6] !text-gray-900"
            />
            <AppButton
              loaddingClass="flex"
              type="submit"
              label="Save Changes"
              className="mt-[10px] text-base flex-1"
              disable={isLoading}
              loadingText="Saving..."
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceInOrg;
