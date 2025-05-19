import { Navbar, Link as F7Link } from 'framework7-react'
import React, { useState } from 'react'
import UserSidebar from './UserSidebar'

const UserNavbar = ({title}) => {
  const [openSidebar, setOpenSidebar] = useState(false)

  return (
    <>
      <Navbar bgColor="white" className="shadow-sm !z-10">
          <div className="flex justify-between w-full">
              <span className="flex items-center ios-specific">
                  <button onClick={() => setOpenSidebar(!openSidebar)}>
                    <i className="bx bx-menu text-black text-3xl ms-3"></i>
                  </button>
                  <span className="ml-8 text-black text-xl ios-text font-inter max-w-fit whitespace-nowrap">{title}</span>
              </span>
          </div>
      </Navbar>
      { openSidebar &&
        <UserSidebar navOpen={openSidebar} setNavOpen={setOpenSidebar} />
      }
      </>
  )
}

export default UserNavbar