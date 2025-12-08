import { useState, useEffect } from "react";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import {
  UseFormReturn,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";

interface GenderSelectProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T, any, undefined>;
  validation?: RegisterOptions<T, Path<T>>;
  isRequired?: boolean;
}

const options = ["Male", "Female", "Other"];

const GenderSelect = <T extends FieldValues>({
  name,
  form,
  validation,
  isRequired,
}: GenderSelectProps<T>) => {
  // Get the current form value for this field
  const currentValue = form.watch(name);

  // Initialize selectedOption based on form value or default to "NA"
  const [selectedOption, setSelectedOption] = useState<any>(
    currentValue && options.includes(currentValue)
      ? currentValue
      : "Select Gender"
  );

  // Sync selectedOption with form value changes
  useEffect(() => {
    if (
      currentValue &&
      (options.includes(currentValue) || currentValue === "Select Gender")
    ) {
      setSelectedOption(currentValue);
    }
  }, [currentValue]);

  const validationOptions = validation
    ? {
        ...validation,
        required:
          typeof validation.required === "string"
            ? validation.required
            : validation.required === true
            ? "Required"
            : undefined,
      }
    : isRequired
    ? { required: "Required" }
    : {};

  useEffect(() => {
    form.register(name, validationOptions);
  }, [form.register, name, validationOptions]);

  const handleSelect = (option: any) => {
    setSelectedOption(option.value);
    form.setValue(name, option.value as any, { shouldValidate: true });
  };

  return (
    <div className="mb-3">
      <label className="font-medium text-sm mb-2 text-[#1A2435] flex justify-start">
        Gender
        {(validation?.required || isRequired) && (
          <span className="text-gray-500"> *</span>
        )}
      </label>
      <div className="relative mt-[6px]">
        <Dropdown
          options={options}
          onChange={handleSelect}
          value={selectedOption}
          placeholder="Select an option"
          className={`genderselect ${
            selectedOption === "Select Gender" ? "placeholder" : "selected"
          } ${
            form.formState.errors[name]?.message?.toString() ? "required" : ""
          }`}
        />
      </div>
      {/* {form.formState.errors[name] && (
        <p className="mt-2 text-sm text-red-600 text-start">
          {form.formState.errors[name]?.message?.toString()}
        </p>
      )} */}
    </div>
  );
};

export default GenderSelect;
