import { useEffect, useState } from "react";
import { Bounce, ToastOptions } from "react-toastify";

export const TOASTER_CONFIG: ToastOptions = {
  position: "top-right",
  hideProgressBar: false,
  pauseOnHover: true,
  theme: "colored",
  transition: Bounce,
  closeOnClick: true,
  draggable: true,
};

export const BREAKPOINTS = {
  SM: "640px",
  MD: "768px",
  LG: "1024px",
  XL: "1280px",
  "2XL": "1536px",
};

type BreakpointKey = keyof typeof BREAKPOINTS;

export const useBreakpoint = (breakpoint: BreakpointKey): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    // Initialize with the correct value on mount
    return window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]})`).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(min-width: ${BREAKPOINTS[breakpoint]})`
    );

    const handleChange = () => {
      setMatches(mediaQuery.matches);
    };

    // Listen for changes to the media query
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup the listener on unmount
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [breakpoint]);

  return matches;
};

export const SpecializationSelect = [
  { label: "General Practitioner", value: "general practitioner" },
  { label: "Cardiologist", value: "cardiologist" },
  { label: "Dermatologist", value: "dermatologist" },
  { label: "Paediatrician", value: "paediatrician" },
  { label: "Gynaecologist", value: "gynaecologist" },
  { label: "Obstetrician", value: "obstetrician" },
  { label: "Orthopaedic Surgeon", value: "orthopaedic surgeon" },
  { label: "Neurologist", value: "neurologist" },
  { label: "Psychiatrist", value: "psychiatrist" },
  { label: "Oncologist", value: "oncologist" },
  { label: "Endocrinologist", value: "endocrinologist" },
  { label: "Ophthalmologist", value: "ophthalmologist" },
  { label: "ENT Specialist", value: "ent specialist" },
  { label: "Urologist", value: "urologist" },
  { label: "Nephrologist", value: "nephrologist" },
  { label: "Gastroenterologist", value: "gastroenterologist" },
  { label: "Pulmonologist", value: "pulmonologist" },
  { label: "Rheumatologist", value: "rheumatologist" },
  { label: "Haematologist", value: "haematologist" },
  { label: "Radiologist", value: "radiologist" },
];

export const PaymentMethodSelect = [
  { label: "UPI", value: "UPI" },
  { label: "Credit Card", value: "creditCard" },
  { label: "Debit Card", value: "debitCard" },
  { label: "Net Banking", value: "netBanking" },
  { label: "PayPal", value: "payPal" },
  { label: "Cash", value: "cash" },
];

export const AddMemberRoles = [
  { label: "Doctor", value: "doctor" },
  { label: "Staff", value: "staff" },
  { label: "Nurse", value: "nurse" },
];

export const HospitalDepartments = [
  { label: "Emergency / Casualty", value: "emergency" },
  { label: "Outpatient Department (OPD)", value: "opd" },
  { label: "Inpatient Department (IPD)", value: "ipd" },
  { label: "General Medicine", value: "general_medicine" },
  { label: "General Surgery", value: "general_surgery" },
  { label: "Pediatrics", value: "pediatrics" },
  { label: "Gynecology & Obstetrics", value: "gynecology_obstetrics" },
  { label: "Orthopedics", value: "orthopedics" },
  { label: "Cardiology", value: "cardiology" },
  { label: "Neurology", value: "neurology" },
  { label: "Neurosurgery", value: "neurosurgery" },
  { label: "Oncology", value: "oncology" },
  { label: "Dermatology", value: "dermatology" },
  { label: "Psychiatry", value: "psychiatry" },
  { label: "Ophthalmology", value: "ophthalmology" },
  { label: "ENT (Ear, Nose, Throat)", value: "ent" },
  { label: "Dentistry", value: "dentistry" },
  { label: "Nephrology", value: "nephrology" },
  { label: "Urology", value: "urology" },
  { label: "Gastroenterology", value: "gastroenterology" },
  { label: "Pulmonology / Chest Medicine", value: "pulmonology" },
  { label: "Anesthesiology", value: "anesthesiology" },
  { label: "Radiology", value: "radiology" },
  { label: "Pathology & Laboratory", value: "pathology" },
  { label: "Physiotherapy", value: "physiotherapy" },
];
