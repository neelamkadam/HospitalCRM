import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/build/css/intlTelInput.css";
import { UserProfileSchema } from "../../utils/validationSchems";
import { useAppSelector } from "../../redux/store";
import { userProfile } from "../../types/form.types";
import AppInputField from "../../components/AppInput";
import debounce from "lodash.debounce";
import { usePutApi } from "../../services/use-api";
import API_CONSTANTS from "../../constants/apiConstants";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/AuthSlice";
import { cn } from "../../utils/common-utils";
import { ImageUp } from "lucide-react";
import CreatReportSvg from "../../assets/user-profile-default.png";
import DropDownSelect from "../../components/DropdownSelect";
import { SpecializationSelect } from "../../constants/commanConstants";
import UserPDFHeader from "../../components/UserPDFHeader";
import UserPDFFooter from "../../components/UserPDFFooter";
import AppButton from "../../components/AppButton";
import AppModal from "../../components/AppModal";
import * as yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "../../constants/routesConstants";
import { useSidebar } from "../../components/ui/sidebar";

type ChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

const UserProfile: React.FC = () => {
  const { userData } = useAppSelector((state: any) => state.authData);

  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = useSidebar();
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const itiInstance = useRef<intlTelInput.Plugin | null>(null);
  const navigate = useNavigate();
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [havePrintedHeader, setHavePrintedHeader] = useState(false);
  const [havePrintedFooter, setHavePrintedFooter] = useState(false);
  const [selectedTab, setSelectedTab] = useState(() => {
    const tabParam = searchParams.get("selectedTab");
    const tabMap: { [key: string]: string } = {
      personalInfo: "Personal Info",
      customizations: "Customizations",
    };
    return tabParam ? tabMap[tabParam] || "Personal Info" : "Personal Info";
  });

  const { putData: updatePermission } = usePutApi<FormData>({
    path: API_CONSTANTS.GET_USER_UPDATE,
  });

  const { putData: updatePassword } = usePutApi<FormData>({
    path: API_CONSTANTS.PUT_USER_PASSWORD,
  });

  useEffect(() => {
    const tabParam = searchParams.get("selectedTab");
    if (tabParam) {
      const tabMap: { [key: string]: string } = {
        personalInfo: "Personal Info",
        customizations: "Customizations",
      };
      setSelectedTab(tabMap[tabParam] || "Personal Info");
    }
  }, [searchParams]);

  const changePasswordSchema = yup.object().shape({
    oldPassword: yup.string().required("Old password is required"),
    newPassword: yup
      .string()
      .required("New password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmNewPassword: yup
      .string()
      .oneOf([yup.ref("newPassword")], "Passwords must match")
      .required("Please confirm your new password"),
  });

  const form = useForm<userProfile | any>({
    resolver: yupResolver(UserProfileSchema),
    defaultValues: {
      role: userData?.role,
      email: userData?.email,
      name: userData?.name,
      about: userData?.about,
      phone: userData?.phone,
      countryCode: userData?.countryCode,
      registrationNumber: userData?.registrationNumber,
      profilePic: userData?.profilePicture,
      specialization: userData?.specialization || "",
      signature: userData?.signature,
      printedHeaderHeight: userData?.printedHeaderHeight || 100,
      printedFooterHeight: userData?.printedFooterHeight || 100,
    },
  });

  const formPassword = useForm<ChangePassword>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const { handleSubmit, reset } = formPassword;

  const onSubmit = async (data: ChangePassword) => {
    setLoading(true);
    try {
      const { confirmNewPassword, ...payload } = data;
      const response = await updatePassword(payload);
      console.log("Password change response:", response);
      setLoading(false);
      reset();
      setIsModalOpen(false); // Close modal
    } catch (error) {
      setLoading(false);
      console.error("Password change failed:", error);
    }
  };

  useEffect(() => {
    if (userData) {
      form.setValue("specialization", userData.specialization || "");
      setHavePrintedHeader(userData.havePrintedHeader || false);
      setHavePrintedFooter(userData.havePrintedFooter || false);
      // You can add other fields here if needed
    }
  }, [userData, form]);

  const profilePic = form.watch("profilePic");
  const signatureFile = form.watch("signature");

  useEffect(() => {
    if (!userData) return;

    const initializeDefaultProfilePic = async () => {
      if (!userData.profilePicture && !form.getValues("profilePic")) {
        try {
          // Fetch default SVG image
          const response = await fetch(CreatReportSvg);
          if (!response.ok) throw new Error("Failed to fetch default image");
          const blob = await response.blob();

          // Create file object with SVG type
          const defaultFile = new File([blob], "default-profile.svg", {
            type: "image/svg+xml",
          });

          form.setValue("profilePic", defaultFile);
          // Immediately update backend with default image
          await updateUserProfile({
            ...form.getValues(),
            profilePic: defaultFile,
          });
        } catch (error) {
          console.error("Error loading default profile image:", error);
        }
      }
    };

    initializeDefaultProfilePic();
  }, [userData, form]);

  // useEffect(() => {
  //   if (!userData) return;

  //   const initializeDefaultProfilePic = async () => {
  //     if (!userData.profilePicture && !form.getValues("profilePic")) {
  //       try {
  //         const response = await fetch("/default-profile.png");
  //         if (!response.ok) throw new Error("Failed to fetch default image");
  //         const blob = await response.blob();
  //         const defaultFile = new File([blob], "default-profile.png", {
  //           type: blob.type,
  //         });
  //         form.setValue("profilePic", defaultFile);
  //       } catch (error) {
  //         console.error("Error loading default profile image:", error);
  //       }
  //     }
  //   };

  //   initializeDefaultProfilePic();
  // }, [userData, form]);

  useEffect(() => {
    let newUrl = "";
    if (typeof profilePic === "string") {
      newUrl = profilePic;
    } else if (profilePic instanceof File) {
      newUrl = URL.createObjectURL(profilePic);
    } else {
      newUrl = CreatReportSvg; // Use SVG as default fallback
    }
    setProfilePicUrl(newUrl);

    return () => {
      if (profilePic instanceof File) {
        URL.revokeObjectURL(newUrl);
      }
    };
  }, [profilePic, userData?.profilePicture]);

  useEffect(() => {
    let url = "";
    if (typeof signatureFile === "string") {
      url = signatureFile;
    } else if (signatureFile instanceof File) {
      url = URL.createObjectURL(signatureFile);
    } else {
      url = userData?.signature || "";
    }
    setSignatureUrl(url);

    return () => {
      if (signatureFile instanceof File) {
        URL.revokeObjectURL(url);
      }
    };
  }, [signatureFile, userData?.signature]);

  // Debounced update
  // const debouncedUpdate = useCallback(
  //   debounce(async (data: userProfile) => {
  //     try {
  //       const formData = new FormData();
  //       Object.entries(data).forEach(([key, value]) => {
  //         if (value !== undefined) {
  //           if (key === "profilePic" && typeof value === "string") return;
  //           formData.append(key, value);
  //         }
  //       });
  //       const response: any = await updatePermission(formData);
  //       dispatch(setUserData(response.data.user));
  //     } catch (error) {
  //       console.error("Update failed:", error);
  //     }
  //   }, 1000),
  //   [updatePermission, dispatch]
  // );

  const debouncedUpdate = useCallback(
    debounce(async (data: userProfile) => {
      try {
        const formData = new FormData();

        // Append checkbox states
        formData.append("havePrintedHeader", String(havePrintedHeader));
        formData.append("havePrintedFooter", String(havePrintedFooter));

        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) {
            // Send default image even if it's a File object
            formData.append(key, value);
          }
        });
        const response: any = await updatePermission(formData);
        dispatch(setUserData(response.data.user));
      } catch (error) {
        console.error("Update failed:", error);
      }
    }, 1000),
    [updatePermission, dispatch, havePrintedHeader, havePrintedFooter]
  );

  useEffect(() => {
    const input = phoneInputRef.current;
    if (!input) return;

    itiInstance.current = intlTelInput(input, {
      initialCountry: "auto",
      geoIpLookup: (cb) => {
        fetch("https://ipapi.co/json/")
          .then((res) => res.json())
          .then((data) => cb(data.country_code))
          .catch(() => cb("us"));
      },
      utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
      separateDialCode: true,
      preferredCountries: ["us", "gb", "in", "au"],
    });

    if (userData?.countryCode && userData?.phone) {
      itiInstance.current.setNumber(userData.countryCode + userData.phone);
    }

    const handlePhoneChange = () => {
      if (!itiInstance.current || !phoneInputRef.current) return;
      const countryData = itiInstance.current.getSelectedCountryData();
      form.setValue("countryCode", `+${countryData.dialCode}`);
      form.setValue("phone", phoneInputRef.current.value.replace(/\D/g, ""));
    };

    input.addEventListener("input", handlePhoneChange);
    input.addEventListener("countrychange", handlePhoneChange);
    return () => {
      input.removeEventListener("input", handlePhoneChange);
      input.removeEventListener("countrychange", handlePhoneChange);
      itiInstance.current?.destroy();
    };
  }, [userData, form, selectedTab]);

  const handleFieldBlur = useCallback(
    async (fieldName: keyof userProfile) => {
      const valid = await form.trigger(fieldName);
      if (valid) {
        debouncedUpdate(form.getValues());
      }
    },
    [form, debouncedUpdate]
  );
  const handlePhoneBlur = useCallback(async () => {
    const valid = await form.trigger(["countryCode", "phone"]);
    if (valid) {
      debouncedUpdate(form.getValues());
    }
  }, [form, debouncedUpdate]);

  const updateUserProfile = async (data: Partial<userProfile>) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined) {
          // Always append profilePic whether it's File or default
          formData.append(k, v as any);
        }
      });
      const response: any = await updatePermission(formData);
      if (response.data.success) {
        dispatch(setUserData(response.data.user));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleClose = () => {
    formPassword.reset();
    setIsModalOpen((prev) => !prev);
  };

  const updateHeaderState = async (checked: boolean) => {
    try {
      const formData = new FormData();
      const data = form.getValues();

      formData.append("havePrintedHeader", String(checked));
      formData.append("havePrintedFooter", String(havePrintedFooter));

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "object" && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response: any = await updatePermission(formData);
      dispatch(setUserData(response.data.user));
      setHavePrintedHeader(response.data.user.havePrintedHeader);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const updateFooterState = async (checked: boolean) => {
    try {
      const formData = new FormData();
      const data = form.getValues();

      formData.append("havePrintedHeader", String(havePrintedHeader));
      formData.append("havePrintedFooter", String(checked));

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "object" && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response: any = await updatePermission(formData);
      dispatch(setUserData(response.data.user));
      setHavePrintedFooter(response.data.user.havePrintedFooter);
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

  return (
    <div style={{ marginLeft: state == "collapsed" ? "28px" : "" }}>
      <div className="flex flex-wrap gap-2 lg:flex-nowrap px-4 pt-4">
        <li className="flex flex-row gap-[10px]">
          <a
            onClick={() => {
              setSelectedTab("Personal Info");
              setSearchParams({ selectedTab: "personalInfo" });
            }}
            className={`relative flex w-[120px] sm:w-[147px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] 
        flex-shrink-0 border-none rounded-[30px] text-sm cursor-pointer 
        shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white text-[#293343]
        ${selectedTab === "Personal Info" ? "font-bold" : ""}`}
          >
            Personal Info
          </a>

          <a
            onClick={() => {
              setSelectedTab("Customizations");
              setSearchParams({ selectedTab: "customizations" });
            }}
            className={`relative flex w-[130px] sm:w-[160px] h-[40px] px-[10px] py-[6px] justify-center items-center gap-[8px] 
        flex-shrink-0 border-none rounded-[30px] text-sm cursor-pointer 
        shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] bg-white text-[#293343]
        ${selectedTab === "Customizations" ? "font-bold" : ""}`}
          >
            Customizations
          </a>
        </li>
      </div>
      <div
        className="bg-white flex-1 pb-1 m-4 rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] h-auto lg:h-[calc(100vh-152px)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white"
        // style={{
        //   height: "calc(100vh - 152px)",
        //   overflowY: "auto",
        // }}
      >
        <form className="space-y-0">
          {selectedTab === "Personal Info" && (
            <div className="grid lg:grid-cols-1 gap-x-4 px-4 mb-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {/* Left column — Profile section */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={profilePicUrl}
                      className="w-28 h-28 rounded-full object-cover border bg-white"
                      alt="Profile"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = CreatReportSvg;
                      }}
                    />
                    <label
                      htmlFor="profile-upload"
                      className="absolute bottom-1 right-1 h-7 w-7 bg-[#01576A] rounded-full p-[2px] cursor-pointer shadow text-white"
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
                          form.setValue("profilePic", file);
                          updateUserProfile({
                            ...form.getValues(),
                            profilePic: file,
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-medium text-gray-700">
                      {userData?.name}
                    </p>
                    <p className="text-sm text-gray-500">{userData?.email}</p>
                    {/* <p className="text-sm text-gray-500">{userData?.role}</p> */}
                  </div>
                </div>

                {/* Right column — FAQ button */}
                <div className="flex justify-end items-center">
                  <AppButton
                    onClick={() => navigate(ROUTES.FAQS)}
                    className="!text-medistryColor text-base !bg-transparent hover:!bg-[#e3eef0] w-[147px] h-[40px] ml-4 py-[6px] justify-center items-center mt-[0px]"
                  >
                    Support
                  </AppButton>
                </div>
              </div>
            </div>
          )}
          {/* Input Fields */}
          {selectedTab === "Personal Info" && (
            <div className="flex pt-1 pb-3 px-4 ">
              <label className="text-[24px] font-normal text-[#1A2435]">
                Personal Information
              </label>
            </div>
          )}
          {selectedTab === "Personal Info" && (
            <div className="grid md:grid-cols-2 gap-x-4 px-4 pb-3">
              <AppInputField<userProfile>
                name="name"
                form={form}
                label="Full Name"
                // readonly
                placeholder="Enter your name"
                onBlure={() => handleFieldBlur("name")}
              />
              {/* <AppInputField<userProfile>
            name="specialization"
            form={form}
            label="Specialization"
            placeholder="Enter your specialization"
            onBlure={() => handleFieldBlur("specialization")}
          /> */}

              <div className="flex flex-col">
                <DropDownSelect<userProfile>
                  name="specialization"
                  form={form}
                  label="Specialization"
                  // validation={{ required: true }}
                  options={SpecializationSelect}
                  placeholder="Select specialization"
                  onBlur={() => handleFieldBlur("specialization")}
                />
              </div>
              <AppInputField<userProfile>
                name="about"
                form={form}
                label="Bio"
                placeholder="Bio your organization"
                onBlure={() => handleFieldBlur("about")}
              />
              <AppInputField<userProfile>
                name="registrationNumber"
                form={form}
                label="Registration"
                placeholder="Enter your registration number"
                onBlure={() => handleFieldBlur("registrationNumber")}
              />
            </div>
          )}
          {selectedTab === "Personal Info" && (
            <div className="flex pb-3 px-4">
              <label className="text-[24px] font-normal text-[#1A2435]">
                Contact Information
              </label>
            </div>
          )}
          {selectedTab === "Personal Info" && (
            <div className="grid md:grid-cols-2 gap-x-4 px-4 pb-3">
              <div className="flex flex-col mb-4">
                <label className="mb-2 font-medium text-sm text-gray-700 text-start">
                  Phone Number
                </label>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  className={cn(
                    `w-full px-4 h-[46.22px] py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#526279] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] placeholder:text-[17px]`,
                    form.formState.errors.phone
                      ? "!border-red-500 bg-[#fff2f4] focus:ring-red-500"
                      : ""
                  )}
                  placeholder="Enter phone number"
                  onBlur={handlePhoneBlur}
                />
              </div>
              <AppInputField<userProfile>
                name="email"
                form={form}
                label="Email"
                placeholder="Enter your email"
                onBlure={() => handleFieldBlur("email")}
              />
            </div>
          )}
          {selectedTab === "Personal Info" && (
            <div className="flex justify-end">
              <AppButton
                onClick={() => setIsModalOpen(true)}
                className="relative flex w-[147px] h-[40px] ml-4 py-[6px] justify-center items-center gap-[8px] flex-shrink-0 !text-[#ffffff] !bg-[#01576A] border-none mt-[0px] mb-[16px] mr-[16px] rounded-[30px] text-sm"
              >
                Change Password
              </AppButton>
            </div>
          )}

          {selectedTab === "Customizations" && (
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
                    <UserPDFHeader role={userData?.role} />
                  ) : (
                    <AppInputField<userProfile>
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
                  <div className="mb-3">
                    {!havePrintedFooter ? (
                      <UserPDFFooter role={userData?.role} />
                    ) : (
                      <AppInputField<userProfile>
                        form={form}
                        label="Footer Height"
                        name="printedFooterHeight"
                        type="number"
                        placeholder="Set header height"
                        onBlure={() => handleFieldBlur("printedFooterHeight")}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedTab === "Customizations" && <hr></hr>}
          {selectedTab === "Customizations" && (
            <div className="grid lg:grid-cols-1 gap-x-4 px-4 pt-3">
              {/* Signature Upload */}
              <div className="flex items-center gap-3 py-4">
                <div className="relative">
                  {signatureUrl ? (
                    <img
                      src={signatureUrl}
                      alt="Signature Preview"
                      className="w-48 h-28 object-contain border bg-white rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-24 flex items-center justify-center border bg-gray-100 text-gray-400">
                      No signature uploaded
                    </div>
                  )}
                  <label
                    htmlFor="signature-upload"
                    className="absolute bottom-1 right-1 h-7 w-7 bg-[#01576A] rounded-full flex items-center justify-center cursor-pointer text-white shadow"
                  >
                    <ImageUp className="h-5 w-5" />
                  </label>
                  <input
                    id="signature-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        form.setValue("signature", file);
                        updateUserProfile({
                          ...form.getValues(),
                          signature: file,
                        });
                      }
                    }}
                  />
                </div>
                <div className="text-sm text-gray-600 text-left">
                  <p>Upload your digital signature</p>
                  <p className="text-slate-300">.jpg, .png format only</p>
                </div>
              </div>
            </div>
          )}
        </form>

        <AppModal isOpen={isModalOpen} toggle={toggleClose} title="">
          <div className="rounded-md shadow-sm">
            <header className="text-xl text-[#1A2435] font-medium px-6 py-4 border-b text-left">
              <h1>Change Password</h1>
            </header>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 flex flex-col gap-4"
            >
              <div className="relative">
                <AppInputField
                  name="oldPassword"
                  form={formPassword}
                  label="Old Password"
                  placeholder="Enter your old password"
                  type={showOldPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-[44px] text-gray-500"
                  onClick={() => setShowOldPassword((prev) => !prev)}
                >
                  {showOldPassword ? (
                    <EyeOff height={15} />
                  ) : (
                    <Eye height={15} />
                  )}
                </button>
              </div>

              {/* New Password with Eye Toggle */}
              <div className="relative">
                <AppInputField
                  name="newPassword"
                  form={formPassword}
                  label="New Password"
                  placeholder="Enter your new password"
                  type={showNewPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-[44px] text-gray-500"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? (
                    <EyeOff height={15} />
                  ) : (
                    <Eye height={15} />
                  )}
                </button>
              </div>

              <div className="relative">
                <AppInputField
                  name="confirmNewPassword"
                  form={formPassword}
                  label="Confirm New Password"
                  placeholder="Re-enter your new password"
                  type={showConfirmPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-[44px] text-gray-500"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? (
                    <EyeOff height={15} />
                  ) : (
                    <Eye height={15} />
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <AppButton
                isLoading={loading}
                type="submit"
                className="w-full mt-0 text-base"
              />
            </form>
          </div>
        </AppModal>
      </div>
    </div>
  );
};

export default UserProfile;
