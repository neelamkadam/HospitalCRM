import React, { useEffect } from "react";
import AppInputField from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addPatientSchems } from "../../utils/validationSchems";
import { useGetApi, usePostApi, usePutApi } from "../../services/use-api";
import { AuthResponseBodyDataModel } from "../../types/response.types";
import API_CONSTANTS from "../../constants/apiConstants";
import GenderSelect from "../../components/GenderSelect";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import {
  Agreement_url,
  Privacy_policy_url,
} from "../../constants/AppConstants";
import { Checkbox } from "../../components/ui/checkbox";
import { RefreshCw } from "lucide-react";
// import PatientDateOfbirth from "../../components/PatientDateOfbirth";
export interface AddPatient {
  name: string;
  phone: string;
  age: string;
  email: string;
  gender: string;
  uniqueId?: string | null;
  privacy: boolean;
}
export interface AddPatientProps {
  toggleClose: () => void;
  setNewPatient?: (patient: { label: string; value: string; phone: string }) => void;
  patientInformation?: any;
}

const AddPatient: React.FC<AddPatientProps> = ({
  toggleClose,
  setNewPatient,
  patientInformation,
}) => {
  const { userData } = useSelector((state: any) => state?.authData);
  const navigate = useNavigate();

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
  // const datePickerRef: any = useRef<{
  //   setOpen?: (open: boolean) => void;
  // } | null>(null);
  const { postData: invitePatient, isLoading: loading } =
    usePostApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.INVITE_PATIENTS,
    });
  const { putData: updatePatient, isLoading: patientLoading } =
    usePutApi<AuthResponseBodyDataModel>({
      path: API_CONSTANTS.PATIENTS.PATIENT_UPDATE_PROFILE,
    });
  const { getData: getNextSerialNumber, isLoading: isloading } =
    useGetApi<any>("");
  const form = useForm<AddPatient>({
    resolver: yupResolver(
      addPatientSchems(!!patientInformation, userData.role)
    ) as any,
    defaultValues: {
      name: "",
      email: "",
      phone: userData.phoneNumber || "",
      gender: "",
      age: "",
      uniqueId: null,
      privacy: patientInformation ? false : true,
    },
  });

  const onSubmit: SubmitHandler<AddPatient> = async (data: AddPatient) => {
    try {
      const payload = {
        name: data.name,
        dob: "",
        gender: data.gender,
        phoneNumber: data.phone ? data.phone : undefined,
        email: data.email ? data.email : undefined,
        age: data?.age,
        uniqueId: data?.uniqueId,
      };

      if (patientInformation) {
        const resData: any = await updatePatient(payload);
        if (resData?.data?.success) {
          navigate(`${ROUTES.HEALTHREPORT}?tab=completed`);
        }
      } else {
        const resData: any = await invitePatient(payload);
        if (resData?.data?.success) {
          setNewPatient?.({
            label: resData?.data.data.name,
            value: resData?.data.data._id,
            phone: resData?.data.data.phoneNumber
          });
          toggleClose();
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
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
        <h1 className="text-xl text-[#1A2435] font-medium pl-4 pr-4 pb-2 pt-2 border-b text-left">
          {patientInformation === true ? "Your Information" : "Add Patient"}
        </h1>
      </header>

      <form
        className="space-y-6 text-[#1A2435] font-bolder text-[16px] pl-4 pr-4 pb-4 pt-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div>
          <AppInputField<AddPatient>
            name="name"
            form={form}
            label={patientInformation === true ? "Your Name" : "Patients Name"}
            placeholder={
              patientInformation === true ? "Your Name" : "Patients Name"
            }
            isRequired={true}
            className=""
          />
          <AppInputField<AddPatient>
            name="phone"
            form={form}
            label="Phone Number"
            placeholder="Enter Phone Number"
            readonly={patientInformation === true ? true : false}
            isRequired={userData.role === "organization" ? false : true}
          />
          <AppInputField<AddPatient>
            name="email"
            form={form}
            label="Email Id"
            placeholder="Email Id"
            isRequired={patientInformation === true ? true : false}
          />
          {/* <AppSelectField
            name="gender"
            form={form}
            label="Gender"
            placeholder="Select Gender"
            options={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
            ]}
          /> */}
          {/* <NativeSelectField
            name="gender"
            form={form}
            label="Gender"
            placeholder="Select Gender"
            options={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
            ]}
          /> */}

          <div className="flex flex-col text-left">
            {/* <label className="font-medium text-sm mb-2 text-[#1A2435] text-left">
              Gender
            </label> */}
            <div>
              <GenderSelect
                name="gender"
                form={form}
                isRequired={true}
                validation={{
                  required: "Gender is required",
                  validate: (value) =>
                    (value !== "Select Gender" && value !== "NA") ||
                    "Please select a valid gender",
                }}
              />
            </div>
          </div>

          <div className="flex flex-col">
            {/* <label
              className="font-medium text-sm mb-2 text-[#1A2435] text-left"
              htmlFor="dob"
            >
              Date of Birth
            </label> */}
            {/* <div
              className="border p-3 rounded-md w-full cursor-pointer focus-within:border-0 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279]"
              onClick={handleDateClick}
            >
               <input
                type="date"
                id="dob"
                {...form.register("dob")}
                className="bg-white w-full outline-none cursor-pointer text-[#1A2435]"
                max={new Date().toISOString().split("T")[0]}
              /> 
              <PatientDateOfbirth name="dob" />
              {form.formState.errors.dob && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.dob.message}
                </p>
              )}
            </div> */}
            {/* <div className="flex flex-col mb-4">
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
                <PatientDateOfbirth
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
            </div> */}
            <AppInputField<AddPatient>
              name="age"
              form={form}
              label="Age"
              placeholder="Enter Age"
              isRequired={true}
            />
            {patientInformation === true ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="privacy"
                      {...form.register("privacy")}
                      checked={form.watch("privacy")}
                      onCheckedChange={(checked) => {
                        form.setValue("privacy", !!checked, {
                          shouldValidate: true, // Add this to prevent immediate validation
                        });
                        // Remove the form.trigger line to prevent immediate validation
                      }}
                      className={`mt-1 h-4 w-4 rounded border-2 ${
                        form.formState.errors.privacy
                          ? "border-red-500"
                          : "border-[#CBD5E1]"
                      } data-[state=checked]:border-[#293343]`}
                    />
                    <label
                      htmlFor="privacy"
                      className="text-sm font-light text-[#526279] flex-1 whitespace-normal text-left"
                    >
                      <div className="block w-full">
                        I have read, understand, and agree to comply with, and
                        consent to, the Updated{" "}
                        <a
                          target="_blank"
                          href={Agreement_url}
                          className="hover:underline text-[#394557] font-semibold"
                          rel="noopener noreferrer"
                        >
                          User License Agreement
                        </a>{" "}
                        and the Updated{" "}
                        <a
                          target="_blank"
                          href={Privacy_policy_url}
                          className="hover:underline text-[#394557] font-semibold"
                          rel="noopener noreferrer"
                        >
                          Privacy Policy
                        </a>
                        .
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {patientInformation === true ? (
              ""
            ) : (
              <div className="flex flex-col mb-4">
                <label className="mb-2 font-medium text-sm text-[#1A2435] text-start">
                  Unique ID
                </label>

                <div className="relative w-full">
                  <input
                    type="text"
                    {...form.register("uniqueId")}
                    placeholder="Enter Unique ID"
                    className="w-full text-[#1A2435] px-4 h-[46px] py-2 border rounded-md 
                             focus:outline-none focus:ring-2 focus:ring-[#526279] 
                             shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] 
                             placeholder:text-[15px] pr-24"
                  />
                  <span
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-sm                  
                             px-2 py-1 rounded-xl cursor-pointer text-medistryColor !bg-transparent hover:!border-medistryColor hover:border-[0.5px] hover:border-solid hover:!bg-[#e3eef0] !bg-[#e3eef0]"
                    onClick={() => handleNextSerialNumber()}
                  >
                    Generate{""}
                    <RefreshCw
                      className={`ml-1 ${isloading ? "animate-spin" : ""}`}
                      style={{ animationDuration: "0.3s" }}
                      size={14}
                    />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:!mt-[8px]">
          <AppButton
            isLoading={loading || patientLoading}
            type="submit"
            className="w-full mt-0 text-base"
          />
        </div>
      </form>
    </div>
  );
};

export default AddPatient;
