import React from "react";
import { Clock } from "lucide-react"; // or replace with an image if needed
import AppButton from "./AppButton";
import { ROUTES } from "../constants/routesConstants";
import { useNavigate } from "react-router-dom";

export const PaymentConfirmation: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[512px] h-[350px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-amber-600 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Payment Pending
          </h2>
          <button
            onClick={() => navigate(ROUTES.PAYMENTS)}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="flex flex-col items-center text-center mt-6">
          <img
            src="public/payment-pending.png"
            alt="pending"
            className="w-16 h-16 mb-4"
          />
          <p className="text-gray-700 text-base font-medium">
            Your payment could not be confirmed yet.
          </p>
          <p className="text-gray-500 text-sm mt-2 px-2">
            If the payment is successful, you will receive a confirmation email.
            Please check your email in a few minutes.
          </p>
          <div className="flex justify-center">
            <AppButton onClick={() => navigate(ROUTES.DASHBOARD)}>
              Go to Dashboard
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
};
