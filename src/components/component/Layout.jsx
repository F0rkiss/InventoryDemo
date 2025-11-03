import React from 'react'
import CustomNavbar from './CustomNavbar'
import { Helmet } from 'react-helmet';

function Layout({title, children}) {
  return (
      
      <div id='layouts' className="bg-gray-100 overflow-y-scroll font-inter h-dvh">
        <CustomNavbar title={title} />
        { children }
      </div>
  )
}

export default Layout