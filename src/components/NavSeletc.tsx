import {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormReturn,
} from "react-hook-form";
import { cn } from "../lib/utils";

interface NativeSelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T, any, undefined>;
  label?: string;
  validation?: RegisterOptions<T, Path<T>>;
  placeholder?: string;
  readonly?: boolean;
  options: { label: string; value: string }[];
  groups?: { label: string; options: { label: string; value: string }[] }[];
}

const NativeSelectField = <T extends FieldValues>({
  name,
  label,
  validation,
  placeholder,
  form,
  readonly,
  options,
  groups,
}: NativeSelectFieldProps<T>) => {
  return (
    <div className="mb-4">
      {label && (
        <div className="flex space-x-1">
          <label className="block text-sm font-medium text-[#1A2435] mb-1">
            {label}
          </label>
          {validation?.required && <div className="text-red-500">*</div>}
        </div>
      )}

      <div className="relative">
        <select
          {...form.register(name)}
          disabled={readonly}
          className={cn(
            "mt-1 w-full px-3 py-3 bg-white border border-[#e2e8f0] rounded-md shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-[#526279]",
            "text-[#1A2435] text-[17px] font-normal appearance-none",
            "cursor-pointer transition-colors duration-200",
            form.formState.errors[name]?.message?.toString()
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/10 bg-red-50"
              : "hover:border-gray-400"
          )}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}

          {groups
            ? groups.map((group) => (
                <optgroup label={group.label} key={group.label}>
                  {group.options.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="text-[#526279] bg-white hover:bg-gray-100"
                    >
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))
            : options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="text-[#526279] bg-white hover:bg-gray-100"
                >
                  {option.label}
                </option>
              ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-5 w-5 text-[#526279]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {form.formState.errors[name] && (
        <p className="mt-2 text-sm text-red-600 text-start">
          {form.formState.errors[name]?.message?.toString()}
        </p>
      )}
    </div>
  );
};

export default NativeSelectField;
