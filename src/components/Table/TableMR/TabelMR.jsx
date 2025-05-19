import { useState, useEffect, useRef } from 'react';
import api from '../../../api/api';
import Pagination from '../../component/Pagination'
import ItemLimits from '../../component/ItemLimits';
import { createPortal } from 'react-dom';
import SearchBar from '../../component/SearchBar';
import Layout from '../../component/Layout';
import { encrypting } from '../../../helper/EncryptHelper';
import { useNavigate } from 'react-router-dom';

function ImageModal({item, source, onClose, items, currentPage}) {
    const [currentIndex, setCurrentIndex] = useState({})
    const [currentIndexAfter, setCurrentIndexAfter] = useState({})
    const [imageLoad, setImageLoad] = useState(false)

    const apiUrl = import.meta.env.VITE_URL

    useEffect(() => {
        const initialIndex ={}
        items.forEach(item => {
            initialIndex[item.id] = 0
        });
        setCurrentIndex(initialIndex)
        setCurrentIndexAfter(initialIndex)
    }, [items])

    const prevItems = (itemIds) => {
        setCurrentIndex((prevIndex) => ({
            ...prevIndex,
            [itemIds] : prevIndex[itemIds] > 0 ? prevIndex[itemIds] - 1 : 0 
        }))
    }

    const nextItems = (itemIds, imageLength) => {
        setCurrentIndex((prevIndex) => ({
            ...prevIndex,
            [itemIds] : prevIndex[itemIds] < imageLength - 1 ? prevIndex[itemIds] + 1 : prevIndex[itemIds] 
        }))
    }

    const handleModalClose = (e) => {
        if(e.target.classList.contains('modal-overlay')) {
            onClose()
        }
    }

    return createPortal(
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-40 flex items-center justify-between z-50 h-screen" onClick={handleModalClose}>
                <button disabled={currentIndex[item.id] <= 0 } onClick={() => prevItems(item.id)} className={`w-1/4  max-lg:h-[60%] ${currentIndex[item.id] <= 0 ? '!h-0' : ''}`}><i className={`bx bx-chevron-left text-white max-md:text-7xl max-sm:text-6xl text-8xl ${currentIndex[item.id] <= 0 ? 'invisible' : ''}`}/></button>
                <div className="modal-content bg-white flex-grow rounded max-w-[90%] p-2 overflow-auto max-h-[95%] h-max">
                    {
                        !imageLoad &&
                    <div className="relative min-h-[600px] min-w-[50%] max-lg:!max-w-full rounded-md mx-auto">
                        <div className='absolute inset-0 flex items-center justify-center bg-gray-300 animate-pulse rounded-xl'>
                            <p>Loading . . . </p>
                        </div>
                    </div>
                    }
                    <img src={`${apiUrl}${item[source][currentIndex[item.id]]}`} className={`max-w-[800px] min-w-[50%] max-lg:!max-w-full rounded-md mx-auto ${imageLoad ? '' : 'hidden'}`} onLoad={() => setImageLoad(true)} onError={() => setImageLoad(false)}/>   
                </div>
                <button disabled={currentIndex[item.id] == item[source].length - 1} className={`w-1/4 max-lg:h-[60%] ${currentIndex[item.id] == item[source].length - 1 ? '!h-0' : ''}`} onClick={() => nextItems(item.id, item[source].length)}><i className={`bx bx-chevron-right max-md:text-7xl max-sm:text-6xl text-8xl text-white ${currentIndex[item.id] == item[source].length - 1 ? 'invisible' : ''}`}></i></button>
        </div>,
        document.body
    )

}


function ItemList() {
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedItemAfter, setSelectedItemAfter] = useState({})
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1);
    const [showImage, setShowImage] = useState(false)
    const [showImgAfter, setShowImgAfter] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const typingTimeoutRef = useRef(null)
    const [limit, setLimit] = useState(10)
    const [selectedOption, setSelectedOption] = useState({value : 10, label : '10'})
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        fetchItems(currentPage, limit);
    }, [currentPage, limit, searchTerm]);

    const fetchItems = async (page = 1, limits = 10) => {
        try {
            setLoading(true)
            const response = await api.get(searchTerm ? `/makeRequest/dataTable/${searchTerm}?page=${page}` : `/makeRequest/dataTable?page=${page}&limit=${limits}`, {
                params : {
                    perPage : limits,
                }
            });
            const data = response.data.data
            setItems(data.data);
            setCurrentPage(data.current_page)
            setTotalPages(data.last_page)
        } catch (error) {

        } finally {
            setLoading(false)
        }
    };

    const openImageModal = (item) => {
        setSelectedItems(item)
        setShowImage(true)
    }

    const closeImageModal = () => {
        setSelectedItems(null)
        setShowImage(false)
    }

    const openImageAfter = (item) => {
        setSelectedItemAfter(item)
        setShowImgAfter(true)
    }

    const closeImageAfter = () => {
        setShowImage(false)
        setSelectedItemAfter(null)
    }

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

    const status = (item) => {
        if (item.status === 'pending') 
            {
                return 'text-yellow-500'
            }
        if (item.status === 'in prosess') 
            {
                return 'text-blue-500'
            }
        if (item.status === 'done')
            {
                return 'text-green-500'
            }
        if (item.status === 'reject')
            {
                return 'text-red-500'
            }
    }

    const FormatDate = (date) => {
        return date?.split('-').reverse().join('-')
    } 

    const goToDetail = async(id) => {
        const encryptingID = await encrypting(id)
        navigate(`/make-request/detail-make-request/${encryptingID}`)        
    }

    const handleChange = (selected) => {
        setSelectedOption(selected)
        setLimit(selected.value)
    }


    return (
        <Layout title={'Tabel MR'}>
            {/* Page Content */}
            <div className='max-lg:mx-10 mt-2 mx-20 '>
                <div className="kontainer border rounded-md mt-4 bg-white mb-8">
                    <div className="wrapper m-6">
                        <div className="mb-4 flex justify-between items-center border-b pb-3 max-sm:flex-col">
                            <h1 className='mt-5 font-medium mb-4 text-2xl whitespace-nowrap'>Data Make Request</h1>
                        </div>
                        <div className='flex justify-end w-full h- items-center max-sm:flex-col my-4'>
                            <SearchBar values={searchQuery} onChange={handleSearchChange} withBlock={false} className={'ms-5 max-md:ms-0 max-md:mt-3'} />
                        </div>
                        <div className={`${ items?.length < 0 ? `overflow-x-auto` : 'max-xl:overflow-x-auto'}`}>
                            <table className='min-w-full border-separate  border-spacing-0 relative mb-10'>
                                <thead>
                                    <tr className='bg-slate-100'>
                                        <th className='border-s border-y p-2 text-center'>Jenis Permintaan</th>
                                        <th className='border-s border-y p-2 text-center'>User</th>
                                        <th className='border-s border-y p-2 text-center'>Status</th>
                                        <th className='border-s border-y p-2 text-center'>Deskripsi</th>
                                        <th className='border-s border-y p-2 text-center'>Keperluan</th>
                                        <th className='border-s border-y p-2 text-center'>Note</th>
                                        <th className='border-s border-y p-2 text-center'>Bukti User</th>
                                        <th className='border-s border-y p-2 text-center'>Bukti Admin</th>
                                        <th className='border-s border-y p-2 text-center'>Tanggal Pembuatan</th>
                                        <th className='border-s border-y p-2 text-center'>Tanggal Penerimaan</th>
                                        <th className='border-s border-y p-2 text-center'>Tanggal Penyerahan</th>
                                        <th className='border-s border-y p-2 text-center'>Kode Penyerahan</th>
                                        <th className='border-x border-y p-2 text-center'>Barang</th>
                                        <th className='border p-2 text-center'>Action</th>
                                    </tr>
                                </thead>
                                
                                <tbody>
                                    { 
                                        items?.length > 0 && !loading ?
                                         items.map((item) => (
                                            <tr key={item.id} className='odd:bg-white even:bg-slate-50'>
                                                <td className='border-s border-b p-2 text-center'>{item.jenis_permintaan.replace('_', ' ' )}</td>
                                                <td className='border-s border-b p-2 text-center'>{item.user?.name || item.username}</td>
                                                <td className={`border-s border-b p-2 text-center whitespace-nowrap capitalize  ${status(item)}`}>{item.status}</td>
                                                <td className='border-s border-b p-2 text-center max-w-40'><p className='line-clamp-4 break-words'>{item.description}</p></td>
                                                <td className='border-s border-b p-2 text-center max-w-40'><p className='line-clamp-4 break-words'>{item.keperluan}</p></td>
                                                <td className='border-s border-b p-2 text-center max-w-40'><p className='line-clamp-4 break-words'>{item.note || '-'}</p></td>
                                                <td className='border-s border-b p-2 text-center '>
                                                    {item.bukti?.length > 0 ? <button onClick={() => openImageModal(item)} className='bg-green-400 text-white p-1 rounded'>Lihat</button> : '-'}
                                                </td>
                                                <td className='border-s border-b p-2 text-center'>
                                                    {item.imgAfter?.length > 0 ? <button onClick={() => openImageAfter(item)} className='bg-green-400 text-white p-1 rounded'>Lihat</button> : '-'}
                                                </td>
                                                <td className='border-s border-b p-2 text-center'>{item.created_at.split('T')[0].split('-').reverse().join('-')  || '-'}</td>
                                                <td className='border-s border-b p-2 text-center'>{FormatDate(item.tanggal_penerimaan) || '-'}</td>
                                                <td className='border-s border-b p-2 text-center'>{FormatDate(item.tanggal_penyerahan) || '-'}</td>
                                                <td className='border-s border-b p-2 text-center max-w-40'><p className='line-clamp-4'>{item.kode_penyerahan || '-'}</p></td>
                                                <td className='border-l border-r border-b p-2 text-center max-w-[200px] break-words'>
                                                    {item.barangs.map((b) => ` ${b.unit_device} - ${b.asset_kode}`).join(', ') || '-'}
                                                </td>
                                                <td className='border p-2 text-center'>
                                                    <button className='bg-green-400 text-white px-4 py-1 rounded' onClick={() => goToDetail(item.id)}>Detail</button>
                                                </td>
                                            </tr>
                                        ))
                                    :
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
                                <ItemLimits className={`${items?.length > 0  && !loading ? '' : 'hidden'}`} handleChange={handleChange} selectedOption={selectedOption}/>   
                            </>
                        }
                        </div>
                </div>
            </div>
            {
                (showImage && selectedItems) && (
                    <ImageModal
                    item={selectedItems}
                    source={'bukti'}
                    onClose={closeImageModal}
                    items={items}
                    currentPage={currentPage}
                    />
                )
            }
            {
                (showImgAfter && selectedItemAfter) && (
                    <ImageModal
                    item={selectedItemAfter}
                    source={'imgAfter'}
                    onClose={closeImageAfter}
                    items={items}
                    currentPage={currentPage}
                    />
                )
            }
        </Layout>
    );
}

export default ItemList;
