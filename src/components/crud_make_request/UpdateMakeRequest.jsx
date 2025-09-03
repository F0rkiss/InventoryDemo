import React, { useEffect, useState } from 'react'
import { Page, Block } from 'framework7-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/api'
import Back from '../component/Back'
import Layout from '../component/Layout'
import Swal from 'sweetalert2'
import SelectPaginate from '../component/SelectPaginate'
import ModalMR from '../component/modal/ModalMR'
import { DecryptID } from '../../helper/EncryptHelper'
import Transition from '../component/Transition'
import { useAuth } from '../../auth/AuthContext'

function UpdateMakeRequest() {
    const [items, setItems] = useState({
        type_request: null,
        tanggal: '',
    }) 
    const [details, setDetails] = useState([]);
    const { id } = useParams()
    const [decryptedId, setDecryptedId] = useState('')
    const [editIndex, setEditIndex] = useState(null);
    const [initialDetails, setcs] = useState({
        note_barang: null,
        qty: '',
    })
    const [contentVisible, setContentVisible] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const [isUnchanged, setIsUnchanged] = useState(true);
    const { role } = useAuth()
    const navigate = useNavigate()
    const [originalItems, setOriginalItems] = useState(null);
    const [originalDetails, setOriginalDetails] = useState([]);

    useEffect(() => {
        const decryptedIds = DecryptID(id)
            setDecryptedId(decryptedIds)
            if (!decryptedIds) {
                navigate(-1)
        }
    }, [id])

    useEffect(() => {
        if (decryptedId) {
            fetchItem()
        }
    }, [decryptedId])

    useEffect(() => {
    // Ensure original data has been loaded before checking
        if (!originalItems || !originalDetails) {
            return;
        }

        // Compare the 'tanggal' field
        const dateChanged = items.tanggal !== originalItems.tanggal;

        // Compare the 'details' array
        let detailsChanged = false;
        if (details.length !== originalDetails.length) {
            detailsChanged = true;
        } else {
            // If lengths are the same, check if the content of any item has changed
            detailsChanged = details.some((detail, index) => {
                const originalDetail = originalDetails[index];
                return detail.note_barang !== originalDetail.note_barang || detail.qty !== originalDetail.qty;
            });
        }

        // Update the state based on whether any changes were found
        setIsUnchanged(!dateChanged && !detailsChanged);

    }, [items, details, originalItems, originalDetails]);

    const fetchItem = async () => {
        try {
            const url = role === 'admin'
                ? `inventMakeRequest-admin/detail/${decryptedId}`
                : `inventMakeRequest-detail/${decryptedId}`
            const response = await api.get(url);
            const data = response.data.data.makeRequest;
            const fetchedItems = {
                type_request : data.MR?.type_name,
                tanggal : data.MR?.tanggal
            };
            const fetchedDetails = data.detailsMR || [];
            setItems(fetchedItems);
            setDetails(fetchedDetails);
            setOriginalItems(fetchedItems);
            setOriginalDetails(fetchedDetails);
        } catch (error) {
            
        } finally { 
            setTimeout(() => setContentVisible(true), 50)
         }
    };

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
            const response = await api.put(`inventMakeRequest-update/${decryptedId}`, {
                invent_type_request_id: items.type_request?.value,
                tanggal: items.tanggal,
                note_barang: details.map(item => item.note_barang),
                qty: details.map(item => item.qty),
            })
            Swal.fire({
                title: 'Make request berhasil diubah!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            navigate('/make-request/list-make-request')
            resetValue
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Gagal mengubah make request',
                text:'Ada Kesalahan Dalam Sistem'
            })
            console.log(error)
            resetValue
        } finally {
            setDisabled(false)
        }
    }

    const resetValue = () => {
        if (originalItems && originalDetails) {
            setItems(originalItems);
            setDetails(originalDetails);
        } else {
            setItems({ type_request: null, tanggal: '' });
            setDetails([]);
        }
    }

    return (
    <Layout title={'Update Make Request'}>
        <Block>
            <div className='px-4'>
                <Back goHome={() => navigate('/make-request/list-make-request')} />
                <p className='lg:text-3xl text-2xl font-semibold capitalize my-4'>Update Make Request</p>
                <Transition contentVisible={contentVisible}>
                <div className="p-8 bg-white shadow-sm rounded-lg border">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5 space-y-2">
                            <label className='font-semibold'>Type Request</label>
                            <div className='bg-gray-200 p-2 rounded-md border border-gray-300 mt-2'>
                                <input 
                                    type="text" 
                                    name="type_request" 
                                    value={items.type_request} 
                                    onChange={e => setItems({ ...items, type_request: e.target.value })}
                                    className="w-full p-2 placeholder:text-gray-400 placeholder:font-inter placeholder:font-light"
                                    placeholder='Type Request'
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className='font-semibold'>Tanggal</label>
                            <div className='bg-white p-2 rounded-md border border-gray-300 mt-2'>
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
                        </div>
                        <div className="mt-2 pt-3">
                           <p className='text-lg font-semibold'>Detail</p>
                        </div>
                        {/* <div className="bg-white mt-2 rounded-lg p-4"> */}
                            <div className="space-y-3 my-3">
                                {/* This message will show if there are no detail items */}
                                { details.length === 0 ? (
                                    <p className="text-center py-2 text-gray-400">Belum ada data.</p>
                                ) : (
                                    /* This will create a bordered box for each detail item */
                                    details.map((item, id) => (
                                        <div key={id} className="border border-gray-300 rounded-lg p-3 flex justify-between items-center">
                                            {/* Note and Quantity are grouped on the left */}
                                            <span className="font-medium">{item.note_barang}</span>
                                            <span className="font-medium xs:px-3">{item.qty}</span>

                                            {/* Action buttons are on the right */}
                                            <div className="flex space-x-2 border-l-2 ps-3 ml-2">
                                                <button type="button" onClick={e => {
                                                    e.preventDefault();
                                                    setEditIndex(id);
                                                    setInitialDetails(details[id]);
                                                    setOpenModal(true);
                                                }}>
                                                    <i className='bx bx-edit text-xl text-cyan-600'></i>
                                                </button>
                                                <button type="button" onClick={e => {
                                                    e.preventDefault();
                                                    setDetails(details.filter((_, i) => i !== id));
                                                }}>
                                                    <i className='bx bx-trash text-xl text-red-500'></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {/* This is the "Add another detail" button at the bottom */}
                            <div className="flex mt-4">
                                <button
                                    type="button"
                                    className="w-full rounded-lg py-2 px-4 flex items-center font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-color duration-200"
                                    onClick={() => {
                                        setOpenModal(!openModal);
                                        setEditIndex(null);
                                        setInitialDetails({ note_barang: '', qty: '' });
                                    }}>
                                    <i className='bx bx-plus mr-2 font-semibold text-base'></i>
                                    <span>{ details.length === 0 ? 'Tambah detail' : 'Tambah detail lain'}</span>
                                </button>
                            </div>
                        {/* </div> */}
                        <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                            <button disabled={disabled || isUnchanged} type='submit' className='py-2 px-2 rounded-lg font-medium bg-blue-500/85 hover:bg-blue-500 transition-color duration-200 text-white disabled:bg-blue-200'>Update</button>
                            <button className='py-2 px-2 rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600' onClick={resetValue} type='button'>Reset</button>
                        </div>
                    </form>
                </div>
                {
                    openModal && <ModalMR
                    open={openModal}
                    onClose={() => {
                        setOpenModal(false);
                        setEditIndex(null);
                    }}
                    onSave={data => {
                        if (editIndex !== null) {
                            // Edit mode: update record at editIndex
                            setDetails(details.map((item, idx) => idx === editIndex ? data : item));
                        } else {
                            // Add mode: add new data
                            setDetails([...details, data]);
                        }
                        setOpenModal(false);
                        setEditIndex(null);
                    }}
                    initialData={initialDetails}
                    />
                }
                </Transition>
            </div>
        </Block>
    </Layout>
    )
}

export default UpdateMakeRequest;