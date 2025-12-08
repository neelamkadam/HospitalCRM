import { useState, useEffect, useRef } from "react";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import {
  UseFormReturn,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";

interface DropDownSelectProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T, any, undefined>;
  validation?: RegisterOptions<T, Path<T>>;
  options: string[] | { label: string; value: string }[];
  label?: string;
  placeholder?: string;
  onBlur?: () => void;
  autoFocus?: boolean; // new prop for autofocus
  disabled?: boolean; // new prop for disabling the dropdown
}

const DropDownSelect = <T extends FieldValues>({
  name,
  form,
  validation,
  options,
  label,
  placeholder = "Select an option",
  onBlur,
  autoFocus = false, // default false
  disabled = false, // default false
}: DropDownSelectProps<T>) => {
  const currentValue = form.watch(name);
  const [selectedOption, setSelectedOption] = useState<any>(
    options.find((opt) =>
      typeof opt === "string"
        ? opt === currentValue
        : opt.value === currentValue
    ) || null
  );

  const dropdownRef = useRef<any>(null);

  // Update selectedOption when form value changes
  useEffect(() => {
    const option = options.find((opt) =>
      typeof opt === "string"
        ? opt === currentValue
        : opt.value === currentValue
    );
    if (option) setSelectedOption(option);
  }, [currentValue, options]);

  // Autofocus effect
  useEffect(() => {
    if (autoFocus && dropdownRef.current) {
      const inputEl = dropdownRef.current.control; // react-dropdown exposes control
      inputEl?.focus();
    }
  }, [autoFocus]);

  const handleSelect = (option: any) => {
    setSelectedOption(option);
    form.setValue(name, option.value as any, { shouldValidate: true });
    if (onBlur) setTimeout(onBlur, 0);
  };

  return (
    <div className="mb-3">
      {label && (
        <div className="flex space-x-1">
          <label className="block text-sm font-medium text-[#1A2435] mb-1">
            {label}
          </label>
          {validation?.required && <div className="text-red-500">*</div>}
        </div>
      )}
      <div className="relative">
        <Dropdown
          ref={dropdownRef}
          options={options}
          onChange={handleSelect}
          value={selectedOption}
          placeholder={placeholder}
          disabled={disabled}
          className={`genderselect !text-[#526279] ${
            selectedOption ? `selected` : "placeholder"
          } ${
            form.formState.errors[name]?.message?.toString() ? "required" : ""
          }`}
        />
      </div>
    </div>
  );
};

export default DropDownSelect;
