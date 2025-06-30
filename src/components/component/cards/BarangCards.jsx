import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import DateFormat from '../../../helper/DateFormatHelper'

const ItemCard = forwardRef(({ item, handleDetailClick, handleUpdateClick, handleDeleteClick, restoreItems, isUser, restore = false }, ref) => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_URL
  const [detail, setDetail] = useState(null);
  const [lazyLoad, setLazyLoad] = useState({})
  const isAsset = item.is_asset
  
  // useEffect(() => {
  //   if (desktop) {
  //       setDetail((prevDetails) => prevDetails = item.id)
  //       setLazyLoad((prev) => ({
  //           ...prev, 
  //           [item[0].id]: true
  //       }))
  //   }
  // }, [desktop])

  return (
    <div ref={ref} className={`bg-white content rounded-md text-sm mb-3 font-inter border overflow-hidden ${isUser ? 'pb-1' : ''}`}>
      <div className="content">
        <div className="upper_section flex mb-3 justify-between border-b py-2 px-4 items-center">
          { isAsset ? 
            <p className='font-semibold'>Aset</p>
            :
            <p className='font-semibold'>Non Aset</p>
          }
          <h1 className="font-bold capitalize text-xl text-ellipsis whitespace-nowrap overflow-hidden text-center">
            {item.name}
          </h1>
          <div className='justify-self-end py-1'>
              <button className='w-8 h-5' onClick={() => handleDetailClick(item.id)}>
                  <i className="bx bx-dots-vertical-rounded text-2xl max-xs:text-xl" />
              </button> 
          </div>
        </div>
        <div className={`flex flex-col sm:flex-row p-4 gap-2 pt-0 ${ !isUser && 'border-b'} justify-between`}>
          <div className="text w-full">
              <div className="flex justify-between">
                Kode Barang: <p>{item.kode_barang}</p>
              </div>
              {/* <div className="flex justify-between">
                Jumlah: <p className='text-green-500'>{item.satuan}</p>
              </div> */}
              <div className="flex justify-between">
                Kode Gudang: <p>{item.kode_gudang}</p>
              </div>
              <div className="flex justify-between">
                Satuan: <p>{item.satuan}</p>
              </div>
          <div>
            <div className='flex justify-between text-gray-400 italic pt-2'>
              <p>Tanggal dibuat: </p>
              <p>{DateFormat(item.created_at)}</p>
            </div>
            <div className='flex justify-between text-gray-400 italic'>
              <p>Terakhir diubah: </p>
              <p>{DateFormat(item.updated_at)}</p>
            </div>
          </div>
          </div>
          <div className="max-w-64 self-center sm:self-auto">
            { item.image &&
              <img src={`${apiUrl}${item.image}`} alt="item image" className=''/>
            }
          </div>
        </div>
      </div>
      {/* <div className={`${detail != item.id ? 'max-h-0' : 'max-h-[400px]'} transition-all ease-in-out duration-700 overflow-hidden `}>
        <div className='mx-4 mt-4'>
          <div className='flex justify-between pb-1'>
            <p>Sumber Barang: </p>
            <p>{item.sumber_barang?.name}</p>
          </div>
          <div className='flex justify-between pb-1'>
            <p>Jenis Barang: </p>
            <p>{item.jenis_barang?.name}</p>
          </div>
          <div className='flex justify-between pb-1'>
            <p>Kategori Barang: </p>
            <p>{item.category_barang?.name}</p>
          </div>
          <div className='flex justify-between pb-1'>
            <p>Tingkat Kebutuhan: </p>
            <p>{item.tingkat_kebutuhan?.name}</p>
          </div>
          <div className='flex justify-between pb-1'>
            <p>Satuan Order: </p>
            <p>{item.satuan_order}</p>
          </div>
          <div className='flex justify-between pb-1'>
            <p>Satuan Stok: </p>
            <p>{item.satuan_stok}</p>
          </div>
          <div>
            <div className='flex justify-between text-gray-400 italic pt-2'>
              <p>Tanggal dibuat: </p>
              <p>{DateFormat(item.created_at)}</p>
            </div>
            <div className='flex justify-between text-gray-400 italic'>
              <p>Terakhir diubah: </p>
              <p>{DateFormat(item.updated_at)}</p>
            </div>
          </div>
        </div>
      </div> */}
      {/* <div className='place-self-center'>
        <button className='text-gray-700 w-28' onClick={() => toggleDetail(item.id)}>
          {detail == item.id ? <i className='bx bx-chevron-up text-3xl'></i> 
                             : <i className='bx bx-chevron-down text-3xl'></i>
                             }
        </button>
      </div> */}
      { !isUser && !restore &&
      <div className={`lower_section flex justify-around font-semibold`}>
        <button
          className="update_button text-cyan-400 bg-white flex justify-center h items-center py-3"
          onClick={() => handleUpdateClick(item.id)}
        >
          <p>Update</p>
        </button>
        <button
          className="delete_button text-red-500 bg-white flex justify-center items-center py-3"
          onClick={() => handleDeleteClick(item.id)}
        >
          <p>Delete</p>
        </button>
      </div>
      }
      {
        restore && 
        <div className={`lower_section flex justify-around font-semibold m-2 space-x-2`}>
          <button
            className="update_button text-white bg-cyan-400 flex justify-center h items-center py-3 rounded-md"
            onClick={() => restoreItems(item.id)}
          >
          <p>Restore</p>
          </button>
        </div>
       
      }
    </div>
  );
});

ItemCard.propTypes = {
  item: PropTypes.object.isRequired,
};

export default ItemCard;
