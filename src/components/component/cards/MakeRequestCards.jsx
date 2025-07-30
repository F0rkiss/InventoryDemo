import React, { forwardRef } from 'react'
import DateFormat from '../../../helper/DateFormatHelper'

const MakeRequestCards = forwardRef(({item, goToDetail, canUpdate, goToUpdate, restoreItems, deleteItems, restore = false}, ref) => {


    return (
        <div className='rounded-lg bg-white border mb-2 flex flex-col justify-between' ref={ref}>
            <div className='border-b flex flex-col items-center justify-center py-3 min-h-[64px] relative'>
                <p className='font-bold text-xl capitalize text-center leading-tight'>
                    {item.user?.EmpName || item.EmpName}
                </p>
                <p className='font-regular text-md text-gray-400 text-center'>
                    {item.kode_mr}
                </p>
                {
                    !restore && (
                        <button
                        className='absolute right-2 top-2 w-8 h-9'
                        onClick={() => goToDetail(item.id)}
                        >
                        <i className="bx bx-dots-vertical-rounded text-2xl max-xs:text-xl" />
                        </button>
                    )
                }
            </div>


            <div className="m-3 text-right gap-2">
              <div className="flex justify-between">
                Type Request: <p>{item.type_request?.name || item.nameTypeRequest}</p>
              </div>
              <div className="flex justify-between">
                Jenis: <p>{item.type_request?.jenis || item.jenisTypeRequest}</p>
              </div>
                {
                    item.type_request?.description && 

                    <div className="flex justify-between">
                        Description: <p>{item.type_request?.description}</p>
                    </div>
                } 
            </div>

            <div className='flex py-2 px-6 border-t'>
                { canUpdate &&
                    <button
                        className="update_button bg-white rounded-md me-4 text-cyan-400 font-bold"
                        onClick={() => goToUpdate(item.id)}
                    >
                        Update
                    </button>
                }
            </div>
        </div>
    )
})

export default MakeRequestCards