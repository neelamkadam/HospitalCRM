import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProfielShareMessage } from "../lib/utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Set User detail in Local Storage
export const setUserDetailsInLocalStorage = (data: {}) => {
  const mapData = new Map<string, string>(Object.entries(data));
  mapData.forEach((value, key) => {
    if (value) {
      localStorage.setItem(key, value);
    }
  });
};

// Get Token from Local Storage
export const getTokenFromLocalStorage = () => {
  return localStorage.getItem("token");
};

// Get All User Details From Local Storage
export const getUserDetailFromLocalStorage = (key: string) => {
  return localStorage.getItem(key);
};

// Clear Local Storage
export const clearLocalStorage = () => {
  localStorage.clear();
};

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return "";
  return str
    .split("-") // Split the string by hyphens
    .map((word) => word?.charAt(0)?.toUpperCase() + word?.slice(1)) // Capitalize each word
    .join(" ");
};

export function removeTrailingSlash(url: string) {
  // Check if the last character is a slash
  if (url.endsWith("/")) {
    // Remove the trailing slash
    return url.slice(0, -1);
  }
  // If no trailing slash, return the original URL
  return url;
}

export function formatmaximunString(value: string) {
  const orgName = value;

  return orgName.length > 12 ? orgName.slice(0, 12) + "..." : orgName;
}

export const handleShare = (platform: string) => {
  if (platform === "whatsapp") {
    // For WhatsApp - plain text with URL
    // const shareText = `${content}\n\n${url}`;
    const shareText = ProfielShareMessage("hostName", "reportId");
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, "_blank");
  } else if (platform === "email") {
    const subject = "you have been invited";
    const emailBody = ProfielShareMessage("hostName", "reportId");
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  }
};

export const customStyle = (form: any) => {
  return {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "#fff",
      border: state.isFocused
        ? "1px solid #ffff"
        : form?.formState?.errors?.patientId
          ? "2px solid red"
          : "1px solid #E6E7E9",
      boxShadow: state.isFocused
        ? "0px 0px 0px 4px #ffff, 0px 1px 2px 0px #ffff"
        : "none",
      padding: "2px 8px",
      borderRadius: "0.375rem",
      width: "100%",
      color: "#526279",
      fontSize: "0.875rem",
      fontWeight: "400",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      minHeight: "auto",
      transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        border: "1px solid #A0AEC0",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "#E5ECED",
      borderRadius: "0.375rem",
      zIndex: 9999,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      padding: "0.75rem",
      fontSize: "1rem",
      textAlign: "left",
      transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
      backgroundColor: state.isSelected
        ? "#E5ECED"
        : state.isFocused
          ? "#E5ECED"
          : "#fff",
      color: state.isSelected ? "#01576A" : "#526279",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#526279",
      fontSize: "0.875rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      minHeight: "auto",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "0",
    }),
    input: (provided: any) => ({
      ...provided,
      margin: "0",
      padding: "0",
    }),
  };
};

export const customStyleA = (form: any) => {
  return {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "#fff",
      border: state.isFocused
        ? "1px solid #016B83"
        : form?.formState?.errors?.patientId
          ? "2px solid red"
          : "1px solid #A0AEC0",
      boxShadow: state.isFocused
        ? "0px 0px 0px 4px #016B833D, 0px 1px 2px 0px #4E4E4E0D"
        : "none",
      padding: "7px 0px 7px 12px",
      borderRadius: "0.375rem",
      width: "100%",
      color: "#526279",
      fontSize: "0.875rem",
      fontWeight: "400",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      minHeight: "auto",
      transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        border: "1px solid #A0AEC0",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "#E5ECED",
      borderRadius: "0.375rem",
      zIndex: 9999,
      maxHeight: "5px", // ⬅️ Show more options before scroll
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      padding: "0.75rem",
      fontSize: "1rem",
      // height: "10x", // ✅ <-- Added line to control option height
      textAlign: "left",
      transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
      backgroundColor: state.isSelected
        ? "#E5ECED"
        : state.isFocused
          ? "#E5ECED"
          : "#fff",
      color: state.isSelected ? "#01576A" : "#526279",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#526279",
      fontSize: "0.875rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      minHeight: "auto",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "0",
    }),
    input: (provided: any) => ({
      ...provided,
      margin: "0",
      padding: "0",
    }),
  };
};

export const customStyleB = () => {
  return {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "#fff",
      border: "none", // ✅ Always no border
      boxShadow: state.isFocused
        ? "0px 0px 0px 4px #016B833D, 0px 1px 2px 0px #4E4E4E0D"
        : "none",
      padding: "2px 1px 0px 12px",
      borderRadius: "0.375rem",
      width: "100%",
      color: "#526279",
      fontSize: "0.875rem",
      fontWeight: "400",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      minHeight: "auto",
      transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        border: "none", // ✅ No border on hover too
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "#E5ECED",
      borderRadius: "0.375rem",
      zIndex: 9999,
      maxHeight: "5px", // ⬅️ Show more options before scroll
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      padding: "0.75rem",
      fontSize: "1rem",
      // height: "10x", // ✅ <-- Added line to control option height
      textAlign: "left",
      transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
      backgroundColor: state.isSelected
        ? "#E5ECED"
        : state.isFocused
          ? "#E5ECED"
          : "#fff",
      color: state.isSelected ? "#01576A" : "#526279",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#526279",
      fontSize: "0.875rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      minHeight: "auto",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "0",
    }),
    input: (provided: any) => ({
      ...provided,
      margin: "0",
      padding: "0",
    }),
  };
};

export const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "#fff",
    border: state.isFocused ? "1px solid #016B83" : "1px solid #A0AEC0",
    boxShadow: state.isFocused
      ? "0px 0px 0px 4px #016B833D, 0px 1px 2px 0px #4E4E4E0D"
      : "none",
    padding: "0px 0px 0px 12px",
    borderRadius: "0.375rem",
    width: "100%",
    color: "#526279",
    fontSize: "0.875rem",
    fontWeight: "400",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    minHeight: "auto",
    transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    "&:hover": {
      border: "1px solid #A0AEC0",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#E5ECED",
    borderRadius: "0.375rem",
  }),
  menuList: (base: any) => ({
    ...base,
    maxHeight: "110px", // Control the scroll area here
    overflowY: "auto",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#E5ECED"
      : state.isFocused
        ? "#E5ECED"
        : "#fff",
    color: state.isSelected ? "#01576A" : "#526279",
    padding: "0.75rem",
    fontSize: "1rem",
    textAlign: "left",
    transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#526279",
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    minHeight: "auto",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: "0",
  }),
  input: (provided: any) => ({
    ...provided,
    margin: "0",
    padding: "0",
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
};

export const customSelectStylesAppointment = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "#fff",
    border: state.isFocused ? "1px solid #016B83" : "1px solid #A0AEC0",
    boxShadow: state.isFocused
      ? "0px 0px 0px 4px #016B833D, 0px 1px 2px 0px #4E4E4E0D"
      : "none",
    padding: "0px 0px 0px 12px",
    borderRadius: "0.375rem",
    width: "100%",
    color: "#526279",
    fontSize: "17px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    minHeight: "auto",
    transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    "&:hover": {
      border: "1px solid #A0AEC0",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#E5ECED",
    borderRadius: "0.375rem",
  }),
  menuList: (base: any) => ({
    ...base,
    maxHeight: "140px", // Control the scroll area here
    overflowY: "auto",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#E5ECED"
      : state.isFocused
        ? "#E5ECED"
        : "#fff",
    color: state.isSelected ? "#01576A" : "#526279",
    padding: "0.75rem",
    fontSize: "17px",
    fontWeight: "500",
    textAlign: "left",
    transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#526279",
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    minHeight: "auto",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: "0",
  }),
  input: (provided: any) => ({
    ...provided,
    margin: "0",
    padding: "0",
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
};


export const customSelectStylesDocter = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "#fff",
    border: state.isFocused ? "1px solid #016B83" : "1px solid #A0AEC0",
    boxShadow: state.isFocused
      ? "0px 0px 0px 4px #016B833D, 0px 1px 2px 0px #4E4E4E0D"
      : "none",
    padding: "0px 0px 0px 12px",
    borderRadius: "0.375rem",
    width: "100%",
    color: "#526279",
    fontSize: "17px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    minHeight: "auto",
    transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    "&:hover": {
      border: "1px solid #A0AEC0",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#E5ECED",
    borderRadius: "0.375rem",
  }),
  menuList: (base: any) => ({
    ...base,
    maxHeight: "300px", // Control the scroll area here
    overflowY: "auto",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#E5ECED"
      : state.isFocused
        ? "#E5ECED"
        : "#fff",
    color: state.isSelected ? "#01576A" : "#526279",
    padding: "0.75rem",
    fontSize: "17px",
    fontWeight: "500",
    textAlign: "left",
    transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#526279",
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    minHeight: "auto",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: "0",
  }),
  input: (provided: any) => ({
    ...provided,
    margin: "0",
    padding: "0",
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
};

export const customSelectStylesDuration = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "#fff",
    border: state.isFocused ? "1px solid #016B83" : "1px solid #A0AEC0",
    boxShadow: state.isFocused
      ? "0px 0px 0px 4px #016B833D, 0px 1px 2px 0px #4E4E4E0D"
      : "none",
    padding: "0px 0px 0px 12px",
    borderRadius: "0.375rem",
    width: "100%",
    color: "#526279",
    fontSize: "17px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    minHeight: "auto",
    transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    "&:hover": {
      border: "1px solid #A0AEC0",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#E5ECED",
    borderRadius: "0.375rem",
  }),
  menuList: (base: any) => ({
    ...base,
    maxHeight: "110px", // Control the scroll area here
    overflowY: "auto",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#E5ECED"
      : state.isFocused
        ? "#E5ECED"
        : "#fff",
    color: state.isSelected ? "#01576A" : "#526279",
    padding: "0.75rem",
    fontSize: "17px",
    fontWeight: "500",
    textAlign: "left",
    transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#526279",
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    minHeight: "auto",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: "0",
  }),
  input: (provided: any) => ({
    ...provided,
    margin: "0",
    padding: "0",
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
};

export const convertToMarkdown = (html: string): string => {
  return html;
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      if (typeof base64 === "string") {
        resolve(base64.split(",")[1]); // remove data:audio/webm;base64, part
      } else {
        reject("Failed to convert blob to base64");
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const editorStyles = `
.toastui-editor-contents {
  text-align: left !important;
  padding: 10px !important;
}

.toastui-editor-contents h1, 
.toastui-editor-contents h2,
.toastui-editor-contents h3,
.toastui-editor-contents p {
  text-align: left !important;
  margin: 10px 0 !important;
}

.toastui-editor-contents img {
  display: inline-block !important;
  margin: 0 auto !important;
}

.toastui-editor-ww-container {
  background-color: #fff !important;
}

 /* Remove toolbar completely */
.toastui-editor-defaultUI .toastui-editor-toolbar,
.toastui-editor-defaultUI .toastui-editor-mode-switch {
  display: none !important;
}

.toastui-editor-main-container {
  top: 0 !important;
}
`;

export const formatToThreeDigits = (value: string | number) => {
  const num = typeof value === "string" ? Number(value) : value;

  if (isNaN(num)) {
    return "Invalid number";
  }

  // Use toPrecision to get 3 significant digits
  const precise = Number(num).toPrecision(3);

  // Convert back to Number to remove unnecessary trailing zeros
  const cleaned = Number(precise);

  return cleaned;
};

export const roundToDecimalPlace = (
  value: string | number,
  decimalPlaces = 1
): number => {
  // Convert string to number if necessary
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  // Check if the value is a valid number
  if (isNaN(numericValue)) {
    throw new Error("Input must be a valid number");
  }

  const factor = Math.pow(10, decimalPlaces);
  return Math.round(numericValue * factor) / factor;
};
