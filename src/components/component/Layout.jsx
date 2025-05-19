import React from 'react'
import CustomNavbar from './CustomNavbar'

function Layout({title, children}) {
  return (
    // <Page className='bg-custom-gray font-inter h-96 !overflow-hidden'>
    //     <CustomNavbar title={title} />
    //     { children }
    // </Page>
      <div id='layouts' className="bg-custom-gray overflow-y-scroll font-inter h-screen">
        <CustomNavbar title={title} />
        { children }
      </div>
  )
}

export default Layout