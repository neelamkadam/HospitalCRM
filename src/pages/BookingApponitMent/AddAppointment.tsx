import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import CustomSingleValue from "../../components/CustomSingleValue";
import CustomPlaceholder from "../../components/CustomPlaceholder";
import AppButton from "../../components/AppButton";
import API_CONSTANTS from "../../constants/apiConstants";
import { useGetApi, usePostApi } from "../../services/use-api";
import CustomTimePicker from "./CustomTimePicker";
import { Search, Calendar, User, Clock, Stethoscope } from "lucide-react";
import { customSelectStylesDuration as customStyleDuration } from "../../utils/common-utils";
import { customSelectStylesAppointment as customStyleAppointment } from "../../utils/common-utils";
import AppModal from "../../components/AppModal";
import AddPatient from "../Patients/AddPatient";

type AppointmentFormValues = {
  clientId: string;
  time: string;
  duration: string;
  doctorId: string;
  isCompleted: boolean;
};

interface AddAppointmentProps {
  slot: { start: string; end: string } | null;
  toggleClose: () => void;
  userData: any;
  fetchAppoinments?: () => void;
  selectedEvent?: any;
  setSelectedEvent?: (event: any) => void;
  setDeleteModal?: any;
  isPast?: boolean;
}

const appointmentSchema: yup.ObjectSchema<any> = yup
  .object({
    clientId: yup.string().required("Patient name is required"),
    time: yup.string().required("Time is required"),
    duration: yup.string().required("Duration is required"),
  })
  .required();

const AddAppointmentForm = ({
  slot,
  toggleClose,
  userData,
  fetchAppoinments,
  selectedEvent,
  setSelectedEvent,
  setDeleteModal,
  isPast,
}: AddAppointmentProps) => {
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [resetPatient, setresetPatient] = useState<any>(null);
  const [selectedDoctorOption, setSelectedDoctorOption] = useState<any>(null);
  const [selectedDuration, setSelectedDuration] = useState<any>(null);
  const { getData: GetOrganizationApi } = useGetApi<any>("");
  const { postData: PostAppointmentApi } = usePostApi<any>({
    path: API_CONSTANTS.APPOINTMENTS.CREATE,
  });
  const { postData: UpdateAppointmentApi } = usePostApi<any>({
    path: `${API_CONSTANTS.APPOINTMENTS.UPDATE}/${selectedEvent?._id}`,
  });
  const [clients, setClients] = useState<{ value: string; label: string }[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  console.log("loading", loading);
  const [error, setError] = useState<string | null>(null);
  console.log("error", error);
  const pageSize = 15;
  const currentPage = 1;
  const search = "";
  const { getData: GetAllDoctors } = useGetApi<any>("");
  const [doctorsData, setDoctorsData] = useState<
    { value: string; label: string }[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isTimeChanged, setIsTimeChanged] = useState(false);
  const [initialTime, setInitialTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const endpoint = `${API_CONSTANTS.GET_ALL_PATIENTS_WITH_ID}`;
        const response: any = await GetOrganizationApi(endpoint);
        if (response?.data?.data?.clients) {
          const transformed = response.data.data.clients.map((item: any) => ({
            value: item._id,
            label: item.name,
            phone: item.phoneNumber,
          }));
          setClients(transformed);
        } else {
          setClients([]);
        }
      } catch (err: any) {
        console.error("Error fetching clients:", err);
        setError("Failed to fetch clients");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [pageSize, currentPage, search, resetPatient]);

  const form = useForm<AppointmentFormValues>({
    resolver: yupResolver(appointmentSchema),
    defaultValues: {
      clientId: "",
      time: "",
      doctorId: "",
      isCompleted: true,
    },
  });

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;
  
  useEffect(() => {
    if (slot?.start && !selectedEvent) {
      const date = new Date(slot.start);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      setValue("time", formattedTime);
    }
  }, [slot, selectedEvent, setValue]);

  useEffect(() => {
    if (selectedEvent?._id) {
      const matchingClient = clients.find(
        (client) => client.value === selectedEvent.clientId
      );
      if (matchingClient) {
        setSelectedOption(matchingClient);
        setValue("clientId", matchingClient.value);
      }
      const matchingDoctors = doctorsData.find(
        (doc) => doc.value === selectedEvent.doctorId
      );
      if (matchingDoctors) {
        setSelectedDoctorOption(matchingDoctors);
        setValue("doctorId", matchingDoctors.value);
      }
      if (selectedEvent.TimeDateData) {
        const dateObj = new Date(selectedEvent.TimeDateData);
        const hours24 = dateObj.getHours();
        const minutes = dateObj.getMinutes();
        const formattedTime = `${hours24.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
        setValue("time", formattedTime);
      }
      if (selectedEvent?._id) {
        if (selectedEvent.TimeDateData) {
          const dateObj = new Date(selectedEvent.TimeDateData);
          const hours24 = dateObj.getHours();
          const minutes = dateObj.getMinutes();
          const formattedTime = `${hours24
            .toString()
            .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

          setValue("time", formattedTime);
          setInitialTime(formattedTime);
        }
      }

      setValue("duration", selectedEvent.duration.toString());
      setValue("isCompleted", selectedEvent.isCompleted);
      setSelectedDuration({
        value: selectedEvent.duration.toString(),
        label: `${selectedEvent.duration} min`,
      });
    }
  }, [selectedEvent, clients, setValue, doctorsData]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const endpoint = `${API_CONSTANTS.GET_DOCTORS}`;
      const response: any = await GetAllDoctors(endpoint);
      if (response?.data) {
        const transformed = response.data.doctors.map((item: any) => ({
          value: item._id,
          label: item.name,
        }));
        setDoctorsData(transformed);
      } else {
        setDoctorsData([]);
      }
    } catch (err: any) {
      console.error("Error fetching clients:", err);
    }
  };

  const CustomPlaceholder1 = () => {
    return (
      <div className="flex items-center gap-2 text-[#526279] mt-[-22px]">
        <Stethoscope className="w-4 h-4 text-[#01576A]" />
        <span className="text-[15px] font-medium text-[#526279]">
          Select Doctor Name
        </span>
      </div>
    );
  };

  const handleSelectDoctorChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedDoctorOption(option);
    setValue("doctorId", option?.value || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleSelectChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedOption(option);
    setValue("clientId", option?.value || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleSelectDurationChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedDuration(option);
    setValue("duration", option?.value || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (data: AppointmentFormValues) => {
    if (!slot?.start) return;
    const [timeStr] = data.time.split(" ");
    const [hours, minutes] = timeStr.split(":").map(Number);
    const startDate = new Date(slot.start);
    startDate.setHours(hours);
    startDate.setMinutes(minutes);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    const dateTime = startDate.toISOString();
    const durationInMinutes = parseInt(data.duration);
    const endDate = new Date(startDate.getTime() + durationInMinutes * 60000);
    const endDateTime = endDate.toISOString();
    const finalPayload = {
      ...data,
      dateTime,
      endDateTime,
      ...(!userData.permissions?.includes("full_appointment_access") &&
      !userData.permissions?.includes("admin")
        ? { doctorId: userData._id }
        : {}),
    };
    if (selectedEvent?._id) {
      const finalData = {
        ...finalPayload,
        isCompleted: true,
      };
      try {
        const response = await UpdateAppointmentApi(finalData);
        reset();
        if (response?.data?.success) {
          if (fetchAppoinments) {
            fetchAppoinments();
          }
          if (setSelectedEvent) {
            setSelectedEvent(null);
          }
          toggleClose();
        } else {
          console.error(
            "Failed to book appointment",
            response?.data?.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error booking appointment:", error);
      }
    } else {
      try {
        const response = await PostAppointmentApi(finalPayload);
        reset();
        if (response?.data?.success) {
          if (fetchAppoinments) {
            fetchAppoinments();
          }
          toggleClose();
        } else {
          console.error(
            "Failed to book appointment",
            response?.data?.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error booking appointment:", error);
      }
    }
  };

  const durationOptions = [
    { value: "15", label: "15 min" },
    { value: "30", label: "30 min" },
    { value: "45", label: "45 min" },
    { value: "60", label: "60 min" },
  ];

  const CustomPlaceholderDuration = () => {
    return (
      <div className="flex items-center gap-2 text-[#526279] mt-[-22px]">
        <Clock className="w-4 h-4 text-[#01576A]" />
        <span className="text-[15px] font-medium text-[#526279]">
          Select Duration
        </span>
      </div>
    );
  };

  const CustomSingleValueDuration = ({ data }: any) => {
    return (
      <div className="flex items-center gap-2 mt-[-22px]">
        <Clock className="w-4 h-4 text-[#01576A]" />
        <span className="text-[15px] font-medium text-[#526279]">
          {data.label}
        </span>
      </div>
    );
  };

  const selectRef = useRef<any>(null);

  const watchedDoctor = watch("doctorId");
  const watchedClient = watch("clientId");
  const watchedTime = watch("time");
  const watchedDuration = watch("duration");
  
  useEffect(() => {
    if (initialTime && watchedTime && watchedTime !== initialTime) {
      setIsTimeChanged(true);
    } else {
      setIsTimeChanged(false);
    }
  }, [watchedTime, initialTime]);

  const isFormComplete =
    !userData.permissions?.includes("full_appointment_access") &&
    !userData.permissions?.includes("admin")
      ? !!(watchedDoctor && watchedClient && watchedTime && watchedDuration)
      : !!(watchedClient && watchedTime && watchedDuration);

  const [openDropdown, setOpenDropdown] = useState<
    "time" | "patient" | "doctor" | "duration" | null
  >(null);

  const closeAllDropdowns = () => setOpenDropdown(null);

  const handleTimePickerToggle = (open: boolean) => {
    setOpenDropdown(open ? "time" : null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeAllDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  const CustomOption = (props: any) => {
    const { data, innerRef, innerProps, isSelected, isFocused } = props;
    const backgroundColor = isSelected
      ? "#E5ECED"
      : isFocused
      ? "#F0F7F8"
      : "#fff";
    const textColor = isSelected ? "#01576A" : "#526279";
    return (
      <div
        ref={innerRef}
        {...innerProps}
        style={{
          padding: "0.75rem",
          display: "flex",
          alignItems: "center",
          backgroundColor,
          color: textColor,
          cursor: "pointer",
          transition: "background-color 0.2s ease-in-out",
        }}
      >
        <div>
          <div style={{ fontWeight: 500, fontSize: "15px" }}>
            {data.label} {data.phone ? `(${data.phone})` : ""}
          </div>
        </div>
      </div>
    );
  };

  const CustomSingleValuePatient = ({ data }: any) => {
    return (
      <div className="flex items-center gap-2 mt-[-22px]">
        <User className="w-4 h-4 text-[#01576A]" />
        <div className="flex flex-row gap-2 items-center">
          <span className="text-[15px] font-medium text-[#526279]">
            {data.label}
          </span>
          <span className="text-[13px] text-[#8C929A]">
            {data.phone ? `(${data.phone})` : ""}
          </span>
        </div>
      </div>
    );
  };

  const toggleAddPatientClose = () => {
    setIsModalOpen((prev) => !prev);
  };

  // Custom select styles for healthcare theme
  const healthcareSelectStyles = {
    ...customStyleAppointment,
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: "#fff",
    }),
    control: (base: any, state: any) => ({
      ...base,
      border: "none",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(1, 87, 106, 0.15)"
        : "none",
      minHeight: "44px",
      fontSize: "15px",
      backgroundColor: state.isDisabled ? "#f8f9fa" : "#fff",
      padding: "0.25rem 0.5rem",
      borderRadius: "10px",
      transition: "all 0.2s ease",
      "&:hover": {
        border: "none",
      },
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: 0,
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      padding: 0,
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: "12px",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12)",
      border: "1px solid rgba(1, 87, 106, 0.1)",
      overflow: "hidden",
    }),
    menuList: (base: any) => ({
      ...base,
      padding: "4px",
    }),
  };

  return (
    <>
      <div ref={containerRef}>
        {/* Modal Header */}
        <header className="appointment-modal-header">
          <h1>
            <div className="appointment-modal-icon">
              <Calendar />
            </div>
            {isPast
              ? "Past Appointment"
              : selectedEvent?._id
              ? "Update Appointment"
              : "New Appointment"}
          </h1>
          {isPast && (
            <p className="text-sm text-[#526279] mt-2 ml-[52px]">
              This is a past appointment created by the doctor.
            </p>
          )}
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 p-5"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const tag = (e.target as HTMLElement).tagName.toLowerCase();
              const type = (e.target as HTMLInputElement).type;
              if (tag !== "textarea" && type !== "submit") {
                e.preventDefault();
              }
            }
          }}
        >
          {/* Doctor Selection */}
          <div className="appointment-form-field">
            <label className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#01576A]" />
              Select Doctor
            </label>
            <div
              className="border border-gray-200 rounded-xl shadow-sm hover:border-[#01576A]/30 focus-within:border-[#01576A] focus-within:ring-2 focus-within:ring-[#01576A]/10 transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Select
                ref={selectRef}
                value={
                  userData.permissions?.includes("full_appointment_access") ||
                  userData.permissions?.includes("admin")
                    ? selectedDoctorOption
                    : doctorsData.find((doc) => doc.value === userData._id)
                }
                onChange={handleSelectDoctorChange}
                options={doctorsData}
                isDisabled={
                  !(
                    userData.permissions?.includes("full_appointment_access") ||
                    userData.permissions?.includes("admin")
                  ) || isPast
                }
                className="search-patient"
                components={{
                  SingleValue: CustomSingleValue,
                  Placeholder: CustomPlaceholder1,
                }}
                isSearchable={true}
                isClearable={true}
                menuIsOpen={openDropdown === "doctor"}
                onMenuOpen={() => setOpenDropdown("doctor")}
                onMenuClose={() => setOpenDropdown(null)}
                closeMenuOnSelect={true}
                blurInputOnSelect={true}
                openMenuOnClick={true}
                openMenuOnFocus={false}
                autoFocus={false}
                styles={healthcareSelectStyles}
              />
            </div>
          </div>

          {/* Patient Selection */}
          <div className="appointment-form-field">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#01576A]" />
                Select Patient
              </label>
            </div>
            <div
              className="border border-gray-200 rounded-xl shadow-sm hover:border-[#01576A]/30 focus-within:border-[#01576A] focus-within:ring-2 focus-within:ring-[#01576A]/10 transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Select
                ref={selectRef}
                isDisabled={isPast}
                value={selectedOption}
                onChange={handleSelectChange}
                menuIsOpen={openDropdown === "patient"}
                onMenuOpen={() => setOpenDropdown("patient")}
                onMenuClose={() => setOpenDropdown(null)}
                options={clients}
                className="search-patient"
                components={{
                  SingleValue: CustomSingleValuePatient,
                  Placeholder: CustomPlaceholder,
                  Option: CustomOption,
                }}
                isSearchable={true}
                isClearable={true}
                placeholder="Search and select a patient..."
                styles={healthcareSelectStyles}
              />
            </div>
            {errors.clientId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.clientId.message}
              </p>
            )}
          </div>

          {/* Form Divider */}
          <div className="appointment-form-divider"></div>

          {/* Time Selection */}
          <div ref={containerRef} className="appointment-form-field">
            <CustomTimePicker
              value={watch("time")}
              onChange={(newTime) => {
                setValue("time", newTime, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              isdisabled={isPast}
              isOpen={openDropdown === "time"}
              onOpenChange={handleTimePickerToggle}
              label="Select Time"
              minuteOptions={[0, 15, 30, 45]}
            />
            {errors.time && (
              <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
            )}
          </div>

          {/* Duration Selection */}
          <div className="appointment-form-field">
            <label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#01576A]" />
              Select Duration
            </label>
            <div
              className="border border-gray-200 rounded-xl shadow-sm hover:border-[#01576A]/30 focus-within:border-[#01576A] focus-within:ring-2 focus-within:ring-[#01576A]/10 transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Select
                isDisabled={isPast}
                ref={selectRef}
                value={selectedDuration}
                onChange={handleSelectDurationChange}
                options={durationOptions}
                className="search-patient"
                menuIsOpen={openDropdown === "duration"}
                onMenuOpen={() => setOpenDropdown("duration")}
                onMenuClose={() => setOpenDropdown(null)}
                components={{
                  SingleValue: CustomSingleValueDuration,
                  Placeholder: CustomPlaceholderDuration,
                }}
                isSearchable={false}
                isClearable={true}
                styles={{
                  ...healthcareSelectStyles,
                  ...customStyleDuration,
                }}
              />
            </div>
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">
                {errors.duration.message}
              </p>
            )}
          </div>

          {/* Action Buttons for Update */}
          {selectedEvent?._id && !isPast && (
            <div className="gap-3 flex justify-between mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  toggleClose();
                  setDeleteModal(true);
                }}
                className="appointment-btn-delete flex-1"
              >
                Cancel Appointment
              </button>
              {isTimeChanged && (
                <button
                  type="submit"
                  disabled={isTimeChanged ? false : watch().isCompleted}
                  className="appointment-btn-primary flex-1"
                >
                  Re-Schedule
                </button>
              )}
            </div>
          )}

          {/* Submit Button for New Appointment */}
          {!isPast && !selectedEvent?._id && (
            <button
              type="submit"
              disabled={!isFormComplete}
              className="appointment-btn-primary w-full mt-6"
            >
              Book Appointment
            </button>
          )}
        </form>
      </div>

      <AppModal isOpen={isModalOpen} toggle={toggleAddPatientClose} title="">
        <AddPatient
          toggleClose={toggleAddPatientClose}
          setNewPatient={(patient: any) => {
            setresetPatient(patient);
            setSelectedOption(patient);
            setValue("clientId", patient.value || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
        />
      </AppModal>
    </>
  );
};

export default AddAppointmentForm;
