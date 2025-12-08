import { Search } from "lucide-react";

const CustomSingleValue = ({ data }: any) => {
  return (
    <div className="flex items-center gap-2 mt-[-22px]">
      <Search className="w-5 h-5 text-gray-500" />
      <span className="text-[17px] font-medium text-[#526279]">{data.label}</span>
    </div>
  );
};

export default CustomSingleValue;
