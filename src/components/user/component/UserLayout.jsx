import { Page } from 'framework7-react'
import React from 'react'
import UserNavbar from './UserNavbar'
const UserLayout = ({title, children}) => {
  return (
    <Page className='bg-custom-gray font-inter'>
      <UserNavbar title={title} />
      { children }
    </Page>
  )
}

export default UserLayout