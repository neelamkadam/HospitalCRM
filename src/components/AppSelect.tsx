import {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormReturn,
} from "react-hook-form";
import { cn } from "../lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T, any, undefined>;
  label?: string;
  validation?: RegisterOptions<T, Path<T>>;
  placeholder?: string;
  readonly?: boolean;
  options: { label: string; value: string }[];
  groups?: { label: string; options: { label: string; value: string }[] }[];
}

const AppSelectField = <T extends FieldValues>({
  name,
  label,
  validation,
  placeholder,
  form,
  readonly,
  options,
  groups,
}: SelectFieldProps<T>) => {
  //   const validationOptions = validation
  //     ? {
  //         ...validation,
  //         required:
  //           typeof validation.required === "string"
  //             ? validation.required
  //             : validation.required === true
  //             ? "Required"
  //             : undefined,
  //       }
  //     : {};

  return (
    <div className="mb-4">
      {label && (
        <div className="flex space-x-1">
          <label className="block text-sm font-medium text-[#1A2435] mb-1">{label}</label>
          {validation?.required && <div className="text-red-500">*</div>}
        </div>
      )}

      <Select
        disabled={readonly}
        onValueChange={(value) => {
          form.setValue(name, value as any, { shouldValidate: true });
        }}
        value={form.watch(name)}
      >
        <SelectTrigger
          className={cn(
            "mt-1 w-full px-3 py-3 border !border-[#E6E7E9] bg-[#ffffff] focus:bg-[#f5f5f5] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#394557] text-[#526279] text-base font-normal",
            // readonly ? "bg-[#0D0F11]" : ""
            form.formState.errors[name]?.message?.toString()
              ? "!border-red-500 placeholder-#F3F4F6 text-white-500 focus:ring-2 focus:ring-red-500 bg-[#fff2f4] !border-1px-sold"
              : ""
          )}
        >
          <SelectValue
            placeholder={
              form.formState.errors[name]?.message?.toString()
                ? form.formState.errors[name]?.message?.toString()
                : placeholder
            }
          />
        </SelectTrigger>

        <SelectContent>
          {groups
            ? groups.map((group) => (
                <SelectGroup key={group.label}>
                  <SelectLabel>{group.label}</SelectLabel>
                  {group.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))
            : options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
        </SelectContent>
      </Select>

      {/* {form.formState.errors[name] && (
        <p className="mt-2 text-sm text-red-600 text-start">
          {form.formState.errors[name]?.message?.toString()}
        </p>
      )} */}
    </div>
  );
};

export default AppSelectField;
