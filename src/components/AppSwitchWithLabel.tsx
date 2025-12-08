import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface SwitchWithLabelProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  labelRight?: string;
  disabled?: boolean;
  className?: string;
}

export function SwitchWithLabel({
  id,
  label,
  checked,
  labelRight,
  onCheckedChange,
  disabled = false,
  className
}: SwitchWithLabelProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Label htmlFor={id}>{labelRight}</Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={checked ? "!bg-[#01576A]" : "bg-red-500"}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}
