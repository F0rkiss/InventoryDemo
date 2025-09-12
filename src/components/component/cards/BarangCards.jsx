import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import DateFormat from '../../../helper/DateFormatHelper'

const ItemCard = forwardRef(({ item, handleDetailClick, handleUpdateClick, handleDeleteClick, handleImageClick, isUser, canUpdate, canDelete }, ref) => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_URL
  const [detail, setDetail] = useState(null);
  const [lazyLoad, setLazyLoad] = useState({})
  const isAsset = item.is_asset
  
  return (
    <div ref={ref} className={`bg-white rounded-md text-sm p-4 font-inter border overflow-hidden flex flex-col justify-between h-full ${isUser ? 'pb-1' : ''} shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="content flex-grow flex flex-col mb-4">
        <div className="grid grid-cols-3 justify-between mb-3 items-center justify-center">
          <div className='col-start-1 capitalize '>
            <h1 className="font-bold capitalize text-xl text-ellipsis whitespace-nowrap overflow-hidden">
              {item.name}
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
          <div className="max-w-64 self-center sm:self-center">
            { item.image ?
              <img src={`${apiUrl}${item.image}`} 
              alt="item image" 
              className='cursor-pointer hover:opacity-80 transition-opacity'
              onClick={() => handleImageClick(`${apiUrl}${item.image}`)}
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
