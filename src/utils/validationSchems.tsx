import * as yup from "yup";

export const addTeamMember = yup.object().shape({
  email: yup
    .string()
    .transform((value) => (value ? value.trim().toLowerCase() : value))
    .email("Must be a valid email")
    .required("Email is required"),

  registrationNumber: yup
    .string()
    .transform((value) => (value ? value.trim().toLowerCase() : value)),
  // .required("Registration number is required"),

  role: yup.string(),

  // department: yup.string().required("Department is required"),

  access: yup
    .object()
    .shape({
      admin: yup.boolean(),
      dashboard: yup.boolean(),
      teams: yup.boolean(),
      reports: yup.boolean(),
    })
    .test(
      "at-least-one-true",
      "At least one permission is required",
      function (value) {
        // Check if at least one permission is true
        return Object.values(value).includes(true);
      }
    ),
});

export const addTeamMemberNew = yup.object().shape({
  email: yup
    .string()
    .transform((value) => (value ? value.trim().toLowerCase() : value))
    .email("Must be a valid email")
    .required("Email is required"),

  registrationNumber: yup
    .string()
    .transform((value) => (value ? value.trim().toLowerCase() : value)),
  // .required("Registration number is required"),

  access: yup
    .object()
    .shape({
      admin: yup.boolean(),
      dashboard: yup.boolean(),
      teams: yup.boolean(),
      reports: yup.boolean(),
    })
    .test(
      "at-least-one-true",
      "At least one permission is required",
      function (value) {
        // Check if at least one permission is true
        return Object.values(value).includes(true);
      }
    ),
});

export const loginSchema = yup
  .object({
    email: yup
      .string()
      .transform((value) => (value ? value.trim() : value))
      // .email("Must be a valid email")
      .required("Email is required"),
    password: yup
      .string()
      // .min(8, "Password must be at least 8 characters long")
      // .matches(/[A-Z]/, "Password must have at least one uppercase letter")
      // .matches(/[a-z]/, "Password must have at least one lowercase letter")
      // .matches(
      //   /[!@#$%^&*(),.?":{}|<>]/,
      //   "Password must have at least one special character"
      // )
      .required("Passwords is required"),
  })
  .required();

export const setEmailSchema = yup
  .object({
    email: yup
      .string()
      .transform((value) => (value ? value.trim() : value))
      .email("Must be a valid email")
      .required("Email is required"),
    password: yup
      .string()
      // .min(8, "Password must be at least 8 characters long")
      // .matches(/[A-Z]/, "Password must have at least one uppercase letter")
      // .matches(/[a-z]/, "Password must have at least one lowercase letter")
      // .matches(
      //   /[!@#$%^&*(),.?":{}|<>]/,
      //   "Password must have at least one special character"
      // )
      .required("Passwords is required"),
  })
  .required();

//patient login
export const patientLogin = yup.object().shape({
  countryCode: yup.string().required("Country code is required"),
  phone: yup
    .string()
    .transform((value) => (value ? value.replace(/\D/g, "") : value))
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
});
export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters long"),
  email: yup
    .string()
    .transform((value) => (value ? value.trim().toLowerCase() : value))
    .email("Must be a valid email")
    .required("Email is required"),
  privacy: yup
    .boolean()
    .required()
    .oneOf([true], "You must accept the privacy policy"),
  countryCode: yup.string().required("Country code is required"),
  phone: yup
    .string()
    .transform((value) => (value ? value.replace(/\D/g, "") : value))
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
});

export const setPhoneNumber = yup.object().shape({
  countryCode: yup.string().required("Country code is required"),
  phone: yup
    .string()
    .transform((value) => (value ? value.replace(/\D/g, "") : value))
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  otp: yup
    .string()
    .required("OTP is required")
    .matches(/^[0-9]{4}$/, "Please enter a valid 6-digit OTP"),
});

export const SetOrganizationSchema = yup.object().shape({
  organizationName: yup
    .string()
    .required("organization name is required")
    .min(2, "organizationName name must be at least 2 characters long"),
  companyRegisterId: yup.string().required("Company Register ID is required"),
});

export const SetPatientNameSchema = yup.object().shape({
  patientName: yup
    .string()
    .required("Patient name is required")
    .min(2, "Patient name must be at least 2 characters long"),
  registerMedicalId: yup.string().required("Medical ID is required"),
});

export const completeRegistrationShema = yup.object().shape({
  secretKay: yup
    .string()
    .required("Secret Kay is required")
    .min(2, "Patient name must be at least 2 characters long"),
  password: yup
    .string()
    // .min(8, "Password must be at least 8 characters long")
    // .matches(/[A-Z]/, "Password must have at least one uppercase letter")
    // .matches(/[a-z]/, "Password must have at least one lowercase letter")
    // .matches(
    //   /[!@#$%^&*(),.?":{}|<>]/,
    //   "Password must have at least one special character"
    // )
    .required("Passwords is required"),
  countryCode: yup.string(),
  phone: yup
    .string()
    .transform((value) => (value ? value.replace(/\D/g, "") : value))
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits"),
});

export const addPatientSchems = (patientInformation?: boolean, role?: string) =>
  yup.object().shape({
    email: yup
      .string()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null
          ? null
          : value.trim().toLowerCase()
      )
      .test(
        "Must be a valid email",
        "Invalid email format",
        (value) =>
          !value || /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
      )
      .when([], {
        is: () => patientInformation === true, // conditionally required
        then: (schema) => schema.required("Email is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
    name: yup
      .string()
      .required("Name is required")
      .min(2, "Name must be at least 2 characters long"),
    phone: yup.string().when([], {
      is: () => role !== "organization",
      then: (schema) =>
        schema
          .required("Phone is required")
          .matches(/^[0-9]{10}$/, "Phone number must be 10 digits"),
      otherwise: (schema) => schema.notRequired(),
    }),
    gender: yup.string().required("Gender is required"),
    age: yup
      .string()
      .required("Age is required")
      .matches(/^\d+$/, "Age must be a number")
      .test("is-valid-age", "Age must be between 1 and 99", (value) => {
        const num = Number(value);
        return num >= 1 && num <= 99;
      }),
    uniqueId: yup.string().nullable().notRequired().max(30),
    privacy: yup
      .boolean()
      .required()
      .oneOf([true], "You must accept the privacy policy"),
  });

export const editPatientSchems = (role?: string) =>
  yup.object().shape({
    email: yup
      .string()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null
          ? null
          : value.trim().toLowerCase()
      )
      .test(
        "Must be a valid email",
        "Invalid email format",
        (value) =>
          !value || /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
      )
      .notRequired(),
    name: yup
      .string()
      .required("Name is required")
      .min(2, "Name must be at least 2 characters long"),
    phone: yup.string().when([], {
      is: () => role !== "organization",
      then: (schema) =>
        schema
          .required("Phone is required")
          .matches(/^[0-9]{10}$/, "Phone number must be 10 digits"),
      otherwise: (schema) => schema.notRequired(),
    }),
    gender: yup.string().nullable().notRequired(),
    age: yup
      .string()
      .required("Age is required")
      .matches(/^\d+$/, "Age must be a number")
      .test("is-valid-age", "Age must be between 1 and 99", (value) => {
        const num = Number(value);
        return num >= 1 && num <= 99;
      }),
    uniqueId: yup.string().nullable().notRequired().max(30),
  });

export const addReporttSchems = yup.object().shape({
  patientId: yup
    .object()
    .shape({
      value: yup.string().required("Patient is required"),
      label: yup.string().required(),
    })
    .required("Patient is required")
    .nullable(),
  reportText: yup.string().optional(),
  // .required("Report text is required")
  // .min(10, "Report must be at least 10 characters"),
});

export const selectMergePatient = yup.object().shape({
  patientId: yup.object().shape({
    value: yup.string().required("Patient is required"),
    label: yup.string().required(),
  }),
});

export const selectPatient = yup.object().shape({
  patientId: yup.string().required("Patient Id is required"),
});

export const memberVerificationSchems = yup
  .object({
    name: yup.string().required(),
    password: yup
      .string()
      // .min(8, "Password must be at least 8 characters long")
      // .matches(/[A-Z]/, "Password must have at least one uppercase letter")
      // .matches(/[a-z]/, "Password must have at least one lowercase letter")
      // .matches(
      //   /[!@#$%^&*(),.?":{}|<>]/,
      //   "Password must have at least one special character"
      // )
      .required("Passwords is required"),
    countryCode: yup.string().required("Country code is required"),
    phone: yup
      .string()
      .transform((value) => (value ? value.replace(/\D/g, "") : value))
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
    privacy: yup
      .boolean()
      .required()
      .oneOf([true], "You must accept the privacy policy"),
  })
  .required();

export const orgProfileSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
  organizationName: yup
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .required("Organization name is required"),
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  address: yup
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .required("Address is required"),
  countryCode: yup
    .string()
    .matches(
      /^\+\d{1,4}$/,
      "Country code must start with '+' followed by digits"
    )
    .required("Country code is required"),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
  companyRegistrationID: yup
    .string()
    .trim()
    .min(3, "Registration Number must be at least 3 characters")
    .required("Registration Number is required"),
  websiteUrl: yup
    .string()
    .trim()
    .url("Please enter a valid website URL")
    .required("Website URL is required"),
  logo: yup
    .string()
    .trim()
    .url("Logo must be a valid URL")
    .required("Logo is required"),
  role: yup.string().trim().required("Role is required"),
  billingInfo: yup
    .object({
      billingName: yup.string().trim().required("Billing name is required"),
      billingAddress: yup
        .string()
        .trim()
        .required("Billing address is required"),
      gstNumber: yup.string().trim().required("GST number is required"),
      paymentMethods: yup
        .array()
        .of(yup.string().trim())
        .required("At least one payment method is required"),
      billingEmail: yup
        .string()
        .trim()
        .email("Please enter a valid billing email address")
        .required("Billing email is required"),
      branchName: yup.string().trim().required("Branch name is required"),
      UpiId: yup.string().trim().required("UPI ID is required"),
      IfscCode: yup.string().trim().required("IFSC code is required"),
      accountNumber: yup.string().trim().required("Account number is required"),
    })
    .required("Billing information is required"),
  pdfHeader: yup.string().trim().required("PDF header is required"),
  patientUniqueIdPrefix: yup
    .string()
    .trim()
    .length(3, "Prefix must be exactly 3 characters"),
  patientUniqueIdLength: yup
    .number()
    .min(5, "Serial number must be between 5 and 10")
    .max(10, "Serial number must be between 5 and 10"),
  printedHeaderHeight: yup
    .number()
    .min(10, "Header height must be between 10 to 180")
    .max(180, "Header height must be between 10 to 180")
    .required("Header height is required"),
  printedFooterHeight: yup
    .number()
    .min(10, "Footer height must be between 10 to 180")
    .max(180, "Footer height must be between 10 to 180")
    .required("Footer height is required"),
});

export const UserProfileSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),

  orgName: yup
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .required("Organization name is required"),

  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .required("Name is required"),

  about: yup
    .string()
    .trim()
    // .min(10, "About must be at least 10 characters long")
    .required("About is required"),

  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),

  countryCode: yup
    .string()
    .matches(
      /^\+\d{1,3}$/,
      "Country code must start with '+' and contain up to 3 digits"
    )
    .required("Country code is required"),

  registrationNumber: yup
    .string()
    .trim()
    .min(3, "Registration Number must be at least 3 characters")
    .required("Registration Number is required"),

  profilePic: yup.string().notRequired(),

  role: yup.string().trim().required("Role is required"),

  specialization: yup.string(),
  printedHeaderHeight: yup
    .number()
    .min(10, "Header height must be between 10 to 180")
    .max(180, "Header height must be between 10 to 180")
    .required("Header height is required"),
  printedFooterHeight: yup
    .number()
    .min(10, "Footer height must be between 10 to 180")
    .max(180, "Footer height must be between 10 to 180")
    .required("Footer height is required"),
});

export const addApiKeySchema = yup.object().shape({
  lable: yup.string().required("required"),
});

export const addReportTypeSchema = yup.object().shape({
  reportType: yup.string().required("required"),
  heading: yup.string(),
  headingShow: yup.string(),
});

export const addServiceInvoiceSchema = yup.object().shape({
  service: yup.string().required("Service is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .moreThan(0, "Price must be greater than zero"),
  tax: yup.number(),
});

export const addPaidInvoiceSchema = yup.object().shape({
  paymentMethod: yup.string().required("Payment method is required"), // now required

  paymentDetails: yup
    .string()
    .max(150, "Description must be at most 150 characters")
    .notRequired(), // optional

  note: yup
    .string()
    .max(150, "Remark must be at most 150 characters")
    .notRequired(), // optional
});

export const PatientOtpRegistrationSchema = yup.object().shape({
  otp: yup
    .string()
    .required("OTP is required")
    .matches(/^[0-9]{6}$/, "Please enter a valid 6-digit OTP"),

  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Za-z]/, "Password must contain at least one letter")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),

  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), undefined], "Passwords must match")
    .required("Confirm password is required"),
});


export const broadcastBulkSend = () =>
  yup.object().shape({
    subject: yup
      .string()
      .required("Subject is required")
      .max(150),
      message: yup
      .string()
      .required("Message is required")
    
  });