import React, { useState, useEffect, useRef } from "react";

export default function YearPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Generate range tahun (misal: 10 tahun ke belakang - 10 tahun ke depan dari tahun ini)
  // Bisa disesuaikan sesuai kebutuhan project
  const currentYear = new Date().getFullYear();
  const startYear = 2000;
  const years = [];
  for (let i = startYear; i <= currentYear; i++) {
    years.push(i);
  }

  // === CLOSE WHEN CLICK OUTSIDE ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
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

  // Handle pilih tahun
  const handleSelectYear = (year) => {
    onChange(year);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* INPUT (Tampilan mirip DatePicker) */}
      <div 
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-300 rounded-md p-3 cursor-pointer bg-white flex justify-between items-center hover:border-green-500 transition-colors"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
            {value || "Pilih Tahun"}
        </span>
        <i className="bx bx-calendar text-gray-500 text-lg"></i>
      </div>

      {/* POPUP YEAR SELECTOR */}
      {open && (
        <>
          {/* BACKDROP MOBILE */}
          <div 
            className="fixed inset-0 z-40 sm:hidden overflow-hidden"
            onClick={() => setOpen(false)}
          ></div>

          {/* CONTAINER POPUP */}
          <div
            className="
              /* Style Mobile (Tengah Layar) */
              fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-[300px]
              
              /* Style Desktop (Dropdown Bawah) */
              sm:absolute sm:top-full sm:left-0 sm:translate-x-0 sm:translate-y-0 sm:mt-2 sm:w-full
              
              /* Style Umum */
              bg-white p-2 rounded-lg shadow-xl border border-gray-200 max-h-[300px] overflow-y-auto
            "
          >
            {/* GRID TAHUN */}
            <div className="grid grid-cols-3 gap-2">
                {years.map((year) => (
                    <button
                        key={year}
                        type="button"
                        onClick={() => handleSelectYear(year)}
                        className={`
                            py-2 px-1 rounded-md text-sm font-medium transition-colors
                            ${parseInt(value) === year 
                                ? 'bg-green-600 text-white shadow-md' 
                                : 'text-gray-700 hover:bg-green-50'
                            }
                        `}
                    >
                        {year}
                    </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}