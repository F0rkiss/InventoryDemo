import React from 'react';
import PropTypes from 'prop-types';
import FilterStatusToggle from './FilterStatusToggle';

// Konfigurasi khusus untuk Memo
const MEMO_CYCLE = ['all', 'dynamic', 'manual'];

const MEMO_LABELS = {
  all: 'Semua',
  dynamic: 'Dynamic', // is_dynamic = 1
  manual: 'Manual',   // is_dynamic = 0
};

const MEMO_ICONS = {
  all: 'bx bxs-sort-alt text-xl',
  dynamic: 'bx bxs-zap text-xl',    // Ikon petir
  manual: 'bx bxs-pencil text-xl',  // Ikon pensil
};

export default function FilterMemoStatus({ value, onChange, className, disabled }) {
  return (
    <FilterStatusToggle
      value={value}
      onChange={onChange}
      cycle={MEMO_CYCLE}
      labels={MEMO_LABELS}
      iconMap={MEMO_ICONS}
      className={className}
      disabled={disabled}
    />
  );
}

FilterMemoStatus.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};