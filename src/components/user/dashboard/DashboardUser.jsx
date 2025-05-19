import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../component/Layout'
import logo from '../../../assets/image/baru.png'
import { Block } from 'framework7-react'
import api from '../../../api/api'
import { useAuth } from '../../../auth/AuthContext'
import barangIcon from '../../../assets/image/dashboard-image/package-regular-120.png'
import mrIcon from '../../../assets/image/dashboard-image/message-add-regular-120.png'
import Loader from '../../component/Loader'
import Transition from '../../component/Transition'

function DashboardUser() {

  const [items, setItems] = useState({})
  const [loading, setLoading] = useState(false)
  const [contentVisible, setContentVisible]= useState(false)
  const {name} = useAuth()

  useEffect(() => {
    fetchItems();
  }, [])

  const fetchItems = async () => {
    try {
    setLoading(true)
    const response = await api.get('dashboard/user')
    const data = response.data
    setItems(data)
    } catch (error) {
      
    } finally {
      setLoading(false)
      setTimeout(() => setContentVisible(true), 50)
    }
  }

  return (
    
    <Layout title={'Dashboard'}>
      <Block>
        <div className='flex flex-col items-center justify-center  text-xl font-extrabold'>
          <p>INVENTORY</p>
          <img src={logo} className='max-w-48 pb-3 mt-3'/>
        </div>

        <div className='my-3 mx-3'>
          <p className='font-bold text-xl'>Welcome!</p>
          <p className='text-xl font-light capitalize overflow-hidden whitespace-nowrap text-ellipsis'>{name}</p>
        </div>
        <div className="bg-white rounded-md shadow-md px-1 py-3">
        { !loading ?
          <Transition contentVisible={contentVisible}>
            <div className='grid gap-2'>
              <div className="barang bg-blue-500 rounded-full overflow-hidden  flex justify-between">
                <div className="counter text-white text-center w-28 flex-col flex justify-center items-center pb-1">
                  <p className='font-bold text-xl translate-y-1 max-w-20 whitespace-nowrap text-ellipsis overflow-hidden text-center '>{items.barang}</p>
                  <p className='font-bold text-xs'>Barang</p>
                </div>
                <div className="icons">
                  <img src={barangIcon} className='opacity-50 max-w-16 me-2' alt="" />
                </div>
              </div>
              <div className="make-request bg-slate-500 rounded-full overflow-hidden flex justify-between">
              <div className="counter text-white text-center w-28 flex-col flex justify-center items-center pb-1">
                  <p className='font-bold text-xl translate-y-1 max-w-24 whitespace-nowrap text-ellipsis overflow-hidden text-center'>{items.makerequest}</p>
                  <p className='font-bold whitespace-nowrap text-xs ms-2'>Make Request</p>
                </div>
                <div className="icons">
                  <img src={mrIcon} className='opacity-50 max-w-16 p-1 me-2' alt="" />
                </div>
              </div>
             </div>
            </Transition>
          : <Loader/>
          }
          </div>
      </Block>
    </Layout>

  )
}

export default DashboardUser