import React, { useEffect } from "react";
import {
  Bell,
  BellRing,
  CalendarDays,
  ChevronRight,
  FileCheck,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { deleteAPI, useGetApi } from "../services/use-api";
import API_CONSTANTS from "../constants/apiConstants";
import NotificationIcon from "../assets/Svgs/notification.svg";

type Notification = {
  _id: string;
  type: "appointment" | "appointment_reminder" | "invoice" | string;
  message: string;
  readAt?: string | null;
  data: {
    invoiceLink?: string;
  };
};

const AppNotification: React.FC = () => {
  const { getData: GetNotifications, isLoading: loading } = useGetApi<any>("");
  const { getData: GetNotificationsMarkAllread } = useGetApi<any>("");
  const { getData: GetNotificationsMarkRead } = useGetApi<any>("");

  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const fetchData = async () => {
    try {
      const response: any = await GetNotifications(
        `${API_CONSTANTS.NOTIFICATION.GET_NOTIFICATION}`
      );
      setNotifications(response?.data?.notifications?.items || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <CalendarDays className="h-5 w-5 text-blue-500" />;
      case "appointment_reminder":
        return <BellRing className="h-5 w-5 text-amber-500" />;
      case "invoice":
        return <FileCheck className="h-5 w-5 text-emerald-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const markAllRead = async () => {
    try {
      const response: any = await GetNotificationsMarkAllread(
        `${API_CONSTANTS.NOTIFICATION.GET_NOTIFICATION_MARK_ALL_READ}`
      );
      if (response.data.success) {
        fetchData();
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
        );
      }
    } catch (error) {
      console.error(error);
    }
  };
  const markAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    try {
      const response: any = await GetNotificationsMarkRead(
        `${API_CONSTANTS.NOTIFICATION.GET_NOTIFICATION_MARK_READ}/${id}/mark-as-read`
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === id ? { ...n, readAt: new Date().toISOString() } : n
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInvoice = (e: React.MouseEvent, invoiceLink?: string | null) => {
    e.stopPropagation();
    if (invoiceLink) {
      window.open(invoiceLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleRemoveNotification = async (
    e: React.MouseEvent,
    noti_id: string
  ) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const result = await deleteAPI(
        `${API_CONSTANTS.NOTIFICATION.GET_NOTIFICATION}/${noti_id}`
      );
      if (result.success) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full bg-none shadow-none border-none outline-none focus:outline-none focus-visible:ring-0 hover:bg-transparent"
          aria-label="Open notifications"
        >
          {/* <BellRing className="h-5 w-5 text-foreground" color="#01576A" /> */}
          <img
            src={NotificationIcon}
            alt="NotificationIcon"
            className="h-6 w-6 mr-2 md:mr-4 cursor-pointer"
          />

          {unreadCount > 0 && (
            <span
              aria-label={`${unreadCount} unread notifications`}
              className="absolute -top-1 right-1 inline-flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-medium h-5 w-5 shadow"
            >
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-50 w-96 bg-popover text-popover-foreground border shadow-lg rounded-md"
      >
        <div className="flex items-center justify-between px-3 py-3 border-b">
          <h2 className="text-base font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              className="bg-medistryColor text-white text-sm "
              size="sm"
              onClick={markAllRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              You're all caught up. No new notifications.
            </div>
          ) : (
            <ul className="py-1">
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n?._id}
                  onClick={(e) => markAsRead(e, n?._id)}
                  className={`flex items-start gap-3 px-3 py-2 focus:bg-secondary/60  ${
                    n.readAt
                      ? "bg-secondary/10 text-muted-foreground text-gray-400"
                      : "bg-secondary/30 font-semibold text-medistryColor"
                  }  border-b last:border-b-0`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-5">{n.message}</p>
                    {n?.type === "invoice" && n?.data?.invoiceLink && (
                      <Button
                        variant="link"
                        className={`text-medistryColor px-0 py-0 h-auto text-xs underline gap-0 shadow-none ${
                          n.readAt
                            ? "bg-secondary/10 text-muted-foreground text-gray-400"
                            : "bg-secondary/30 font-semibold text-medistryColor"
                        }`}
                        onClick={(e) => [
                          markAsRead(e, n._id),
                          handleInvoice(e, n.data?.invoiceLink),
                        ]}
                      >
                        View invoice <ChevronRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  <div
                    className="flex-shrink-0 ml-auto mt-0.5 cursor-pointer"
                    onClick={(e) => handleRemoveNotification(e, n._id)}
                  >
                    <X className="w-3.5 h-3.5 p-0.5 text-gray-400 hover:text-gray-600 bg-slate-200 rounded-full" />
                  </div>
                </DropdownMenuItem>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AppNotification;
