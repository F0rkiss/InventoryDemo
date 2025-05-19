import React, { useEffect, useState } from 'react';

const MultiUpload = ({ items = { image: [] }, required, handleDelete, handleUpload}) => {
    const [currentSize, setCurrentSize] = useState(0)

    return (
        <div className='bg-white p-2 rounded-md border-solid border-gray-300 border text-gray-400 font-light font-inter overflow-hidden'>
            <input 
                type="file" 
                className='text-white w-1/2'
                multiple
                id="img"
                name="img" 
                required={required}
                accept={`image/png, image/jpeg`}
                onChange={handleUpload}      
            />
            <div className={`grid grid-cols-3 gap-4 ${items.image?.length > 0 ? 'mt-4' : ''}`}>
                {
                    items.image?.map((file, index) => {
                        const imageUrl = file instanceof File ? URL.createObjectURL(file) : file;
                        return (
                            <div key={index} className="gambar flex justify-center w-20 h-20 mt-3 relative">
                            {
                                <>
                                    <button 
                                        className='bg-red-500 absolute top-0 right-0 text-[8px] rounded-full text-white w-max py-1 font-bold px-2' 
                                        onClick={() => handleDelete(index)}
                                        type='button'
                                        >
                                        X
                                    </button>
                                    
                                    <img src={imageUrl} className='w-full h-auto object-cover rounded-md' />
                                </>
                            }
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
};

export default MultiUpload;
