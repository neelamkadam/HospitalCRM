import React, { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import AppNavbar from "./AppNavbar";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useGetApi, usePutApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import { setUserData } from "../../redux/AuthSlice";
import ChatBot from "../../pages/ChatBot/ChatBot";
import ConsentModal from "../ConsentModal";
import { AuthResponseBodyDataModel } from "../../types/response.types";

interface LayoutProps {
  children?: React.ReactNode;
  sidebar?: boolean;
  header?: boolean;
}

const AppLayout: React.FC<LayoutProps> = ({
  children,
  sidebar = true,
  header = true,
}) => {
  const dispatch = useAppDispatch();
  const { userData }: any = useAppSelector((state) => state.authData);
  const [confirmConsent, setConfirmConsent] = useState(false);
  const [sideBarOpen, setSideBarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sideBarOpen));
  }, [sideBarOpen]);

  const { getData: getUserData } = useGetApi<any>("");

  useEffect(() => {
    const fetchApi = async () => {
      const userDataRes = await getUserData(API_CONSTANTS.GET_USER_INFO);
      if (userDataRes?.data?.success) {
        if (!userDataRes?.data?.user?.confirmConsent) {
          setConfirmConsent(true);
        }
        dispatch(setUserData(userDataRes?.data?.user));
      }
    };
    fetchApi();
  }, []);

  const { putData: UpdateConsent } = usePutApi<AuthResponseBodyDataModel>({
    path: API_CONSTANTS.AUTH.UPDATE_CONSENT,
  });

  const handleUpdate = async () => {
    const payload = {
      confirmConsent: true,
    };
    try {
      let resData = await UpdateConsent(payload);
      if (resData?.data?.success) {
        setConfirmConsent(false);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  return (
    <SidebarProvider
      onOpenChange={() => setSideBarOpen((prev) => !prev)}
      open={sideBarOpen}
    >
      {sidebar && <AppSidebar userPermissions={userData?.permissions} />}
      <SidebarInset className="bg-transparent !bg-[#f3f4f6]">
        {/* Sticky Header */}
        {header && (
          <div className="sticky top-0 z-50">
            <AppNavbar />
          </div>
        )}
        <div className="!bg-[#f3f4f6]">
          <Outlet />
          {children}
        </div>
        {userData?.role === "client" && !confirmConsent &&
          <div id="chatbot-container" className="fixed bottom-4 right-4 z-[9999] pointer-events-auto">
            <ChatBot />
          </div>
        }
        <ConsentModal
          isOpen={confirmConsent}
          toggle={() => setConfirmConsent(false)}
          onConfirm={() => {
            handleUpdate();
          }}
        />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
