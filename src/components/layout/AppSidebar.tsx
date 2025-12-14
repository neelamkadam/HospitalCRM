import * as React from "react";
import { NavMain } from "./NavMain";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "../ui/sidebar";
import { ROUTES } from "../../constants/routesConstants";
import UserSvg from "../../assets/Svgs/User.svg";
import DashboardSvg from "../../assets/Svgs/dashboard.svg";
import handheart from "../../assets/Svgs/handheart.svg";
import Analytics from "../../assets/Svgs/analytics.svg";
import shielduser from "../../assets/Svgs/shield-user.svg";
import BanknoteArrowUp from "../../assets/Svgs/BanknoteArrowUp.svg";
import MessageIcon from "../../assets/Svgs/messages-square.svg";
import Calender from "../../assets/Svgs/calendar-days.svg";
import { useSelector } from "react-redux";
// import FullAppLogo from "../../assets/App-Logo-Full.png";
import AppLogo from "../../assets/App-Logo.png";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userPermissions?: string[];
}

export function AppSidebar({
  userPermissions,
  ...props
}: AppSidebarProps): JSX.Element {
  const userRoles = userPermissions || [];
  const { userData } = useSelector((state: any) => state.authData);

  const baseNav = [
    {
      title: "Dashboard",
      url: ROUTES.DASHBOARD,
      icon: DashboardSvg,
      permissions: ["admin", "dashboard"],
    },
    {
      title: "My Profile",
      url: `${ROUTES.PATIENTS_OVERALL_HEALTH}?id=${userData?._id}`,
      icon: UserSvg,
      permissions: ["client"],
    },
    {
      title: "Patients",
      url: ROUTES.PATIENTS,
      icon: UserSvg,
      permissions: ["patients", "client"],
    },
    {
      title: "Reports",
      url: `${ROUTES.HEALTHREPORT}?tab=completed`,
      icon: Analytics,
      permissions: ["admin", "reports", "client"],
    },
    {
      title: "Chats",
      url: ROUTES.CHATHISTORY,
      icon: MessageIcon,
      permissions: ["Chat", "client"],
    },
    {
      title: "Requests",
      url: ROUTES.PATIENT_REQUEST,
      icon: handheart,
      permissions: ["client"],
    },
    ...(userData?.organizationId?.appointmentsEnabled
      ? [
          {
            title: "Appointments",
            url: ROUTES.CalenderPage,
            icon: Calender,
            permissions: ["client", "appointments"],
          },
        ]
      : []),

    ...(userData?.organizationId?.billingEnabled
      ? [
          {
            title: "Billing",
            url: ROUTES.BILLINGS,
            icon: BanknoteArrowUp,
            permissions: ["billing"],
          },
        ]
      : []),
    {
      title: "Payments",
      url: ROUTES.PAYMENTS,
      icon: BanknoteArrowUp,
      permissions: ["client"],
    },

    {
      title: "Appointments",
      url: ROUTES.DOCTOR_APPOINTMENT,
      icon: Calender,
      permissions: ["client"],
    },
    // {
    //   title: "BookRoom",
    //   url: ROUTES.BOOKROOM,
    //   icon: UserSvg,
    //   permissions: ["admin", "patients", "client"],
    // },
  ];

  const adminNav = {
    title: "Admin",
    url: ROUTES.Organization,
    icon: shielduser,
    permissions: ["admin", "teams"],
  };

  const data = {
    navMain: userData?.isSuperAdmin ? [adminNav, ...baseNav] : baseNav,
  };

  let filteredNav = data.navMain.filter((item) => {
    if (!item?.permissions?.length) return true;
    if (
      userData?.role?.includes("client") &&
      [
        "My Profile",
        "Reports",
        "Requests",
        "Payments",
        "Chats",
        "Appointments",
      ].includes(item.title)
    ) {
      return true;
    }
    return item?.permissions?.some((permission) =>
      userRoles?.includes(permission)
    );
  });

  // if admin → sort so Patients comes before Reports
  if (userData?.permissions?.includes("admin", "client")) {
    filteredNav = filteredNav.sort((a, b) => {
      if (a.title === "Patients" && b.title === "Reports") return -1;
      if (a.title === "Reports" && b.title === "Patients") return 1;
      return 0;
    });
  }

  const { state } = useSidebar();

  return (
    <Sidebar
      className={`${
        state == "collapsed" ? "!w-20" : ""
      } !bg-gradient-to-b from-[#f8fafe] via-[#f8fafe] to-[#f8fafe] !z-[999] !border-none`}
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        {state == "collapsed" ? (
          <div className="lg:pt-[10px] self-center">
            <img src={AppLogo} className="h-8 w-8" alt="Header Image" />
            {/* <p
              className="w-6 h-6 shadow rounded-full !bg-transparent z-10 cursor-pointer mt-5 flex items-center justify-center absolute right-[-12px] top-0"
              onClick={() => toggleSidebar()}
            >
              <ChevronRight className="w-5" />
            </p> */}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2.5 ml-7 animation-wrapper">
            <div>
              <img
                src={AppLogo}
                className="h-10 w-10 object-contain"
                alt="Header Image"
              />
            </div>
            <div className="relative w-[140px] overflow-hidden ml-[2px]">
              <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-transparent to-transparent pointer-events-none z-10" />
              <div className="scrolling-text text-lg w-[140px] font-medium text-start text-[#394557] inline-block whitespace-nowrap will-change-transform">
                {userData?.organizationId?.organizationName || "CareSynca"}
              </div>
            </div>
            {/* <p
              className="w-6 h-6 shadow rounded-full bg-white z-10 cursor-pointer mt-5 flex items-center justify-center absolute right-[-12px] top-0"
              onClick={() => toggleSidebar()}
            >
              <ChevronLeft className="w-5" />
            </p> */}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent
        className={`${state == "expanded" ? "space-y" : ""}  lg:mt-[12px]`}
      >
        {/* Pass handler to close sidebar on click */}
        <NavMain items={filteredNav} />
      </SidebarContent>

      <SidebarFooter className="px-6 py-4">
        {/* Footer Content */}
      </SidebarFooter>
    </Sidebar>
  );
}
