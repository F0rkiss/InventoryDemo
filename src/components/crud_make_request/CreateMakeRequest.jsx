import React, { useEffect, useState } from 'react'
import { Page, Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import Swal from 'sweetalert2'
import SelectPaginate from '../component/SelectPaginate'
import ModalMR from '../component/modal/ModalMR'

function CreateMakeRequest() {
    const navigate = useNavigate()

    const [items, setItems] = useState({
        type_request: null,
        tanggal: '',
    }) 
    const [details, setDetails] = useState([]);

    const [editIndex, setEditIndex] = useState(null);
    const [initialDetails, setInitialDetails] = useState({
        note_barang: null,
        qty: '',
    })

    const [openModal, setOpenModal] = useState(false)
    const [disabled, setDisabled] = useState(false)

    const handleSubmit = async(e) =>{
        e.preventDefault();
        try {
            if (disabled) {
                return
            }
            setDisabled(true)
            if (!items.type_request || !items.tanggal) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Data belum lengkap',
                    text: 'Silakan lengkapi type request dan tanggal!',
                });
                setDisabled(false);
                return;
            }
            if (details.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Detail kosong',
                    text: 'Tambahkan minimal satu detail barang.',
                });
                setDisabled(false);
                return;
            }
            const response = await api.post('inventMakeRequest-create', {
                invent_type_request_id: items.type_request?.value,
                tanggal: items.tanggal,
                note_barang: details.map(item => item.note_barang),
                qty: details.map(item => item.qty),
            })
            Swal.fire({
                title: 'Make request berhasil dibuat!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            navigate('/make-request/list-make-request')
            resetValue
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak dapat membuat make request',
                text:'Ada Kesalahan Dalam Sistem'
            })
            resetValue
        } finally {
            setDisabled(false)
        }
    }

    const resetValue = () => {
        setItems({ type_request: null, tanggal: '' });
        setDetails([]);
    }

    return (
    <Layout title={'Create Make Request'}>
        <Block>
            <Back goHome={() => navigate('/make-request/list-make-request')} />
            <div className="p-8 m-8 md:m-4 bg-white shadow-sm rounded-lg">
                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label className='font-semibold'>Type Request</label>
                        <SelectPaginate
                            source={'inventTypeRequest'}
                            selectValue={items.type_request}
                            selectName={'Type request'}
                            itemLabel={['name']}
                            handleSelectChange={type_request => setItems({...items, type_request})}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className='font-semibold'>Tanggal</label>
                        <div className='bg-white p-2 rounded-md border border-gray-300 border mt-2'>
                        <input 
                            type="date" 
                            name="tanggal" 
                            value={items.tanggal} 
                            onChange={e => setItems({ ...items, tanggal: e.target.value })}
                            className="w-full p-2 placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                            placeholder='Tanggal'
                            required
                        />
                        </div>
                        {/* <p className='text-xs text-red-500 mt-1 ms-1'>Kode Hanya Boleh 2 Karakter dan Tidak Boleh Nomor</p> */}
                    </div>
                    <div className="bg-white mt-8 rounded-lg shadow-sm border p-6">
                        <div className="text-xl font-semibold mb-4">Detail</div>
                        <table className="w-full mb-4">
                            <tbody>
                                {details.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-4 text-gray-400">No records</td>
                                    </tr>
                                ) : (
                                    details.map((item, id) => (
                                        <tr key={id} className="border-b">
                                            <td className="py-2 px-2 font-semibold">{item.note_barang}</td>
                                            <td className="py-2 px-2 font-semibold">{item.qty}</td>
                                            <td className="flex place-self-end py-2 px-2">
                                                <button type='button' className="ms-2" onClick={() => {
                                                    setInitialDetails(details[id])
                                                    setEditIndex(id)
                                                    setOpenModal(!openModal)
                                                }}><i className='bx bx-edit text-xl text-cyan-600'></i></button>
                                                <button type='button' className="ms-2" onClick={() => {
                                                    setDetails(details.filter((_, i) => i !== id));
                                                }}><i className='bx bx-trash text-xl text-red-500'></i></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <div className="flex justify-center mt-5">
                            <button
                            type="button" 
                            className="text-3xl font-light text-gray-700" 
                            onClick={() => {
                                setOpenModal(!openModal),
                                setEditIndex(null),
                                setInitialDetails({ note_barang: '', qty: ''})
                                }}>
                                <i className='bx bx-plus'></i>
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-center mt-6">
                        <button disabled={disabled} type='submit' className='w-4/12 py-2 rounded-md bg-teal-400 text-white me-2'>Submit</button>
                        <button className='w-4/12 py-2 rounded-md bg-red-400 text-white' onClick={resetValue} type='button'>Reset</button>
                    </div>
                </form>
            </div>
            {
                openModal && <ModalMR
                open={openModal}
                initialData={initialDetails}
                onClose={() => {setOpenModal(false), setEditIndex(null)}}
                onSave={data => {
                    if (editIndex !== null) {
                        // Edit mode: ganti record di posisi editIndex
                        setDetails(details.map((item, idx) => idx === editIndex ? data : item));
                    } else {
                        // Add mode: tambahkan data baru
                        setDetails([...details, data]);
                    }
                    setOpenModal(false)
                    setEditIndex(null)
                }}
                />
            }
        </Block>
    </Layout>
    )
}

export default CreateMakeRequest;