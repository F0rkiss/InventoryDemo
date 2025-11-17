import React from 'react';

const CustomCheckBox = ({ label, checked, onChange, disabled = false }) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        {/* Kotak Checkbox Custom */}
        <div className={`
          w-6 h-6 border-2 rounded-md transition-all duration-200 ease-in-out flex items-center justify-center
          ${checked 
            ? 'bg-blue-500 border-blue-500' 
            : 'bg-white border-gray-300 group-hover:border-blue-400'}
        `}>
          {/* Ikon Centang */}
          <svg 
            className={`w-4 h-4 text-white transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth="3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      
      {/* Label */}
      <span className="text-gray-700 font-medium select-none group-hover:text-gray-900">
        {label}
      </span>
    </label>
  );
};

export default CustomCheckBox;