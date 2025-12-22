import React, { forwardRef, useEffect, useRef, useState } from 'react'
import InfoRow from '../infoRow';

const ApprovalStepMemoCard = forwardRef(({item, from, goToDetail, canUpdate, canDelete, goToUpdate, deleteItems}, ref) => {
    const [open, setOpen] = useState(false);
    const popRef = useRef(null);

    // close on outside click / ESC
    useEffect(() => {
      const onDown = (e) => {
        if (popRef.current && !popRef.current.contains(e.target)) setOpen(false);
      };
      const onKey = (e) => e.key === 'Escape' && setOpen(false);
      document.addEventListener('mousedown', onDown);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', onDown);
        document.removeEventListener('keydown', onKey);
      };
    }, []);

    return (
       <div
        className="relative rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[200px]"
        ref={ref}
      >
        {/* Header */}
        <div className="grid grid-cols-3 mb-3 border-b items-center pb-2">
          <div className="col-start-1 col-span-2">
            <p className="font-bold text-xl capitalize leading-tight">{item.username || item.user?.EmpName || item.EmpName}</p>
            <p className="font-medium">{item.is_upline ? 'Atasan' : 'Bukan Atasan Langsung'}</p>
          </div>
          <button
                className="detail-button col-start-3 justify-self-end"
                onClick={() => setOpen(true)}
                title="User Info"
              >
                <i className="bx bx-dots-vertical-rounded text-2xl group-hover:text-gray-800 transition-all duration-200" />
              </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-gray-500">Note</span>
            <p className="text-sm font-medium text-right max-w-[60%] break-words">
              {item.note || 'Belum Ditentukan'}
            </p>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-gray-500">Approval Step</span>
            <p className="text-sm font-medium text-right max-w-[60%] break-words">
              {item.approval_step || 'Belum Ditentukan'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 mt-3">
            <button className="px-3 py-1.5 update-button" onClick={() => goToUpdate(item.id)}>
              Update
            </button>
            <button
              onClick={() => deleteItems(item.id)}
              className="px-3 py-1.5 delete-button"
            >
              Delete
            </button>
        </div>

        {/* Popover (centered over the card) */}
        {open && (
          <div
            ref={popRef}
            className="absolute self-end z-20 flex justify-end"
          >
            <div className="w-72 border border-gray-300 bg-white p-4 rounded-lg shadow-lg space-y-2">
              <Row label="Name" value={item.user?.EmpName || item.EmpName} />
              <Row label="Email" value={item.user?.email || item.email} />
            </div>
          </div>
        )}
      </div>
    );
})

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <span className="col-span-1 text-sm text-gray-500">{label}</span>
      <span className="col-span-2 text-sm font-medium text-gray-900 break-words text-right">
        {value}
      </span>
    </div>
  );
}

export default ApprovalStepMemoCard
