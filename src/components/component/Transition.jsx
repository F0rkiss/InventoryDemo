import React from 'react'

function Transition({children , contentVisible}) {
  return (
    <div className={`transition-opacity duration-700 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
        {children}
    </div>
  )
}

export default Transition