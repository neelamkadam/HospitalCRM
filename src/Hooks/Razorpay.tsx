import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";

export const useRazorpayPayment = () => {
  const { error, isLoading, Razorpay } = useRazorpay();

  const initiatePayment = (options: RazorpayOrderOptions) => {
    if (!Razorpay) {
      console.error("Razorpay SDK not loaded");
      return;
    }

    const paymentObject = new Razorpay({
      ...options,
      handler: function (response: any) {
        console.log("Payment Success:", response);
        if (typeof options.handler === "function") {
          options.handler(response);
        }
      },
    });

    paymentObject.open();
  };

  return { initiatePayment, error, isLoading };
};
