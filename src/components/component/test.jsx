import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../../api/api';
import { useParams } from 'react-router-dom';
import Loader from './Loader';
import { DecryptID } from '../../helper/EncryptHelper';

const ImageAfterUpload = ({ items = { imgAfter: [] }, setItems, required, source }) => {

  useEffect(() => {
    const decryptIds = DecryptID(id)
    setDecryptedId(decryptIds)
  }, [id])


  const handleFileSelection = (e) => {
    const files = e.target.files;
    const fileArray = Array.from(files);
    setItems((prevItems) => ({
      ...prevItems,
      imgAfter : (prevItems.imgAfter || []).concat(fileArray),
    }));
  };

  const handleUpload = async (index) => {
    try {
      setLoadingIndex(index);
      const formdata = new FormData();
      formdata.append('imgAfter[]', items.imgAfter[index]);

      const response = await api.post(source || `makeRequest/admin/uploadImgAfter/${decryptedId}`, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const gambar = response.data.imgAfter;
      setIsUploaded((prev) => prev.map((status, i) => (i === index ? true : status)));
      setItems((prevItems) => ({
        ...prevItems,
        imgAfter : prevItems.imgAfter.map((item, i) => (i === index ? `${BaseURL}${gambar}` : item)),
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoadingIndex(null);
    }
  };

  const handleDelete = async (index) => {
    try {
      const result = await Swal.fire({
        title: 'Apakah Anda Yakin Untuk Menghapus Gambar Ini',
        icon: 'info',
        showDenyButton: true,
        confirmButtonText: 'Ya',
        denyButtonText: 'Tidak',
        customClass: {
          actions: 'my-actions',
          confirmButton: 'order-2',
          denyButton: 'order-3',
        },
      });

      if (result.isConfirmed) {
        const paths = items.imgAfter[index].slice(43); // assuming the slice path is correct
        await api.delete(`makeRequest/${decryptedId}/deleteImgAfter/${paths}`);
        await Swal.fire('Terhapus', ' ', 'success');
        setItems((prevItems) => ({
          ...prevItems,
          imgAfter: prevItems.imgAfter.filter((_, i) => i !== index),
        }));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <div className="bg-white p-2 rounded-md border-solid border-gray-300 border text-gray-400 font-light font-inter overflow-hidden">
      <input
        type="file"
        className="text-white w-1/2"
        multiple
        id="img"
        name="image"
        required={required}
        accept="image/png, image/jpeg"
        onChange={handleFileSelection}
      />
      <div className={`grid grid-cols-3 gap-4 ${items.imgAfter?.length > 0 ? 'mt-4' : ''}`}>
        {items.imgAfter?.map((file, index) => {
          const buktiUrl = file instanceof File ? URL.createObjectURL(file) : file;

          return (
            <div key={index} className="gambar flex justify-center item w-20 h-20 mt-3 relative">
              {loadingIndex === index ? (
                <div className="absolute">
                  <Loader contentClass={'max-w-8 max-h-8'} Class={'-translate-y-5 h-8 overflow-hidden'} />
                </div>
              ) : file instanceof File ? (
                <button
                  className={`absolute inset-0 w-full h-full flex items-center justify-center bg-transparent rounded-md text-white ${
                    loadingIndex !== index && loadingIndex !== null && 'bg-black bg-opacity-20'
                  }`}
                  onClick={() => handleUpload(index)}
                  type="button"
                  disabled={loadingIndex !== null && index !== loadingIndex}
                >
                  <span
                    className={`bg-blue-500 py-1 px-2 rounded-md text-sm ${
                      loadingIndex !== null && index !== loadingIndex ? 'bg-blue-300 cursor-not-allowed' : ''
                    }`}
                  >
                    Upload
                  </span>
                </button>
              ) : (
                <button
                  className="bg-red-500 absolute top-0 right-0 text-[8px] rounded-full text-white w-max py-1 font-bold px-2"
                  onClick={() => handleDelete(index)}
                  type="button"
                >
                  X
                </button>
              )}
              <img src={buktiUrl} className="w-full h-auto object-cover rounded-md" alt="preview" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageAfterUpload;
