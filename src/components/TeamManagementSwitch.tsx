import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface SwitchWithLabelProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function TeamManagementSwitch({
  id,
  label,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: SwitchWithLabelProps) {
  return (
    <div className={`flex justify-between ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium text-[#1A2435] ">{label}</Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={checked ? "!bg-[#01576A]" : "bg-red-500"}
      />
    </div>
  );
}
