import { Page, Block } from 'framework7-react'
import api from '../../api/api'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import CustomNavbar from '../component/CustomNavbar'
import Loader from '../component/Loader'
import { useNavigate } from 'react-router-dom'
import Transition from '../component/Transition'
import SelectPaginate from '../component/SelectPaginate'
import Back from '../component/Back'
import Layout from '../component/Layout'
import { DecryptID } from '../../helper/EncryptHelper'
import Swal from 'sweetalert2'

function UpdateDepartment() {
    const {id} = useParams()
    const [items, setItems] = useState({
        name : '',
        divisi : null,
    })
    const navigate = useNavigate()
    const [contentVisible, setContentVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [decryptedId, setDecryptedId] = useState('')
    const [disabled, setDisabled] = useState(false)

    useEffect(() => {
        const decryptedIds = DecryptID(id)
        setDecryptedId(decryptedIds)
        if (!decryptedIds) {
            navigate(-1)
        }
    }, [id])

    useEffect(() => {
        if (decryptedId) {
            fetchItems()
        }
    }, [decryptedId])
    
    const fetchItems = async() => {
        try {
            setLoading(true)
            const response = await api.get(`/department/${decryptedId}`)
            const data = response.data.data
            setItems({
                name : data.name,
                divisi : data.divisi ? {value : data.divisi?.id , label : data.divisi?.name} : null
            })  
        } catch (error) {
            
        } finally {
            setLoading(false)
            setTimeout(() => setContentVisible(true), 50)
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (disabled) {
                return
            }
            setDisabled(true)
            const response = await api.put(`/department/${decryptedId}`, {
                name : items.name,
                divisi_id : items.divisi?.value
            })
            const data = response.data.data
            navigate('/department/list-department')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Mengubah Status MR',
                text:'Ada Kesalahan Dalam Sistem'
            })
        } finally {
            setDisabled(false)
        }
    }

    const goHome = () => {
        navigate('/department/list-department')
    }
    
  return (
    <Layout title={'Update Department'}>
        {loading && <Loader Class={'translate-y-40'} />}
            <Transition contentVisible={contentVisible}>
                <Block>
                    <Back goHome={goHome} />
                        <div className="bg-white shadow-sm p-3 rounded-md mt-3">
                            <form onSubmit={handleSubmit}>
                            <label>Divisi</label>
                            <SelectPaginate 
                            handleSelectChange={divisi => ({...items, divisi})}
                            source={'divisi'}
                            selectName={'Divisi'}
                            selectValue={items.divisi || null}
                            itemLabel={['name']}
                            required={true}
                            />
                            <div className="mt-3">
                                <label>Nama Department</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                                <input 
                                    type="text" 
                                    name="Nama" 
                                    value={items.name || ''} 
                                    onChange={e => setItems({ ...items, name: e.target.value })}
                                    className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                    maxLength={40}
                                    placeholder='Nama Kategori'
                                    required
                                />
                                </div>
                            </div>
                            <div className="flex mt-4">
                            <button disabled={disabled} type="submit" className="bg-cyan-400 text-white p-2 rounded">Update Item</button>
                            <button type='button' onClick={fetchItems} className="bg-red-500 text-white p-2 rounded ms-3">Reset</button>
                            </div>
                            </form>
                        </div>
                </Block>
            </Transition>
    </Layout>
  )
}

export default UpdateDepartment