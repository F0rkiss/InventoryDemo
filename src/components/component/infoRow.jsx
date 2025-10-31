import React from 'react';

function InfoRow({ label, value, showInfo = false, infoText = "" }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0">
      <div className="flex items-start sm:items-center gap-1 relative group">
        <span className="text-gray-500 break-words">{label}</span>
        {showInfo && (
          <>
            <i className="bx bx-info-circle text-yellow-500 cursor-pointer text-base"></i>
            <div className="absolute left-0 top-full sm:left-full sm:top-1/2 sm:-translate-y-1/2 mt-1 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-500 group-hover:delay-0 bg-white border border-gray-300 text-gray-700 text-xs rounded-md px-2 py-1 max-w-[14rem] sm:w-56 shadow-sm pointer-events-none z-10">
              {infoText}
            </div>
          </>
        )}
      </div>

      <span className="font-medium break-words">{value || '-'}</span>
    </div>
  );
}

export default InfoRow;
