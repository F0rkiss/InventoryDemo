import React, { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import DateFormat from '../../../helper/DateFormatHelper';

const ItemCard = forwardRef(({ item, handleDetailClick, handleUpdateClick, handleDeleteClick, handleImageClick, canUpdate, canDelete, initial }, ref) => {
  const apiUrl = import.meta.env.VITE_URL;
  const [isExpanded, setIsExpanded] = useState(false);
  const isAsset = item.is_asset || item.barangIsAsset;
  const [isOpenLPB, setIsOpenLPB] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleAccordionLPB = () => {
    setIsOpenLPB(!isOpenLPB);
  };

  return (
    <div ref={ref} className="bg-white rounded-2xl text-sm p-4 font-inter border shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
      {/* --- Always Visible Header --- */}
      <div className="flex justify-between items-start cursor-pointer" >
        <div className="flex flex-col gap-2">
            <div>
                <h1 className="font-bold capitalize text-lg">
                    {item.name || item.namaBarang}
                </h1>
                <p className='font-medium text-gray-500 text-sm'>
                  {isAsset === 'ya' ? 'Aset' : isAsset === 'tidak' ? 'Non Aset' : 'Bangunan'}
                </p>
            </div>
        </div>
        <div className="flex items-center my-2 gap-4">
          { initial === 'Stok' && (
            <p className="text-gray-500">Qty: <span className="font-semibold text-black">{item.qty}</span></p>
            )
          }
          <button
              className='px-2 py-1 detail-button self-center'
              aria-expanded={isExpanded}
              aria-label="Toggle details"
              onClick={toggleExpansion}
          >
              <i className={`bx bxs-chevron-down text-2xl text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* --- Expandable Content --- */}
      <div
        className={`
          mt-2 pt-2 transition-all duration-300 ease-out overflow-hidden
          ${isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
        `}
      >
          {/* --- Top Action Buttons --- */}
          <div className="flex justify-end items-center gap-2 mb-4">
            {canUpdate && (
                <button
                  className="w-fit px-5 py-2 update-button flex items-center text-sm gap-2"
                  onClick={() => handleUpdateClick(item.id)}
                >
                  Update
                  <i className="bx bx-edit"></i>
                </button>
            )}
            {canDelete && (
                <button
                  className="w-fit px-5 py-2 delete-button flex items-center text-sm gap-2"
                  onClick={() => handleDeleteClick(item.id)}
                >
                  Delete
                  <i className="bx bx-trash-alt"></i>
                </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:justify-between">
            {/* Left side: Details */}
            {/* ----- BARIS INI DIUBAH ----- */}
            <div className="flex-grow md:flex-grow-0">
              {initial === 'Barang' && (
                <div className="text w-full space-y-3">
                  <div className="text-gray-500">
                    Kode Barang <p className='text-black font-medium'>{item.kode_barang}</p>
                  </div>
                  <div className=" text-gray-500">
                    Kode Gudang <p className='text-black font-medium'>{item.kode_gudang}</p>
                  </div>
                  <div className="text-gray-500">
                    Satuan <p className='text-black font-medium'>{item.satuan}</p>
                  </div>
                </div>
              )}

              {(initial === 'Stok' || initial === 'StokAsset') && (
                <div className="text w-full space-y-2 pb-2">
                  <div className="text-gray-500">
                    Kode Barang <p className='text-black font-medium'>{item.kodeBarang}</p>
                  </div>
                  <div className=" text-gray-500">
                    Kode Gudang <p className='text-black font-medium'>{item.kodeGudang}</p>
                  </div>
                  <div className=" text-gray-500">
                    Tgl. Masuk <p className='text-black font-medium'>{DateFormat(item.tanggal_barang_masuk)}</p>
                  </div>
                  { initial === 'Stok' &&
                    <div className="text-gray-500">
                      Quantity <p className='text-black font-medium'>{item.qty}</p>
                    </div>
                  }
                  <div className="text-gray-500 space-x-2">
                    Note <p className='text-black font-medium'>{item.note}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Middle side: LPB (Stok Only) */}
            {/* {initial === 'Stok' && (
              <div className={`text w-fit border py-1 px-3 rounded-lg hover:bg-gray-50 transition-color duration-200 ${isOpenLPB ? 'bg-gray-100' : ''}`}>
                <button className="flex w-full items-center justify-between text-gray-700" onClick={toggleAccordionLPB}>
                  <p className='font-semibold text-left'>LPB</p>
                  <i className={`bx bx-chevron-${isOpenLPB ? 'up' : 'down'} text-2xl`}></i>
                </button>
                <div className={`space-y-2 transition-all duration-300 ease-in-out overflow-hidden ${isOpenLPB ? 'max-h-96 pt-2' : 'max-h-0'}`}>
                  <div className="text-gray-500">
                    Penerima <p className='text-black font-medium'>{item.penerimaLpb}</p>
                  </div>
                  <div className=" text-gray-500">
                    Kode <p className='text-black font-medium'>{item.kodeLpb}</p>
                  </div>
                  <div className=" text-gray-500">
                    Tanggal <p className='text-black font-medium'>{DateFormat(item.tanggalLpb)}</p>
                  </div>
                </div>
              </div>
            )} */}

            {/* Right side: Image */}
            <div className="flex-shrink-0 md:w-60 h-60 flex items-center justify-center">
              {(item.image || item.gambarBarang) ? (
                <img
                  src={`${apiUrl}${item.image || item.gambarBarang}`}
                  alt="item image"
                  className='cursor-pointer hover:opacity-80 transition-opacity object-cover w-full h-full rounded-md'
                  onClick={() => handleImageClick(`${apiUrl}${item.gambarBarang || item.image}`)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                    <p className='text-gray-500'>No Image</p>
                </div>
              )}
            </div>
          </div>

          {/* --- Bottom Detail Button --- */}
          <div className="mt-4">
              <button
                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors duration-200"
                onClick={() => handleDetailClick(item.id)}
              >
                Lihat Detail
              </button>
          </div>
        </div>
    </div>
  );
});

ItemCard.propTypes = {
  item: PropTypes.object.isRequired,
  handleDetailClick: PropTypes.func.isRequired,
  handleUpdateClick: PropTypes.func.isRequired,
  handleDeleteClick: PropTypes.func.isRequired,
  handleImageClick: PropTypes.func,
  canUpdate: PropTypes.bool,
  canDelete: PropTypes.bool,
  initial: PropTypes.string,
};

export default ItemCard;