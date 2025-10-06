import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import DateFormat from '../../../helper/DateFormatHelper'

const ItemCard = forwardRef(({ item, handleDetailClick, handleUpdateClick, handleDeleteClick, handleImageClick, isUser, canUpdate, canDelete, initial }, ref) => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_URL
  const [detail, setDetail] = useState(null);
  const [lazyLoad, setLazyLoad] = useState({})
  const isAsset = item.is_asset || item.barangIsAsset
  const [isOpenLPB, setIsOpenLPB] = useState(false)

  const toggleAccordionLPB = () => {
    setIsOpenLPB(!isOpenLPB);
  }
  
  return (
    <div ref={ref} className={`bg-white rounded-md text-sm p-4 font-inter border overflow-hidden flex flex-col justify-between ${isUser ? 'pb-1' : ''} shadow-sm hover:shadow-lg transition-shadow duration-200`}>
      <div className="content flex-grow flex flex-col mb-4">
        <div className="grid grid-cols-3 justify-between mb-3 items-center justify-center">
          <div className='col-start-1 col-span-2 capitalize '>
            <h1 className="font-bold capitalize text-xl text-ellipsis whitespace-nowrap overflow-hidden">
              {item.name || item.namaBarang}
            </h1>
            { isAsset ? 
              <p className='font-medium'>Aset</p>
              :
              <p className='font-medium'>Non Aset</p>
            }
          </div>
          <div className='justify-self-end py-1 col-start-3'>
              <button className='detail-button' onClick={() => handleDetailClick(item.id)}>
                  <i className="bx bx-dots-vertical-rounded text-2xl max-xs:text-xl" />
              </button> 
          </div>
        </div>
        <div className={`flex flex-col border-t pt-3 gap-2 justify-between`}>
          { initial === 'Barang' &&
            <div className="text w-full space-y-2">
                <div className="flex justify-between text-gray-500">
                  Kode Barang <p className='text-black font-medium'>{item.kode_barang}</p>
                </div>
                <div className="flex justify-between text-gray-500">
                  Kode Gudang <p className='text-black font-medium'>{item.kode_gudang}</p>
                </div>
                <div className="flex justify-between text-gray-500">
                  Satuan <p className='text-black font-medium'>{item.satuan}</p>
                </div>
            </div>
          }
          
          { initial === 'Stok' &&
            <>
              <div className="text w-full space-y-2 pb-2">
                <div className="flex justify-between text-gray-500">
                  Kode Barang <p className='text-black font-medium'>{item.kodeBarang}</p>
                </div>
                <div className="flex justify-between text-gray-500">
                  Kode Gudang <p className='text-black font-medium'>{item.kodeGudang}</p>
                </div>
                <div className="flex justify-between text-gray-500">
                  Tgl. Masuk <p className='text-black font-medium'>{DateFormat(item.tanggal_barang_masuk)}</p>
                </div>
                <div className="flex justify-between text-gray-500">
                  Quantity <p className='text-black font-medium'>{item.qty}</p>
                </div>
                <div className="flex justify-between text-gray-500 space-x-2">
                  Note <p className='text-black font-medium'>{item.note}</p>
                </div>
              </div>
              <div className={`text w-full border py-1 px-3 rounded-lg hover:bg-gray-50 transition-color duration-200 ${isOpenLPB ? 'bg-gray-100' : ''}`}>
                <button className="flex items-center justify-center text-gray-700" onClick={toggleAccordionLPB}>
                  <p className='font-semibold text-left text-[16px]'>LPB</p>
                  <i className={`bx bx-chevron-${isOpenLPB ? 'up' : 'down'} text-3xl ios-chevron `}></i>
                </button>
                <div className={`w-full  space-y-2 transition-all duration-300 ease-in-out overflow-hidden ${isOpenLPB ? 'max-h-96 pb-3' : 'max-h-0'}`}>
                  <div className="flex justify-between text-gray-500">
                    Penerima <p className='text-black font-medium'>{item.penerimaLpb}</p>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    Kode <p className='text-black font-medium'>{item.kodeLpb}</p>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    Tanggal <p className='text-black font-medium'>{DateFormat(item.tanggalLpb)}</p>
                  </div>
                </div>
              </div>
            </>
          }
          <div className="mt-2 max-w-64 self-center sm:self-center">
            { (item.image || item.gambarBarang) ?
              <img src={`${apiUrl}${item.image || item.gambarBarang}`} 
              alt="item image" 
              className='cursor-pointer hover:opacity-80 transition-opacity'
              onClick={() => handleImageClick(`${apiUrl}${item.gambarBarang || item.image}`)}
              />
              :
              <p className='mt-12'>No Image</p>
            }
          </div>
        </div>
      </div>
      <div className={`flex gap-1`}>
      { canUpdate &&
        <button
          className="px-3 py-1.5 update-button"
          onClick={() => handleUpdateClick(item.id)}
        >
          <p>Update</p>
        </button>
      }
      { canDelete &&
        <button
          className="px-3 py-1.5 delete-button"
          onClick={() => handleDeleteClick(item.id)}
        >
          <p>Delete</p>
        </button>
      }
      </div>
    </div>
  );
});

ItemCard.propTypes = {
  item: PropTypes.object.isRequired,
  handleImageClick: PropTypes.func,
};

export default ItemCard;
