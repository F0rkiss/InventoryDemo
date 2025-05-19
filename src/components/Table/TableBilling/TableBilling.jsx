import { useState, useEffect, useRef } from 'react';
import api from '../../../api/api';
import Swal from 'sweetalert2';
import Select from 'react-select';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Pagination from '../../component/Pagination'
import ItemLimits from '../../component/ItemLimits';
import { SwiperSlide, Swiper } from 'swiper/react';
import { createPortal } from 'react-dom';
import SearchBar from '../../component/SearchBar';
import Layout from '../../component/Layout';
import { useNavigate } from 'react-router-dom';
import { encrypting } from '../../../helper/EncryptHelper';

function ImageModal({item, source, onClose}) {
    const apiUrl = import.meta.env.VITE_URL

    const handleModalClose = (e) => {
        if(e.target.classList.contains('modal-overlay')) {
            onClose()
        }
    }

    return createPortal(
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={handleModalClose}>
            <div className="modal-content bg-white rounded p-2 w-3/4 h-3/4 max-w-xl max-h-full overflow-auto">
                <Swiper>
                {
                    item[source].map((gambar, index) => (
                            <SwiperSlide key={index}>
                                <img src={`${apiUrl}${gambar}`} className='w-full h-auto'/>               
                            </SwiperSlide>
                        ))
                }
                </Swiper>
            </div>
        </div>,
        document.body
    )

}


function ItemList() {
    const [items, setItems] = useState([]);``
    const [selectedItems, setSelectedItems] = useState([]);
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1);
    const [showImage, setShowImage] = useState(false)
    const [showImgAfter, setShowImgAfter] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const typingTimeoutRef = useRef(null)
    const [limit, setLimit] = useState(10)
    const [loading, setLoading] = useState(false)    
    const [selectedOption, setSelectedOption] = useState({value : 10, label : '10'})
    const navigate = useNavigate()
                    

    useEffect(() => {
        fetchItems(currentPage, limit);
    }, [currentPage, limit, searchTerm]);

    
    const fetchItems = async (page = 1, limits = 10) => {
        try {
            setLoading(true)
            const response = await api.get(searchTerm ? `/billings/dataTable/${searchTerm}?page=${page}` : `/billings/dataTable?page=${page}&limit=${limits}`, {
                params : {
                    perPage : limits,
                }
            });
            const data = response.data.data
            setItems(data.data);
            setCurrentPage(data.current_page)
            setTotalPages(data.last_page)
            setLoading(false)
        } catch (error) {

        } finally {
            setLoading(false)
        }
    };

    const goToPage = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages && pageNumber !== currentPage) {
            setTimeout(() => {
                setCurrentPage(pageNumber);
            }, 700);
        }
    };

    
    const handleSearchChange = (query) => {
        setSearchQuery(query);
        if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
        setSearchTerm(query);
        }, 750);
    };
    
    const goToDetail = async(id) => {
        const encryptingID = await encrypting(id)
        navigate(`/billing/detail-billing/${encryptingID}`)
    }

    const StatusColor = (item) => {
        if (item.status == 'aktif') {
            return 'text-green-400'
        } else {
            return 'text-red-500'
        }
    }

    const FormatDate = (date) => {
        return date?.split('-').reverse().join('-')
    } 

    const handleChange = (selected) => {
        setSelectedOption(selected)
        setLimit(selected.value)
    }


    return (
        <Layout title={'Tabel Billing'}>
            {/* Page Content */}
            <div className='max-lg:mx-10 mt-2 mx-20 '>
                <div className="kontainer border rounded-md mt-4 bg-white mb-8">
                    <div className="wrapper m-6">
                        <div className="mb-4 flex justify-between items-center border-b pb-3 max-sm:flex-col">
                            <h1 className='mt-5 font-medium mb-4 text-2xl whitespace-nowrap'>Data Billing</h1>
                        </div>
                        <div className='flex justify-end w-full h- items-center max-sm:flex-col my-4'>
                            <SearchBar values={searchQuery} onChange={handleSearchChange} withBlock={false} className={'ms-5 max-md:ms-0 max-md:mt-3'} />
                        </div>
                        <div className={`${ items?.length < 0 ? `overflow-x-auto` : 'max-xl:overflow-x-auto'}`}>
                            <table className='min-w-full border-separate border-spacing-0 relative mb-10'>
                                <thead>
                                    <tr className='bg-slate-100'>
                                        <th className='border-s border-y p-2 text-center'>User</th>
                                        <th className='border-s border-y p-2 text-center'>Penanggung Jawab</th>
                                        <th className='border-s border-y p-2 text-center'>Status</th>
                                        <th className='border-s border-y p-2 text-center'>Tanggal Berlangganan</th>
                                        <th className='border-s border-y p-2 text-center'>Tanggal Selesai Berlangganan</th>
                                        <th className='border-s border-y p-2 text-center'>Tanggal Pembayaran</th>
                                        <th className='border-s border-y p-2 text-center'>Biaya</th>
                                        <th className='border-s border-y p-2 text-center'>Note</th>
                                        <th className='border p-2 text-center'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        items?.length > 0 && !loading ?
                                        items.map((item) => (
                                            <tr key={item.id} className='odd:bg-white even:bg-slate-50'>
                                                <td className='border-s border-b p-2 text-center capitalize'>{item.user?.name}</td>
                                                <td className='border-s border-b p-2 text-center capitalize'>{item.penanggungJawab}</td>
                                                <td className={`border-s whitespace-nowrap border-b p-2 text-center ${StatusColor(item)} `}>{item.status}</td>
                                                <td className='border-s border-b p-2 text-center'>{FormatDate(item.tanggal_berlangganan) || '-'}</td>
                                                <td className='border-s border-b p-2 text-center'>{FormatDate(item.tanggal_selesai_berlangganan) || '-'}</td>
                                                <td className='border-s border-b p-2 text-center'>{FormatDate(item.tanggal_pembayaran) || '-'}</td>
                                                <td className='border-s border-b p-2 text-center'>Rp. {item.biaya ? new Intl.NumberFormat().format(item.biaya).replace(/,/g, '.') : '-'}</td>
                                                <td className='border-x border-b p-2 text-center max-w-40'><p className='line-clamp-4 break-words'>{item.note || '-'}</p></td>
                                                <td className='border p-2 text-center'>
                                                    <button onClick={() => goToDetail(item.id)} className='bg-green-400 text-white px-2 py-1 rounded'>Detail</button>
                                                </td>
                                            </tr>
                                        )) : 
                                        <tr>
                                            <td className='text-center text-2xl mb-10'>
                                                <div className='w-full border border-t-0 absolute py-3 text-gray-500 font-light'>{loading ? 'Loading . . . ' : 'Data Not Found'}</div>
                                            </td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='w-full flex justify-center mb-8'>
                        { items?.length > 0  && !loading &&
                                <>
                                <Pagination currentPage={currentPage} goToPage={goToPage} totalPages={totalPages}/>
                                <ItemLimits className={`${items?.length > 0  && !loading ? '' : 'hidden'}`} handleChange={handleChange} selectedOption={selectedOption} />
                                </>
                        }
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default ItemList;
