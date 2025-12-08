import React, { useEffect, useRef, useState } from "react";

type CustomTimePickerProps = {
    value: string;
    onChange: (time: string) => void;
    label?: string;
    className?: string;
    minuteOptions?: number[];
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    isdisabled?: boolean;
    error?: string;
};

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
    value,
    onChange,
    label,
    className = "",
    minuteOptions,
    isOpen,
    onOpenChange,
    isdisabled,
    error,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // UI state
    const [uiHour, setUiHour] = useState(12);
    const [uiMinute, setUiMinute] = useState(0);
    const [uiMeridian, setUiMeridian] = useState<"AM" | "PM">("AM");

    // Value ref to hold the 'draft' selection
    const valueRef = useRef({
        hour: 12,
        minute: 0,
        meridian: "AM" as "AM" | "PM",
    });

    // Parse `value` (24-hour HH:mm) when parent updates it
    useEffect(() => {
        if (value) {
            const [hStr, mStr] = value.split(":");
            const h = parseInt(hStr, 10);
            const m = parseInt(mStr, 10);
            const meridian = h >= 12 ? "PM" : "AM";
            const hour = h % 12 === 0 ? 12 : h % 12;

            setUiHour(hour);
            setUiMinute(m);
            setUiMeridian(meridian as "AM" | "PM");
            valueRef.current = { hour, minute: m, meridian };
        }
    }, [value]);

    const formatToEnglish = () => {
        return `${uiHour}:${uiMinute.toString().padStart(2, "0")} ${uiMeridian}`;
    };

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = minuteOptions && minuteOptions.length > 0
        ? minuteOptions
        : Array.from({ length: 60 }, (_, i) => i);

    // Use pointerdown with capture so we detect outside clicks BEFORE other inputs
    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onOpenChange(false);

                // Commit the selected time to parent
                const { hour, minute, meridian } = valueRef.current;
                const finalHour = meridian === "PM"
                    ? (hour % 12) + 12
                    : hour % 12;
                const formatted = `${finalHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                onChange(formatted);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown, true);
        return () => document.removeEventListener('pointerdown', handlePointerDown, true);
    }, [isOpen, onChange, onOpenChange]);

    const handleButtonClick = () => {
        // Toggle
        const willOpen = !isOpen;

        // If we are opening and there is no current value, initialize to 12:00 AM and commit
        if (willOpen && !value) {
            const hour = 12;
            const minute = 0;
            const meridian: "AM" | "PM" = "AM";
            valueRef.current = { hour, minute, meridian };
            setUiHour(hour);
            setUiMinute(minute);
            setUiMeridian(meridian);

            // Commit default 12:00 AM (which in 24-hour is 00:00)
            const formatted = `00:00`;
            onChange(formatted);
        }

        onOpenChange(willOpen);
    };

    const commitChangeToParent = () => {
        const { hour, minute, meridian } = valueRef.current;
        const finalHour = meridian === "PM"
            ? (hour % 12) + 12
            : hour % 12;
        const formatted = `${finalHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        onChange(formatted);
    };

    const handleOptionClick = (
        type: "hour" | "minute" | "meridian",
        val: number | "AM" | "PM"
    ) => {
        if (type === "hour") {
            valueRef.current.hour = val as number;
            setUiHour(val as number);
        } else if (type === "minute") {
            valueRef.current.minute = val as number;
            setUiMinute(val as number);
        } else {
            valueRef.current.meridian = val as "AM" | "PM";
            setUiMeridian(val as "AM" | "PM");
        }

        // Commit immediately so the field shows the selected value even if user clicks another input
        commitChangeToParent();
    };

    return (
        <>
            {label && <label className="flex text-sm font-medium text-[#1A2435]">{label}</label>}
            <div className={`relative ${className}`} ref={containerRef}>
                <button
                    disabled={isdisabled}
                    type="button"
                    onClick={handleButtonClick}
                    className={`w-full border-[1px] rounded-lg pl-[9px] pr-2 py-3 mt-1 text-left focus:outline-none shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)]
    ${error
                            ? "border-red-500 bg-[#fff2f4] text-red-500 placeholder:text-red-400 text-[17px] font-medium"
                            : "border-gray-000 bg-white focus:ring-2 focus:ring-[#526279] text-[17px] font-medium text-[#526279]"
                        }`}
                // style={{ fontWeight: "500", fontSize: "1rem" }}
                >
                    {value ? formatToEnglish() : "Select Time"}
                </button>

                {isOpen && !isdisabled && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md p-3">
                        <div className="flex flex-row gap-4">
                            {/* Hour */}
                            <div className="w-1/3">
                                <div className="text-sm font-medium mb-1 flex justify-center">Hour</div>
                                <ul className="flex flex-col max-h-40 overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white space-y-2 pr-1">
                                    {hours.map((h) => (
                                        <li
                                            key={h}
                                            onClick={() => handleOptionClick("hour", h)}
                                            className={`px-4 py-2 cursor-pointer rounded text-center ${uiHour === h
                                                ? "bg-[#01576A] text-white"
                                                : "hover:bg-blue-100"
                                                }`}
                                        >
                                            {h}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Minute */}
                            <div className="w-1/3">
                                <div className="text-sm font-medium mb-1 flex justify-center">Minute</div>
                                <ul className="flex flex-col max-h-40 overflow-y-scroll scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-white space-y-2 pr-1">
                                    {minutes.map((m) => (
                                        <li
                                            key={m}
                                            onClick={() => handleOptionClick("minute", m)}
                                            className={`px-4 py-2 cursor-pointer rounded text-center ${uiMinute === m
                                                ? "bg-[#01576A] text-white"
                                                : "hover:bg-blue-100"
                                                }`}
                                        >
                                            {m.toString().padStart(2, "0")}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* AM/PM */}
                            <div className="w-1/3">
                                <div className="text-sm font-medium mb-1 flex justify-center">AM / PM</div>
                                <ul className="flex flex-col space-y-2">
                                    {(["AM", "PM"] as Array<"AM" | "PM">).map((mer) => (
                                        <li
                                            key={mer}
                                            onClick={() => handleOptionClick("meridian", mer)}
                                            className={`px-4 py-2 cursor-pointer rounded text-center ${uiMeridian === mer
                                                ? "bg-[#01576A] text-white"
                                                : "hover:bg-blue-100"
                                                }`}
                                        >
                                            {mer}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CustomTimePicker;
