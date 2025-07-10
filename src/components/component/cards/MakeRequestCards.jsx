import React, { forwardRef } from 'react'
import DateFormat from '../../../helper/DateFormatHelper'

const MakeRequestCards = forwardRef(({item, goToDetail, goToUpdate, restoreItems, deleteItems, restore = false}, ref) => {


    return (
        <div className='rounded-lg bg-white border mb-2 flex flex-col justify-between' ref={ref}>
            <div className='grid grid-cols-3 border-b'>
                <div className='col-start-2 place-items-center py-2'>
                    <p className='text-left font-bold text-xl capitalize'>{item.user?.EmpName || item.EmpName}</p>
                    <p className='text-center font-regular text-md text-gray-400'>{item.kode_mr}</p>
                </div>
                {
                    !restore && 
                    <div className='col-start-3 justify-self-end py-1'>
                        <button className='w-8 h-9' onClick={() => goToDetail(item.id)}>
                            <i className="bx bx-dots-vertical-rounded text-2xl max-xs:text-xl" />
                        </button> 
                    </div>
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
              <div className="flex justify-between">
                Note: <p>{item.note || '-'}</p>
              </div>
              {/* <div className="flex justify-between">
                Tanggal Dibuat: <p>{DateFormat(item.created_at)}</p>
              </div>
              <div className="flex justify-between">
                Tanggal Dirubah: <p>{DateFormat(item.updated_at)}</p>
              </div> */}
            </div>

            <div className='flex py-2 px-6 border-t'>
                { !restore ?
                <>
                    <button
                        className="update_button bg-white rounded-md me-4 text-cyan-400 font-bold"
                        onClick={() => goToUpdate(item.id)}
                    >
                        Update
                    </button>
                    <button
                        onClick={() => deleteItems(item.id, item.name)}
                        className="delete_button bg-white rounded-md text-red-500 font-bold"
                    >
                        Delete
                    </button>
                </>
                :
                    <button
                        className="restore_button bg-white rounded-md me-4 text-cyan-400 font-bold"
                        onClick={() => restoreItems(item.id, item.name)}
                    >
                        Restore
                    </button>
                }
            </div>
        </div>
    )
})

export default MakeRequestCards