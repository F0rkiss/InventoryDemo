import React, { useState, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // format backend YYYY-MM-DD
  const formatToISO = (date) => {
    if (!date) return "";
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().split("T")[0];
  };

  // format display dd/mm/yyyy
  const formatDisplay = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("id-ID");
  };

  const parsedValue = value ? new Date(value) : undefined;

  // === CLOSE WHEN CLICK OUTSIDE ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full mt-2">
      {/* INPUT */}
      <input
        readOnly
        placeholder="dd/mm/yyyy"
        value={parsedValue ? formatDisplay(parsedValue) : ""}
        onClick={() => setOpen((prev) => !(prev))}
        className="w-full border border-gray-300 rounded-md p-3 cursor-pointer bg-white"
      />

      {/* POPUP CALENDAR */}
      {open && (
        <div
          className="absolute z-50 mt-2 bg-white p-3 rounded-lg shadow-lg border"
        //   style={{ width: "100%" }}
        >
          <DayPicker
            mode="single"
            selected={parsedValue}
            onSelect={(date) => {
              onChange(formatToISO(date));
              setOpen(false);
            }}
            captionLayout="dropdown"
            fromYear={1900}
            toYear={2100}
          />
        </div>
      )}
    </div>
  );
}
