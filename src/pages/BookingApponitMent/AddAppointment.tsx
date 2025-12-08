import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import CustomSingleValue from "../../components/CustomSingleValue";
import CustomPlaceholder from "../../components/CustomPlaceholder";
// import { customStyleA } from "../../utils/common-utils";
import AppButton from "../../components/AppButton";
import API_CONSTANTS from "../../constants/apiConstants";
import { useGetApi, usePostApi } from "../../services/use-api";
import CustomTimePicker from "./CustomTimePicker";
import { Plus, Search } from "lucide-react";
import { customSelectStylesDuration as customStyleDuration } from "../../utils/common-utils";
import { customSelectStylesAppointment as customStyleAppointment } from "../../utils/common-utils";
import AppModal from "../../components/AppModal";
import AddPatient from "../Patients/AddPatient";

// import { Search } from "lucide-react";

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
    userData: any
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

const AddAppointmentForm = ({ slot, toggleClose, userData, fetchAppoinments, selectedEvent, setSelectedEvent, setDeleteModal, isPast }: AddAppointmentProps) => {
    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [resetPatient, setresetPatient] = useState<any>(null);
    const [selectedDoctorOption, setSelectedDoctorOption] = useState<any>(null);
    const [selectedDuration, setSelectedDuration] = useState<any>(null);
    // const timeRef = useRef<HTMLInputElement>(null);
    const { getData: GetOrganizationApi } = useGetApi<any>("");
    const { postData: PostAppointmentApi } = usePostApi<any>({
        path: API_CONSTANTS.APPOINTMENTS.CREATE,
    });
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

    // const watchedTime = watch("time");



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
            isCompleted: true
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
        }
    }, [slot, selectedEvent, setValue]);

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
            }
            if (selectedEvent?._id) {
                if (selectedEvent.TimeDateData) {
                    const dateObj = new Date(selectedEvent.TimeDateData);
                    const hours24 = dateObj.getHours();
                    const minutes = dateObj.getMinutes();
                    const formattedTime = `${hours24.toString().padStart(2, "0")}:${minutes
                        .toString()
                        .padStart(2, "0")}`;

                    setValue("time", formattedTime);
                    setInitialTime(formattedTime); // save initial event time
                }
            }

            setValue("duration", (selectedEvent.duration).toString());
            setValue("isCompleted", (selectedEvent.isCompleted));
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

    const handleSelectDoctorChange = (option: { value: string; label: string } | null) => {
        setSelectedDoctorOption(option);
        setValue("doctorId", option?.value || "", {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    const handleSelectChange = (option: { value: string; label: string } | null) => {
        setSelectedOption(option);
        setValue("clientId", option?.value || "", {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    const handleSelectDurationChange = (option: { value: string; label: string } | null) => {
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
            ...(
                !userData.permissions?.includes("full_appointment_access") &&
                    !userData.permissions?.includes("admin")
                    ? { doctorId: userData._id }
                    : {}
            )
        };
        if (selectedEvent?._id) {
            const finalData = {
                ...finalPayload,
                isCompleted: true
            }
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
                    console.error("Failed to book appointment", response?.data?.message || "Unknown error");
                }
            } catch (error) {
                console.error("Error booking appointment:", error);
            }
        }
        else {
            try {
                const response = await PostAppointmentApi(finalPayload);
                reset();
                if (response?.data?.success) {
                    if (fetchAppoinments) {
                        fetchAppoinments();
                    }
                    toggleClose();
                } else {
                    console.error("Failed to book appointment", response?.data?.message || "Unknown error");
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

    // In AddAppointmentForm.tsx

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

    const CustomOption = (props: any) => {
        const { data, innerRef, innerProps, isSelected, isFocused } = props;
        const backgroundColor = isSelected
            ? "#E5ECED" // light green for selected
            : isFocused
                ? "#F0F7F8" // subtle hover
                : "#fff"; // default
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
                {/* <div style={{
                    backgroundColor: "#d8eaff",
                    borderRadius: "50%",
                    width: 35,
                    height: 35,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    marginRight: 10,
                    color: "#01576A",
                    fontSize: "14px",
                }}>
                    {data.initials}
                </div> */}
                <div>
                    <div style={{ fontWeight: 500, fontSize: "17px" }}>
                        {data.label} {data.phone ? `(${data.phone})` : ""}
                    </div>
                </div>
            </div>
        );
    };

    const CustomSingleValuePatient = ({ data }: any) => {
        return (
            <div className="flex items-center gap-2 mt-[-22px]">
                <Search className="w-5 h-5 text-[17px] font-medium text-[#526279]" />
                <div className="flex flex-row gap-2 items-center">
                    <span className="text-[17px] font-medium text-[#526279]">{data.label}</span>
                    <span className="text-[17px] font-medium text-[#526279]">{data.phone ? `(${data.phone})` : ""}</span>
                </div>
            </div>
        );
    };

    // useEffect(() => {
    //     if (!isModalOpen) {
    //         fetchPatient();
    //     }
    // }, [isModalOpen]);

    const toggleAddPatient = () => {
        setIsModalOpen((prev) => !prev);
    };

    const toggleAddPatientClose = () => {
        setIsModalOpen((prev) => !prev);
    };

    return (
        <>
            <div ref={containerRef}>
                <header className="mb-0">
                    <h1 className="text-xl text-[#1A2435] font-medium pl-4 pr-4 py-4 border-b text-left">
                        {isPast
                            ? "This is a past appointment created by the doctor."
                            : selectedEvent?._id
                                ? "Update Appointment by Doctor"
                                : "Add Appointment"}

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
                            Select Doctor
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
                                isDisabled={
                                    !(userData.permissions?.includes("full_appointment_access") ||
                                        userData.permissions?.includes("admin")) || isPast
                                }
                                className="search-patient"
                                components={{
                                    SingleValue: CustomSingleValue,
                                    Placeholder: CustomPlaceholder1,
                                    // Option: CustomOption
                                }}
                                isSearchable={true}
                                isClearable={true}
                                // placeholder="Search and select a service..."
                                // menuPortalTarget={document.body}
                                menuIsOpen={openDropdown === 'doctor'}
                                onMenuOpen={() => setOpenDropdown('doctor')}
                                onMenuClose={() => setOpenDropdown(null)}
                                closeMenuOnSelect={true} // Close menu after selection
                                blurInputOnSelect={true} // Blur input after selection
                                openMenuOnClick={true}
                                openMenuOnFocus={false} // Don't auto-open on focus
                                autoFocus={false} // Don't auto-focus
                                styles={{
                                    ...customStyleAppointment,
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                        backgroundColor: "#fff",
                                    }),
                                    control: (base) => ({
                                        ...base,
                                        border: "none",
                                        boxShadow: "none",
                                        minHeight: "auto",
                                        fontSize: "17px",
                                        backgroundColor: "#fff",
                                        padding: "0.25rem 0.5rem",
                                        "&:hover": {
                                            border: "none",
                                        },
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
                    {/* Patient Dropdown */}
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <label
                                htmlFor="duration"
                                className="text-sm font-medium text-[#1A2435]"
                            >
                                Select Patient
                            </label>

                            {!isPast && !selectedEvent?._id && <p
                                className="font-medium text-sm text-[#01576A] flex items-center cursor-pointer hover:underline"
                                onClick={toggleAddPatient}
                            >
                                <span className="mr-1">
                                    <Plus size={17} />
                                </span>
                                Add a Patient
                            </p>}
                        </div>
                        <div
                            className="border rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279]"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >

                            <Select
                                ref={selectRef}
                                isDisabled={isPast}
                                value={selectedOption}
                                onChange={handleSelectChange}
                                menuIsOpen={openDropdown === 'patient'}
                                onMenuOpen={() => setOpenDropdown('patient')}
                                onMenuClose={() => setOpenDropdown(null)}
                                options={clients}
                                className="search-patient"
                                components={{
                                    SingleValue: CustomSingleValuePatient,
                                    Placeholder: CustomPlaceholder,
                                    Option: CustomOption
                                }}
                                isSearchable={true}
                                isClearable={true}
                                placeholder="Search and select a service..."
                                // menuPortalTarget={document.body}
                                // closeMenuOnSelect={true} // Close menu after selection
                                // blurInputOnSelect={true} // Blur input after selection
                                // openMenuOnClick={true}
                                // openMenuOnFocus={false} // Don't auto-open on focus
                                // autoFocus={false} // Don't auto-focus
                                styles={{
                                    ...customStyleAppointment,
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                        backgroundColor: "#fff",
                                    }),
                                    control: (base) => ({
                                        ...base,
                                        border: "none",
                                        boxShadow: "none",
                                        minHeight: "auto",
                                        fontSize: "17px",
                                        backgroundColor: "#fff",
                                        padding: "0.25rem 0.5rem",
                                        "&:hover": {
                                            border: "none",
                                        },
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
                            // onMenuOpen={() => {
                            //     // Prevent modal from closing when menu opens
                            //     document.body.style.pointerEvents = "auto";
                            // }}
                            // onMenuClose={() => {
                            //     // Restore normal behavior when menu closes
                            //     document.body.style.pointerEvents = "auto";
                            // }}
                            />

                        </div>
                        {errors.clientId && (
                            <p className="text-red-500 text-sm mt-1">{errors.clientId.message}</p>
                        )}
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
                            }}
                            isdisabled={isPast}
                            isOpen={openDropdown === 'time'}  // Changed from kisOpen to isOpen
                            onOpenChange={handleTimePickerToggle}
                            label="Select Time"
                            minuteOptions={[0, 15, 30, 45]}
                        />
                        {errors.time && (
                            <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
                        )}
                    </div>
                    {/* Select Time Duration */}
                    <div>
                        <label htmlFor="duration" className="flex mb-1 text-sm font-medium text-[#1A2435]">
                            Select Duration
                        </label>
                        <div
                            className="border rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279]"
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
                                menuIsOpen={openDropdown === 'duration'}
                                onMenuOpen={() => setOpenDropdown('duration')}
                                onMenuClose={() => setOpenDropdown(null)}
                                components={{
                                    SingleValue: CustomSingleValueDuration,
                                    Placeholder: CustomPlaceholderDuration,
                                }}
                                isSearchable={false}
                                isClearable={true}
                                // placeholder="Search and select a service..."
                                // menuPortalTarget={document.body}
                                // menuPosition="fixed"
                                // closeMenuOnSelect={true} // Close menu after selection
                                // blurInputOnSelect={true} // Blur input after selection
                                // openMenuOnClick={true}
                                // openMenuOnFocus={false} // Don't auto-open on focus
                                // autoFocus={false} // Don't auto-focus
                                styles={{
                                    ...customStyleDuration,
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                        backgroundColor: "#fff",
                                    }),
                                    control: (base) => ({
                                        ...base,
                                        border: "none",
                                        boxShadow: "none",
                                        minHeight: "auto",
                                        fontSize: "17px",
                                        backgroundColor: "#fff",
                                        padding: "0.25rem 0.5rem",
                                        "&:hover": {
                                            border: "none",
                                        },
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

                    {selectedEvent?._id && !isPast && (

                        <div className="gap-4 flex justify-around mt-6">
                            {/* <AppButton
                                label={watch().isCompleted ? "Appointment Completed" : "Mark as Done"}
                                onClick={() => setValue("isCompleted", !watch().isCompleted)}
                                loaddingClass="flex"
                                className="mt-[10px] !text-medistryColor text-base flex-1 !bg-transparent !border-medistryColor hover:!bg-[#e3eef0]"
                            /> */}
                            <AppButton
                                label={"Delete"}
                                onClick={() => {
                                    toggleClose();
                                    setDeleteModal(true);
                                }}
                                loaddingClass="flex"
                                className="mt-[10px] !text-medistryColor text-base flex-1 !bg-transparent !border-medistryColor hover:!bg-[#e3eef0]"
                            />
                            {isTimeChanged && <AppButton
                                label={isTimeChanged ? "Re-Schedule" : "Confirm"}  // ✅ here
                                type="submit"
                                disable={isTimeChanged ? false : watch().isCompleted}
                                className="mt-[10px] text-base flex-1"
                            />}
                        </div>
                    )}
                    {/* Submit Button */}
                    {!isPast && !selectedEvent?._id && <AppButton
                        loaddingClass="flex"
                        type="submit"
                        className="mt-[20px] text-base flex-1 w-full"
                        disable={!isFormComplete}
                    >
                        Book Appointment
                    </AppButton>}
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

export default AddAppointmentForm;
