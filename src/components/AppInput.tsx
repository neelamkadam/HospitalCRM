import { ChangeEvent, FocusEvent } from "react";
import {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormReturn,
} from "react-hook-form";
import { cn } from "../utils/common-utils";

interface InputFieldProps<T extends FieldValues> {
  name: Path<T> | any;
  form: UseFormReturn<T, any, any>;
  type?: "text" | "email" | "password" | "number" | "url";
  label?: string;
  validation?: RegisterOptions<T, Path<T>>;
  isRequired?: boolean;
  placeholder?: string;
  readonly?: boolean;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlure?: (event: FocusEvent<HTMLInputElement>) => void;
  className?: string;
  maxLength?: number; // Added maxLength prop
}

const AppInputField = <T extends FieldValues>({
  name,
  type = "text",
  label,
  validation,
  isRequired = false,
  placeholder,
  form,
  readonly,
  value,
  onChange,
  onBlure,
  className,
  maxLength, // Destructure maxLength
}: InputFieldProps<T>) => {
  // Determine validation options, directly using validation object
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
    : {};

  // const isError = !!form.formState.errors[name]; // Check if there's an error for this field

  return (
    <div className="mb-3">
      {label && (
        <div className="flex space-x-1">
          <label
            htmlFor={name}
            className="block text-sm font-medium text-[#1A2435] mb-1"
          >
            {label}
          </label>
          {validation && validation.required && (
            <div className="text-red-500">*</div>
          )}
           {!validation?.required && isRequired && (
            <div className="text-gray-500">*</div>
          )}
        </div>
      )}
      <input
        id={name}
        type={type}
        disabled={readonly}
        placeholder={
          form.formState.errors[name]?.message?.toString()
            ? form.formState.errors[name]?.message?.toString()
            : placeholder
        }
        autoComplete="off"
        maxLength={maxLength} // Apply maxLength here
        {...form.register(name, validationOptions)}
        onChange={(event) => {
          form.register(name, validationOptions).onChange(event);
          if (onChange) {
            onChange(event);
          }
        }}
        value={value}
        onBlur={(event) => {
          form.register(name, validationOptions).onBlur(event);
          if (onBlure) {
            onBlure(event);
          }
        }}
        style={{
          fontSize: "17px",
          color: form.formState.errors[name]?.message?.toString()
            ? "#1A2435"
            : "#526279",
        }}
        className={cn(
          `mt-1 block w-full pl-2 pr-3 pb-3 pt-3 border !border-[#E6E7E9] rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] focus:outline-none focus:ring-2 focus:ring-[#526279] sm:text-sm ${className} ${
            readonly ? "bg-white" : "bg-white"
          }`,
          form.formState.errors[name]?.message?.toString()
            ? "!border-red-500 placeholder-#ADB1B7 text-white-500 focus:ring-2 focus:ring-red-500 bg-[#fff2f4] !border-1px-sold"
            : ""
        )}
      />
      {/* {isError && (
        <p className="mt-2 text-sm text-red-600 text-start">
          {form.formState.errors[name]?.message?.toString()}
        </p>
      )} */}
    </div>
  );
};

export default AppInputField;
