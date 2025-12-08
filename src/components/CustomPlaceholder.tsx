import { Search } from "lucide-react";

const CustomPlaceholder = () => {
  return (
    <div className="flex items-center gap-2 text-[#526279] mt-[-22px]">
      <Search className="w-5 h-5 text-gray-500" />
      <span className="text-[17px] font-medium text-[#526279]">Search Patient Name</span>
    </div>
  );
};

export default CustomPlaceholder;


export const CustomOrganizationPlaceholder = () => {
  return (
    <div className="flex items-center gap-2 text-[#526279] mt-[-22px]">
      <Search className="w-5 h-5 text-gray-500" />
      <span className="text-[17px] font-medium text-[#526279]">Search Organization Name</span>
    </div>
  );
};

