import { Plus } from "lucide-react";
import React from "react";
import { Separator } from "./ui/separator";
import PlusIcon from "../assets/Svgs/plusIcon.svg";
import PlusIconGray from "../assets/Svgs/PlusGray.svg";
import GreenArrowUp from "../assets/Svgs/GreenArrowUp.svg";
import GrayArrowUp from "../assets/Svgs/GrayArrowUp.svg";
import { formatToThreeDigits } from "../utils/common-utils";
import { formatRevenue } from "../lib/utils";

interface DashboardCardProps {
  title: string;
  icon: any;
  value: string | number;
  valueLabel: string;
  changeCount: string;
  changeType: "increase" | "decrease" | "no change";
  growth: string;
  isLoading: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  value,
  valueLabel,
  changeCount,
  changeType,
  growth,
  isLoading,
}) => {
  const showChangeCount = changeCount !== "0";

  const formattedValue =
    valueLabel.toLowerCase() === "revenue"
      ? formatRevenue(Number(value))
      : Number(value) % 1 === 0
      ? Number(value).toString()
      : Number(value).toFixed(1);

  return (
    <div className="bg-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] rounded-2xl h-full">
      {/* Header Section */}
      <div className="flex justify-between items-center p-3 rounded-t-2xl bg-[#01576A]">
        <span className="text-white flex items-center opacity-80">
          {icon}
          <span className="ml-3 font-normal text-[18px] text-white leading-7">
            {title}
          </span>
        </span>
      </div>
      <div>
        {isLoading ? (
          <div className="p-5">
            <div className="flex items-start">
              <div className="h-[25px] w-20 bg-gray-200 rounded" />
              <div className="ml-3 mt-7 h-6 w-32 bg-gray-200 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center">
                <div className="h-5 w-5 bg-gray-200 rounded-full" />
                <div className="ml-2 h-4 w-8 bg-gray-200 rounded" />
                <div className="ml-2 h-4 w-16 bg-gray-200 rounded" />
              </div>
              <div className="flex items-center">
                <div className="h-5 w-5 bg-gray-200 rounded-full" />
                <div className="ml-2 h-4 w-8 bg-gray-200 rounded" />
                <div className="ml-2 h-4 w-16 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="absolute inset-0 shimmer-animation" />
          </div>
        ) : (
          <>
            <div className="flex items-end px-5 pt-2 pb-3">
              <h1
                className={`text-5xl font-bold dash-box-big-text ${
                  value === "0.0" ? "text-[#ADB1B7]" : "text-[#1A2435]"
                }`}
              >
                {/* {Number(value) % 1 === 0
                  ? Number(value)
                  : Number(value)?.toFixed(1)} */}
                {formattedValue}
              </h1>
              <p
                className={`text-lg font-light pl-3 mt-7 dash-box-small-text ${
                  value === "0.0" ? "text-[#ADB1B7]" : "text-[#666D79]"
                }`}
              >
                {valueLabel}
              </p>
            </div>
            <div className="grid border-t text-gray-500 md:grid-cols-">
              {/* <div className="flex justify-between w-full items-center">
                <div className="flex p-3">
                  {showChangeCount && (
                    <>
                      {changeCount == "0" ? (
                        <>
                          <span className="text-[#00b279] text-base font-normal pt-[3px]">
                            <CirclePlus height="17px" color="#8C929A" />
                          </span>
                          <span className="text-[#8C929A]">0.0</span>
                          <span className="text-[#526279] text-base font-light mt-[-2px] ml-[5px]">
                            added
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1 text-base font-normal">
                            {changeType === "decrease" ? (
                              <>
                                <span className="text-red-500">
                                  {changeCount}
                                </span>
                              </>
                            ) : (
                              <>
                                <CirclePlus
                                  size={18}
                                  className="bg-[#D7F4DE] text-[#00b279] rounded-full"
                                />
                                <span className="text-[#00b279]">
                                  {changeCount}
                                </span>
                              </>
                            )}
                          </span>
                          <span className="text-[#8C929A] text-base font-light ml-[5px]">
                            {changeType}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>
                <Separator orientation="vertical" className="h-[20px]" />
                <div className="flex p-2">
                  <span className="text-[#00b279] text-base font-normal pt-[3px]">
                    <CircleArrowUp
                      size={18}
                      className="bg-[#D7F4DE] rounded-full"
                    />
                  </span>
                  <span className="text-[#00b279] ">{growth}%</span>
                  <span className="text-[#8C929A] text-base font-light mt-[-2px]">
                    growth
                  </span>
                </div>
              </div> */}
              <div className="w-full items-center flex px-0 justify-evenly">
                <div className="flex p-3 px-2 gap-1 items-center">
                  {showChangeCount ? (
                    <>
                      {changeCount == "0" || changeCount == "0" ? (
                        <>
                          <span className="text-[#00b279] text-base font-normal pt-[3px]">
                            <Plus height="17px" color="#8C929A" />
                          </span>
                          <span className="text-[#8C929A]">0.0</span>
                          <span className="text-[#526279] text-base font-light mt-[-2px] ml-[5px]">
                            added
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1 text-base font-normal">
                            {changeType === "decrease" ? (
                              <>
                                <span className="text-red-500 text-base">
                                  {changeCount}
                                </span>
                              </>
                            ) : changeCount === "0.0" ? (
                              <>
                                <div className="bg-[#E6E7E9] text-[#8C929A] rounded-full p-[3px] w-[18px] h-[18px]">
                                  <img
                                    src={PlusIconGray}
                                    alt="Plus Icon"
                                    className="w-3"
                                    color="#8C929A"
                                  />
                                </div>
                                <span className="text-[#8C929A] text-base">
                                  {changeCount}
                                </span>
                              </>
                            ) : (
                              <>
                                <div className="bg-[#D7F4DE] text-[#388E3C] rounded-full p-[3px] w-[18px] h-[18px]">
                                  <img
                                    src={PlusIcon}
                                    alt="Plus Icon"
                                    className="w-3"
                                  />
                                </div>
                                <span className="text-[#388E3C] text-base">
                                  {title == "Revenue"
                                    ? formatRevenue(Number(changeCount))
                                    : Number(changeCount)}
                                </span>
                              </>
                            )}
                          </span>
                          <span className="text-[#8C929A] text-base font-light ml-[5px] card-font-size">
                            {changeType === "no change"
                              ? "increase"
                              : changeType}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="bg-[#E6E7E9] text-[#8C929A] rounded-full p-[3px] w-[18px] h-[18px]">
                        <img
                          src={PlusIconGray}
                          alt="Plus Icon"
                          className="w-3"
                          color="#8C929A"
                        />
                      </div>
                      <span className="text-[#8C929A]">0.0</span>
                      <span className="text-[#526279] text-base font-light mt-[-2px] ml-[5px]">
                        increase
                      </span>
                    </>
                  )}
                </div>
                <Separator orientation="vertical" className="h-[20px]" />
                {growth === "0.0" ? (
                  <div className="flex p-2 gap-1 items-center">
                    <div className="bg-[#E6E7E9] text-[#8C929A] rounded-full p-[3px] w-[18px] h-[18px]">
                      <img src={GrayArrowUp} alt="Plus Icon" className="w-3" />
                    </div>
                    <span className="text-[#8C929A] ">{growth}%</span>
                    <span className="text-[#8C929A] text-base font-light card-font-size">
                      growth
                    </span>
                  </div>
                ) : (
                  <div className="flex p-2 gap-1 items-center">
                    <div className="bg-[#D7F4DE] text-[#388E3C] rounded-full p-[3px] w-[18px] h-[18px]">
                      <img src={GreenArrowUp} alt="Plus Icon" className="w-3" />
                    </div>
                    <span className="text-[#388E3C] ">
                      {formatToThreeDigits(growth)}%
                    </span>
                    <span className="text-[#8C929A] text-base font-light card-font-size">
                      growth
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
