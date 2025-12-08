import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "../constants/routesConstants";
import LandingPage from "../pages/LandingPage";
import SignUp from "../pages/Auth/SignUp";
import Login from "../pages/Auth/Login";
import OtpVerification from "../pages/Auth/OtpVerification";
import Dashboard from "../pages/DashBoard/Dashboard";
import ProtectedRoute from "./AuthRedirect";
import AppLayout from "../components/layout/AppLayout";
import TeamManagement from "../pages/TeamManagement/TeamManagement";
import HealthReportsPage from "../pages/HealthReport/HealthReport";
import Patients from "../pages/Patients/Patients";
import MemberVerificaitonScreen from "../pages/TeamManagement/MemberVerificaitonScreen";
import ResetPassword from "../pages/Auth/ResetPassword";
import SetNewPasswordScreen from "../pages/Auth/SetNewPasswordScreen";
import ReportSummary from "../pages/HealthReport/ReportSummary";
import OverallPatientsReport from "../pages/Patients/OverallPatientsReport";
import FileUpload from "../pages/HealthReport/FileUpload";
import SelectOrganization from "../pages/Auth/SelectOrganization";
import SetOrganization from "../pages/Auth/SetOrganization";
import SetPatientName from "../pages/Auth/SetPatientName";
import CompleteRegistration from "../pages/Auth/CompleteRegistration";
import CreateReport from "../pages/HealthReport/CreateReport";
import TeamLoges from "../pages/TeamManagement/TeamLoges";
import SetEmailAndPappPatient from "../pages/Auth/SetEmailAndPappPatient";
import AIObservations from "../pages/AIObservation/AIObservations";
import ViewDetailObservation from "../pages/AIObservation/ViewDetailObservation";
import OrgAccount from "../pages/OrgProfile/OrgAccount";
import UserProfile from "../pages/OrgProfile/UserProfile";
import SetPhoneOtp from "../pages/Auth/SetPhoneOtp";
import ApiKeys from "../pages/ApiKeys/ApiKeys";
import Organization from "../pages/Organization/Organization";
import OrganizationDetails from "../pages/Organization/OrganizationDetails";
import AppointmentCalendar from "../pages/BookingApponitMent/AppointmentCalendar";
import PatientLogin from "../pages/Auth/PatientLogin";
import { AddPatientInformation } from "../pages/Patients/AddPatientInformation";
import { PatientRequest } from "../pages/PatientRequest/PatientRequest";
import { Payments } from "../pages/Payments/Payments";
import { PaymentVerifiction } from "../pages/Payments/PaymentVerifiction";
import { CreateInvoice } from "../pages/Billing/CreateInvoice";
import { Billings } from "../pages/Billing/Billings";
// import BookRoom from "../pages/BookRoom/BedPicker";
import PatientProfile from "../pages/OrgProfile/PatientProfile";
import ChatBotTable from "../pages/ChatBot/ChatBotTable";
import BookDoctorAppointment from "../pages/BookingApponitMent/PatientPortalAppointment/BookDoctorAppoinment";
import PatientPasswordVerify from "../pages/Auth/PatientPasswordVerify";
import PatientOtpRegistration from "../pages/Auth/PatientOtpRegistration";
import AdminAnalytics from "../pages/AdminAnalytics";
import Orgbroadcast from "../pages/Broadcast/Orgbroadcast";
import Faqs from "../pages/OrgProfile/Faqs";
import { AdminInvoiceTable } from "../pages/Billing/AdminInvoiceTable";
import { AdminCreateInvoice } from "../pages/Billing/AdminCreateInvoice";

export const AppRoutes = createBrowserRouter([
  {
    path: ROUTES.LANDING_PAGE,
    element: <LandingPage />,
  },
  {
    path: ROUTES.SIGNUP,
    element: <SignUp />,
  },
  {
    path: ROUTES.LOGIN,
    element: <Login />,
  },
  {
    path: ROUTES.PATIENT_LOGIN,
    element: <PatientLogin />,
  },
  { path: ROUTES.SET_PATIENT_PWD, element: <PatientPasswordVerify /> },
  { path: ROUTES.PAtTIENT_SEND_OTP, element: <PatientLogin /> },
  {
    path: ROUTES.ADD_PATIENT_INFORMATION,
    element: <AddPatientInformation />,
  },
  {
    path: ROUTES.OTP_VERIFICATION,
    element: <OtpVerification />,
  },
  {
    path: ROUTES.PATIENT_OTP_PASSWORD_VERIFY,
    element: <OtpVerification />,
  },
  {
    path: ROUTES.PATIENT_OTP_REGISTRATION,
    element: <PatientOtpRegistration />,
  },
  {
    path: ROUTES.MEMBER_VERIFICATION_SCREEN,
    element: <MemberVerificaitonScreen />,
  },
  {
    path: ROUTES.RESET_PWD,
    element: <ResetPassword />,
  },
  {
    path: ROUTES.SET_NEW_PWD,
    element: <SetNewPasswordScreen />,
  },
  { path: ROUTES.SELECT_ORGANIZATION, element: <SelectOrganization /> },
  { path: ROUTES.SET_ORGANIZATION, element: <SetOrganization /> },
  { path: ROUTES.SET_PHONEOTP, element: <SetPhoneOtp /> },
  { path: ROUTES.SET_UP_PATIENT, element: <SetPatientName /> },
  { path: ROUTES.COMPLETE_REGISTRATION, element: <CompleteRegistration /> },
  { path: ROUTES.UPDATE_EMAIL_PASSWORD, element: <SetEmailAndPappPatient /> },
  {
    path: ROUTES.PAYMENT_VERIFICATION,
    element: <PaymentVerifiction />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: <Dashboard />,
      },
      {
        path: ROUTES.TEAMMANAGEMENT,
        element: <TeamManagement />,
      },
      {
        path: ROUTES.TEAMLOGES,
        element: <TeamLoges />,
      },
      // {
      //   path: ROUTES.PDFPREVIEW,
      //   element: <PdfPreview />,
      // },
      {
        path: ROUTES.HEALTHREPORT,
        element: <HealthReportsPage />,
      },
      {
        path: ROUTES.REPORT_SUMMARY,
        element: <ReportSummary />,
      },
      {
        path: ROUTES.FILE_PLOAd,
        element: <FileUpload />,
      },
      {
        path: ROUTES.CREATE_REPORT,
        element: <CreateReport />,
      },
      {
        path: ROUTES.PATIENTS,
        element: <Patients />,
      },
      {
        path: ROUTES.PATIENTS_OVERALL_HEALTH,
        element: <OverallPatientsReport />,
      },
      { path: ROUTES.AIOBSERVATIONS, element: <AIObservations /> },
      { path: ROUTES.VIEW_OBSERVATION, element: <ViewDetailObservation /> },
      { path: ROUTES.PROFILE, element: <OrgAccount /> },
      { path: ROUTES.USERPROFILE, element: <UserProfile /> },
      { path: ROUTES.PATIENTPROFILE, element: <PatientProfile /> },
      { path: ROUTES.API_KEYS, element: <ApiKeys /> },
      {
        path: ROUTES.Organization,
        element: <Organization />,
      },
      {
        path: ROUTES.OrganizationDetails,
        element: <OrganizationDetails />,
      },
      {
        path: ROUTES.CalenderPage,
        element: <AppointmentCalendar />,
      },
      {
        path: ROUTES.PATIENT_REQUEST,
        element: <PatientRequest />,
      },
      {
        path: ROUTES.PAYMENTS,
        element: <Payments />,
      },
      {
        path: ROUTES.BILLING_CREATE,
        element: <CreateInvoice />,
      },
      {
        path: ROUTES.BILLINGS,
        element: <Billings />,
      },
      {
        path: ROUTES.CHATHISTORY,
        element: <ChatBotTable />,
      },
      {
        path: ROUTES.DOCTOR_APPOINTMENT,
        element: <BookDoctorAppointment />,
      },
      {
        path: ROUTES.ADMINANALYTICS,
        element: <AdminAnalytics />,
      },
      { path: ROUTES.FAQS, element: <Faqs /> },

      {
        path: ROUTES.ORGBROADCAST,
        element: <Orgbroadcast />,
      },
      {
        path: ROUTES.ADMIN_INVOICE,
        element: <AdminInvoiceTable />,
      },
       {
        path: ROUTES.ADMIN_INVOICE_CREATE,
        element: <AdminCreateInvoice />,
      },
    ],
  },
]);
