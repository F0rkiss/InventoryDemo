    import React, { useEffect, useState } from 'react'
    import MiModal from '../MiModal'
    import SelectPaginate from '../SelectPaginate'
    import api from '../../../api/api'
    import BarangExport from '../../../excel/BarangExport'
    import HistoryExport from '../../../excel/HistoryExport'
    import Swal from 'sweetalert2'
    import Loader from '../../component/Loader'

    const ModalBarang = ({onClose}) => {

        const [page, setPage] = useState(0)
        const [pageZero, setPageZero] = useState(false)
        const [section, setSection] = useState(null)
        const [isTransitioning, setIsTransitioning] = useState(false)
        const [barangIds, setBarangIds] = useState([])
        const [closeModal, setCloseModal] = useState(false)
        const [historyRange, setHistoryRange] = useState({
            tgl_awal : '',
            tgl_akhir : ''
        })        
        const [disableRange, setDisableRange] = useState(false)
        const [disableSubmit, setDisableSubmit] = useState(false)
        const tanggalAwal = new Date(historyRange.tgl_awal)
        const tanggalAkhir = new Date(historyRange.tgl_akhir)

        useEffect(() => {
            if (tanggalAwal >= tanggalAkhir) {
                setDisableRange(true)
            } else {
                setDisableRange(false)
            }
        }, [historyRange])

        const getBarang = async () => {
            try {
                setDisableSubmit(true)
                const response = await Promise.all([
                    api.get('getSheetBarang/in-use'),
                    api.get('getSheetBarang/out'),
                    api.get('getSheetBarang/in-service'),
                    api.get('getSheetBarang/rusak'),
                    api.get('getSheetBarang/upgrade')
                ])
                const data = response.map((res) => res.data.data)
                const statusSheets = {
                   in_use : {barang : data[0], title : 'Barang In Use'},
                    out : {barang: data[1], title : 'Barang Out'},
                    in_service : {barang: data[2], title : 'Barang In Service'},
                    rusak : {barang: data[3], title : 'Barang Rusak'},
                    upgrade : {barang: data[4], title : 'Barang Upgrade'}
                }
                await BarangExport(statusSheets)
                setDisableSubmit(false)
                setCloseModal(true)
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error Dalam Sistem'
                })
            }
        }

        const handleHistory = async (e) => {
            e.preventDefault()
            try {
                setDisableSubmit(true)
                const formdata = new FormData()
                barangIds.forEach((b) => {
                    formdata.append('barang_ids[]', b.value)
                })
                const response = await api.post(`getSheetHistory`, formdata)                
                const data = response.data.data
                await HistoryExport(data)
                setCloseModal(true)
                setDisableSubmit(true)
            } catch (error) {
                Swal.fire({
                    icon:'error',
                    title:'Tidak Dapat Membuat Excel',
                    text:'Ada Kesalahan Dalam Sistem'
                })
            } 
        }

        const handleHistoryRange = async (e) => {
            e.preventDefault()
            try {
                setDisableSubmit(true)
                const response = await api.post(`getSheetHistory`, {
                    'start' : historyRange.tgl_awal,
                    'end' : historyRange.tgl_akhir,
                })
                const data = response.data.data
                await HistoryExport(data)
                setHistoryRange({tgl_awal : '', tgl_akhir : ''})
                setCloseModal(true)
            } catch (error) {
                Swal.fire({
                    icon:'error',
                    title:'Tidak Dapat Membuat Excel',
                    text:'Ada Kesalahan Dalam Sistem'
                })
            }
        }
        

        const handleSelectSection = (sections, pages = 1) => {
            setIsTransitioning(true)
            if (page <= 1) {
                setPageZero(true)
            }
            setTimeout(() => {
                if (page <= 1 ) {
                    setPageZero(false)
                }
                setSection(sections)
                setPage(pages)
                setIsTransitioning(false)
            },300)
        }

        const nextPage = () => {
            setIsTransitioning(true) 
            setTimeout(() => {
                setPage((prevPage) => prevPage + 1)
                setIsTransitioning(false)
            }, 300)
        }

        const prevPage = () => {
            setIsTransitioning(true)
            if (page == 1) {
                setPageZero(true)
            }
            setTimeout(() => {
                setPage((prevPage) => Math.max(prevPage - 1, 1))
                if (page == 1) {
                    setSection(null)
                    setPageZero(false)
                }
                setIsTransitioning(false)
            }, 300)
        }

    return (
        <MiModal onClose={onClose} contentClass={`max-sm:h-[500px] max-xl:h-[500px] h-[50%]`} closeModal={closeModal}>
            <div className='shadow-sm bg-white pt-2 '>
                <p className='text-xl font-semibold text-hitam-mi pb-2 text-center'>Export To Excel</p>
            </div>
            <div className='content flex-grow flex items-center justify-center w-full relative'>
                <div className={`w-full flex justify-center items-center transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    {
                    section == null && !disableSubmit &&
                    <div className='flex flex-col justify-center items-center w-full gap-2'>
                        <button className='bg-green-400 text-white w-[80%] h-8 rounded-lg' onClick={() => handleSelectSection('history')}>Export Excel History</button>
                        <button className='bg-green-400 text-white w-[80%] h-8 rounded-lg' onClick={() => getBarang()}>Export Excel Barang </button>
                    </div>
                    }
                    {
                        disableSubmit && 
                        <div>
                            <Loader />
                        </div>
                    }
                    {
                    section == 'history' && page == 1 && !disableSubmit &&
                    <form className='w-full flex flex-col justify-center items-center ' onSubmit={handleHistory}>
                        <p className='text-2xl font-semibold -translate-y-4'>Pilih Barang</p>
                        <div className={`barang mb-3 w-3/4`}>
                            <SelectPaginate 
                            source={`barang`}
                            isMulti={true}
                            selectName={'Barang'} 
                            itemLabel={['username' ,'unit_device', 'asset_kode']}  
                            maxMenuHeight={window.innerWidth < 321 || window.innerHeight < 600 ? 70 : 170}
                            handleSelectChange={barang => setBarangIds(barang)}
                            required={true}
                            />
                        </div>
                        <div className='tombol-hijau flex flex-col w-full justify-center items-center gap-2 mt-1'>
                            <button type='submit' className='bg-green-400 disabled:bg-green-300 text-white max-md:w-[80%] w-[40%] h-8 rounded-lg' disabled={disableSubmit}>Export Excel</button>
                            <button type='button' className='bg-green-400 text-white w-max px-8 h-8 rounded-lg' onClick={() => nextPage()}>Pilih Rentang Tanggal</button>
                        </div>
                    </form>
                    }

                    {/*              History Range               */}
                    {
                        section == 'history' && page == 2 && !disableSubmit &&
                        <form className='w-full flex flex-col justify-center items-center mb-8' onSubmit={handleHistoryRange}>
                            <p className='text-2xl font-semibold -translate-y-4'>Pilih rentang tanggal </p>
                            <div className="tgl-pembayaran mb-3 w-[80%]">
                                <label>Tanggal Awal</label>
                                <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-gray-400 font-light font-inter'>
                                    <input 
                                    type="date"
                                    className='w-full '
                                    onChange={e => setHistoryRange({...historyRange, tgl_awal : e.target.value})}
                                    value={historyRange.tgl_awal || ''}
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
                                    onChange={e => setHistoryRange({...historyRange, tgl_akhir : e.target.value})}
                                    value={historyRange.tgl_akhir || ''}
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
                    }
                </div>
                {  page > 0 && section  &&
                    <div className={`transition-opacity duration-500 ${ pageZero ? 'opacity-0' : 'opacity-100'} absolute bottom-0 w-full`}>
                        <button className='py-2 bg-white shadow-sm' onClick={() => prevPage()}><p className='font-normal'>Kembali</p></button>
                    </div>
                }
            </div>
        </MiModal>
    )
    }

    export default ModalBarang