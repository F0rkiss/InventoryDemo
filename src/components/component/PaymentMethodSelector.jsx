// src/component/PaymentMethodSelect.jsx
import React from "react";

const methods = ["cash", "e-wallet", "credit"];

export default function PaymentMethodSelect({ value, onChange }) {
  return (
    <div>
      <p className="font-semibold">Metode Pembayaran</p>
      <div className="flex gap-4 mt-2">
        {methods.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            className={`px-8 py-6 rounded-lg border text-center flex-1 transition-colors
              ${
                value === method
                  ? "bg-blue-100 border-blue-400 text-black"
                  : "bg-white border-gray-300 hover:bg-gray-100 text-black"
              }`}
          >
            {method}
          </button>
        ))}
      </div>
    </div>
  );
}
