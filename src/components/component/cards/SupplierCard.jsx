import React, { forwardRef } from 'react'

const SupplierCards = forwardRef(({item, deleteItems, goToDetail, goToUpdate, canUpdate, canDelete}, ref) => {

    return (
        <div className='rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[150px]' ref={ref}>
            <div className='mb-3 border-b items-center justify-center pb-2'>
                <p className='col-start-1 font-semibold text-xl capitalize leading-tight'>
                    {item.nama_perusahaan}
                </p>
            </div>
            <div className='space-y-1'>
                <div className='flex justify-between'>
                    <p className="">Alamat: <span className="text-right">{item.alamat}</span></p>
                </div>
                <div className='flex justify-between'>
                    <p className="">No. Telp: <span>{item.phone}</span></p>
                </div>
                <div className='flex justify-between'>
                    <p className="">PIC: <span>{item.PIC}</span></p>
                </div>
            </div>

            <div className='flex justify-end gap-2 pt-3'>
                {
                    canUpdate &&
                    <button
                        className="px-3 py-1.5 update-button"
                        onClick={() => goToUpdate(item.id)}
                    >
                        Update
                    </button>
                }
                {
                    canDelete &&
                    <button
                        onClick={() => deleteItems(item.id, item.nama_perusahaan)}
                        className="px-3 py-1.5 delete-button"
                    >
                        Delete
                    </button>
                }
            </div>
        </div>
    )
})

export default SupplierCards