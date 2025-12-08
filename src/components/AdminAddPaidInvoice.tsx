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

const AdminAddPaidInvoice: React.FC<{
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  invoiceData: any;
  fetchData: (page: number, resetData?: boolean) => void;
}> = ({ setIsModalOpen, invoiceData, fetchData }) => {

  const { postData: PutInvoiceApi, isLoading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: `${API_CONSTANTS.ADMIN.CREATE_ADMIN_INVOICE}/${invoiceData?._id}`,
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
      organizationId: invoiceData?.organizationId,
      items: invoiceData?.items,
      amount: invoiceData?.amount,
      status: "paid",
      notes: data.note,
      taxAmount: invoiceData?.totalAmount,
      discount: 5,
      totalAmount: invoiceData?.totalAmount,
      paymentDueDate: invoiceData?.paymentDueDate,
      paymentDate: new Date(),
    };

    try {
      const resData: any = await PutInvoiceApi(payload);
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

  useEffect(() => {
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

  // If in view mode, show invoice details
  if (invoiceData?.viewDetails) {
    return (
      <div className="">
        <div className="text-xl text-[#1A2435] font-medium px-6 py-3 text-left">
          Invoice Details
        </div>
        <div className="w-full px-6 pb-6 space-y-4">
          {/* Organization Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-[#1A2435] mb-3">Organization Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#666D79] mb-1">Organization Name</label>
                <p className="text-[#1A2435] font-medium">{invoiceData?.organizationDetails?.organizationName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#666D79] mb-1">Email</label>
                <p className="text-[#1A2435]">{invoiceData?.organizationDetails?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#666D79] mb-1">Phone</label>
                <p className="text-[#1A2435]">{invoiceData?.organizationDetails?.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#666D79] mb-1">Address</label>
                <p className="text-[#1A2435]">{invoiceData?.organizationDetails?.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-[#1A2435] mb-3">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#666D79] mb-1">Total Amount</label>
                <p className="text-[#1A2435] font-semibold text-lg">₹{invoiceData?.totalAmount || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#666D79] mb-1">Payment Status</label>
                <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${
                  invoiceData?.status === 'paid' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {invoiceData?.status || 'N/A'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#666D79] mb-1">Payment Method</label>
                <p className="text-[#1A2435]">{invoiceData?.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#666D79] mb-1">Payment Due Date</label>
                <p className="text-[#1A2435]">{invoiceData?.paymentDueDate ? new Date(invoiceData.paymentDueDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          {invoiceData?.items && invoiceData.items.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#1A2435] mb-3">Invoice Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 font-medium text-[#666D79]">Description</th>
                      <th className="text-right py-2 font-medium text-[#666D79]">Quantity</th>
                      <th className="text-right py-2 font-medium text-[#666D79]">Rate</th>
                      <th className="text-right py-2 font-medium text-[#666D79]">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item: any, index: number) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-2 text-[#1A2435]">{item.description || 'N/A'}</td>
                        <td className="py-2 text-right text-[#1A2435]">{item.quantity || 0}</td>
                        <td className="py-2 text-right text-[#1A2435]">₹{item.rate || 0}</td>
                        <td className="py-2 text-right text-[#1A2435] font-medium">₹{(item.quantity || 0) * (item.rate || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Details & Notes */}
          {(invoiceData?.paymentDetails || invoiceData?.notes) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#1A2435] mb-3">Additional Information</h3>
              {invoiceData?.paymentDetails && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-[#666D79] mb-1">Payment Details</label>
                  <p className="text-[#1A2435] bg-white p-3 rounded border">{invoiceData.paymentDetails}</p>
                </div>
              )}
              {invoiceData?.notes && (
                <div>
                  <label className="block text-sm font-medium text-[#666D79] mb-1">Notes/Remarks</label>
                  <p className="text-[#1A2435] bg-white p-3 rounded border">{invoiceData.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* User Details */}
          {invoiceData?.userDetails && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#1A2435] mb-3">Paid By</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#666D79] mb-1">Name</label>
                  <p className="text-[#1A2435]">{invoiceData.userDetails.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#666D79] mb-1">Email</label>
                  <p className="text-[#1A2435]">{invoiceData.userDetails.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <AppButton
              onClick={() => {
                setIsModalOpen(false);
                resetFormState();
              }}
              label="Close"
              type="button"
              className="text-base px-8 !bg-[#f3f4f6] !text-gray-900"
            />
          </div>
        </div>
      </div>
    );
  }

  // Regular form mode for paying invoice
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
              disabled={false}
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

export default AdminAddPaidInvoice;
