import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/build/css/intlTelInput.css";
import { UserProfileSchema } from "../../utils/validationSchems";
import { useAppSelector } from "../../redux/store";
import { userProfile } from "../../types/form.types";
import AppInputField from "../../components/AppInput";
// import debounce from "lodash.debounce";
// import { usePutApi } from "../../services/use-api";
// import API_CONSTANTS from "../../constants/apiConstants";
// import { useDispatch } from "react-redux";
// import { setUserData } from "../../redux/AuthSlice";
import { cn } from "../../utils/common-utils";
import CreatReportSvg from "../../assets/user-profile-default.png";

const PatientProfile: React.FC = () => {
  const { userData } = useAppSelector((state: any) => state.authData);
  // const dispatch = useDispatch();
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const itiInstance = useRef<intlTelInput.Plugin | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  // const { putData: updatePermission } = usePutApi<FormData>({
  //   path: API_CONSTANTS.GET_USER_UPDATE,
  // });

  // const { putData: updatePassword } = usePutApi<FormData>({
  //   path: API_CONSTANTS.PUT_USER_PASSWORD,
  // });

  const form = useForm<userProfile | any>({
    resolver: yupResolver(UserProfileSchema),
    defaultValues: {
      role: userData?.role,
      email: userData?.email,
      name: userData?.name,
      about: userData?.about,
      phone: userData?.phoneNumber,
      countryCode: userData?.countryCode,
      registrationNumber: userData?.registrationNumber,
      profilePic: userData?.profilePicture,
      specialization: userData?.specialization || "",
      signature: userData?.signature,
      gender: userData?.gender,
    },
  });

  // const onSubmit = async (data: ChangePassword) => {
  //   setLoading(true);
  //   try {
  //     const { confirmNewPassword, ...payload } = data;
  //     const response = await updatePassword(payload);
  //     console.log("Password change response:", response);
  //     setLoading(false);
  //     reset();
  //     setIsModalOpen(false); // Close modal
  //   } catch (error) {
  //     setLoading(false);
  //     console.error("Password change failed:", error);
  //   }
  // };

  useEffect(() => {
    if (userData) {
      form.setValue("specialization", userData.specialization || "");
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
          // await updateUserProfile({
          //   ...form.getValues(),
          //   profilePic: defaultFile,
          // });
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
    // setSignatureUrl(url);

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

  // const debouncedUpdate = useCallback(
  //   debounce(async (data: userProfile) => {
  //     try {
  //       const formData = new FormData();
  //       Object.entries(data).forEach(([key, value]) => {
  //         if (value !== undefined) {
  //           // Send default image even if it's a File object
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

    if (userData?.countryCode && userData?.phoneNumber) {
      itiInstance.current.setNumber(userData.countryCode + userData.phoneNumber);
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
  }, [userData, form]);


  return (
    <div className="bg-white flex-1 pb-1 m-4 rounded-xl shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)]">
      <form className="space-y-0">
        <div className="grid lg:grid-cols-1 gap-x-4 px-4">
          <div className="flex items-center gap-3 md:gap-6 mb-4 pt-4">
            <div className="relative">
              <img
                src={profilePicUrl}
                className="w-28 h-28 rounded-full object-cover border bg-white"
                alt="Profile"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = CreatReportSvg;
                }}
              />
              {/* <label
                htmlFor="profile-upload"
                className="absolute bottom-1 right-1 h-7 w-7 bg-[#01576A] rounded-full p-[2px] cursor-pointer shadow text-white"
              >
                ✎
              </label> */}
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
              // onChange={(e) => {
              //   const file = e.target.files?.[0];
              //   if (file) {
              //     form.setValue("profilePic", file);
              //     updateUserProfile({
              //       ...form.getValues(),
              //       profilePic: file,
              //     });
              //   }
              // }}
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
        </div>
        {/* Input Fields */}
        <div className="flex pt-1 pb-3 px-4 ">
          <label className="text-[24px] font-normal text-[#1A2435]">
            Personal Information 
          </label>
        </div>
        <div className="grid md:grid-cols-2 gap-x-4 px-4 pb-3">
          <AppInputField
            readonly
            name="name"
            form={form}
            label="Full Name"
          // placeholder="Enter your name"
          // onBlure={() => handleFieldBlur("name")}
          />
          {/* <AppInputField<userProfile>
            name="specialization"
            form={form}
            label="Specialization"
            placeholder="Enter your specialization"
            onBlure={() => handleFieldBlur("specialization")}
          /> */}

          <div className="flex flex-col">
            <AppInputField
              readonly
              name="email"
              form={form}
              label="Email"
            // placeholder="Enter your name"
            // onBlure={() => handleFieldBlur("name")}
            />
          </div>
          <AppInputField
            name="gender"
            form={form}
            label="Gender"
            readonly
          // placeholder="Bio your organization"
          // onBlure={() => handleFieldBlur("about")}
          />
          <div className="flex flex-col mb-4">
            <label className="mb-2 font-medium text-sm text-gray-700 text-start">
              Phone Number
            </label>
            <input
              ref={phoneInputRef}
              readOnly
              type="tel"
              className={cn(
                `w-full px-4 h-[46.22px] py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#526279] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] placeholder:text-[17px]`,
                form.formState.errors.phone
                  ? "!border-red-500 bg-[#fff2f4] focus:ring-red-500"
                  : ""
              )}
              placeholder="Enter phone number"
            // onBlur={handlePhoneBlur}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default PatientProfile;
