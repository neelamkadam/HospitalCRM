import React, { useEffect, useRef } from "react";
import AppButton from "./AppButton";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addPaidInvoiceSchema } from "../utils/validationSchems";
import { AuthResponseBodyDataModel } from "../types/response.types";
import { usePostApi } from "../services/use-api";
import API_CONSTANTS from "../constants/apiConstants";
import { AddPaidInvoiceType } from "../types/form.types";
import DropDownSelect from "./DropdownSelect";
import { PaymentMethodSelect } from "../constants/commanConstants";

const AddPaidInvoice: React.FC<{
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  invoiceData: any;
  fetchData: (page: number, resetData?: boolean) => void;
}> = ({ setIsModalOpen, invoiceData, fetchData }) => {
  const { postData: PutInvoiceApi, isLoading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.BILLINGS.CREATE_INVOICE,
    });

  const form = useForm<AddPaidInvoiceType>({
    resolver: yupResolver(addPaidInvoiceSchema),
    defaultValues: {
      paymentMethod: invoiceData.paymentMethod || "",
      paymentDetails: invoiceData.paymentDetails || "",
      note: invoiceData.notes || "",
    },
  });

  const { register } = form;

  const onSubmit: SubmitHandler<AddPaidInvoiceType> = async (
    data: AddPaidInvoiceType
  ) => {
    const payload = {
      clientId: invoiceData?.clientId?._id,
      status: "paid",
      invoiceType: "medical",
      items: invoiceData?.items?.items,
      amount: invoiceData?.amount,
      notes: data.note,
      insuranceCode: "",
      taxAmount: invoiceData?.totalAmount,
      discount: 5,
      totalAmount: invoiceData?.totalAmount,
      paymentDueDate: invoiceData?.paymentDueDate,
      billingDate: invoiceData?.billingDate,
      paymentMethod: data.paymentMethod,
      paymentDetails: data.paymentDetails,
    };

    try {
      const resData: any = await PutInvoiceApi(
        payload,
        `${API_CONSTANTS.BILLINGS.GET_INVOICE}/${invoiceData._id}`
      );
      if (resData?.data?.success) {
        setIsModalOpen(false);
        fetchData(1, true);
        resetFormState();
      }
    } catch (error) {
      console.error("Error submitting invoice:", error);
    }
  };
  const resetFormState = () => {
    form.reset();
  };

  const formRef = useRef<HTMLFormElement>(null);

  // Effect to prevent auto-focus when modal opens
  useEffect(() => {
    // Blur any focused elements when the component mounts
    const timer = setTimeout(() => {
      if (formRef.current) {
        const focusedElement = document.activeElement as HTMLElement;
        if (formRef.current.contains(focusedElement)) {
          focusedElement.blur();
        }
      }
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="">
      <div className="text-xl text-[#1A2435] font-medium px-6 py-3 text-left">
        Paid Invoice
      </div>
      <div className="w-full px-6 pb-6">
        <form
          ref={formRef}
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <div>
            <DropDownSelect<AddPaidInvoiceType>
              name="paymentMethod"
              form={form}
              label="Payment method"
              options={PaymentMethodSelect}
              placeholder="Select Payment method"
              autoFocus={false}
              disabled={invoiceData?.viewDetails}
            />
          </div>

          <div>
            <label className="block text-sm text-left font-medium text-[#1A2435] mb-1">
              Payment Details
            </label>
            <textarea
              {...register("paymentDetails")}
              placeholder="Type your payment details here..."
              rows={2}
              className="mt-1 block w-full px-3 py-3  rounded-md sm:text-sm border border-[#ccc] focus:outline-none focus:ring-2 focus:ring-[#526279] "
              autoFocus={false}
              disabled={invoiceData?.viewDetails}
            />
          </div>

          <div>
            <label className="block text-sm text-left font-medium text-[#1A2435] mb-1">
              Remarks
            </label>
            <textarea
              {...register("note")}
              placeholder="Type your remarks here..."
              rows={2}
              className="mt-1 block w-full px-3 py-3 rounded-md sm:text-sm border border-[#ccc] focus:outline-none focus:ring-2 focus:ring-[#526279]"
              autoFocus={false}
              disabled={invoiceData?.viewDetails}
            />
          </div>

          <div className="gap-4 flex justify-around">
            <AppButton
              onClick={() => {
                setIsModalOpen(false);
                resetFormState();
              }}
              label="Cancel"
              type="button"
              className="mt-[10px] text-base flex-1 !bg-[#f3f4f6] !text-gray-900"
            />
            <AppButton
              type="submit"
              className="mt-[10px] text-base flex-1"
              label={isLoading ? "Processing..." : "Paid"}
              disable={isLoading}
              loaddingClass="flex items-center justify-center"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaidInvoice;
