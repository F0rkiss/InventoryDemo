import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import CustomNavbar from '../component/CustomNavbar';
import { Page, Block } from 'framework7-react';
import api from '../../api/api';
import { replace, useNavigate, useParams } from 'react-router-dom';
import Loader from '../component/Loader';
import SelectPaginate from '../component/SelectPaginate';
import { QRCodeSVG } from 'qrcode.react';
import ScrollPagination from '../component/ScrollPagination';
import Layout from '../component/Layout';
import { useAuth } from '../../auth/AuthContext';
import { DecryptID, encrypting } from '../../helper/EncryptHelper';
import MakeHistoryForms from '../component/forms/MakeHistoryForms';
import reactSvgToImage from 'react-svg-to-image';
import Swal from 'sweetalert2';
import DateFormatToIDN from '../../helper/DateFormatHelper';

const tanggalHistoryToIndonesian = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour12: false 
      };
    return date.toLocaleDateString('id-ID', options);
  };

function DetailItem() {
  const {role, name} = useAuth()
  const [item, setItem] = useState(null);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const [decryptedId, setDecryptedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [nextCursor, setNextCursor] = useState(null); 
  const [disableSubmit, setDisableSubmit] = useState(false)
  const [itemHistories, setItemHistories] = useState({
    user: null,
    spek_upgraded: '',
    status: null,
    lokasi: '',
  })
  
  // State Untuk Mengecek Apakah Barang Ini Punya Dia
  const status = [
    {value: 'in use', label: 'in use' },
    {value: 'out', label: 'out' },
    {value: 'in service', label: 'in service' },
    {value: 'upgrade', label: 'upgrade' },
    {value: 'rusak', label: 'rusak' }
  ]

  useEffect(() => {
    const decryptedId = DecryptID(id)
    setDecryptedId(decryptedId)
    if (!decryptedId) {
      navigate(-1)
    }
  }, [id]);
  
  useEffect(() => {
    if (decryptedId) {
      fetchItems()
    }
  }, [decryptedId])

  useEffect(() => {
    if (role == 'admin') {
      fetchHistory()
    }
  }, [item, role])

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/detail-barang/${decryptedId}`);
      const itemData = response.data.data;
      setItem(itemData);      
      setLoading(false);
      return itemData;
    } catch (error) {
      setLoading(false); 
    }
  };


  const fetchHistory = async () => {
    try {
      setLoadingHistory(true)
      setItemHistories({...itemHistories, user : item.user && {value : item.user?.id, label : item.user?.name }, status : { value : item.status, label : item.status } })
      const responseHistory = await api.get(`history/${item.id}`);
      if (responseHistory != null) {
        const histories = responseHistory.data.data.data;
        setHistory(histories);
        setNextCursor(responseHistory?.data.data.next_cursor)
      }
    } catch (historyError) {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  const fetchMoreHistory = async () => {
    if (!nextCursor || loadingHistory) return;
    setLoadingHistory(true); 
    try {
      const response = await api.get(`history/${item.id}`, {
        params: {
          cursor: nextCursor,
        },
      });
      const data = response.data.data;
      setHistory((prevHistory) => {
        const existingIds = new Set(prevHistory.map((item) => item.id));
        const newItems = data.data.filter((item) => !existingIds.has(item.id));
        return [...prevHistory, ...newItems];
      });
      setNextCursor(data.next_cursor);
    } catch (error) {
      
    } finally {
      setLoadingHistory(false); 
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      setDisableSubmit(true)
      const response = await api.post(`/history/${item.id}`, {
        user_id : itemHistories.user?.value,
        status : itemHistories.status?.value,
        spek_upgraded : itemHistories.spek_upgraded,
        lokasi : itemHistories.lokasi
      });
      setIsVisible(false);
      fetchHistory()
      fetchItems();
      setItemHistories({
        ...itemHistories,
        spek_upgraded: '',
        lokasi: '',
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Dalam Membuat History'
      })
    } finally {
      setTimeout(() => {
        setDisableSubmit(false)
      }, 1500)
    }
  }

  const goToMR = async () => {
    const ids = await encrypting(decryptedId)
    navigate(`/make-request/create-make-request/${ids}`)
  }

  const handleInputChange = (field) => (e) => {
    setItemHistories({ ...itemHistories, [field]: e.target.value });
  };

  const handleSelectChange = (field) => (selectedOption) => {
      setItemHistories({ ...itemHistories, [field]: selectedOption });
  };

  return (
    <Layout title={'Detail Barang'}>
      <Block>
      { role &&
        <button
          onClick={() => navigate(role == 'user' ? '/barang-anda' : '/barang/list-barang')}
          className="flex justify-start mt-2 font-inter max-w-32 mb-2"
        >
          <i className="bx bx-left-arrow-alt text-4xl" />
          <div className="self-center">Go Home</div>
        </button>
      } 
        {
        item && (
          <>
            <div className='bg-white shadow-sm rounded-md'>
            {
                  item.image && <div>
                    <img src={`${import.meta.env.VITE_URL}${item.image}`} className='w-full h-80 object-fill p-1 rounded-lg bg-url' alt='Gambar Barang' />
                  </div>
                }
            </div>
            
            <div className="bg-white font-inter py-5 mt-3 rounded-md w-full shadow-sm">
              <div className="mx-6">
                <p className="text-2xl font-bold mb-2">
                  {item.category?.name} {item.asset_kode.slice(5, 8)}
                </p>
                <p className="text-lg">
                  <strong>Kode Aset:</strong> {item.asset_kode}
                </p>
                <p className="text-lg">
                  <strong>Kategori:</strong> <span className="capitalize">{item.category?.name}</span>
                </p>
                <p className="text-lg">
                  <strong>Pengguna:</strong> <span className="capitalize">{ item.user ? (item.user.name) : ('Tidak Ada')}</span>
                </p>
                <p className="text-lg">
                  <strong>Unit Device:</strong> <span className="capitalize">{item.unit_device}</span>
                </p>
                <p className="text-lg">
                  <strong>Status:</strong> <span className="capitalize">{item.status}</span>
                </p>
                <p className="text-lg">
                  <strong>Brand:</strong> <span className="capitalize">{item.brand}</span>
                </p>
                <p className="text-lg">
                  <strong>Tanggal Barang Masuk:</strong> <span className="capitalize">{DateFormatToIDN(item.date_barang_masuk)}</span>
                </p>
                <p className="text-lg">
                  <strong>Spek Origin:</strong> <span className="capitalize break-words">{item.spek_origin}</span>
                </p>
                <p className="text-lg">
                  <strong>Spek Akhir:</strong> <span className="capitalize break-words">{item.spek_akhir || 'Tidak Ada'}</span>
                </p>
                <p className="text-lg">
                  <strong>Type Monitor:</strong> <span className="capitalize">{item.type_monitor || 'Tidak Ada'}</span>
                </p>
                <p className="text-lg">
                  <strong>Note:</strong> <span className="capitalize">{item.note || 'Tidak Ada'}</span>
                </p>
                { (role && role !== 'user') &&
                <div className={`mt-3 `}>
                  <button className={` transition-all duration-400 ${ isVisible ? `bg-red-500 ` : `bg-teal-400`} text-white me-6 py-2 rounded-xl`} onClick={() => setIsVisible(!isVisible)}>{ isVisible ? 'Close History' : 'Make History'}</button>
                </div>
                }
              </div>
            </div>

            <MakeHistoryForms 
              className={`transition-max-height duration-1000 ease-in-out mt-3 ${isVisible ? 'max-h-96 ' : 'max-h-0'}`} 
              disableSubmit={disableSubmit} 
              handleSubmit={handleSubmit} 
              itemHistories={itemHistories} 
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
            />
            
            <div className="mt-3 rounded-lg shadow-sm flex flex-col justify-center p-3 bg-white font-inter">
              <QRCodeSVG  size={256} className='self-center mt-3' value={`${location.origin}/barang/detail-barang/${encodeURIComponent(id)}`} />
              <h1 className="text-center font-extrabold text-4xl mt-3">SCAN ME!</h1>
            </div>

            <div className={`bg-white rounded-lg shadow-sm mt-6 font-inter ${role !== 'admin' && 'hidden' }`}>
              <div className="top-card border-b">
                <h1 className="text-center text-3xl font-extrabold drop-shadow-md pt-5 uppercase mb-4">History</h1>
              </div>
              <div className="wrapper">
                  
                    <ScrollPagination
                      loading={loadingHistory}
                      fetchMoreItems={fetchMoreHistory}
                      nextCursor={nextCursor}
                    >
                      { history.map((historyItem) => (
                        <div key={historyItem.id} className="history-item text-lg border-b">
                          {/* Customize the display of each history item */}
                          <div className="text mt-2 p-3 whitespace-normal">
                            <p className="font-bold">
                              Tanggal History: <span className="font-normal">{tanggalHistoryToIndonesian(historyItem.created_at)}</span>
                            </p>
                            <p className="font-bold">
                              Lokasi Barang: <span className="font-normal">{historyItem.lokasi}</span>
                            </p>
                            <p className="font-bold">
                              Spek Upgrade: <span className="font-normal break-words">{historyItem.spek_upgraded || 'Belum Pernah Upgrade'}</span>
                            </p>
                            <p className="font-bold">
                              User: <span className="capitalize font-normal">{historyItem.user?.name || 'Tidak Ada'}</span>
                            </p>
                            <p className="font-bold">
                              Status: <span className="capitalize font-normal">{historyItem.status || 'Tidak Ada'}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </ScrollPagination>
                    {loadingHistory && <Loader />}
                  
              </div>
            </div>
            { ( name == item.user?.name && role == 'user' || role == 'admin' ) && !item.isSelected &&  
              <button className={`bg-coklat-mi text-white py-2 text-lg text-center rounded-md shadow-md mt-8 ${!role && 'hidden' }`} onClick={goToMR}>
                Buat Make Request
              </button>
            }
            {
              !role &&
              <div className='mt-3 flex justify-center w-full'>
                <button onClick={() => navigate('/login')} className='bg-coklat-mi py-3 rounded-xl font-light text-white mx-24'>
                  Sign In
                </button>
              </div>
            }
            </>
          )
        }
        {
          loading && <Loader  Class={'mt-60'}/>
        }
      </Block>
    </Layout>
  );
}

export default DetailItem;
