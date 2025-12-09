import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_CYCLE = ['all', 'completed', 'not_completed'];

const statusToClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300';
    case 'not_completed':
      return 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300';
    default:
      return 'bg-white text-gray-700 hover:bg-gray-50';
  }
};

// Icon map (Boxicons)
const DEFAULT_ICON_MAP = {
  all: 'bx bxs-layer text-xl',
  completed: 'bx bxs-check-circle text-xl',
  not_completed: 'bx bx-time-five text-xl',
};

export default function FilterStatusToggle({
  value,
  onChange,
  cycle = DEFAULT_CYCLE,
  disabled = false,
  className = '',
  showText = false,
  // labels = { all: 'Semua', completed: 'Selesai', not_completed: 'Belum Selesai' },
  iconMap = DEFAULT_ICON_MAP, // <-- you can override if needed
  'data-testid': dataTestId,
}) {
  const nextValue = useMemo(() => {
    const idx = cycle.indexOf(value);
    return cycle[(idx + 1) % cycle.length];
  }, [cycle, value]);

  const handleClick = () => {
    if (!disabled) onChange(nextValue);
  };

  // const title = `Filter: ${labels[value] || value}`;
  const iconClassName = iconMap[value] ?? iconMap.all;

  return (
      <button
        type="button"
        // title={title}
        // aria-label={title}
        aria-pressed={value !== 'all'}
        onClick={handleClick}
        disabled={disabled}
        data-testid={dataTestId}
        className={`px-4 py-3 w-fit h-fit border rounded-full flex justify-center items-center gap-2 transition-colors duration-200
                    ${statusToClass(value)} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      >
        <i className={iconClassName}></i>
        {/* {showText && <span>{labels[value] || value}</span>} */}
      </button>
  );
}

FilterStatusToggle.propTypes = {
  value: PropTypes.oneOf(['all', 'completed', 'not_completed']).isRequired,
  onChange: PropTypes.func.isRequired,
  cycle: PropTypes.arrayOf(PropTypes.oneOf(['all', 'completed', 'not_completed'])),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  showText: PropTypes.bool,
  // labels: PropTypes.shape({
  //   all: PropTypes.string,
  //   completed: PropTypes.string,
  //   not_completed: PropTypes.string,
  // }),
  iconMap: PropTypes.object,
};
