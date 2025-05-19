import { Page, Block } from 'framework7-react'
import api from '../../api/api'
import React, { useState } from 'react'
import CustomNavbar from '../component/CustomNavbar'
import Loader from '../component/Loader'
import { useNavigate } from 'react-router-dom'
import Transition from '../component/Transition'
import SelectPaginate from '../component/SelectPaginate'
import Back from '../component/Back'
import Swal from 'sweetalert2'

function UpdateDepartment() {

    const [items, setItems] = useState({
        name : '',
        divisi : null,
    })
    const [disabled, setDisabled] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (disabled) {
                return
            }
            setDisabled(true)
            const response = await api.post(`/department`, {
                name : items.name,
                divisi_id : items.divisi?.value
            })
            const data = response.data.data
            navigate('/department/list-department')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Membuat Department',
                text:'Ada Kesalahan Dalam Sistem'
            })
        } finally {
            setDisabled(false)
        }
    }

    const goHome = () => {
        navigate('/department/list-department')
    }

    const reset = () => {
        setItems({
            name : '',
            divisi : null
        })
    }
  return (
    <Page className='bg-custom-gray font-inter'>
        <CustomNavbar title={'Create Department'}/>
            <Block>
                <Back goHome={goHome} />
                <div className="bg-white shadow-sm p-3 rounded-md mt-3">
                    <form onSubmit={handleSubmit}>
                        <label>Divisi</label>
                        <SelectPaginate
                            source={'divisi'}
                            selectName={'Divisi'}
                            itemLabel={['name']}
                            handleSelectChange={divisi => setItems({...items, divisi})}
                            />
                        <div className="mt-3">
                            <label>Nama Department</label>
                            <div className='bg-white p-2 rounded-md border-solid border-gray-300 border'>
                            <input 
                                type="text" 
                                name="Nama" 
                                value={items.name} 
                                onChange={e => setItems({ ...items, name: e.target.value })}
                                className="w-full p-2 border rounded placeholder:text-gray-400 placeholder:font-inter placeholder:font-light "
                                maxLength={40}
                                placeholder='Nama Kategori'
                                required
                            />
                            </div>
                        </div>
                        <div className="flex mt-4">
                            <button disabled={disabled} type="submit" className="bg-cyan-400 text-white p-2 rounded">Create Department</button>
                            <button type='button' onClick={reset} className="bg-red-500 text-white p-2 rounded ms-3">Reset</button>
                        </div>
                    </form>
                </div>
            </Block>
    </Page>
  )
}

export default UpdateDepartment