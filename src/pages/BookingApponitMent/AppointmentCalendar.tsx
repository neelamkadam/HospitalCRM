import { useState, useEffect, useRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AppModal from "../../components/AppModal";
import AddAppointment from "./AddAppointment";
import "./CalenderCss.css";
import { useAppSelector } from "../../redux/store";
import API_CONSTANTS from "../../constants/apiConstants";
import { useGetApi, deletePatient, usePostApi } from "../../services/use-api";
import moment from "moment";
import AppDeleteDialog from "../../components/AppDeleteDialog";
import Select from "react-select";
import { customSelectStyles } from "../../utils/common-utils";
import { useForm } from "react-hook-form";
import { Search, Calendar} from "lucide-react";
import { useSidebar } from "../../components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import PatientPortalAppointmentUpdate from "./PatientPortalAppointmentUpdate";

const LOCAL_STORAGE_VIEW_KEY = "calendarView";
const LOCAL_STORAGE_DATE_KEY = "calendarDate";

const AppointmentCalendar = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dayEvents, setDayEvents] = useState<any[]>([]);
  console.log(dayEvents);
  const [isDayEventModalOpen, setIsDayEventModalOpen] = useState(false);
  console.log(isDayEventModalOpen);
  const calendarRef = useRef<FullCalendar | null>(null);
  const { userData } = useAppSelector((state: any) => state.authData);
  const { getData: GetAllAppointmentsApi } = useGetApi<any>("");
  const { getData: GetAllDoctors } = useGetApi<any>("");
  const [appoinmentsData, setAppoinmentsData] = useState<[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>();
  const [calendarView, setCalendarView] = useState("timeGridWeek");
  console.log("calendarView", calendarView);
  const [doctorsData, setDoctorsData] = useState<
    { value: string; label: string }[]
  >([]);
  const { postData: UpdateAppointmentApi } = usePostApi<any>({
    path: `${API_CONSTANTS.APPOINTMENTS.UPDATE}/${selectedEvent?._id}`,
  });

  // Calculate appointment stats
  const appointmentStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let todayCount = 0;
    let upcomingCount = 0;
    let pendingCount = 0;

    appoinmentsData.forEach((appt: any) => {
      const apptDate = new Date(appt.endTime);
      apptDate.setHours(0, 0, 0, 0);

      if (apptDate.getTime() === today.getTime()) {
        todayCount++;
      }
      if (apptDate >= today) {
        upcomingCount++;
      }
      if (appt.status === "pending") {
        pendingCount++;
      }
    });

    return { todayCount, upcomingCount, pendingCount };
  }, [appoinmentsData]);

  useEffect(() => {
    fetchAppoinments();
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchAppoinments(selectedOption || undefined);
  }, [selectedOption]);

  const handleSelectChange = (
    option: { value: string; label: string } | null
  ) => {
    setSelectedOption(option?.value);
  };

  const handleDelete = async () => {
    if (!selectedEvent?._id) return;

    if (selectedEvent?.isCreatedByClient) {
      const dateObj1 = new Date(selectedEvent.TimeDateData);
      // 1️⃣ Convert to UTC ISO for dateTime
      const utcISOString1 = dateObj1.toISOString();

      // 2️⃣ Extract time in HH:mm format (local time)
      const hours1 = dateObj1.getHours().toString().padStart(2, "0");
      const minutes1 = dateObj1.getMinutes().toString().padStart(2, "0");
      const timeString = `${hours1}:${minutes1}`;

      // 3️⃣ Save into payload
      const finalPayload1 = {
        dateTime: utcISOString1,
        time: timeString,
      };
      const dateNew = new Date(finalPayload1?.dateTime);
      // Convert to ISO 8601 UTC format
      const isoString = dateNew.toISOString();

      // build payload for cancel
      const dateObj = new Date(isoString);
      const date = dateObj.toISOString().split("T")[0];
      const [hours, minutes] = timeString.split(":").map(Number);

      const startDate = new Date(date);
      startDate.setHours(hours, minutes, 0, 0);
      const endDate = new Date(
        startDate.getTime() + Number(selectedEvent.duration) * 60 * 1000
      );

      const finalPayload2 = {
        ...selectedEvent,
        status: "cancel",
        dateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
      };
      try {
        const response = await UpdateAppointmentApi(finalPayload2);
        if (response?.data?.success) {
          if (fetchAppoinments) fetchAppoinments();
          if (setSelectedEvent) setSelectedEvent(null);

          // ✅ close delete modal first, then parent
          setDeleteModal(false);
          toggleClose();
        } else {
          console.error(
            "Failed to Update appointment",
            response?.data?.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error updating appointment:", error);
      }
    } else {
      try {
        setDeleteLoading(true);
        const endpoint = `${API_CONSTANTS.APPOINTMENTS.DELETE}${selectedEvent?._id}`;
        const response = await deletePatient(endpoint);

        if (response?.success) {
          if (fetchAppoinments) fetchAppoinments();
          if (setSelectedEvent) setSelectedEvent(null);

          // ✅ same order: delete modal first, then parent
          setDeleteModal(false);
          toggleClose();
        }
      } catch (err) {
        console.error("Error deleting appointment:", err);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

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

  const fetchAppoinments = async (doctorId?: string) => {
    try {
      const params = new URLSearchParams({
        search: "",
        doctorId: doctorId || "",
      });
      const endpoint = `${API_CONSTANTS.APPOINTMENTS.GET}?${params.toString()}`;
      const response: any = await GetAllAppointmentsApi(endpoint);
      if (response?.data) {
        const transformed = response?.data?.appointments?.map((item: any) => {
          const dt = new Date(item.dateTime);
          const date = dt.toISOString().split("T")[0];
          const time = dt.toTimeString().slice(0, 5);

          // normalize status
          const status = item?.status?.toLowerCase();
          const isClientCreated = !!item?.createdByClient;

          let backgroundColor = "#01576A"; // default
          let textColor = "#fff"; // default text color

          if (isClientCreated && status === "pending") {
            backgroundColor = "#ffffff"; // pending -> white
            textColor = "rgb(1, 87, 106)";
          } else if (status === "cancel") {
            backgroundColor = "#ffcccc"; // cancel -> light red
            textColor = "#000000";
          } else if (status === "approved") {
            backgroundColor = "#01576A"; // approved -> dark teal
            textColor = "#fff";
          } else if (status === "rescheduled") {
            backgroundColor = "#ffffff"; // 🔶 rescheduled -> light orange
            textColor = "rgb(1, 87, 106)"; // orange text
          }
          // else: fallback is default #01576A

          return {
            id: item._id,
            patientName: item?.clientDetails?.name,
            clientId: item?.clientId,
            date,
            time,
            endTime: item?.dateTime,
            borderColor: "#01576A",
            backgroundColor,
            textColor,
            duration: item?.duration,
            doctorName: item?.doctorDetails?.name,
            endDateTime: item?.endDateTime,
            doctorId: item?.doctorId,
            isCompleted: item?.isCompleted,
            isCreatedByClient: isClientCreated,
            status, // keep raw status if needed
            clientPhoneNumber: item?.clientDetails?.phoneNumber,
          };
        });

        setAppoinmentsData(transformed);
      } else {
        setAppoinmentsData([]);
      }
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
    }
  };

  const fetchAppointments = async () => {
    const formatted = appoinmentsData?.map((appt: any) => ({
      id: appt.id,
      title: appt.patientName,
      clientId: appt.clientId,
      start: appt.endTime,
      end: appt.endDateTime,
      backgroundColor: appt.backgroundColor,
      textColor: appt.textColor,
      display: "block",
      extendedProps: {
        clientId: appt.clientId,
        duration: appt.duration,
        isCompleted: appt.isCompleted,
      },
      doctorName: appt?.doctorName,
      doctorId: appt?.doctorId,
      borderColor: appt.borderColor,
      isCreatedByClient: appt.isCreatedByClient,
      status: appt.status,
      clientPhoneNumber: appt.clientPhoneNumber,
    }));

    setAppointments(formatted);
  };

  useEffect(() => {
    fetchAppointments();
  }, [appoinmentsData]);

  useEffect(() => {
    const savedView =
      localStorage.getItem(LOCAL_STORAGE_VIEW_KEY) || "timeGridWeek";
    const savedDate = localStorage.getItem(LOCAL_STORAGE_DATE_KEY);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(savedView);
      if (savedDate) calendarApi.gotoDate(savedDate);
    }
  }, []);

  const handleEventClick = (clickInfo: any) => {
    const eventDate = new Date(clickInfo.event.start);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );

    const isPast = eventDay < today; // ✅ Flag for past event

    setSelectedEvent({
      clientName: clickInfo.event._def.title,
      _id: clickInfo.event._def.publicId,
      clientId: clickInfo.event.extendedProps.clientId,
      isCreatedByClient: clickInfo.event.extendedProps.isCreatedByClient,
      doctorId: clickInfo.event.extendedProps.doctorId,
      TimeDateData: clickInfo.event.start,
      duration: clickInfo.event.extendedProps.duration,
      isCompleted: clickInfo.event.extendedProps.isCompleted,
      status: clickInfo.event.extendedProps.status,
      clientPhoneNumber: clickInfo.event.extendedProps.clientPhoneNumber,
      isPast,
    });

    setSelectedSlot({
      start: moment(clickInfo.event.start).format("YYYY-MM-DD"),
      end: moment(clickInfo.event.start).format("YYYY-MM-DD"),
    });

    setIsModalOpen(true);
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedEvent(null);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const selectedDate = new Date(selectInfo.start);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < now) return;
    setSelectedSlot({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
  };

  const CustomPlaceholder = () => {
    return (
      <div className="flex items-center gap-2 text-[#526279] mt-[-22px]">
        <Search className="w-5 h-5 text-gray-500" />
        <span className="text-[16px]">Select Doctor Name</span>
      </div>
    );
  };

  const CustomSingleValue = ({ data }: any) => {
    return (
      <div className="flex items-center gap-2 mt-[-22px]">
        <Search className="w-5 h-5 text-gray-500" />
        <span className="font-medium text-[17px]">{data.label}</span>
      </div>
    );
  };

  const handleEventDrop = async (info: any) => {
    const finalData = {
      clientId: info.event._def.extendedProps.clientId,
      duration: info.event._def.extendedProps.duration.toString(),
      doctorId: info.event._def.publicId,
    };
    const appointmentId = info.event._def.publicId;
    if (!appointmentId) return;
    const token = localStorage.getItem("token");
    if (token) {
      try {
        if (!info.event.start) return;

        const startDate = new Date(info.event.start);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);

        const dateTime = startDate.toISOString();

        const durationInMinutes = parseInt(
          info.event._def.extendedProps.duration
        );
        const endDate = new Date(
          startDate.getTime() + durationInMinutes * 60000
        );
        const endDateTime = endDate.toISOString();

        const finalPayload = {
          ...finalData,
          dateTime,
          endDateTime,
          doctorId:
            info.event._def.extendedProps.isCreatedByClient === true
              ? info.event._def.extendedProps.doctorId
              : userData._id,
          status:
            info.event._def.extendedProps.isCreatedByClient === true
              ? "rescheduled"
              : "",
        };
        const response = await fetch(
          `https://api-beta.medistry.ai/api/appointments/${appointmentId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(finalPayload),
          }
        );
        const data = await response.json();
        if (data?.success) {
          fetchAppoinments?.();
        } else {
          console.error(
            "Failed to update appointment",
            data?.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error updating appointment:", error);
      }
    }
  };
  const handleMoreLinkClick = (arg: any) => {
    const events = arg?.allSegs?.map((seg: any) => {
      const event = seg?.event;
      return {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor: event.backgroundColor,
        textColor: event.textColor,
      };
    });
    setDayEvents(events);
    setIsDayEventModalOpen(true);
  };

  const toggleClose = () => {
    setIsModalOpen(false);
  };

  const handleDateClick = (arg: any) => {
    const calendarApi = calendarRef.current?.getApi();
    const clickedDate = arg.date;

    if (!calendarApi) return;

    if (calendarApi.view.type === "dayGridMonth") {
      calendarApi.changeView("timeGridDay", arg.dateStr);
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(clickedDate);
      selectedDate.setHours(0, 0, 0, 0);

      // ❌ Block past days
      if (selectedDate < today) return;

      // ✅ Allow current day & future days (ignore past times)
      setSelectedSlot({
        start: clickedDate,
        end: clickedDate,
      });

      setIsModalOpen(true);
    }
  };

  const { state } = useSidebar();

  const form = useForm<any>({});

  const {
    formState: { errors },
  } = form;
  console.log(errors);

  const renderSlotLabel = (arg: any) => {
    const date: Date = arg.date;
    const hour24 = date.getHours();
    const minute = date.getMinutes();
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const meridiem = hour24 >= 12 ? "PM" : "AM";
    const minuteText = minute ? `:${String(minute).padStart(2, "0")}` : "";

    return (
      <div style={{ whiteSpace: "nowrap", paddingLeft: 6, fontWeight: 500 }}>
        <span className="text-[#666d79] text-[15px]">
          {hour12}
          {minuteText}
        </span>
        <span className="ml-[2px] text-[#666d79] text-[15px]">{meridiem}</span>
      </div>
    );
  };

  return (
    <div
      className="pt-4 pl-4 pr-4 pb-4"
      style={{ marginLeft: state == "collapsed" ? "28px" : "" }}
    >
      {/* Page Header Section */}
      <div className="appointment-page-header">
        <div className="appointment-header-content">
          <div className="appointment-header-title">
            <div className="appointment-header-icon">
              <Calendar />
            </div>
            <div>
              <h1>Appointments</h1>
              <p>Manage and schedule patient appointments</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="appointment-stats-grid">
            <div className="appointment-stat-card">
              <div className="appointment-stat-value">{appointmentStats.todayCount}</div>
              <div className="appointment-stat-label">Today</div>
            </div>
            <div className="appointment-stat-card">
              <div className="appointment-stat-value">{appointmentStats.upcomingCount}</div>
              <div className="appointment-stat-label">Upcoming</div>
            </div>
            <div className="appointment-stat-card">
              <div className="appointment-stat-value">{appointmentStats.pendingCount}</div>
              <div className="appointment-stat-label">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Filter */}
      {userData.permissions?.includes("full_appointment_access") ||
      userData.permissions?.includes("admin") ? (
        <div className="flex justify-start mb-4">
          <form>
            <div className="relative">
              <Select
                onChange={handleSelectChange}
                options={doctorsData}
                isSearchable={true}
                isClearable={true}
                placeholder="Search and select a service..."
                closeMenuOnSelect={true}
                blurInputOnSelect={true}
                openMenuOnClick={true}
                openMenuOnFocus={false}
                autoFocus={false}
                styles={{
                  ...customSelectStyles,
                  control: (provided: any, state: any) => ({
                    ...provided,
                    backgroundColor: "#fff",
                    border: "none",
                    boxShadow: state.isFocused
                      ? "0px 0px 0px 4px #016B833D, 0px 1px 2px 0px #4E4E4E0D"
                      : "0 2px 8px rgba(0, 0, 0, 0.08)",
                    padding: "2px 1px 0px 12px",
                    borderRadius: "12px",
                    width: "100%",
                    color: "#526279",
                    fontSize: "0.875rem",
                    fontWeight: "400",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    minHeight: "auto",
                    transition:
                      "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      border: "none",
                    },
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "#000000 !important",
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12)",
                  }),
                  menuList: (base) => ({
                    ...base,
                    maxHeight: "100px",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                  }),
                }}
                className="search-Doctor lg:w-[295px] lg:mb-[2px]"
                components={{
                  SingleValue: CustomSingleValue,
                  Placeholder: CustomPlaceholder,
                }}
              />
            </div>
          </form>
        </div>
      ) : (
        ""
      )}

      {/* Status Legend */}
      <div className="appointment-status-legend">
        <div className="status-legend-item">
          <div className="status-legend-dot approved"></div>
          <span>Approved</span>
        </div>
        <div className="status-legend-item">
          <div className="status-legend-dot pending"></div>
          <span>Pending</span>
        </div>
        <div className="status-legend-item">
          <div className="status-legend-dot rescheduled"></div>
          <span>Rescheduled</span>
        </div>
        <div className="status-legend-item">
          <div className="status-legend-dot cancelled"></div>
          <span>Cancelled</span>
        </div>
      </div>

      {/* Calendar Container with Glassmorphism */}
      <div className="calendar-glass-container">
        <div
          className={`calendar-wrapper ${
            userData.permissions?.includes("full_appointment_access") ||
            userData.permissions?.includes("admin")
              ? "has-full-access"
              : "no-access"
          }`}
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            allDaySlot={false}
            nowIndicator={true}
            titleFormat={{ year: "numeric", month: "long" }}
            views={{
              timeGridWeek: {
                dayHeaderContent: (args) => {
                  const date = args.date;
                  const day = date.getDate();
                  const weekday = date.toLocaleDateString("en-US", {
                    weekday: "short",
                  });
                  return `${weekday} ${day}`;
                },
              },
            }}
            eventContent={(arg: any) => {
              const doctorName = arg.event._def.extendedProps.doctorName;
              const duration =
                new Date(arg.event.end).getTime() -
                new Date(arg.event.start).getTime();
              const showDetails = duration > 30 * 60 * 1000;
              return (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          height: "100%",
                          width: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          padding: "2px 4px",
                          fontSize: "12px",
                          lineHeight: "1.2",
                          fontFamily: "Inter, serif",
                          fontWeight: 500,
                        }}
                      >
                        <div>
                          {arg.timeText.split(" - ")[0]}
                          {!showDetails &&
                            ` | ${
                              userData.permissions?.includes(
                                "full_appointment_access"
                              ) || userData.permissions?.includes("admin")
                                ? `${doctorName} | `
                                : ""
                            }${arg.event.title}`}
                        </div>

                        {showDetails && (
                          <>
                            <div
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: "12px",
                                lineHeight: "1.2",
                                color:
                                  arg.event._def.extendedProps.status ===
                                  "pending"
                                    ? "rgb(1, 87, 106)"
                                    : arg.event._def.extendedProps.status ===
                                      "rescheduled"
                                    ? "rgb(1, 87, 106)"
                                    : "",
                                fontFamily: "Inter, serif",
                                fontWeight: 500,
                              }}
                            >
                              {(userData.permissions?.includes(
                                "full_appointment_access"
                              ) ||
                                userData.permissions?.includes("admin")) &&
                              doctorName
                                ? `  ${doctorName}`
                                : ""}{" "}
                              | {arg.event.title}
                            </div>
                          </>
                        )}
                      </div>
                    </TooltipTrigger>

                    <TooltipContent className="bg-[#1A2435] text-white px-3 py-2 rounded-lg text-xs max-w-[200px] shadow-lg">
                      <div style={{ whiteSpace: "pre-line" }}>
                        {`Patient: ${arg.event.title}\nDoctor: ${doctorName}`}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }}
            slotLabelContent={renderSlotLabel}
            ref={calendarRef}
            timeZone="local"
            selectable={true}
            dateClick={handleDateClick}
            select={handleDateSelect}
            events={appointments}
            headerToolbar={{
              left: "",
              center: "title",
              right: "prev,next today timeGridDay,timeGridWeek,dayGridMonth",
            }}
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }}
            editable={true}
            eventOverlap={true}
            eventDrop={handleEventDrop}
            eventClick={handleEventClick}
            dayMaxEvents={true}
            moreLinkClick={handleMoreLinkClick}
            dayCellClassNames={(arg: any) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (arg.date < today) {
                return "fc-day-disabled";
              }
              return "";
            }}
            viewDidMount={(view) => setCalendarView(view.view.type)}
          />
        </div>
      </div>

      <AppModal
        isOpen={isModalOpen}
        toggle={toggleClose}
        title=""
      >
        {selectedEvent?.isCreatedByClient ? (
          <PatientPortalAppointmentUpdate
            slot={selectedSlot}
            toggleClose={toggleClose}
            userData={userData}
            fetchAppoinments={fetchAppoinments}
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            setDeleteModal={setDeleteModal}
            isPast={selectedEvent?.isPast}
          />
        ) : (
          <AddAppointment
            slot={selectedSlot}
            toggleClose={toggleClose}
            userData={userData}
            fetchAppoinments={fetchAppoinments}
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            setDeleteModal={setDeleteModal}
            isPast={selectedEvent?.isPast}
          />
        )}
      </AppModal>
      <AppDeleteDialog
        isLoading={deleteLoading}
        isOpen={deleteModal}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment?"
        onConfirm={handleDelete}
        onClose={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default AppointmentCalendar;
