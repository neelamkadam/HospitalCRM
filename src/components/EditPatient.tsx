import React, { useEffect } from "react";
import { useGetApi, usePostApi } from "../services/use-api";
import { AuthResponseBodyDataModel } from "../types/response.types";
import API_CONSTANTS from "../constants/apiConstants";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { editPatientSchems } from "../utils/validationSchems";
import AppInputField from "./AppInput";
import GenderSelect from "./GenderSelect";
// import PatientDateOfBirth from "./PatientDateOfbirth";
import AppButton from "./AppButton";
import { useSelector } from "react-redux";
import { RefreshCw } from "lucide-react";

export interface AddPatient {
  name: string;
  phone: string;
  age: string;
  email?: string | null;
  gender?: string | null;
  uniqueId?: string | null;
}

export interface AddPatientProps {
  toggleClose: () => void;
  setNewPatient?: (patient: { label: string; value: string }) => void;
  reportDataInfo?: any;
  fetchReports?: any;
}

const EditPatient: React.FC<AddPatientProps> = ({
  toggleClose,
  setNewPatient,
  reportDataInfo,
  fetchReports,
}) => {
  // const datePickerRef: any = useRef<{
  //   setOpen?: (open: boolean) => void;
  // } | null>(null);
  const { getData: getNextSerialNumber, isLoading: isloading } =
    useGetApi<any>("");
  const { userData } = useSelector((state: any) => state?.authData);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  const { postData: invitePatient, isLoading: loading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: `${API_CONSTANTS.PATIENTS.PATIENT_UPDATE}${reportDataInfo?.clientId?._id}`,
    });
  const form = useForm<AddPatient>({
    resolver: yupResolver(editPatientSchems(userData.role)) as any,
    defaultValues: {
      name: reportDataInfo?.clientId?.name,
      email: reportDataInfo?.clientId?.email,
      phone: reportDataInfo?.clientId?.phoneNumber,
      gender: reportDataInfo?.clientId?.gender,
      age: reportDataInfo?.clientId?.age,
      uniqueId: reportDataInfo?.clientId?.uniqueId,
    },
  });

  const onSubmit: SubmitHandler<AddPatient> = async (data: AddPatient) => {
    const payload = {
      name: data.name,
      dob: "",
      gender: data.gender,
      phoneNumber: data.phone ? data.phone : undefined,
      email: data.email ? data.email : undefined,
      age: data?.age,
      uniqueId: data?.uniqueId,
    };
    const resData: any = await invitePatient(payload);
    if (resData?.data?.success) {
      fetchReports();
      setNewPatient?.({
        label: resData?.data.data.name,
        value: resData?.data.data._id,
      });
      toggleClose();
    }
  };

  const handleNextSerialNumber = async () => {
    try {
      const response: any = await getNextSerialNumber(
        `${API_CONSTANTS.PATIENTS.NEXT_SERIAL_NUMBER}`
      );
      if (response?.data?.success) {
        form.setValue("uniqueId", response?.data?.serialNumber || "");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-0 md:overflow-visible overflow-y-auto">
      <header className="mb-0">
        <h1 className="text-xl text-[#1A2435] font-medium px-6 py-4 border-b text-left">
          Edit Patient
        </h1>
      </header>

      <form
        className="space-y-6 text-[#1A2435] font-bolder text-[16px] p-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div>
          <AppInputField<AddPatient>
            name="name"
            form={form}
            label="Patients Name"
            placeholder="Patients name"
          />
          <AppInputField<AddPatient>
            name="phone"
            form={form}
            label="Phone Number"
            placeholder="Enter Phone Number"
          />
          <AppInputField<AddPatient>
            name="email"
            form={form}
            label="Email Id"
            placeholder="Email Id"
          />
          <div className="flex flex-col">
            {/* <label className="font-medium text-sm mb-2 text-[#1A2435] text-left">
              Gender
            </label> */}
            <div>
              <GenderSelect name="gender" form={form} />
            </div>
          </div>
          <AppInputField<AddPatient>
            name="age"
            form={form}
            label="Age"
            placeholder="Enter Age"
          />

          <div className="relative w-full">
            <AppInputField<AddPatient>
              name="uniqueId"
              form={form}
              label="Unique ID"
              placeholder="Unique ID"
              readonly={reportDataInfo?.clientId?.uniqueId}
            />
            {!reportDataInfo?.clientId?.uniqueId && (
              <span
                className="absolute mt-0.5 right-2 top-12 -translate-y-1/2 flex items-center text-sm                  
                             px-2 py-1 rounded-xl cursor-pointer text-medistryColor !bg-transparent hover:!border-medistryColor hover:border-[0.5px] hover:border-solid hover:!bg-[#e3eef0] !bg-[#e3eef0]"
                onClick={() => handleNextSerialNumber()}
              >
                Generate
                <RefreshCw
                  className={`ml-1 ${isloading ? "animate-spin" : ""}`}
                  style={{ animationDuration: "0.3s" }}
                  size={14}
                />
              </span>
            )}
          </div>

          {/* <div className="flex flex-col mb-4">
            <div className="flex flex-col mb-4">
              <label
                className="font-medium text-sm mb-2 text-[#1A2435] text-left"
                htmlFor="dob"
              >
                Date of Birth
              </label>
              <div
                className="border border-gray-300 p-3 rounded-md w-full shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279]"
                onClick={() => datePickerRef?.setOpen(true)}
              >
                <PatientDateOfBirth
                  value={form.watch("dob")}
                  onChange={(date) =>
                    form.setValue("dob", date, { shouldValidate: true })
                  }
                  datePickerRef={datePickerRef}
                />
              </div>
              {form.formState.errors.dob && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.dob.message}
                </p>
              )}
            </div>
          </div> */}
        </div>

        <div>
          <AppButton
            label="Save Changes"
            isLoading={loading}
            type="submit"
            className="w-full mt-0 text-base"
          />
        </div>
      </form>
    </div>
  );
};

export default EditPatient;
