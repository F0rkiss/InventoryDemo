import React, { useEffect, useState } from 'react';
import { Block } from 'framework7-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Back from '../component/Back';
import Layout from '../component/Layout';
import Swal from 'sweetalert2';
import SelectPaginate from '../component/SelectPaginate';
import Transition from '../component/Transition';
import ModalDetailRequest from '../component/modal/ModalMR';
import ImagePreviewModal from '../component/modal/ImagePreviewModal';

function CreateMakeRequest() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_URL; // BARU: Ambil apiUrl jika diperlukan oleh modal

  const [items, setItems] = useState({
    type_request: null,
    tanggal: '',
  });

  // BARU: State untuk melacak jenis request (stok atau bukan)
  const [isStockRequest, setIsStockRequest] = useState(null); // null, true, atau false

  const [details, setDetails] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [initialDetails, setInitialDetails] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  // Image preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setContentVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleTypeRequestChange = (selectedOption) => {
    setItems({ ...items, type_request: selectedOption });
    
    // BARU: Set status is_stock berdasarkan pilihan. Reset detail jika tipe berubah.
    if (selectedOption) {
      const isStock = selectedOption.is_stok === 1;
      if (isStockRequest !== isStock) {
        setDetails([]); // Kosongkan detail jika tipe request berubah
      }
      setIsStockRequest(isStock);
    } else {
      setIsStockRequest(null);
      setDetails([]);
    }
  };

  // Image preview functions
  const handleClosePreview = () => {
      setIsPreviewOpen(false);
      setSelectedImageUrl('');
  };
  const handleImageClick = (imageUrl) => {
      setSelectedImageUrl(imageUrl);
      setIsPreviewOpen(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    setDisabled(true);

    try {
      if (!items.type_request || !items.tanggal || details.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data belum lengkap', text: 'Silakan lengkapi semua field dan tambahkan minimal satu detail.' });
        setDisabled(false);
        return;
      }

      // DIUBAH: Membuat payload secara dinamis
      const payload = {
        invent_type_request_id: items.type_request?.value,
        tanggal: items.tanggal,
        qty: details.map((d) => d.qty),
      };

      if (isStockRequest) {
        payload.invent_barang_id = details.map((d) => d.selectedBarang?.id || d.selectedBarang?.invent_barangs_id || d.invent_barang_id);
      } else {
        payload.note_barang = details.map((d) => d.note_barang);
      }

      await api.post('inventMakeRequest-create', payload);

      Swal.fire({ title: 'Make request berhasil dibuat!', icon: 'success', timer: 2000, showConfirmButton: false });
      navigate('/make-request/list-make-request');

    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal membuat request', text: error?.response?.data?.message || 'Terjadi kesalahan pada sistem.' });
    } finally {
      setDisabled(false);
    }
  };
  
  const handleSaveDetail = (data) => {
    if (editIndex !== null) {
      setDetails(details.map((it, idx) => (idx === editIndex ? data : it)));
    } else {
      setDetails([...details, data]);
    }
    setOpenModal(false);
    setEditIndex(null);
  };

  const resetValue = () => {
    setItems({ type_request: null, tanggal: '' });
    setDetails([]);
    setIsStockRequest(null);
  };

  return (
    <Layout title={'Create Make Request'}>
      <Block>
        <div className="xs:px-0 md:px-4">
          <Back goHome={() => navigate('/make-request/list-make-request')} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Create Make Request</p>

          <Transition contentVisible={contentVisible}>
            <div className="p-7 bg-white shadow-lg shadow-gray-200 rounded-lg border border-gray-300">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Type Request</label>
                  <SelectPaginate
                    source={'inventTypeRequest'}
                    selectValue={items.type_request}
                    selectName={'Type request'}
                    itemLabel={['name']}
                    handleSelectChange={handleTypeRequestChange} // DIUBAH: Gunakan handler baru
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="font-semibold">Tanggal</label>
                  <div className="bg-white p-2 rounded-md border border-gray-300 mt-2">
                    <input
                    type="date" 
                    value={items.tanggal} 
                    onChange={(e) => setItems({ ...items, tanggal: e.target.value })} 
                    className="w-full p-2 active:outline-sky-500" 
                    required />
                  </div>
                </div>

                {/* DIUBAH: Hanya tampilkan bagian detail jika Type Request sudah dipilih */}
                {isStockRequest !== null && (
                  <>
                    <div className="mt-2 pt-3">
                      <p className="text-lg font-semibold">Detail</p>
                    </div>
                    <div className="space-y-3 my-3">
                      {details.length === 0 ? (
                          <p className="text-center py-2 text-gray-400">Belum ada data.</p>
                      ) : (
                          details.map((item, id) => (
                              <div
                                  key={id}
                                  className="
                                  border border-gray-300 rounded-xl p-3
                                  grid grid-cols-[80px,1fr] md:grid-cols-[160px,1fr,80px,160px,64px]
                                  items-center gap-x-4
                                  "
                              >
                                  {/* Image Section */}
                                  <div className="overflow-hidden rounded-lg bg-gray-50 w-full aspect-[4/3]">
                                      {isStockRequest && item.selectedBarang?.gambarBarang ? (
                                          <div className="flex items-center">
                                              <img
                                                  src={`${apiUrl}${item.selectedBarang.gambarBarang}`}
                                                  alt={item.selectedBarang.namaBarang}
                                                  className="w-full h-full object-cover cursor-pointer"
                                                  onClick={() => handleImageClick(`${apiUrl}${item.selectedBarang.gambarBarang}`)}
                                              />
                                          </div>
                                      ) : (
                                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                              No Image
                                          </div>
                                      )}
                                  </div>

                                  {/* Item Details Section */}
                                  <div className="flex flex-col justify-between flex-grow p-1 md:p-0 md:contents">
                                      <div>
                                          {isStockRequest ? (
                                              <div className="font-semibold text-gray-800">
                                                  {item.selectedBarang?.name || item.selectedBarang?.namaBarang}
                                              </div>
                                          ) : (
                                              <div className="font-semibold text-gray-800">
                                                  {item.note_barang}
                                              </div>
                                          )}
                                          {isStockRequest && (
                                              <div className="font-normal text-sm text-gray-400">
                                                  Kode: {item.selectedBarang?.kode || item.selectedBarang?.kodeBarang}
                                              </div>
                                          )}
                                      </div>

                                      {/* Quantity Section */}
                                      <div className="flex flex-col items-start mt-2 md:mt-0 md:contents">
                                          <div className="font-medium md:text-right">
                                              <span className="font-normal text-sm text-gray-400">Qty: </span>
                                              {item.qty}
                                          </div>
                                      </div>
                                  </div>

                                  {/* Buttons Section */}
                                  <div className="col-start-2 flex items-center justify-center w-full gap-2 mt-2 divide-x-2 md:col-auto md:divide-x-0 md:mt-0 md:justify-self-end md:border-l-2 md:pl-3">
                                      <button type="button" onClick={() => { setInitialDetails(item); setEditIndex(id); setOpenModal(true); }}>
                                          <i className="bx bx-edit text-xl text-cyan-600"></i>
                                      </button>
                                      <button type="button" onClick={() => setDetails(details.filter((_, i) => i !== id))} className="pl-2">
                                          <i className="bx bx-trash text-xl text-red-500"></i>
                                      </button>
                                  </div>
                              </div>
                          ))
                      )}
                    </div>
                    <div className="flex mt-4">
                      <button type="button" className="w-full rounded-lg py-2 px-4 flex items-center transition-color duration-200 font-medium bg-blue-50 text-blue-600 hover:bg-blue-100" onClick={() => { setOpenModal(true); setEditIndex(null); setInitialDetails(null); }}>
                        <i className="bx bx-plus mr-2 font-semibold text-base"></i>
                        <span>{details.length === 0 ? 'Tambah detail' : 'Tambah detail lain'}</span>
                      </button>
                    </div>
                  </>
                )}
                <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                  <button disabled={disabled} type="submit" className='py-2 px-4 w-full rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-color duration-200 text-white disabled:bg-blue-300'>Submit</button>
                  <button className='py-2 px-4 w-full rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600' onClick={resetValue} type="button">Reset</button>
                </div>
              </form>
            </div>
            { openModal && (
              <ModalDetailRequest
                open={openModal}
                initialData={initialDetails}
                isStock={isStockRequest}
                apiUrl={apiUrl}
                onClose={() => { setOpenModal(false); setEditIndex(null); }}
                onSave={handleSaveDetail}
              />
            )}
          </Transition>
        </div>
      </Block>
      <ImagePreviewModal
      isOpen={isPreviewOpen}
      onClose={handleClosePreview}
      imageUrl={selectedImageUrl}
      />
    </Layout>
  );
}

export default CreateMakeRequest;