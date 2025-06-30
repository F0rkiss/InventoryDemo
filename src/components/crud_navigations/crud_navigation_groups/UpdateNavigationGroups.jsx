import React, {useEffect, useState} from 'react'
import api from '../../../api/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Page, Block } from 'framework7-react';
import SelectPaginate from '../../component/SelectPaginate';
import { DecryptID } from '../../../helper/EncryptHelper';
import Select from 'react-select';
import Transition from '../../component/Transition';
import { accessOptions, findAccessOption } from '../../../helper/FindOptions';
import Back from '../../component/Back';
import Layout from '../../component/Layout';
import Swal from 'sweetalert2';

function UpdateNavigationGroups() {
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
    const [loading, setLoading] = useState(false)
    const [decryptedId, setDecryptedId] = useState('')
    const [contentVisible, setContentVisible] = useState(false)
    const navigate = useNavigate();
    const { id } = useParams();

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

    const fetchItems = async () => {
        try {
            const response = await api.get(`inventNavigationGroup-detail/${decryptedId}`)
            const data = response.data.data;
            setItems({
                role: data.role ? { 
                    value: data.role.id, label: data.role.name } : null,
                navigation_menu: data.navigation_menu ? { 
                    value: data.navigation_menu.id, label: data.navigation_menu.name } : null,
                create_access: findAccessOption(data.create_access),
                read_access: findAccessOption(data.read_access),
                update_access: findAccessOption(data.update_access),
                delete_access: findAccessOption(data.delete_access)
            })
        } catch (error) {
            // console.error('Error fetching items:', error);
        } finally { setTimeout(() => setContentVisible(true), 50) }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (disabled) {
                return
            }
            setDisabled(true)
            await api.put(`inventNavigationGroup-update/${decryptedId}`, {
                role_id : items.role?.value,
                invent_navigation_menus_id : items.navigation_menu?.value,
                read_access : items.read_access?.value,
                create_access : items.create_access?.value,
                update_access : items.update_access?.value,
                delete_access : items.delete_access?.value
            })
            Swal.fire({
                title: 'Berhasil diubah!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            navigate('/navigations/list-navigations')
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak dapat mengubah navigations group',
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
        <Layout title={'Update Navigation Group'}>
            <Block>
                <Back goHome={() => navigate('/navigation-groups/list-navigation-groups')}/>
                <Transition contentVisible={contentVisible}>
                    <div className='bg-white rounded shadow-sm p-3'>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-5">
                                <label>Role </label>
                                <SelectPaginate
                                    selectValue={items.role}
                                    source={'role'}
                                    selectName={'Role'}
                                    itemLabel={['name']}
                                    handleSelectChange={role => setItems({...items, role})}
                                    required
                                />
                            </div>
                            <div className="mb-5">
                                <label>Navigation Menu </label>
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
                                <label>Read Access:</label>
                                <Select 
                                    options={accessOptions} 
                                    value={items.read_access} 
                                    onChange={read_access => setItems({ ...items, read_access })}
                                    placeholder='Select Read Access'
                                    required
                                />
                            </div>
                            <div className="mb-5">
                                <label>Create Access:</label>
                                <Select 
                                    options={accessOptions} 
                                    value={items.create_access} 
                                    onChange={create_access => setItems({ ...items, create_access })}
                                    placeholder='Select Create Access'
                                    required
                                />
                            </div>
                            <div className="mb-5">
                                <label>Update Access:</label>
                                <Select 
                                    options={accessOptions} 
                                    value={items.update_access} 
                                    onChange={update_access => setItems({ ...items, update_access })}
                                    placeholder='Select Update Access'
                                    required
                                />
                            </div>
                            <div className="mb-5">
                                <label>Delete Access:</label>
                                <Select 
                                    options={accessOptions} 
                                    value={items.delete_access} 
                                    onChange={delete_access => setItems({ ...items, delete_access })}
                                    placeholder='Select Delete Access'
                                    required
                                />
                            </div>
                            <div className="flex">
                                <button disabled={disabled} type="submit" className="bg-cyan-400 text-white p-2 rounded w-1/2 me-3">Update</button>
                                <button type="button" onClick={clearAll} className="bg-red-400 text-white p-2 rounded w-1/2">Clear</button>
                            </div>
                        </form>
                    </div>
                </Transition>
            </Block>
        </Layout>
    </div>
  )
}

export default UpdateNavigationGroups;