export type LoginFormType = {
  email: string;
  password: string;
};
export type PatientLoginFormType = {
  phone: string;
  countryCode: string;
};

export type ReportTypeForm = {
  reportType: string;
  heading?: string;
  headingShow?: string;
};

export type AddServiceReportType = {
  service: string;
  price: number;
  tax?: number;
};

export type AddPaidInvoiceType = {
  paymentMethod: string;
  paymentDetails?: string | null;
  note?: string | null;
};

export type SetMemberType = {
  name: string;
  password: string;
  countryCode: string;
  phone: string;
  privacy: boolean;
};

export interface SignUpFormType {
  name: string;
  email: string;
  privacy: boolean;
  countryCode: string; // Ensure this is always a string
  phone: string;
}

export type SetPhoneOtpType = {
  phone: string;
  countryCode: string;
  otp: string;
};

export type SetOrganizationType = {
  organizationName: string;
  companyRegisterId: string;
};

export type SetPatientNameType = {
  patientName: string;
  registerMedicalId: string;
};

export interface completeRegistration {
  secretKay: string;
  password: string;
  countryCode?: string;
  phone?: string;
}

export type orgProfile = {
  organizationName: string;
  email: string;
  name: string;
  websiteUrl: string;
  address: string;
  countryCode: string;
  phone: string;
  companyRegistrationID: string;
  logo: string;
  role: string;
  billingInfo: {
    billingName: string;
    billingAddress: string;
    gstNumber: string;
    paymentMethods: any;
    billingEmail: string;
    branchName: string;
    IfscCode: string;
    UpiId: string;
    accountNumber: string;
  };
  pdfHeader: string;
  patientUniqueIdPrefix?: string;
  patientUniqueIdLength?: number;
  _id?: string;
  printedHeaderHeight: number;
  printedFooterHeight: number;
};

export type userProfile = {
  orgName: string;
  email: string;
  name: string;
  about: string;
  phone: string;
  registrationNumber: string;
  countryCode: string;
  profilePic?: string | any;
  role: string;
  specialization: any;
  signature: string;
  gender: string;
  printedHeaderHeight: number;
  printedFooterHeight: number;
};
