import React, { forwardRef } from 'react'

const MataUangCards = forwardRef(({item, deleteItems, goToUpdate, canUpdate, canDelete}, ref) => {

    return (
        <div className='rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col justify-between min-h-[150px]' ref={ref}>
            <div className='mb-3 border-b items-center justify-center pb-2'>
                <p className='col-start-1 font-semibold text-xl capitalize leading-tight'>
                    {item.kode}
                </p>
            </div>
            <div className='space-y-1'>
                <div className='flex justify-between'>
                    <p className="">Nama: <span className="text-right">{item.name}</span></p>
                </div>
                <div className='flex justify-between'>
                    <p className="">Symbol: <span>{item.symbol}</span></p>
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
                        onClick={() => deleteItems(item.id, item.kode)}
                        className="px-3 py-1.5 delete-button"
                    >
                        Delete
                    </button>
                }
            </div>
        </div>
    )
})

export default MataUangCards