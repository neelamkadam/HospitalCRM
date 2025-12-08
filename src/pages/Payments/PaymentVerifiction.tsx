import React from "react";
import { PaymentSuccess } from "../../components/PaymentSuccess";
import { PaymentConfirmation } from "../../components/PaymentConfirmation";

export const PaymentVerifiction: React.FC = () => {
  const searchParams = new URLSearchParams(location.search);
  const paymentStatus = searchParams.get("razorpay_payment_link_status");

  return (
    <>
      {paymentStatus == "paid" ? <PaymentSuccess /> : <PaymentConfirmation />}
    </>
  );
};
