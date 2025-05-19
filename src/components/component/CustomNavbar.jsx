import { Navbar, Link as F7Link } from 'framework7-react'
import React, { useState } from 'react'
import CustomSidebar from './CustomSidebar'
import { useAuth } from '../../auth/AuthContext'

const CustomNavbar = ({title}) => {
  const [openSidebar, setOpenSidebar] = useState(false)
  const {role} = useAuth()

  return (
    <>
      { openSidebar &&
        <CustomSidebar navOpen={openSidebar} setNavOpen={setOpenSidebar} />
      }
      <Navbar bgColor="white" className="shadow-sm !z-10">
          <div className="flex justify-between w-full">
              <span className="flex items-center ios-specific">
                { role &&
                  <button aria-label='sidebar-button' onClick={() => setOpenSidebar(!openSidebar)}>
                    <i className="bx bx-menu text-black text-3xl ms-3"></i>
                  </button>
                }
                  <span className="ml-8 text-black text-xl ios-text font-inter max-w-fit whitespace-nowrap">{title}</span>
              </span>
          </div>
      </Navbar>
      </>
  )
}

export default CustomNavbar