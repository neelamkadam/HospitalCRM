import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
// import CustomPlaceholder from "../../components/CustomPlaceholder";
// import { customStyleA } from "../../utils/common-utils";
import AppButton from "../../components/AppButton";
import API_CONSTANTS from "../../constants/apiConstants";
import { useGetApi, usePostApi } from "../../services/use-api";
import CustomTimePicker from "./CustomTimePicker";
import { Search } from "lucide-react";
import { customSelectStylesAppointment as customStyleAppointment } from "../../utils/common-utils";
import AppModal from "../../components/AppModal";
import AddPatient from "../Patients/AddPatient";
import AppInputField from "../../components/AppInput";

// import { Search } from "lucide-react";

type AppointmentFormValues = {
    clientId: string;
    time: string;
    duration: string;
    doctorId: string;
    isCompleted: boolean;
    dateTime: string;
    status: string;
};

interface AddAppointmentProps {
    slot: { start: string; end: string } | null;
    toggleClose: () => void;
    userData: any
    fetchAppoinments?: () => void;
    selectedEvent?: any;
    setSelectedEvent?: (event: any) => void;
    setDeleteModal?: any;
    isPast?: boolean;
}

const appointmentSchema: yup.ObjectSchema<any> = yup
    .object({
        // clientId: yup.string().required("Patient name is required"),
        time: yup.string().required("Time is required"),
        duration: yup.string().required("Duration is required"),
    })
    .required();

const PatientPortalAppointmentUpdate = ({ slot, toggleClose, userData, fetchAppoinments, selectedEvent, setSelectedEvent, setDeleteModal, isPast }: AddAppointmentProps) => {
    const [selectedOption, setSelectedOption] = useState<any>(null);
    console.log("selectedOption", selectedOption);
    const [resetPatient, setresetPatient] = useState<any>(null);
    const [selectedDoctorOption, setSelectedDoctorOption] = useState<any>(null);
    const [selectedDuration, setSelectedDuration] = useState<any>(null);
    // const timeRef = useRef<HTMLInputElement>(null);
    const { getData: GetOrganizationApi } = useGetApi<any>("");
    // const { postData: PostAppointmentApi } = usePostApi<any>({
    //     path: API_CONSTANTS.APPOINTMENTS.CREATE,
    // });
    const { postData: UpdateAppointmentApi } = usePostApi<any>({
        path: `${API_CONSTANTS.APPOINTMENTS.UPDATE}/${selectedEvent?._id}`,
    });
    const [clients, setClients] = useState<{ value: string; label: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    console.log("loading", loading)
    const [error, setError] = useState<string | null>(null);
    console.log("error", error)
    const pageSize = 15;
    const currentPage = 1;
    const search = "";
    const { getData: GetAllDoctors } = useGetApi<any>("");
    const [doctorsData, setDoctorsData] = useState<{ value: string; label: string }[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isTimeChanged, setIsTimeChanged] = useState(false);
    const [initialTime, setInitialTime] = useState<string | null>(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                // const params = new URLSearchParams({
                //     per_page: pageSize.toString(),
                //     page: currentPage.toString(),
                //     search: search || "",
                // });
                // const endpoint = `${API_CONSTANTS.GET_CLIENTS}`;
                const endpoint = `${API_CONSTANTS.GET_ALL_PATIENTS_WITH_ID}`;
                const response: any = await GetOrganizationApi(endpoint);
                if (response?.data?.data?.clients) {
                    const transformed = response.data.data.clients.map((item: any) => ({
                        value: item._id,
                        label: item.name,
                        phone: item.phoneNumber
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
            isCompleted: false
        },
    });

    const {
        // register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = form;
    useEffect(() => {
        // Parse slot time when component mounts or slot changes
        if (slot?.start && !selectedEvent) {
            const date = new Date(slot.start);
            const hours = date.getHours();
            const minutes = date.getMinutes();

            // Convert to HH:mm format
            const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            setValue("time", formattedTime);

            const dateNew = new Date(selectedEvent?.TimeDateData);

            // Convert to ISO 8601 UTC format
            const isoString = dateNew.toISOString();
            setValue("dateTime", isoString);
        }
    }, [slot, selectedEvent, setValue]);

    useEffect(() => {
        if (selectedEvent?.TimeDateData) {
            const dateObj = new Date(selectedEvent.TimeDateData);
            const hours24 = dateObj.getHours();
            const minutes = dateObj.getMinutes();
            const formattedTime = `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

            // setValue("time", formattedTime);
            setInitialTime(formattedTime); // save initial time
        }
    }, [selectedEvent, setValue]);

    useEffect(() => {
        if (selectedEvent?._id) {
            // Pre-select doctor from client list
            const matchingClient = clients.find(client => client.value === selectedEvent.clientId);
            if (matchingClient) {
                setSelectedOption(matchingClient);
                setValue("clientId", matchingClient.value);
            }
            const matchingDoctors = doctorsData.find(doc => doc.value === selectedEvent.doctorId);
            if (matchingDoctors) {
                setSelectedDoctorOption(matchingDoctors);
                setValue("doctorId", matchingDoctors.value);
            }
            if (selectedEvent.TimeDateData) {
                const dateObj = new Date(selectedEvent.TimeDateData);
                const hours24 = dateObj.getHours();
                const minutes = dateObj.getMinutes();
                const formattedTime = `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                setValue("time", formattedTime);
                const dateNew = new Date(selectedEvent?.TimeDateData);

                // Convert to ISO 8601 UTC format
                const isoString = dateNew.toISOString();
                setValue("dateTime", isoString);
            }
            setValue("duration", (selectedEvent.duration).toString());
            setValue("isCompleted", (selectedEvent.isCompleted));
            setValue("clientId", selectedEvent.clientId);
            setSelectedDuration({
                value: (selectedEvent.duration).toString(),
                label: `${selectedEvent.duration} min`
            });
        }
    }, [selectedEvent, clients, setValue, doctorsData]);

    useEffect(() => {
        fetchDoctors()
    }, [])

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
                <Search className="w-5 h-5 text-gray-500" />
                <span className="text-[17px] font-medium text-[#526279]">Select Doctor Name</span>
            </div>
        );
    };

    const CustomSingleValue = ({ data }: any) => {
        return (
            <div className="flex items-center gap-2 mt-[-22px]">
                {/* <Search className="w-5 h-5 text-gray-500" /> */}
                <span className="font-medium text-[17px] text-[#526279]">{data.label}</span>
            </div>
        );
    };

    const handleSelectDoctorChange = (option: { value: string; label: string } | null) => {
        setSelectedDoctorOption(option);
        setValue("doctorId", option?.value || "", {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    // const handleSelectChange = (option: { value: string; label: string } | null) => {
    //     setSelectedOption(option);
    //     // setValue("clientId", option?.value || "", {
    //     //     shouldValidate: true,
    //     //     shouldDirty: true,
    //     // });
    // };

    const handleSelectDurationChange = (option: { value: string; label: string } | null) => {
        setSelectedDuration(option);
        setValue("duration", option?.value || "", {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    const onSubmit = async (data: AppointmentFormValues) => {

        // 1️⃣ Extract date from dateTime
        const dateObj = new Date(data.dateTime); // e.g., 2025-09-19T17:30:00.000Z
        const date = dateObj.toISOString().split("T")[0]; // "2025-09-19"

        // 2️⃣ Get hours and minutes from time field
        const [hours, minutes] = data.time.split(":").map(Number);

        // 3️⃣ Create startDate using the date + time
        const startDate = new Date(date);
        startDate.setHours(hours, minutes, 0, 0);

        // 4️⃣ Calculate endDateTime using duration (in minutes)
        const endDate = new Date(startDate.getTime() + Number(data.duration) * 60 * 1000);

        // 5️⃣ Build final payload
        const finalPayload = {
            ...data,
            dateTime: startDate.toISOString(),    // UTC start datetime
            endDateTime: endDate.toISOString(),   // UTC end datetime
        };
        if (selectedEvent?._id) {
            try {
                const response = await UpdateAppointmentApi(finalPayload);
                reset();
                if (response?.data?.success) {
                    if (fetchAppoinments) {
                        fetchAppoinments();
                        toggleClose();
                    }
                    if (setSelectedEvent) {
                        setSelectedEvent(null);
                        toggleClose();
                    }
                } else {
                    console.error(
                        "Failed to Update appointment",
                        response?.data?.message || "Unknown error"
                    );
                }
            } catch (error) {
                console.error("Error updating appointment:", error);
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
                {/* <Search className="w-5 h-5 text-gray-500" /> */}
                <span className="text-[17px] font-medium text-[#526279]">Select Duration</span>
            </div>
        );
    };

    const CustomSingleValueDuration = ({ data }: any) => {
        return (
            <div className="flex items-center gap-2 mt-[-22px]">
                {/* <Search className="w-5 h-5 text-gray-500" /> */}
                <span className="text-[17px] font-medium text-[#526279]">{data.label}</span>
            </div>
        );
    };

    const selectRef = useRef<any>(null);

    // In PatientPortalAppointmentUpdate.tsx

    // Add this state to track open dropdowns
    const [openDropdown, setOpenDropdown] = useState<
        'time' | 'patient' | 'doctor' | 'duration' | null
    >(null);

    // Handler to close all dropdowns
    const closeAllDropdowns = () => setOpenDropdown(null);

    // Handler for time picker open/close
    const handleTimePickerToggle = (open: boolean) => {
        setOpenDropdown(open ? 'time' : null);
    };

    // In your form component, add this useEffect to close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                closeAllDropdowns();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     if (!isModalOpen) {
    //         fetchPatient();
    //     }
    // }, [isModalOpen]);

    const toggleAddPatientClose = () => {
        setIsModalOpen((prev) => !prev);
    };

    const currentTime = watch("time");

    useEffect(() => {
        if (initialTime && currentTime !== initialTime) {
            setIsTimeChanged(true);
        } else {
            setIsTimeChanged(false);
        }
    }, [currentTime, initialTime]);

    return (
        <>
            <div ref={containerRef}>
                <header className="mb-0">
                    <h1 className="text-xl text-[#1A2435] font-medium pl-4 pr-4 py-4 border-b text-left">
                        {selectedEvent?.clientName ? (
                            isPast ? (
                                <>
                                    {/* <span className="font-semibold text-[#01576A]">
                                        {selectedEvent.clientName}
                                    </span>{" "} */}
                                    Patient had an appointment
                                </>
                            ) : (
                                <>

                                    {selectedEvent.status === "pending" && (
                                        <>
                                            {/* <span className="font-semibold text-[#01576A]">
                                                {selectedEvent.clientName}
                                            </span>{" "} */}
                                            Patient has an upcoming appointment
                                            <br />
                                            Please confirm or cancel
                                        </>
                                    )}
                                    {selectedEvent.status === "approved" && (
                                        <>Appointment has been <span className="text-[#01576A]">Confirmed</span>.</>
                                    )}
                                    {selectedEvent.status === "rescheduled" && (
                                        <>Appointment has been <span className="text-[#8C929A]">Rescheduled</span>.</>
                                    )}
                                    {selectedEvent.status === "cancel" && (
                                        <>Appointment has been <span className="text-red-600 font-semibold">Cancelled</span>.</>
                                    )}
                                </>
                            )
                        ) : (
                            ""
                        )}
                    </h1>
                </header>


                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 p-4"
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
                    <div className="relative">
                        <label htmlFor="duration" className=" flex  mb-1 text-sm font-medium text-[#1A2435]">
                            Doctor
                        </label>
                        <div
                            className="border rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279]"
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
                                isDisabled={true}
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
                                styles={{
                                    ...customStyleAppointment,
                                    control: (base) => ({
                                        ...base,
                                        border: "1px solid #e5e7eb",
                                        boxShadow: "none",
                                        fontSize: "16px",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.375rem",
                                        backgroundColor: "#ffff",
                                        opacity: 1,
                                        cursor: "default",
                                        "&:hover": {
                                            border: "1px solid #e5e7eb",
                                        },
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: "#000",
                                    }),
                                    valueContainer: (base) => ({
                                        ...base,
                                        padding: 0,
                                    }),
                                    indicatorsContainer: (base) => ({
                                        ...base,
                                        padding: 0,
                                    }),
                                }}
                            />
                        </div>
                    </div>


                    <div className="relative">
                        <label htmlFor="duration" className=" flex  mb-1 text-sm font-medium text-[#1A2435]">
                            Patient Name
                        </label>
                        <div
                            // className="border rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279]"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <AppInputField
                                name="name"
                                form={form}
                                value={
                                    selectedEvent
                                        ? `${selectedEvent?.clientName} (${selectedEvent?.clientPhoneNumber})`
                                        : ""
                                }
                                readonly
                                className="text-[17px] font-medium text-[#526279]"
                            />
                        </div>
                    </div>
                    <div ref={containerRef}>
                        {/* Custom Time Picker */}
                        <CustomTimePicker
                            value={watch("time")}
                            onChange={(newTime) => {
                                setValue("time", newTime, {
                                    shouldValidate: true,
                                    shouldDirty: true
                                });
                                // compare with initial
                                // if (initialTime && newTime !== initialTime) {
                                //     setIsTimeChanged(true);
                                // } else {
                                //     setIsTimeChanged(false);
                                // }
                            }}
                            isOpen={openDropdown === 'time'}
                            onOpenChange={handleTimePickerToggle}
                            label="Time"
                            minuteOptions={[0, 15, 30, 45]}
                        // isdisabled={isPast}
                        />
                        {errors.time && (
                            <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
                        )}
                    </div>
                    {/* Select Time Duration */}
                    <div>
                        <label htmlFor="duration" className="flex mb-1 text-sm font-medium text-[#1A2435]">
                            Duration
                        </label>
                        <div
                            className="border rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279]"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <Select
                                // isDisabled={true}
                                ref={selectRef}
                                value={selectedDuration}
                                onChange={handleSelectDurationChange}
                                options={durationOptions}
                                className="search-patient"
                                menuIsOpen={openDropdown === 'duration'}
                                onMenuOpen={() => setOpenDropdown('duration')}
                                onMenuClose={() => setOpenDropdown(null)}
                                components={{
                                    SingleValue: CustomSingleValueDuration,
                                    Placeholder: CustomPlaceholderDuration,
                                }}
                                isSearchable={true}
                                isClearable={true}
                                styles={{
                                    ...customStyleAppointment,
                                    control: (base) => ({
                                        ...base,
                                        border: "1px solid #e5e7eb",
                                        boxShadow: "none",
                                        fontSize: "16px",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.375rem",
                                        backgroundColor: "#fffff",
                                        opacity: 1,
                                        cursor: "default",
                                        "&:hover": {
                                            border: "1px solid #e5e7eb",
                                        },
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: "#000",
                                    }),
                                    valueContainer: (base) => ({
                                        ...base,
                                        padding: 0,
                                    }),
                                    indicatorsContainer: (base) => ({
                                        ...base,
                                        padding: 0,
                                    }),
                                }}
                            />
                        </div>
                        {errors.duration && (
                            <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
                        )}
                    </div>

                    {selectedEvent?._id && (
                        <div className="gap-4 flex justify-around mt-6">
                            <AppButton
                                label={"Delete"}
                                onClick={() => {
                                    toggleClose();
                                    setDeleteModal(true);
                                }}
                                loaddingClass="flex"
                                className="mt-[10px] !text-medistryColor text-base flex-1 !bg-transparent !border-medistryColor hover:!bg-[#e3eef0]"
                            />
                            {selectedEvent?.status === "approved" && !isTimeChanged ? "" : (
                                <AppButton
                                    disable={(!isTimeChanged && selectedEvent?.status === "approved" && !selectedEvent?.isPast) || (!isTimeChanged && selectedEvent?.status === "rescheduled" && !selectedEvent?.isPast)}
                                    label={
                                        (isTimeChanged && selectedEvent?.isPast)
                                            ? "Re-Schedule"
                                            : (selectedEvent?.isPast && selectedEvent?.status === "pending")
                                                ? "Confirm"
                                                : ((isTimeChanged && selectedEvent?.status !== "approved") && !selectedEvent?.isPast)
                                                    ? "Re-Schedule"
                                                    : ((isTimeChanged && selectedEvent?.status !== "pending") && selectedEvent?.isPast)
                                                        ? "Re-Schedule"
                                                        : ((isTimeChanged && selectedEvent?.status !== "pending") && !selectedEvent?.isPast)
                                                            ? "Re-Schedule"
                                                            : (((!isTimeChanged && selectedEvent?.status === "pending")
                                                                || selectedEvent?.status === "rescheduled"
                                                                || selectedEvent?.status === "approved") && !selectedEvent?.isPast)
                                                                ? "Confirm"
                                                                : ((!isTimeChanged && selectedEvent?.status === "rescheduled" || selectedEvent?.status === "approved" && selectedEvent?.isPast)
                                                                    ? "Confirm"
                                                                    : "")
                                    }
                                    type="submit"
                                    className="mt-[10px] text-base flex-1"
                                    onClick={() => {
                                        setValue(
                                            "status",
                                            (isTimeChanged && selectedEvent?.isPast)
                                                ? "rescheduled"
                                                : (selectedEvent?.isPast && selectedEvent?.status === "pending")
                                                    ? "approved"
                                                    : ((isTimeChanged && selectedEvent?.status !== "approved") && !selectedEvent?.isPast)
                                                        ? "rescheduled"
                                                        : ((isTimeChanged && selectedEvent?.status !== "pending") && selectedEvent?.isPast)
                                                            ? "rescheduled"
                                                            : ((isTimeChanged && selectedEvent?.status !== "pending") && !selectedEvent?.isPast)
                                                                ? "rescheduled"
                                                                : (((!isTimeChanged && selectedEvent?.status === "pending")
                                                                    || selectedEvent?.status === "rescheduled"
                                                                    || selectedEvent?.status === "approved") && !selectedEvent?.isPast)
                                                                    ? "approved"
                                                                    : ((!isTimeChanged && selectedEvent?.status === "rescheduled" || selectedEvent?.status === "approved" && selectedEvent?.isPast)
                                                                        ? "approved"
                                                                        : ""),
                                            { shouldValidate: true }
                                        );
                                    }}
                                />
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    {/* {!isPast && !selectedEvent?._id && <AppButton
                        loaddingClass="flex"
                        type="submit"
                        className="mt-[20px] text-base flex-1 w-full"
                        disable={!isFormComplete}
                    >
                        Book Appointment
                    </AppButton>} */}
                    {/* {selectedEvent?._id && !isPast && (
                        <div className="mt-4 text-start text-sm font-light text-[#526279]">

                            Do you want to{" "}
                            <button
                                type="button"
                                className="text-[#394557] font-semibold hover:underline"
                                onClick={() => {
                                    toggleClose();
                                    setDeleteModal(true);
                                }}
                            >
                                cancel
                            </button>{" "}
                            this appointment?
                        </div>
                    )} */}
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

export default PatientPortalAppointmentUpdate;
