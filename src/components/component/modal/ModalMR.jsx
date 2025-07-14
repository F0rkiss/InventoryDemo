import React, { useEffect, useState } from 'react'
import MiModal from '../MiModal'
import MRExport from '../../../excel/MRExport'
import api from '../../../api/api'
import Swal from 'sweetalert2'

const ModalMR = ({ onClose, onSave, open, initialData }) => {
    const [modalData, setModalData] = useState({
        note_barang : '',
        qty : '',
    })

    React.useEffect(() => {
         if (open) {
            if (initialData) setModalData(initialData);
            else setModalData({ note_barang: '', qty: '' });
        }
    }, [open, initialData])
    if (!open) return null

    const handleSubmit = async(e) => {
        e.preventDefault()
        try {
            if (!modalData.note_barang || !modalData.qty) return
        } catch (error) {
            console.log(error)
        } finally {
            onSave({ ...modalData, qty: parseInt(modalData.qty) })
            setModalData({ note_barang: '', qty: '' })
        }
    }

    return (
        <MiModal
        onClose={onClose}
        contentClass={`max-sm:h-[500px] max-xl:h-[500px] h-[50%]`}
        closeModal={false}
        >
        <div className='content flex-grow flex items-center justify-center w-full relative'>
            <form className='w-full flex flex-col justify-center items-center mb-8' onSubmit={handleSubmit}>
            <p className='text-2xl font-semibold -translate-y-4'>Masukkan Detail Request</p>
            <div className="tgl-pembayaran mb-3 w-[80%]">
                <label>Note Barang</label>
                <div className='bg-white p-2 mt-2 rounded-md border-solid border-gray-300 border font-light font-inter'>
                <input
                    type="text"
                    className='w-full'
                    onChange={e => setModalData({ ...modalData, note_barang: e.target.value })}
                    value={modalData.note_barang}
                    required
                    autoFocus
                />
                </div>
            </div>
            <div className="tgl-pembayaran mb-3 w-[80%]">
                <label>Quantity</label>
                <div className='bg-white p-2 mt-2 rounded-md border-solid border-gray-300 border font-light font-inter'>
                <input
                    type="number"
                    min={1}
                    className='w-full'
                    onChange={e => setModalData({ ...modalData, qty: e.target.value })}
                    value={modalData.qty}
                    required
                />
                </div>
            </div>
            <div className='tombol-hijau flex flex-col w-full justify-center items-center gap-2 mt-3'>
                <button
                type="submit"
                disabled={!modalData.note_barang || !modalData.qty}
                className='bg-green-500 disabled:bg-green-300 text-white max-md:w-[80%] w-[40%] h-10 rounded-lg'
                >
                    Save
                </button>
            </div>
            </form>
        </div>
        </MiModal>
    )
    }

export default ModalMR