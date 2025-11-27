import React from 'react'

/*
  Generic horizontal Tabs component.
  Props:
    items: array of primitives or objects
    active: current selected value
    onChange: function(newValue)
    getLabel: optional mapper (item) -> label string
    getValue: optional mapper (item) -> value primitive
    renderExtra: optional ReactNode appended at right
    className: extra classes for outer wrapper
*/
function Tabs({
  items = [],
  active,
  onChange,
  getLabel,
  getValue,
  renderExtra,
  className = ''
}) {
  const resolveValue = (item) => {
    if (getValue) return getValue(item)
    if (typeof item === 'string' || typeof item === 'number') return item
    return item?.id ?? item?.value ?? item?.name ?? item
  }
  const resolveLabel = (item) => {
    if (getLabel) return getLabel(item)
    if (typeof item === 'string' || typeof item === 'number') return String(item)
    return item?.label ?? item?.name ?? item?.id ?? String(item)
  }

  return (
    <div className={`capitalize border-b mb-4 flex gap-4 overflow-x-auto whitespace-nowrap no-scrollbar ${className}`}>
      {items.map((item) => {
        const val = resolveValue(item)
        const label = resolveLabel(item)
        const isActive = val === active
        return (
          <button
            key={val}
            type="button"
            aria-pressed={isActive}
            aria-label={`Tab ${label}`}
            onClick={() => onChange(val)}
            className={`capitalize px-4 py-2 font-medium transition-colors duration-200 ${
              isActive ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        )
      })}
      {renderExtra}
    </div>
  )
}

export default Tabs
