import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

// Definisikan siklus, label, warna, dan ikon untuk Aset
const DEFAULT_CYCLE = ['all', 'ya', 'tidak']

const DEFAULT_LABELS = {
  all: 'Filter',
  ya: 'Aset',
  tidak: 'Non Aset',
}

// Map ikon (Boxicons)
const DEFAULT_ICON_MAP = {
  all: 'bx bx-filter text-xl',
  ya: 'bx bxs-building text-xl', // Ikon untuk Aset (bangunan)
  tidak: 'bx bxs-box text-xl', // Ikon untuk Non-Aset (kotak)
}

// Map warna
const statusToClass = (status) => {
  switch (status) {
    case 'ya':
      // Biru untuk Aset
      return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300'
    case 'tidak':
      // Oranye untuk Non-Aset
      return 'bg-orange-100 text-xs text-orange-700 hover:bg-orange-200 border-orange-300'
    default:
      // Standar untuk "Semua"
      return 'bg-white text-gray-700 hover:bg-gray-50'
  }
}

/**
 * Komponen tombol cycling untuk memfilter berdasarkan status aset (all, ya, tidak).
 */
export default function FilterAssetToggle({
  value,
  onChange,
  cycle = DEFAULT_CYCLE,
  disabled = false,
  className = '',
  labels = DEFAULT_LABELS,
  iconMap = DEFAULT_ICON_MAP,
  'data-testid': dataTestId,
}) {
  // Tentukan nilai berikutnya dalam siklus
  const nextValue = useMemo(() => {
    const idx = cycle.indexOf(value)
    return cycle[(idx + 1) % cycle.length]
  }, [cycle, value])

  const handleClick = () => {
    if (!disabled) onChange(nextValue)
  }

  const title = labels[value] || value
  const iconClassName = iconMap[value] ?? iconMap.all

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={value !== 'all'}
      onClick={handleClick}
      disabled={disabled}
      data-testid={dataTestId}
      className={`px-4 py-3 w-fit text-left text-sm font-medium border rounded-full flex justify-center items-center gap-2 transition-colors duration-200
                  ${statusToClass(value)} ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      } ${className}`}
    >
      <i className={iconClassName}></i>
      {/* Teks sekarang selalu ditampilkan, sesuai permintaan Anda */}
      <span>{labels[value] || value}</span>
    </button>
  )
}

FilterAssetToggle.propTypes = {
  value: PropTypes.oneOf(['all', 'ya', 'tidak']).isRequired,
  onChange: PropTypes.func.isRequired,
  cycle: PropTypes.arrayOf(PropTypes.oneOf(['all', 'ya', 'tidak'])),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  labels: PropTypes.shape({
    all: PropTypes.string,
    ya: PropTypes.string,
    tidak: PropTypes.string,
  }),
  iconMap: PropTypes.object,
  'data-testid': PropTypes.string,
}