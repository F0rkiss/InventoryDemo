import React, { useState, useEffect } from 'react';
import SelectPaginate from './SelectPaginate';

const ViewerAccessModal = ({
  show,
  mode, // 'viewer' | 'approver'
  view, // 'list' | 'form'
  dataList = [],
  loading,
  onClose,
  onAdd,
  onEdit,
  onDelete,
  onBack,
  onSave,
  selectedItem
}) => {
  
  // State lokal untuk form handling
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form saat masuk mode form
  useEffect(() => {
    if (view === 'form') {
      if (selectedItem) {
        // Mode Edit
        setFormData({
            // Mapping user select
            user: selectedItem.user ? { value: selectedItem.user_id, label: selectedItem.user.EmpName || selectedItem.EmpName } : selectedItem ? { value: selectedItem.user_id, label: selectedItem.EmpName } : null,
            // Mapping note (pastikan field backend 'note' atau 'notes' disesuaikan disini, saya pakai 'note' sesuai request)
            note: selectedItem.note || selectedItem.notes || '', 
            
        });
      } else {
        // Mode Create: Reset
        setFormData({});
      }
    }
  }, [view, selectedItem]);

  if (!show) return null;

  // --- RENDER TITLE ---
  const getTitle = () => {
    if (view === 'list') {
      return mode === 'viewer' ? 'Dapat dilihat oleh' : 'Pengaturan approval';
    } else {
      const action = selectedItem ? 'Edit' : 'Tambah';
      const subject = mode === 'viewer' ? 'pengguna baru' : 'approver';
      return `${action} ${subject}`;
    }
  };

  // --- HANDLE SUBMIT FORM ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Format data payload sesuai request: user_id & note
    const payload = {
        user_id: formData.user?.value,
        note: formData.note 
    };
    
    await onSave(payload);
    setSubmitting(false);
  };

  // --- RENDER CONTENT LIST ---
  const renderListContent = () => {
    if (loading) return <div className="text-center py-8 text-gray-500">Loading data...</div>;
    
    if (dataList.length === 0) {
      return <div className="text-center py-8 text-gray-400 italic">Belum ada data.</div>;
    }

    return (
      <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-3 p-1">
        {mode === 'viewer' ? (
           // --- LIST VIEWER STYLE ---
           dataList.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg transition-colors group">
              <div>
                 <p className="text-sm font-semibold text-gray-700">{item.EmpName || item.name || 'User'}</p>
                 <p className="text-xs text-gray-500">{item.email || 'user@mail.com'}</p>
              </div>
              <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(item)} className="text-amber-500 hover:text-amber-600"><i className='bx bx-edit text-xl'></i></button>
                <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-600"><i className='bx bx-trash text-xl'></i></button>
              </div>
            </div>
          ))
        ) : (
           // --- LIST APPROVER STYLE (Simplified) ---
           <>
            <div className="flex text-xs font-bold text-gray-400 mb-2 px-2">
                <div className="w-1/3">Nama</div>
                <div className="w-2/3">Notes</div>
                <div className="w-1/3">Step</div>
                {/* Kolom Step dihapus karena tidak diminta */}
                <div className="w-16"></div>
            </div>
            {dataList.map((item, idx) => (
                <div key={idx} className="flex items-start p-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg text-sm group">
                    <div className="w-1/3 font-medium text-gray-800 pr-2">{item.name || item.user?.EmpName}</div>
                    <div className="w-2/3 text-gray-500 text-xs pr-2">{item.note || item.notes || '-'}</div>
                    <div className="w-1/3 text-gray-500 text-xs pr-2">{item.step_order || '-'}</div>
                    <div className="w-16 flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(item)} className="text-amber-500"><i className='bx bx-edit text-lg'></i></button>
                        <button onClick={() => onDelete(item.id)} className="text-red-500"><i className='bx bx-trash text-lg'></i></button>
                    </div>
                </div>
            ))}
           </>
        )}
      </div>
    );
  };

  // --- RENDER CONTENT FORM ---
  const renderFormContent = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        
        {/* Field User (Dipakai di Viewer & Approver) */}
        <div>
            {console.log('formData.user:', formData.user)}
            <label className="text-xs font-semibold text-gray-500 mb-1">User</label>
            <SelectPaginate
                source={"inventUser"} 
                selectValue={formData.user}
                itemLabel={['EmpName']}
                handleSelectChange={(val) => setFormData({...formData, user: val})}
                placeholder="Cari pengguna..."
                className="text-sm"
            />
        </div>

        {/* Field Khusus Approver: Note Saja */}
        {mode === 'approver' && (
            <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 ">Note</label>
                <textarea 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-blue-500 min-h-[80px]"
                    value={formData.note || ''}
                    onChange={e => setFormData({...formData, note: e.target.value})}
                    placeholder="Tambahkan catatan approval..."
                />
            </div>
        )}

        {/* Action Buttons Form */}
        <div className="flex gap-2 pt-4 mt-auto">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.user} // Disable jika user belum dipilih
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : (selectedItem ? 'Update' : 'Tambah')}
            </button>
        </div>
      </form>
    );
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-2xl animate-fade-in">
      <div className={`bg-white p-6 rounded-2xl shadow-2xl w-[90%] border border-gray-100 relative flex flex-col transition-all max-w-md`}>
        
        {/* Header Modal */}
        <div className="w-full flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-3 w-full">
             {view === 'form' && (
                <button onClick={onBack} className="hover:bg-gray-100 rounded-full p-1 transition-colors w-fit">
                    <i className='bx bx-arrow-back text-xl text-gray-700'></i>
                </button>
             )}
             <h3 className="text-lg font-bold text-gray-800">{getTitle()}</h3>
          </div>
          
          {view === 'list' && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-fit">
                <i className="bx bx-x text-2xl"></i>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="min-h-[200px]">
            {view === 'list' ? renderListContent() : renderFormContent()}
        </div>

        {/* Floating Add Button */}
        {view === 'list' && (
            <div className="flex self-end bottom-6 right-6">
                 <button 
                    onClick={onAdd}
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                >
                    <i className='bx bx-plus text-2xl'></i>
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default ViewerAccessModal;