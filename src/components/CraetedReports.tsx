import React from "react";
import UserSvg from "../assets/Svgs/User.svg";
import Analytics from "../assets/Svgs/analytics.svg";
import { FolderUp } from "lucide-react";

interface uploadedCreatedReportsProps {
  uploadedCreatedReports: any;
}

const CraetedReports: React.FC<uploadedCreatedReportsProps> = ({
  uploadedCreatedReports,
}) => {
  return (
    <div
      className={`rounded-xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] w-full bg-white ${
        uploadedCreatedReports?.length > 0 ? "h-fit" : ""
      }`}
    >
      <div className="flex justify-start flex-col rounded-t-lg p-4">
        <h2 className="font-normal text-lg text-start text-[#1A2435]">
          Reports Info
        </h2>
        <span className="text-start cursor-pointer text-[#84818A]">
          {/* From Dec 12, 2024 — Jan 29, 2025 */}
          {/* <Dropdown periodKey="topConditions" /> */}
        </span>
      </div>

      <div
        className="overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white bg-white rounded-b-2xl"
        style={{ height: `calc(100vh - 405px)` }}
      >
        {uploadedCreatedReports && (
          <table className="table-auto w-full text-left">
            {/* <thead>
                      <th className="p-4"></th>
                      <th className="p-4 text-[#cccccc]">Report Count</th>
                      <th className="p-4 ">Count</th>
                    </thead> */}
            <tbody>
              {uploadedCreatedReports.map((val: any) => (
                <tr
                  key={val?._id}
                  className="hover:bg-gray-100 h-[49px] border-b border-[#E6E7E9] flex-1 items-center last:border-b-0"
                >
                  <td className="p-4 flex">
                    {/* <span className="ml-[5px] bg-[#F2F3F3] rounded-full w-[23px] h-[23px] flex items-center justify-center shrink-0">
                       <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M12 5.33333H4.00001C3.26363 5.33333 2.66668 5.93029 2.66668 6.66667V12C2.66668 12.7364 3.26363 13.3333 4.00001 13.3333H12C12.7364 13.3333 13.3333 12.7364 13.3333 12V6.66667C13.3333 5.93029 12.7364 5.33333 12 5.33333ZM4.00001 4C2.52725 4 1.33334 5.19391 1.33334 6.66667V12C1.33334 13.4728 2.52725 14.6667 4.00001 14.6667H12C13.4728 14.6667 14.6667 13.4728 14.6667 12V6.66667C14.6667 5.19391 13.4728 4 12 4H4.00001Z"
                          fill="#8C929A"
                        />
                        <path
                          d="M8.00001 6.66666C7.63182 6.66666 7.33334 6.96513 7.33334 7.33332V8.66666H6.00001C5.63182 8.66666 5.33334 8.96513 5.33334 9.33332C5.33334 9.70151 5.63182 9.99999 6.00001 9.99999H7.33334V11.3333C7.33334 11.7015 7.63182 12 8.00001 12C8.3682 12 8.66668 11.7015 8.66668 11.3333V9.99999H10C10.3682 9.99999 10.6667 9.70151 10.6667 9.33332C10.6667 8.96513 10.3682 8.66666 10 8.66666H8.66668V7.33332C8.66668 6.96513 8.3682 6.66666 8.00001 6.66666Z"
                          fill="#8C929A"
                        />
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M6.66666 2.66668C6.29847 2.66668 5.99999 2.96515 5.99999 3.33334V4.00001C5.99999 4.3682 5.70151 4.66668 5.33332 4.66668C4.96513 4.66668 4.66666 4.3682 4.66666 4.00001V3.33334C4.66666 2.22877 5.56209 1.33334 6.66666 1.33334H9.33332C10.4379 1.33334 11.3333 2.22877 11.3333 3.33334V4.00001C11.3333 4.3682 11.0348 4.66668 10.6667 4.66668C10.2985 4.66668 9.99999 4.3682 9.99999 4.00001V3.33334C9.99999 2.96515 9.70151 2.66668 9.33332 2.66668H6.66666Z"
                          fill="#8C929A"
                        />
                      </svg> 
                    </span> */}
                    <img src={UserSvg} alt="User" className="w-5" />

                    <span className="ml-3 text-[#1A2435] font-[16px]">
                      {val?.name}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-evenly items-center">
                      <span className="w-[23px] h-[23px] flex items-center justify-center">
                        <img src={Analytics} alt="Analytics" className="w-5" />
                      </span>
                      <span className="text-sm text-[#1A2435] ml-1">
                        {val?.createdReports}{" "}
                      </span>
                      <span className="text-[#8C929A] text-sm ml-2">
                        Created Reports
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-evenly items-center">
                      <span className="w-[23px] h-[23px] flex items-center justify-center">
                        <FolderUp size={22} color="#8C929A" />
                      </span>
                      <span className="text-sm text-[#1A2435] ml-1">
                        {val?.uploadedReports}{" "}
                      </span>
                      <span className="text-[#8C929A] text-sm ml-2">
                        Uploaded Reports
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CraetedReports;
