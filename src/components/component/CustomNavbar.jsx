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
      <Navbar bgColor="white" className="border-b-2 border-gray-400/20 !z-10">
          <div className="flex justify-between w-full">
              <span className="flex items-center ios-specific">
                { role &&
                  <button aria-label='sidebar-button' onClick={() => setOpenSidebar(!openSidebar)}>
                    <i className="bx bx-menu-alt-left text-black text-3xl ms-4"></i>
                  </button>
                }
                  <span className="ml-8 text-black text-xl ios-text font-inter max-w-fit whitespace-nowrap">{title}</span>
              </span>
          </div>

          <div>
            <button>
              <i className='bx  bx-bell text-2xl pr-8'  ></i> 
            </button>
          </div>
      </Navbar>

      
      </>
  )
}

export default CustomNavbar