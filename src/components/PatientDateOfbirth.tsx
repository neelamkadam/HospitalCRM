import { getMonth, getYear, setMonth, setYear } from "date-fns";
import { range } from "lodash";
import { useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface PatientDateOfBirthProps {
  value: string;
  onChange: (date: string) => void;
  datePickerRef?: any;
}

const PatientDateOfBirth = ({
  value,
  onChange,
  datePickerRef,
}: PatientDateOfBirthProps) => {
  const internalRef = useRef<DatePicker | null>(null);
  const years = range(1900, getYear(new Date()) + 1, 1);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Check if the selected date is in the future
      if (isFutureDate(date)) {
        return; // Don't allow future dates
      }

      // Format date to ISO string (YYYY-MM-DD)
      const formattedDate = date.toISOString().split("T")[0];
      onChange(formattedDate);
    } else {
      onChange("");
    }
  };

  const [tempDate, setTempDate] = useState<Date | null>(
    value ? new Date(value) : null
  );

  const handleYearChange = (year: number) => {
    if (tempDate) {
      const newDate = setYear(tempDate, year);
      setTempDate(newDate);
      handleDateChange(newDate);
    }
  };

  const handleMonthChange = (month: number) => {
    if (tempDate) {
      const newDate = setMonth(tempDate, month);
      setTempDate(newDate);
      handleDateChange(newDate);
    }
  };

  // Prevent form submission when interacting with calendar controls
  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    type: "year" | "month"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (type === "year") {
      handleYearChange(Number(e.target.value));
    } else {
      handleMonthChange(months.indexOf(e.target.value));
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Check if a date is in the future
  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  return (
    <div className="w-full max-w-xs">
      <DatePicker
        ref={(el) => {
          if (el) {
            internalRef.current = el;
            if (datePickerRef) datePickerRef.setOpen = () => el.setOpen(true);
          }
        }}
        maxDate={new Date()} // Disable future dates
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between px-2 py-2 space-x-2">
            <button
              type="button"
              onClick={(e) => {
                handleButtonClick(e);
                decreaseMonth();
              }}
              disabled={prevMonthButtonDisabled}
              className={`p-1 rounded-md ${
                prevMonthButtonDisabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="Previous month"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div className="flex space-x-2">
              <select
                value={getYear(date)}
                onChange={(e) => {
                  handleSelectChange(e, "year");
                  changeYear(Number(e.target.value));
                }}
                onClick={(e) => e.stopPropagation()}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={months[getMonth(date)]}
                onChange={(e) => {
                  handleSelectChange(e, "month");
                  changeMonth(months.indexOf(e.target.value));
                }}
                onClick={(e) => e.stopPropagation()}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={(e) => {
                handleButtonClick(e);
                increaseMonth();
              }}
              disabled={nextMonthButtonDisabled}
              className={`p-1 rounded-md ${
                nextMonthButtonDisabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="Next month"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
        selected={value ? new Date(value) : null}
        onChange={handleDateChange}
        className="w-full focus:outline-none flex-1"
        dateFormat="MMMM d, yyyy"
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={50}
        placeholderText="Select date of birth"
        filterDate={(date) => !isFutureDate(date)} // Additional filter for future dates
      />
    </div>
  );
};

export default PatientDateOfBirth;
