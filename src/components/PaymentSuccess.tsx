import React from "react";
import { CheckCircle2 } from "lucide-react";
import AppButton from "./AppButton";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routesConstants";

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in-up">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="text-green-500 w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Successful
          </h2>
          <p className="text-gray-600">
            Thank you! Your payment was processed successfully. A confirmation
            email has been sent with the details.
          </p>
        </div>

        <div className="flex justify-center">
          <AppButton onClick={() => navigate(ROUTES.DASHBOARD)}>
            Back to Medistry
          </AppButton>
        </div>
      </div>
    </div>
  );
};
