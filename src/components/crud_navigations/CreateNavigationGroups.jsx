import React, {useEffect, useState} from 'react'
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { Page, Block } from 'framework7-react';
import { accessOptions, findAccessOption } from '../../helper/FindOptions';
import SelectPaginate from '../component/SelectPaginate';
import Select from 'react-select';
import Back from '../component/Back';
import Layout from '../component/Layout';
import Swal from 'sweetalert2';

function CreateNavigationGroups() {
    const [items, setItems] = useState({
        role : null,
        navigation_menu : null,
        create_access : null,
        read_access : null,
        update_access : null,
        delete_access : null,
    })

    const [disabled, setDisabled] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (disabled) {
                return
            }
            setDisabled(true)
            await api.post('inventNavigationGroup-create', {
                role_id : items.role?.value,
                invent_navigation_menus_id : items.navigation_menu?.value,
                read_access : items.read_access?.value,
                create_access : items.create_access?.value,
                update_access : items.update_access?.value,
                delete_access : items.delete_access?.value
            })
            Swal.fire({
                title: 'Navigations Group berhasil dibuat!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            navigate('/navigations/list-navigations')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak dapat membuat navigations group',
                text:'Kesalahan dalam sistem'
            })
            setError(error.response.data)
        } finally {
            setDisabled(false)
        }
    }

    const clearAll = () => {
        setItems({
            role : null,
            navigation_menu : null,
            create_access : null,
            read_access : null,
            update_access : null,
            delete_access : null,
        })
    }
  return (
    <div>
        <Layout title={'Create Navigation Group'}>
            <Block>
                <Back goHome={() => navigate('/navigations/list-navigations')}/>
                <div className='bg-white rounded shadow-sm p-3'>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label className='font-semibold'>Role </label>
                            <SelectPaginate
                                className={'p-2 rounded-md border-solid border-gray-500 border'}
                                source={'inventRole'}
                                selectValue={items.role}
                                selectName={'Role'}
                                itemLabel={['name']}
                                handleSelectChange={role => setItems({...items, role})}
                                required
                            />
                        </div>
                        <div className="mb-5 g-4">
                            <label className='font-semibold'>Navigation Menu </label>
                            <SelectPaginate
                                source={'inventNavigationMenu'}
                                selectValue={items.navigation_menu}
                                selectName={'Navigation Menu'}
                                itemLabel={['name']}
                                handleSelectChange={navigation_menu => setItems({...items, navigation_menu})}
                                required
                            />
                        </div>
                        <div className="mb-5">
                            <label className='font-semibold'>Read Access:</label>
                            <Select 
                                options={accessOptions} 
                                value={items.read_access}
                                placeholder="Pilih Akses Read" 
                                onChange={read_access => setItems({ ...items, read_access })}
                                required
                            />
                        </div>
                        <div className="mb-5">
                            <label className='font-semibold'>Create Access:</label>
                            <Select 
                                options={accessOptions} 
                                value={items.create_access}
                                placeholder="Pilih Akses Create" 
                                onChange={create_access => setItems({ ...items, create_access })}
                                required
                            />
                        </div>
                        <div className="mb-5">
                            <label className='font-semibold'>Update Access:</label>
                            <Select 
                                options={accessOptions} 
                                value={items.update_access}
                                placeholder="Pilih Akses Update"
                                onChange={update_access => setItems({ ...items, update_access })}
                                required
                            />
                        </div>
                        <div className="mb-5">
                            <label className='font-semibold'>Delete Access:</label>
                            <Select 
                                options={accessOptions} 
                                value={items.delete_access}
                                placeholder="Pilih Akses Delete"
                                onChange={delete_access => setItems({ ...items, delete_access })}
                                required
                            />
                        </div>
                        <div className="flex">
                            <button disabled={disabled} type="submit" className="bg-cyan-400 text-white p-2 rounded w-1/2 me-3">Create</button>
                            <button type="button" onClick={clearAll} className="bg-red-400 text-white p-2 rounded w-1/2">Clear</button>
                        </div>
                    </form>
                </div>
            </Block>
        </Layout>
    </div>
  )
}

export default CreateNavigationGroups;