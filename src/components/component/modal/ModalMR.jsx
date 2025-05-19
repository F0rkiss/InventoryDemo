import React, { useEffect, useState } from 'react'
import MiModal from '../MiModal'
import MRExport from '../../../excel/MRExport'
import api from '../../../api/api'
import Swal from 'sweetalert2'

const ModalMR = ({onClose}) => {
    const [closeModal, setCloseModal] = useState(false)
    const [dateRange, setDateRange] = useState({
        tgl_awal : '',
        tgl_akhir : '',
    })
    const [disableRange, setDisableRange] = useState(false)
    const [disableSubmit, setDisableSubmit] = useState(false)

    const tanggalAwal = new Date(dateRange.tgl_awal)
    const tanggalAkhir = new Date(dateRange.tgl_akhir)

    useEffect(() => {
        if (tanggalAwal >= tanggalAkhir) {
            setDisableRange(true)
        } else {
            setDisableRange(false)
        }
    }, [dateRange])


    const handleRange = async(e) => {
        e.preventDefault()
        try {
            setDisableSubmit(true)
            const response = await api.post(`getSheetMakeRequest`, {
                'start' :  dateRange.tgl_awal,
                'end' :  dateRange.tgl_akhir,
            })
            const data = response.data.data
            MRExport(data)
            setDisableSubmit(false)
            setCloseModal(true)
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Ada Kesalahan Dalam Sistem',
                text: 'Coba Lagi Nanti'
            })
        }
    }

  return (
    <MiModal onClose={onClose} contentClass={`max-sm:h-[500px] max-xl:h-[1000px] h-[50%]`} closeModal={closeModal}>
        <div className='shadow-sm bg-white pt-2 '>
            <p className='text-xl font-semibold text-hitam-mi pb-2 text-center'>Export To Excel</p>
        </div>
        <div className='content flex-grow flex items-center justify-center w-full relative'>
            <form className='w-full flex flex-col justify-center items-center mb-8' onSubmit={handleRange}>
                <p className='text-2xl font-semibold -translate-y-4'>Pilih rentang tanggal </p>
                <div className="tgl-pembayaran mb-3 w-[80%]">
                    <label>Tanggal Awal</label>
                    <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-gray-400 font-light font-inter'>
                        <input 
                        type="date"
                        className='w-full '
                        onChange={e => setDateRange({...dateRange, tgl_awal : e.target.value})}
                        value={dateRange.tgl_awal || ''}
                        required
                        />
                    </div>
                </div>
                <div className="tgl-pembayaran mb-3 w-[80%]">
                    <label>Tanggal Akhir</label>
                    <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-gray-400 font-light font-inter'>
                        <input 
                        type="date"
                        className='w-full '
                        onChange={e => setDateRange({...dateRange, tgl_akhir : e.target.value})}
                        value={dateRange.tgl_akhir || ''}
                        required
                        />
                    </div>
                </div>
                { disableRange &&
                    <p className='text-red-500 max-xs:text-[10px] text-xs'>* Tanggal Awal Tidak Boleh Lebih Awal Dengan Tanggal Akhir !!</p>
                }
                <div className='tombol-hijau flex flex-col w-full justify-center items-center gap-2 mt-3'>
                    <button disabled={disableRange || disableSubmit} className='bg-green-400 disabled:bg-green-300 text-white max-md:w-[80%] w-[40%] h-8 rounded-lg'>Export Excel</button>
                </div>
            </form>
        </div>
    </MiModal>
  )
}

export default ModalMR