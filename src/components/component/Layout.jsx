import React from 'react'
import CustomNavbar from './CustomNavbar'
import { Helmet } from 'react-helmet';

function Layout({title, children}) {
  return (
    // <Page className='bg-custom-gray font-inter h-96 !overflow-hidden'>
    //     <CustomNavbar title={title} />
    //     { children }
    // </Page>
    
      <div id='layouts' className="bg-gray-100 overflow-y-scroll font-inter h-screen">
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <CustomNavbar title={title} />
        { children }
      </div>
  )
}

export default Layout