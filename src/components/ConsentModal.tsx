import React, { useState } from "react";
import AppButton from "./AppButton";
import AppModal from "./AppModal";
import { Checkbox } from "./ui/checkbox";
import { useAppSelector } from "../redux/store";

interface ConsentModalProps {
  isOpen: boolean;
  toggle: () => void;
  onConfirm: () => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  toggle,
  onConfirm,
}) => {
  const [consents, setConsents] = useState({
    medistryNotDiagnose: false,
    confirmPatientInfo: false,
    doctorResponsibility: false,
    patientConsent: false,
  });

  const { userData }: any = useAppSelector((state) => state.authData);
  const isPatient = userData?.role === "client";

  const handleCheckboxChange = (key: keyof typeof consents) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(consents).every(Boolean);

  return (
    <AppModal
      hideCloseButton
      isOpen={isOpen}
      toggle={toggle}
      disableOutsideClick
      title=""
    >
      <div className="space-y-4 p-6 mt-6">
        {/* 1 */}
        <div className="flex items-start gap-2">
          <Checkbox
            checked={consents.medistryNotDiagnose}
            onCheckedChange={() => handleCheckboxChange("medistryNotDiagnose")}
            className="mt-1"
          />
          <span className="text-sm text-gray-700">
            {isPatient ? (
              <>
                <strong>Medistry</strong> helps you view and manage your health
                information but cannot diagnose, treat, or prescribe. Please
                always consult your doctor for medical advice or emergencies.
              </>
            ) : (
              <>
                I understand that <strong>Medistry</strong> cannot diagnose,
                treat, or prescribe medication for any medical condition and
                functions primarily to support doctors with report management.
              </>
            )}
          </span>
        </div>

        {/* 2 */}
        <div className="flex items-start gap-2">
          <Checkbox
            checked={consents.confirmPatientInfo}
            onCheckedChange={() => handleCheckboxChange("confirmPatientInfo")}
            className="mt-1"
          />
          <span className="text-sm text-gray-700">
            {isPatient ? (
              <>
                Any health scores, insights, or tips shown in the app are for
                general understanding only and should not replace professional
                medical guidance.
              </>
            ) : (
              <>
                I understand that I must confirm vital patient information
                including values and data with the corresponding medical records
                and review any prescription or report created before sending it
                to patients.
              </>
            )}
          </span>
        </div>

        {/* 3 */}
        <div className="flex items-start gap-2">
          <Checkbox
            checked={consents.doctorResponsibility}
            onCheckedChange={() => handleCheckboxChange("doctorResponsibility")}
            className="mt-1"
          />
          <span className="text-sm text-gray-700">
            {isPatient ? (
              <>
                Your reports come from doctors, labs, or providers. Medistry
                does its best to keep them safe and organized but is not
                responsible for errors, delays, or decisions made without a
                doctor’s input.
              </>
            ) : (
              <>
                Doctors must rely on their own expertise to make medical
                decisions for patients. Medistry is meant to assist doctors with
                documentation management, it is not a diagnostic tool. Medistry
                is not responsible for the accuracy of information created with
                or uploaded to it by users.
              </>
            )}
          </span>
        </div>

        {/* 4 */}
        <div className="flex items-start gap-2">
          <Checkbox
            checked={consents.patientConsent}
            onCheckedChange={() => handleCheckboxChange("patientConsent")}
            className="mt-1"
          />
          <span className="text-sm text-gray-700">
            {isPatient ? (
              <>
                By using Medistry, you agree that your health data may be
                securely stored and processed as per law. You’re also
                responsible for keeping your account private and sharing access
                only with people you trust.
              </>
            ) : (
              <>
                I understand I am responsible for obtaining written patient
                consent before uploading their information.
              </>
            )}
          </span>
        </div>

        {/* Confirm Button */}
        <div className="flex justify-end">
          <AppButton
            disable={!allChecked}
            onClick={() => {
              if (allChecked) {
                onConfirm();
              }
            }}
            className="relative flex w-[147px] h-[40px] ml-4 py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#ffffff] !bg-[#01576A] border-none mt-[16px] mb-[16px] mr-0px] rounded-[30px] text-sm"
          >
            Confirm
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};

export default ConsentModal;
