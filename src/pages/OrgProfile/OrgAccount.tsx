import React, { useEffect, useCallback, useRef, useState } from "react";
import AppInputField from "../../components/AppInput";
import { orgProfile } from "../../types/form.types";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { orgProfileSchema } from "../../utils/validationSchems";
import API_CONSTANTS from "../../constants/apiConstants";
import { useGetApi, usePutApi } from "../../services/use-api";
import debounce from "lodash.debounce";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/build/css/intlTelInput.css";
import { cn } from "../../utils/common-utils";
import PDFHeaderUpload from "../TeamManagement/PdfPreview";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import TeamManagement from "../TeamManagement/TeamManagement";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import CreatReportSvg from "../../assets/org-profile-default.png";
import PDFFooterUpload from "../TeamManagement/PDFFooterUpload";
import AppButton from "../../components/AppButton";
import { IndianRupee } from "lucide-react";
import { ROUTES } from "../../constants/routesConstants";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserThreeInitials } from "../../lib/utils";
import { ServiceInOrg } from "./ServiceInOrg";
import { useSidebar } from "../../components/ui/sidebar";
import { setUserData } from "../../redux/AuthSlice";
import Select from "react-select";

const OrgAccount: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getData: getUserData } = useGetApi<any>("");
  const { userData } = useAppSelector((state: any) => state.authData);
  const permissions = userData?.permissions;
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const itiInstance = useRef<intlTelInput.Plugin | null>(null);
  const [orgData, setOrgData] = React.useState<orgProfile | null>(null);
  const paymentOptions = ["UPI", "Bank Transfer"];
  const [touchedPM, setTouchedPM] = useState(false);
  const [havePrintedHeader, setHavePrintedHeader] = useState(false);
  const [havePrintedFooter, setHavePrintedFooter] = useState(false);
  const [selectedTab, setSelectedTab] = useState(() => {
    const tabParam = searchParams.get("selectedTab");
    const tabMap: { [key: string]: string } = {
      orgInfo: "Org Info",
      billing: "Billing",
      teams: "Teams",
      services: "Services",
      customisations: "Customisations",
    };
    return tabParam ? tabMap[tabParam] || "Org Info" : "Org Info";
  });

  useEffect(() => {
    const fetchApi = async () => {
      const userDataRes = await getUserData(API_CONSTANTS.GET_USER_INFO);
      if (userDataRes?.data?.success) {
        dispatch(setUserData(userDataRes?.data?.user));
      }
    };
    fetchApi();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("selectedTab");
    if (tabParam) {
      const tabMap: { [key: string]: string } = {
        orgInfo: "Org Info",
        billing: "Billing",
        teams: "Teams",
        services: "Services",
        customisations: "Customisations",
      };
      setSelectedTab(tabMap[tabParam] || "Org Info");
    }
  }, [searchParams]);

  type OrgProfileFieldNames =
    | keyof orgProfile
    | "billingInfo.billingName"
    | "billingInfo.billingAddress"
    | "billingInfo.gstNumber"
    | "billingInfo.paymentMethods"
    | "billingInfo.billingEmail"
    | "billingInfo.branchName"
    | "billingInfo.IfscCode"
    | "billingInfo.UpiId"
    | "billingInfo.accountNumber"
    | "patientUniqueIdPrefix"
    | "patientUniqueIdLength"
    | "printedHeaderHeight"
    | "printedFooterHeight";

  const { putData: updatePermission } = usePutApi<orgProfile>({
    path: API_CONSTANTS.GET_ORG_UPDATE,
  });

  const form = useForm<orgProfile>({
    resolver: yupResolver(orgProfileSchema),
    defaultValues: {
      organizationName: "",
      email: "",
      name: "",
      websiteUrl: "",
      address: "",
      countryCode: "",
      phone: "",
      companyRegistrationID: "",
      logo: "",
      billingInfo: {
        billingName: "",
        billingAddress: "",
        gstNumber: "",
        paymentMethods: [],
        billingEmail: "",
        branchName: "",
        IfscCode: "",
        UpiId: "",
        accountNumber: "",
      },
      pdfHeader: "",
      patientUniqueIdPrefix: "",
      patientUniqueIdLength: 6,
      printedHeaderHeight: 100,
      printedFooterHeight: 100,
    },
  });

  const debouncedUpdate = useCallback(
    debounce(async (data: orgProfile) => {
      try {
        const formData = new FormData();
        const billingInfo = { ...data.billingInfo };
        const paymentMethods = billingInfo.paymentMethods || [];

        // Process UPI information
        if (paymentMethods.includes("UPI") && billingInfo.UpiId) {
          (billingInfo as any).upi = { upiId: billingInfo.UpiId };
          delete (billingInfo as any).UpiId;
        }

        // Process Bank Transfer information
        if (paymentMethods.includes("Bank Transfer")) {
          (billingInfo as any).bankTransfer = {
            bankName: billingInfo.branchName,
            accountNumber: billingInfo.accountNumber,
            ifscCode: billingInfo.IfscCode,
          };
          // delete billingInfo.branchName;
          delete (billingInfo as any).branchName;
          delete (billingInfo as any).IfscCode;
          delete (billingInfo as any).accountNumber;
        }

        // Append billing info
        Object.entries(billingInfo).forEach(([key, value]) => {
          if (key === "upi" || key === "bankTransfer") {
            Object.entries(value).forEach(([subKey, subValue]) => {
              if (typeof subValue === "string" || subValue instanceof Blob) {
                formData.append(`billingInfo[${key}][${subKey}]`, subValue);
              } else {
                console.warn(`Unsupported value type for ${subKey}:`, subValue);
              }
            });
          } else if (Array.isArray(value)) {
            value.forEach((item) =>
              formData.append(`billingInfo[${key}]`, item)
            );
          } else {
            formData.append(`billingInfo[${key}]`, value || "");
          }
        });

        // Append other fields (excluding checkbox states to avoid duplication)
        Object.entries(data).forEach(([key, value]) => {
          if (
            key !== "billingInfo" &&
            key !== "havePrintedHeader" &&
            key !== "havePrintedFooter" &&
            value !== undefined
          ) {
            formData.append(
              key,
              typeof value === "object" ? JSON.stringify(value) : String(value)
            );
          }
        });

        // Append checkbox states once
        formData.append("havePrintedHeader", String(havePrintedHeader));
        formData.append("havePrintedFooter", String(havePrintedFooter));

        await updatePermission(formData);
      } catch (error) {
        console.error("Update failed:", error);
      }
    }, 1000),
    [updatePermission, havePrintedHeader, havePrintedFooter]
  );

  const pmValues = form.getValues("billingInfo.paymentMethods") || [];
  const showError = touchedPM && pmValues.length === 0;

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "#fff",
      border: state.isFocused
        ? "1px solid #016B83"
        : showError
        ? "2px solid red"
        : "1px solid #E6E7E9",
      boxShadow: showError
        ? "0px 0px 0px 1px #526279"
        : "0px 1px 2px 0px rgba(16,24,40,0.04)",
      padding: "5px 0px 5px 12px",
      borderRadius: "0.375rem",
      width: "100%",
      height: "46px",
      color: "#526279",
      fontSize: "0.875rem",
      fontWeight: "400",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      minHeight: "46px",
      cursor: "pointer",
      transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        border: "1px solid #E6E7E9",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "#E5ECED",
      borderRadius: "0.375rem",
      width: "auto",
      minWidth: "200px",
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
      color: "#9CA3AF",
      fontSize: "17px",
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

  const handleFieldBlur = useCallback(
    async (fieldName: OrgProfileFieldNames) => {
      const isValid = await form.trigger(fieldName);
      if (isValid) {
        const formData = form.getValues();
        debouncedUpdate(formData);
      }
    },
    [form, debouncedUpdate]
  );

  const handlePhoneBlur = useCallback(async () => {
    const isValidCountryCode = await form.trigger("countryCode");
    const isValidPhone = await form.trigger("phone");
    if (isValidCountryCode && isValidPhone) {
      const formData = form.getValues();
      debouncedUpdate(formData);
    }
  }, [form, debouncedUpdate]);

  useEffect(() => {
    const input = phoneInputRef.current;
    if (!input || itiInstance.current) return;

    itiInstance.current = intlTelInput(input, {
      initialCountry: "auto",
      geoIpLookup: (callback) => {
        fetch("https://ipapi.co/json/")
          .then((res) => res.json())
          .then((data) => callback(data.country_code))
          .catch(() => callback("us"));
      },
      utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
      separateDialCode: true,
      preferredCountries: ["us", "gb", "in", "au"],
    });

    const handlePhoneChange = () => {
      if (!itiInstance.current || !phoneInputRef.current) return;
      const countryData = itiInstance.current.getSelectedCountryData();
      const nationalNumber = phoneInputRef.current.value.replace(/\D/g, "");
      form.setValue("countryCode", `+${countryData.dialCode}`);
      form.setValue("phone", nationalNumber);
    };

    input.addEventListener("input", handlePhoneChange);
    input.addEventListener("countrychange", handlePhoneChange);

    return () => {
      input.removeEventListener("input", handlePhoneChange);
      input.removeEventListener("countrychange", handlePhoneChange);
      itiInstance.current?.destroy();
      itiInstance.current = null;
    };
  }, [selectedTab, form]);

  useEffect(() => {
    fetchOrgData();
  }, [selectedTab, form]);

  const fetchOrgData = async () => {
    try {
      const userDataRes = await getUserData(API_CONSTANTS.GET_ORG_INFO);
      if (userDataRes?.data?.org) {
        const org = userDataRes.data.org;
        const billingInfo = org.billingInfo || {};

        setOrgData(org);
        setHavePrintedHeader(org.havePrintedHeader || false);
        setHavePrintedFooter(org.havePrintedFooter || false);

        form.reset({
          ...org,
          billingInfo: {
            billingName: billingInfo.billingName || "",
            billingAddress: billingInfo.billingAddress || "",
            gstNumber: billingInfo.gstNumber || "",
            paymentMethods: billingInfo.paymentMethods || [],
            billingEmail: billingInfo.billingEmail || "",
            UpiId: billingInfo.upi?.upiId || "",
            branchName: billingInfo.bankTransfer?.bankName || "",
            IfscCode: billingInfo.bankTransfer?.ifscCode || "",
            accountNumber: billingInfo.bankTransfer?.accountNumber || "",
          },
          patientUniqueIdPrefix:
            org.patientUniqueIdPrefix ||
            UserThreeInitials(org.organizationName),
          patientUniqueIdLength: org.patientUniqueIdLength || 6,
          printedHeaderHeight: org.printedHeaderHeight || 100,
          printedFooterHeight: org.printedFooterHeight || 100,
        });

        if (itiInstance.current && org.countryCode && org.phone) {
          itiInstance.current.setNumber(org.countryCode + org.phone);
        }
      }
    } catch (error) {
      console.error("Failed to fetch organization data:", error);
    }
  };

  const [isFocused, setIsFocused] = useState(false);
  const lengthValue = form.watch("patientUniqueIdLength");
  const blurText = lengthValue ? `${lengthValue} Digits` : "Digits";
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("logo", file);
      await updatePermission(formData);
      fetchOrgData();
    } catch (error) {
      console.error("Failed to update logo:", error);
    }
  };

  const updateHeaderState = async (checked: boolean) => {
    try {
      const formData = new FormData();
      const data = form.getValues();
      const billingInfo = { ...data.billingInfo };
      const paymentMethods = billingInfo.paymentMethods || [];

      // Process UPI information
      if (paymentMethods.includes("UPI") && billingInfo.UpiId) {
        (billingInfo as any).upi = { upiId: billingInfo.UpiId };
        delete (billingInfo as any).UpiId;
      }

      // Process Bank Transfer information
      if (paymentMethods.includes("Bank Transfer")) {
        (billingInfo as any).bankTransfer = {
          bankName: billingInfo.branchName,
          accountNumber: billingInfo.accountNumber,
          ifscCode: billingInfo.IfscCode,
        };
        delete (billingInfo as any).branchName;
        delete (billingInfo as any).IfscCode;
        delete (billingInfo as any).accountNumber;
      }

      // Append billing info
      Object.entries(billingInfo).forEach(([key, value]) => {
        if (key === "upi" || key === "bankTransfer") {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (typeof subValue === "string" || subValue instanceof Blob) {
              formData.append(`billingInfo[${key}][${subKey}]`, subValue);
            }
          });
        } else if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`billingInfo[${key}]`, item));
        } else {
          formData.append(`billingInfo[${key}]`, value || "");
        }
      });

      Object.entries(data).forEach(([key, value]) => {
        if (
          key !== "billingInfo" &&
          key !== "havePrintedHeader" &&
          key !== "havePrintedFooter" &&
          value !== undefined
        ) {
          formData.append(
            key,
            typeof value === "object" ? JSON.stringify(value) : String(value)
          );
        }
      });

      formData.append("havePrintedHeader", String(checked));
      formData.append("havePrintedFooter", String(havePrintedFooter));

      const response: any = await updatePermission(formData);
      if (response?.data?.org) {
        setHavePrintedHeader(response.data.org.havePrintedHeader);
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const updateFooterState = async (checked: boolean) => {
    try {
      const formData = new FormData();
      const data = form.getValues();
      const billingInfo = { ...data.billingInfo };
      const paymentMethods = billingInfo.paymentMethods || [];

      // Process UPI information
      if (paymentMethods.includes("UPI") && billingInfo.UpiId) {
        (billingInfo as any).upi = { upiId: billingInfo.UpiId };
        delete (billingInfo as any).UpiId;
      }

      // Process Bank Transfer information
      if (paymentMethods.includes("Bank Transfer")) {
        (billingInfo as any).bankTransfer = {
          bankName: billingInfo.branchName,
          accountNumber: billingInfo.accountNumber,
          ifscCode: billingInfo.IfscCode,
        };
        delete (billingInfo as any).branchName;
        delete (billingInfo as any).IfscCode;
        delete (billingInfo as any).accountNumber;
      }

      // Append billing info
      Object.entries(billingInfo).forEach(([key, value]) => {
        if (key === "upi" || key === "bankTransfer") {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (typeof subValue === "string" || subValue instanceof Blob) {
              formData.append(`billingInfo[${key}][${subKey}]`, subValue);
            }
          });
        } else if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`billingInfo[${key}]`, item));
        } else {
          formData.append(`billingInfo[${key}]`, value || "");
        }
      });

      Object.entries(data).forEach(([key, value]) => {
        if (
          key !== "billingInfo" &&
          key !== "havePrintedHeader" &&
          key !== "havePrintedFooter" &&
          value !== undefined
        ) {
          formData.append(
            key,
            typeof value === "object" ? JSON.stringify(value) : String(value)
          );
        }
      });

      formData.append("havePrintedHeader", String(havePrintedHeader));
      formData.append("havePrintedFooter", String(checked));

      const response: any = await updatePermission(formData);
      if (response?.data?.org) {
        setHavePrintedFooter(response.data.org.havePrintedFooter);
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleHeaderCheckboxChange = (e: any) => {
    const checked = e.target.checked;
    setHavePrintedHeader(checked);
    if (!checked) {
      form.setValue("printedHeaderHeight", 100);
    }
    updateHeaderState(checked);
  };

  const handleFooterCheckboxChange = (e: any) => {
    const checked = e.target.checked;
    setHavePrintedFooter(checked);
    if (!checked) {
      form.setValue("printedFooterHeight", 100);
    }
    updateFooterState(checked);
  };
  const { state } = useSidebar();

  const tabOptions = [
    { label: "Org Info", value: "Org Info", param: "orgInfo" },
    { label: "Billing", value: "Billing", param: "billing" },
    { label: "Teams", value: "Teams", param: "teams" },
    { label: "Services", value: "Services", param: "services" },
    {
      label: "Customisations",
      value: "Customisations",
      param: "customisations",
    },
  ];

  return (
    <div style={{ marginLeft: state == "collapsed" ? "28px" : "" }}>
      <header className="flex justify-end pr-4 pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-[180px] flex items-center justify-between h-[40px] px-[20px] py-[6px] bg-white border-none rounded-[30px] shadow-sm text-sm text-[#334155] gap-2 focus:outline-none">
            {selectedTab}
            <ChevronDown className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuGroup>
              {tabOptions.map((tab) => (
                <DropdownMenuItem
                  key={tab.param}
                  onClick={() => {
                    setSelectedTab(tab.value);
                    setSearchParams({ selectedTab: tab.param });
                  }}
                  className={selectedTab === tab.value ? "bg-[#E5ECED]" : ""}
                >
                  {tab.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div
        className={`${state == "collapsed" ? "" : ""} 
              bg-white flex-1 m-4 rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]
              h-auto lg:h-[calc(100vh-152px)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white`}
      >
        <form>
          {/* Profile Section */}
          {selectedTab === "Org Info" && (
            <div className="flex items-center gap-6 mb-5 px-4 pt-4">
              <div className="relative">
                <img
                  src={form.watch("logo") || CreatReportSvg}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border bg-white"
                />
                <label
                  htmlFor="profile-upload"
                  className="absolute bottom-1 h-7 w-7 right-1 bg-[#01576A] rounded-full p-[2px] cursor-pointer shadow text-white"
                >
                  ✎
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      form.setValue("logo", URL?.createObjectURL(file));
                      handleFileUpload(file);
                    }
                  }}
                  disabled={userData?.role !== "organization"}
                />
              </div>
              <div className="text-left">
                <p className="text-lg font-medium text-gray-700">
                  {orgData?.organizationName}
                </p>
                <p className="text-sm text-gray-500">{orgData?.email}</p>
              </div>
            </div>
          )}
          {selectedTab === "Org Info" && (
            <div className="px-4 mb-3">
              <div className="flex pb-3">
                <label className="text-[24px] font-normal text-[#1A2435]">
                  Organization Information
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-x-4">
                <AppInputField<orgProfile>
                  name="organizationName"
                  form={form}
                  label="Organization Name"
                  placeholder="Enter your organization name"
                  onBlure={() => handleFieldBlur("organizationName")}
                  readonly={userData?.role !== "organization"}
                />
                <AppInputField<orgProfile>
                  name="email"
                  form={form}
                  label="Email"
                  placeholder="Enter your email"
                  onBlure={() => handleFieldBlur("email")}
                  readonly={userData?.role !== "organization"}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-x-4">
                <AppInputField<orgProfile>
                  name="address"
                  form={form}
                  label="Address"
                  placeholder="Enter your address"
                  onBlure={() => handleFieldBlur("address")}
                  readonly={userData?.role !== "organization"}
                />
                <AppInputField<orgProfile>
                  name="companyRegistrationID"
                  form={form}
                  label="Registration Number"
                  placeholder="Enter your registration number"
                  onBlure={() => handleFieldBlur("companyRegistrationID")}
                  readonly={userData?.role !== "organization"}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-x-4">
                <div className="flex flex-col mb-4">
                  <label className="mb-2 font-medium text-sm text-[#1A2435] text-start">
                    Phone Number
                  </label>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    className={cn(
                      `w-full text-[#1A2435] px-4 h-[46.22px] py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#526279] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] placeholder:text-[17px]`,
                      form.formState.errors.phone
                        ? "!border-red-500 placeholder-#ADB1B7 text-white-500 focus:ring-2 focus:ring-red-500 bg-[#fff2f4] !border-1px-sold placeholder:text-[17px]"
                        : ""
                    )}
                    placeholder="Enter phone number"
                    onBlur={handlePhoneBlur}
                    disabled={userData?.role !== "organization"}
                  />
                </div>

                <AppInputField<orgProfile>
                  name="websiteUrl"
                  form={form}
                  label="Website URL"
                  placeholder="Enter your website URL"
                  onBlure={() => handleFieldBlur("websiteUrl")}
                  readonly={userData?.role !== "organization"}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-x-4">
                <div className="flex flex-col mb-4">
                  <label className="mb-2 font-medium text-sm text-[#1A2435] text-start">
                    Generate Unique ID
                  </label>
                  <div className="flex w-full">
                    <input
                      type="text"
                      maxLength={3}
                      {...form.register("patientUniqueIdPrefix")}
                      className={cn(
                        `w-[14%] bg-gray-100 text-[#1A2435] px-4 h-[46.22px] py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#526279] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] placeholder:text-[17px]`
                      )}
                      placeholder="ABC"
                      onBlur={() => handleFieldBlur("patientUniqueIdPrefix")}
                      disabled={userData?.role !== "organization"}
                    />
                    {isFocused && (
                      <Controller
                        name="patientUniqueIdLength"
                        control={form.control}
                        render={({ field }) => (
                          <input
                            type="number"
                            min="5"
                            max="10"
                            placeholder=""
                            disabled={userData?.role !== "organization"}
                            style={{
                              color: isFocused ? "#1A2435" : "transparent",
                            }}
                            ref={(el) => {
                              field.ref(el);
                              inputRef.current = el;
                            }}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={() => {
                              field.onBlur();
                              setIsFocused(false);
                              handleFieldBlur("patientUniqueIdLength");
                            }}
                            className={cn(
                              `ml-[1px] flex-1 text-[#1A2435] px-4 h-[46.22px] py-2 border rounded-r-md
      focus:outline-none focus:ring-2 focus:ring-[#526279] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)]
      placeholder:text-[17px]`,
                              form.formState.errors.patientUniqueIdLength
                                ? "!border-red-500 placeholder:text-[#ADB1B7] focus:ring-2 focus:ring-red-500 bg-[#fff2f4]"
                                : ""
                            )}
                            onFocus={() => setIsFocused(true)}
                          />
                        )}
                      />
                    )}

                    {!isFocused && (
                      <div
                        className={cn(
                          `relative flex-1 w-full text-start left-0 top-1/2 -translate-y-1/2 text-gray-400 cursor-text border rounded-r-md px-4 h-[46.22px] py-2 pt-[11px]`,
                          form.formState.errors.patientUniqueIdLength
                            ? "!border-red-500 placeholder:text-[#ADB1B7] focus:ring-2 focus:ring-red-500 bg-[#fff2f4]"
                            : ""
                        )}
                        onClick={() => setIsFocused(true)}
                      >
                        {blurText}
                      </div>
                    )}
                  </div>
                  {/* {(form.formState.errors.patientUniqueIdPrefix ||
                form.formState.errors.patientUniqueIdLength) && (
                <span className="text-red-500 text-sm mt-1">
                  {form.formState.errors.patientUniqueIdPrefix?.message ||
                    form.formState.errors.patientUniqueIdLength?.message}
                </span>
              )} */}
                </div>
              </div>
            </div>
          )}

          {/* <hr /> */}

          {selectedTab === "Customisations" && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div>
                <div className="flex mt-4 mb-2 px-4 gap-5">
                  <label className="text-[24px] font-normal text-[#1A2435]">
                    Header
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={havePrintedHeader}
                      onChange={(e) => handleHeaderCheckboxChange(e)}
                      className="w-4 h-4 border-gray-200 rounded checked:accent-medistryColor hover:checked:accent-medistryColor"
                    />
                    <span className="text-gray-700 text-left">
                      I have my own header
                    </span>
                  </label>
                </div>
                <div className="px-4 mb-3">
                  {!havePrintedHeader ? (
                    <PDFHeaderUpload role={userData?.role} />
                  ) : (
                    <AppInputField<orgProfile>
                      form={form}
                      label="Header Height"
                      name="printedHeaderHeight"
                      type="number"
                      placeholder="Set header height"
                      onBlure={() => handleFieldBlur("printedHeaderHeight")}
                    />
                  )}
                </div>
              </div>
              <div>
                <div className="flex mt-4 mb-2 px-4 gap-5">
                  <label className="text-[24px] font-normal text-[#1A2435]">
                    Footer
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={havePrintedFooter}
                      onChange={(e) => handleFooterCheckboxChange(e)}
                      className="w-4 h-4 border-gray-200 rounded checked:accent-medistryColor hover:checked:accent-medistryColor"
                    />
                    <span className="text-gray-700 text-left">
                      I have my own footer
                    </span>
                  </label>
                </div>
                <div className="px-4 mb-3">
                  {!havePrintedFooter ? (
                    <PDFFooterUpload role={userData?.role} />
                  ) : (
                    <AppInputField<orgProfile>
                      form={form}
                      label="Footer Height"
                      name="printedFooterHeight"
                      type="number"
                      placeholder="Set footer height"
                      onBlure={() => handleFieldBlur("printedFooterHeight")}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          {/* <hr /> */}

          {/* Billing Information */}
          {selectedTab === "Billing" && (
            <div className="flex mt-4 mb-1 px-4">
              <label className="text-[24px] font-normal text-[#1A2435] pt-4 lg:pt-0">
                Billing Information :
              </label>
            </div>
          )}

          {selectedTab === "Billing" && (
            <div className="grid md:grid-cols-2 gap-x-4 px-4 mt-4">
              <AppInputField<orgProfile>
                name="billingInfo.billingName"
                form={form}
                label="Billing Name"
                placeholder="Enter your billing name"
                onBlure={() => handleFieldBlur("billingInfo.billingName")}
                readonly={userData?.role !== "organization"}
              />
              <AppInputField<orgProfile>
                name="billingInfo.billingAddress"
                form={form}
                label="Billing Address"
                placeholder="Enter your billing address"
                onBlure={() => handleFieldBlur("billingInfo.billingAddress")}
                readonly={userData?.role !== "organization"}
              />
            </div>
          )}

          {selectedTab === "Billing" && (
            <div className="grid md:grid-cols-2 gap-x-4 px-4">
              <AppInputField<orgProfile>
                name="billingInfo.gstNumber"
                form={form}
                label="GST Number"
                placeholder="Enter your GST number"
                onBlure={() => handleFieldBlur("billingInfo.gstNumber")}
                readonly={userData?.role !== "organization"}
              />
              <AppInputField<orgProfile>
                name="billingInfo.billingEmail"
                form={form}
                label="Billing Email"
                placeholder="Enter your billing email"
                onBlure={() => handleFieldBlur("billingInfo.billingEmail")}
                readonly={userData?.role !== "organization"}
              />
            </div>
          )}

          {selectedTab === "Billing" && (
            <div className="grid md:grid-cols-2 gap-x-4 px-4 mb-3">
              <div className="flex flex-col">
                <div className="flex flex-col mb-4">
                  <label className="mb-2 font-medium text-sm text-[#1A2435] text-start">
                    Payment Methods
                  </label>
                  <div className="flex flex-col">
                    <Select
                      isMulti
                      options={paymentOptions.map((method) => ({
                        label: method,
                        value: method,
                      }))}
                      value={(
                        form.watch("billingInfo.paymentMethods") || []
                      ).map((method: any) => ({
                        label: method,
                        value: method,
                      }))}
                      onChange={(selectedOptions) => {
                        const selectedValues = selectedOptions.map(
                          (option) => option.value
                        );
                        form.setValue(
                          "billingInfo.paymentMethods",
                          selectedValues,
                          { shouldValidate: true }
                        );
                      }}
                      onBlur={async () => {
                        const isValid = await form.trigger(
                          "billingInfo.paymentMethods"
                        );
                        setTouchedPM(true);
                        const selected =
                          form.getValues("billingInfo.paymentMethods") || [];
                        const initial =
                          orgData?.billingInfo?.paymentMethods || [];
                        const isChanged =
                          JSON.stringify(selected.sort()) !==
                          JSON.stringify(initial.sort());

                        if (isValid && selected.length > 0 && isChanged) {
                          debouncedUpdate(form.getValues());
                        }
                      }}
                      isDisabled={userData?.role !== "organization"}
                      placeholder="Select payment methods"
                      styles={customStyles}
                    />
                  </div>
                </div>
              </div>
              {permissions?.includes("admin") && (
                <div className="flex justify-end md:justify-start">
                  <AppButton
                    className="mt-2 md:mt-7 mb-6"
                    onClick={() => navigate(ROUTES.PAYMENTS)}
                  >
                    <IndianRupee />
                    Payments
                  </AppButton>
                </div>
              )}
            </div>
          )}

          {selectedTab === "Services" && permissions?.includes("billing") && (
            <ServiceInOrg />
          )}

          {/* Bank Transfer Fields */}
          {selectedTab === "Billing" &&
            form
              .watch("billingInfo.paymentMethods")
              ?.includes("Bank Transfer") && (
              <div className="grid md:grid-cols-2 gap-x-4 px-4">
                <AppInputField<orgProfile>
                  name="billingInfo.branchName"
                  form={form}
                  label="Bank Name"
                  placeholder="Enter your bank name"
                  onBlure={() => handleFieldBlur("billingInfo.branchName")}
                  readonly={userData?.role !== "organization"}
                />
                <AppInputField<orgProfile>
                  name="billingInfo.accountNumber"
                  form={form}
                  label="Account Number"
                  placeholder="Enter bank account number"
                  onBlure={() => handleFieldBlur("billingInfo.accountNumber")}
                  readonly={userData?.role !== "organization"}
                />
                <AppInputField<orgProfile>
                  name="billingInfo.IfscCode"
                  form={form}
                  label="IFSC Code"
                  placeholder="Enter IFSC code"
                  onBlure={() => handleFieldBlur("billingInfo.IfscCode")}
                  readonly={userData?.role !== "organization"}
                />
              </div>
            )}

          {/* UPI Field */}
          {selectedTab === "Billing" &&
            form.watch("billingInfo.paymentMethods")?.includes("UPI") && (
              <div className="grid md:grid-cols-2 gap-x-4 px-4">
                <AppInputField<orgProfile>
                  name="billingInfo.UpiId"
                  form={form}
                  label="UPI ID"
                  placeholder="Enter UPI ID"
                  onBlure={() => handleFieldBlur("billingInfo.UpiId")}
                  readonly={userData?.role !== "organization"}
                />
              </div>
            )}

          {/* <hr /> */}

          {/* Team Permissions */}
          {selectedTab === "Teams" && (
            <div className="flex mt-4 mb-1 px-4">
              <label className="text-[24px] font-normal text-left text-[#1A2435] pt-4 lg:pt-0">
                Teams (Permissions & Access) :
              </label>
            </div>
          )}
          {selectedTab === "Teams" && (
            <div className="pb-4">
              {/* <TeamPermission id={orgData?._id} /> */}
              <TeamManagement />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OrgAccount;
