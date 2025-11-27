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
        <>
          {/* BACKDROP KHUSUS MOBILE (Biar bisa close pas klik luar di mode mobile) */}
          <div 
            className="fixed inset-0 z-40 sm:hidden"
            onClick={() => setOpen(false)}
          ></div>

          {/* CONTAINER CALENDAR */}
          <div
            className="
              /* --- STYLE UNTUK MOBILE (Tengah Layar/Modal) --- */
              fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50
              
              /* --- STYLE UNTUK DESKTOP (Dropdown Bawah Input) --- */
              sm:absolute sm:top-full sm:left-0 sm:translate-x-0 sm:translate-y-0 sm:mt-2
              
              /* --- STYLE UMUM --- */
              bg-white p-3 rounded-lg shadow-lg border
            "
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
        </>
      )}
    </div>
  );
}
