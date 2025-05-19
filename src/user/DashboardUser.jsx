import React from 'react'
import { useNavigate } from 'react-router-dom'

function DashboardUser() {

  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('authToken')
    navigate('/login')
    
  }
  return (
    
    <div>DashboardUser
      <button onClick={logout} className='text-lg bg-coklat-mi text-white'>Logout</button>
    </div>
  )
}

export default DashboardUser