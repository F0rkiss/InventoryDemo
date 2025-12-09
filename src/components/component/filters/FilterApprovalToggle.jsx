import React from 'react';
import PropTypes from 'prop-types';
import FilterStatusToggle from './FilterStatusToggle'; // Pastikan path import benar

// Kita reuse key 'completed' & 'not_completed' biar dapet warna Hijau & Orange otomatis dari komponen induk
const APPROVAL_CYCLE = ['all', 'completed', 'not_completed'];

// const APPROVAL_LABELS = {
//   all: 'Semua',
//   completed: 'Approved',       // is_full_approval = 1 (Hijau)
//   not_completed: 'Process',    // is_full_approval = 0 (Orange)
// };

const APPROVAL_ICONS = {
  all: 'bx bxs-layer text-xl',
  completed: 'bx bxs-check-circle text-xl', // Icon Centang
  not_completed: 'bx bx-time-five text-xl',     // Icon Jam
};

export default function FilterApprovalToggle({ value, onChange, className, disabled }) {
  return (
    <FilterStatusToggle
      value={value}
      onChange={onChange}
      cycle={APPROVAL_CYCLE}
    //   labels={APPROVAL_LABELS}
      iconMap={APPROVAL_ICONS}
      className={className}
      disabled={disabled}
      showText={true} // Opsional: set true jika ingin teks "Approved/Process" muncul di sebelah icon
    />
  );
}

FilterApprovalToggle.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};