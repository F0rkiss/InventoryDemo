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
    <div ref={ref} className={`bg-white rounded-md text-sm mb-3 font-inter border overflow-hidden flex flex-col justify-between h-full ${isUser ? 'pb-1' : ''}`}>
      <div className="content flex-grow flex flex-col ">
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
        <div className={`flex flex-col p-4 gap-2 pt-0 justify-between`}>
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
          <div className="max-w-64 self-center sm:self-center">
            { item.image ?
              <img src={`${apiUrl}${item.image}`} alt="item image" className=''/>
              :
              <p className='mt-12'>No Image</p>
            }
          </div>
        </div>
      </div>
      { !isUser && !restore &&
      <div className={`flex justify-around font-semibold mt-auto border-t`}>
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
    </div>
  );
});

ItemCard.propTypes = {
  item: PropTypes.object.isRequired,
};

export default ItemCard;
