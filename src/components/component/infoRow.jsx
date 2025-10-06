import React from 'react';

function InfoRow({ label, value }) {
    return (
        <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0">
            <span className="text-gray-500 break-words">{label}</span>
            <span className="font-medium break-words">{value || '-'}</span>
        </div>
    );
}

export default InfoRow;
