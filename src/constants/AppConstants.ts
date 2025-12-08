export const accessOptions = [
  { key: "admin", label: "Admin" },
  { key: "dashboard", label: "Dashboard" },
  { key: "teams", label: "Teams" },
  { key: "reports", label: "Reports" },
  { key: "patients", label: "Patients" },
  { key: "appointments", label: "Appointments" },
  { key: "billing", label: "Billing" },
  { key: "allowPatientDataDownload", label: "Patient Data Download" },
  { key: "allowPatientDataEdit", label: "Patient Data Edit" },
];

export const AppConstants = {
  unidentified: "unidentified",
};

export const Privacy_policy_url =
  "https://api-dev.medistry.ai//files/Medistry%20User%20Privacy%20Policy.docx.pdf";

export const Agreement_url =
  "https://api-dev.medistry.ai/files/EULA%20Medistry.pdf";

export const Terms_Condition = "https://medistry.ai/terms-and-conditions";

export const Data_Constcnts = {
  EMR_TYPE: "medistry",
};

export const REPORT_TYPE = [
  "Prescription",
  "Clinical Note",
  // "Discharge Summary",
  "Referral Note",
  "Lab Request",
  "Radiology Report",
];

export const periodOptions = [
  { label: "Daily", value: "day" },
  { label: "Weekly", value: "this_week" },
  { label: "Monthly", value: "this_month" },
  // { label: "Quarterly", value: "quarterly" },
  { label: "Semi-annual", value: "semi_annual" },
  { label: "Annual", value: "this_year" },
];
