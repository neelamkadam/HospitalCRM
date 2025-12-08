import React, { useEffect, useRef, useState } from "react";
import AppButton from "../../../components/AppButton";
import { SubmitHandler, useForm } from "react-hook-form";
import { useGetApi, usePostApi } from "../../../services/use-api";
import API_CONSTANTS from "../../../constants/apiConstants";
import Select from "react-select";
import CustomTimePicker from "../CustomTimePicker";
import * as yup from "yup"; // ✅ import yup
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";


export interface AppointmentForm {
    doctor: string;
    organization: string;
    time: string;
    duration: string;
    date: string; // store as string for input type="date"
}

export interface AddPatientProps {
    toggleClose: () => void;
    setNewPatient?: (patient: { label: string; value: string; phone: string }) => void;
    patientInformation?: any;
    selectedRow?: any;
    setSelectedRow?: (row: any) => void;
    fetchAppointments?: () => void;
}

const AddDoctorAppointment: React.FC<AddPatientProps> = ({ toggleClose, selectedRow, setSelectedRow, fetchAppointments }) => {
    const { getData: GetAllDoctors } = useGetApi<any>("");
    const { getData: GetAllOrganizations } = useGetApi<any>("");
    const addDoctorAppointmentSchema = yup.object().shape({
        doctor: yup.string().required("Doctor is required"),
        organization: yup.string().required("Organization is required"),
        time: yup.string().required("Time is required"),
        date: yup.string().required("Date is required"),
        duration: yup.string().required("Duration is required"),
    });
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const { postData: AddAppointmentData, isLoading: loading } =
        usePostApi<any>({
            path: API_CONSTANTS.CREATE_DOCTOR_APPOINTMENT,
        });

    const { postData: UpdateAppointmentApi } = usePostApi<any>({
        path: `${API_CONSTANTS.APPOINTMENTS.UPDATE}/${selectedRow?._id}`,
    });
    const [doctorsData, setDoctorsData] = useState<{ value: string; label: string }[]>([]);
    const [orgData, setOrgData] = useState<{ value: string; label: string }[]>([]);


    useEffect(() => {
        fetchOrg();
    }, []);

    useEffect(() => {
        if (selectedRow?._id) {
            setValue("doctor", selectedRow?.doctorId);
            setValue("organization", selectedRow?.organizationId);
            setValue("duration", selectedRow?.duration?.toString());
            setValue("time", moment(selectedRow?.dateTime).format("HH:mm"));
            setValue("date", moment(selectedRow?.endDateTime).format("YYYY-MM-DD"));
        }
    }, [selectedRow]);

    useEffect(() => {
        if (selectedRow?.organizationId) {
            fetchDoctorsByOrg(selectedRow?.organizationId);
        }
    }, [selectedRow]);

    const fetchDoctorsByOrg = async (orgId: string) => {
        setLoadingDoctors(true);
        try {
            const endpoint = `${API_CONSTANTS.GET_DOCTORS_APPOINTMENTS}=${orgId}`;
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
            console.error("Error fetching doctors:", err);
            setDoctorsData([]);
        } finally {
            setLoadingDoctors(false);
        }
    };

    const fetchOrg = async () => {
        try {
            const endpoint = `${API_CONSTANTS.GET_ALL_ORGANIZATION_APPOINTMENTS}`;
            const response: any = await GetAllOrganizations(endpoint);

            if (response?.data?.organizations) {
                const transformed = response.data.organizations
                    .filter((item: any) => item.appointmentsEnabled) // filter only true
                    .map((item: any) => ({
                        value: item._id,
                        label: item.organizationName,
                    }));
                setOrgData(transformed);
            } else {
                setOrgData([]);
            }
        } catch (err: any) {
            console.error("Error fetching organizations:", err);
        }
    };


    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AppointmentForm>({
        resolver: yupResolver(addDoctorAppointmentSchema),
        defaultValues: {
            doctor: "",
            organization: "",
            time: "",
            duration: "",
            date: moment().format("YYYY-MM-DD"),
        },
    });

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const selectRef = useRef<any>(null);

    const durationOptions = [
        { label: "15 Minutes", value: "15" },
        { label: "30 Minutes", value: "30" },
        { label: "45 Minutes", value: "45" },
    ];

    const handleSelectChange =
        (field: "doctor" | "organization" | "duration") => (option: any) => {
            setValue(field, option?.value || "", { shouldValidate: true });

            if (field === "organization" && option?.value) {
                // reset doctor selection
                setValue("doctor", "");
                setDoctorsData([]);
                // fetch doctors for this organization
                fetchDoctorsByOrg(option.value);
            }
        };

    const handleDropdownToggle = (field: string, isOpen: boolean) => {
        setOpenDropdown(isOpen ? field : null);
    };

    const handleTimeChange = (newTime: string) => {
        setValue("time", newTime);
    };

    const handleDateChange = (dateStr: string) => {
        setValue("date", dateStr, { shouldValidate: true });
    };

    const onSubmit: SubmitHandler<AppointmentForm> = async (data) => {
        try {
            let dateTime = null;
            let endDateTime = null;
            if (data.date && data.time) {
                const [hours, minutes] = data.time.split(":").map(Number);
                const combined = new Date(data.date);
                combined.setHours(hours, minutes, 0, 0);
                dateTime = combined.toISOString();
                const endCombined = new Date(combined);
                endCombined.setMinutes(endCombined.getMinutes() + Number(data.duration || 0));
                endDateTime = endCombined.toISOString();
            }

            const payload = {
                dateTime,
                endDateTime,
                duration: Number(data.duration),
                organizationId: data.organization,
                doctorId: data.doctor,
                isCompleted: false,
                status: "pending"
            };
            if (selectedRow?._id) {
                await UpdateAppointmentApi(payload);
                fetchAppointments && fetchAppointments();
                toggleClose();
                setSelectedRow && setSelectedRow(null);
            } else {
                const response = await AddAppointmentData(payload);
                fetchAppointments && fetchAppointments();
                toggleClose();
                console.log("✅ Appointment created successfully:", response);
            }
        } catch (error) {
            console.error("Form submission error:", error);
        }


    };

    return (
        <div className="p-0">
            <header className="mb-0">
                <h1 className="text-xl text-[#1A2435] font-medium pl-4 pr-4 pb-2 pt-2 border-b text-left">
                    {selectedRow?._id ? "Modify Appointment" : "Book Appointment"}
                </h1>
            </header>
            <form
                className="space-y-6 text-[#526279] font-medium text-[17px] pl-4 pr-4 pb-4 pt-4"
                onSubmit={handleSubmit(onSubmit)}
            >
                {/* 2. Organization */}
                <div className="relative">
                    <label className="flex mb-1 text-sm font-medium text-[#1A2435]">
                        Select Organization
                    </label>
                    <div
                        className={`border px-2 py-1 rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none 
                ${errors.organization
                                ? "!border-red-500 focus:ring-2 focus:ring-red-500 bg-[#fff2f4]"
                                : "focus-within:ring-2 focus-within:ring-[#526279]"
                            }`}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <Select
                            ref={selectRef}
                            value={watch("organization") ? orgData.find((d) => d.value === watch("organization")) : null}
                            onChange={handleSelectChange("organization")}
                            options={orgData}
                            placeholder="Select Organization"
                            menuIsOpen={openDropdown === "organization"}
                            onMenuOpen={() => setOpenDropdown("organization")}
                            onMenuClose={() => setOpenDropdown(null)}
                            isSearchable
                            isClearable
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    border: "none",
                                    boxShadow: "none",
                                    minHeight: "auto",
                                    fontSize: "17px",
                                    padding: 0,
                                    backgroundColor: errors.organization ? "#fff2f4" : "white",
                                }),
                                valueContainer: (base) => ({ ...base, padding: 0 }),
                                indicatorsContainer: (base) => ({ ...base, padding: 0 }),
                                placeholder: (base) => ({
                                    ...base,
                                    color: errors.organization ? "#ADB1B7" : "#526279",
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: "#526279", // ✅ selected value color
                                    fontSize: "17px",
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isSelected
                                        ? "#01576A"
                                        : state.isFocused
                                            ? "#E0F2F1"
                                            : "white",
                                    color: state.isSelected ? "white" : "#526279",
                                    cursor: "pointer",
                                    fontSize: "17px",
                                }),
                            }}
                        />
                    </div>
                </div>

                {/* 1. Doctor */}
                <div className="relative">
                    <label className="flex mb-1 text-sm font-medium text-[#1A2435]">
                        Select Doctor
                    </label>
                    <div
                        className={`border px-2 py-1 rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none 
                ${errors.doctor
                                ? "!border-red-500 focus:ring-2 focus:ring-red-500 bg-[#fff2f4]"
                                : "focus-within:ring-2 focus-within:ring-[#526279]"
                            }`}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <Select
                            ref={selectRef}
                            value={doctorsData.find((d) => d.value === watch("doctor"))}
                            onChange={handleSelectChange("doctor")}
                            options={doctorsData}
                            placeholder="Select Doctor Name"
                            isDisabled={loadingDoctors || doctorsData.length === 0}
                            menuIsOpen={openDropdown === "doctor"}
                            onMenuOpen={() => setOpenDropdown("doctor")}
                            onMenuClose={() => setOpenDropdown(null)}
                            isSearchable
                            isClearable
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    border: "none",
                                    boxShadow: "none",
                                    minHeight: "auto",
                                    fontSize: "17px",
                                    padding: 0,
                                    backgroundColor: errors.doctor ? "#fff2f4" : "white",
                                }),
                                valueContainer: (base) => ({ ...base, padding: 0 }),
                                indicatorsContainer: (base) => ({ ...base, padding: 0 }),
                                placeholder: (base) => ({
                                    ...base,
                                    color: errors.doctor ? "#ADB1B7" : "#526279",
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: "#526279", // ✅ selected value color
                                    fontSize: "17px",
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isSelected
                                        ? "#01576A"
                                        : state.isFocused
                                            ? "#E0F2F1"
                                            : "white",
                                    color: state.isSelected ? "white" : "#526279",
                                    cursor: "pointer",
                                    fontSize: "17px",
                                }),
                            }}
                        />
                    </div>
                </div>

                {/* 3. Date */}
                <div>
                    <label className="flex mb-1 text-sm font-medium text-[#1A2435]">
                        Select Date
                    </label>
                    <div
                        className={`border p-[13px] rounded-md cursor-pointer shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none 
                ${errors.date
                                ? "!border-red-500 focus:ring-2 focus:ring-red-500 bg-[#fff2f4]"
                                : "focus-within:ring-2 focus-within:ring-[#526279]"
                            }`}
                    >
                        <input
                            type="date"
                            value={watch("date") || ""}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className={`w-full outline-none cursor-pointer text-[17px] font-medium ml-[-5px] 
                    ${errors.date ? "text-red-500 placeholder-[#ADB1B7] bg-[#fff2f4]" : "text-[#526279] bg-white"}`}
                            min={new Date().toISOString().split("T")[0]}
                            onFocus={(e) => e.target.showPicker()}
                        />
                    </div>
                </div>

                {/* 4. Time */}
                <div>
                    <CustomTimePicker
                        value={watch("time")}
                        onChange={handleTimeChange}
                        isOpen={openDropdown === "time"}
                        onOpenChange={(isOpen) => handleDropdownToggle("time", isOpen)}
                        label="Select Time"
                        minuteOptions={[0, 15, 30, 45]}
                        error={errors.time?.message}
                        className="text-[17px] font-medium text-[#526279]"
                    />
                </div>

                {/* 5. Duration */}
                <div>
                    <label className="flex mb-1 text-sm font-medium text-[#1A2435]">
                        Select Duration
                    </label>
                    <div
                        className="border px-2 py-1 rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#526279]"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <Select
                            ref={selectRef}
                            value={durationOptions.find((d) => d.value === watch("duration"))}
                            onChange={handleSelectChange("duration")}
                            options={durationOptions}
                            menuIsOpen={openDropdown === "duration"}
                            onMenuOpen={() => setOpenDropdown("duration")}
                            onMenuClose={() => setOpenDropdown(null)}
                            isSearchable
                            isClearable
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    border: "none",
                                    boxShadow: "none",
                                    minHeight: "auto",
                                    fontSize: "17px",
                                    padding: 0,
                                    backgroundColor: errors.doctor ? "#fff2f4" : "white",
                                }),
                                valueContainer: (base) => ({ ...base, padding: 0 }),
                                indicatorsContainer: (base) => ({ ...base, padding: 0 }),
                                placeholder: (base) => ({
                                    ...base,
                                    color: errors.doctor ? "#ADB1B7" : "#526279",
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: "#526279", // ✅ selected value color
                                    fontSize: "17px",
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isSelected
                                        ? "#01576A"
                                        : state.isFocused
                                            ? "#E0F2F1"
                                            : "white",
                                    color: state.isSelected ? "white" : "#526279",
                                    cursor: "pointer",
                                    fontSize: "17px",
                                }),
                            }}
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="lg:!mt-[28px]">
                    <AppButton
                        isLoading={loading}
                        type="submit"
                        className="w-full mt-0 text-base"
                    >
                        {selectedRow?._id ? "Modify Appointment" : "Book Appointment"}
                    </AppButton>
                </div>
            </form>
        </div>

    );
};

export default AddDoctorAppointment;
