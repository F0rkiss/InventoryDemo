import React, { useState, useEffect } from 'react';
import { Block } from 'framework7-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
import Back from '../component/Back';
import Swal from 'sweetalert2';
import Transition from '../component/Transition'
import SelectPaginate from '../component/SelectPaginate';

function UpdateApprovalStep() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const [decryptedId, setDecryptedId] = useState('')
    const [originalItems, setOriginalItems] = useState(null);
    const [isUnchanged, setIsUnchanged] = useState(true);
    const [contentVisible, setContentVisible] = useState(false)
    const [disabled, setDisabled] = useState(false)
    
    useEffect(() => {
        const decryptedIds = DecryptID(id)
            setDecryptedId(decryptedIds)
            if (!decryptedIds) {
                navigate(-1)
        }
    }, [id, navigate])

    useEffect(() => {
        if (decryptedId) {
            fetchItems()
        }
    }, [decryptedId])

  const [items, setItems] = useState({
    approval_step: '',          
    type: '',  
    user: null,              
    note: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async () => {
     try {
        const response = await api.get(`approvalStepPurchase-detail/${decryptedId}`);
        const data = response.data.data;
        const fetchedItems = {
            approval_step: data.approval_step?.toString() || '',
            type: data.type || '',
            user: data.user ? { value: data.user?.id, label: data.user?.EmpName } : null,
            note: data.note || '',        
        };
        setItems(fetchedItems);
        setOriginalItems(fetchedItems);
    } catch (error) {
        console.error('Error fetching approval step:', error);
    } finally { 
        setTimeout(() => setContentVisible(true), 50)
    }
  }

    useEffect(() => {
        if (!originalItems) return;

        const cur = {
            approval_step: String(items.approval_step ?? ''),
            type: String(items.type ?? ''),
            user_id: items.user?.value ?? null,
            note: (items.note ?? '').trim(),
        };
        const orig = {
            approval_step: String(originalItems.approval_step ?? ''),
            type: String(originalItems.type ?? ''),
            user_id: originalItems.user?.value ?? null,
            note: (originalItems.note ?? '').trim(),
        };

        const changed = Object.keys(cur).some(k => cur[k] !== orig[k]);
        setIsUnchanged(!changed);
    }, [items, originalItems]);


    const validate = () => {
        const e = {};

        if (items.approval_step === '' || isNaN(Number(items.approval_step))) {
            e.approval_step = 'Approval step wajib diisi (angka).';
        }
        if (!items.type) e.type = "Type Approval Wajib diisi";
        if (!items.user) e.user_id = 'User wajib dipilih.';
        if (!items.note?.trim()) e.note = 'Note wajib diisi.';

        setErrors(e);
        return Object.keys(e).length === 0;
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setItems(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            const n = { ...errors }; delete n[name]; setErrors(n);
        }
    };  

  const resetValue = () => {
    if (originalItems) {
      setItems(originalItems);
      setErrors({});
    }
  };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // no-change guard
        if (isUnchanged) {
            Swal.fire({
            icon: 'info',
            title: 'Tidak ada perubahan',
            text: 'Ubah setidaknya satu field sebelum menyimpan.',
            });
            return;
        }

        // align with PO page: disable guard first
        if (disabled) return;
        setDisabled(true);

        // field-level validation
        if (!validate()) {
            Swal.fire({
            icon: 'warning',
            title: 'Form Tidak Lengkap',
            text: 'Harap isi semua field yang wajib diisi.',
            });
            setDisabled(false);
            return;
        }

        try {
            const payload = {
            approval_step: Number(items.approval_step),
            type: items.type,
            user_id: items.user.value,
            note: items.note,
            };

            await api.put(`approvalStepPurchase-update/${decryptedId}`, payload);

            Swal.fire({
            title: 'Approval Step Purchase berhasil diubah!',
            icon: 'success',
            timer: 1800,
            showConfirmButton: false,
            });

            navigate('/approval-step-purchase/list-approval-step');
        } catch (err) {
            Swal.fire({
            icon: 'error',
            title: 'Gagal Memperbarui Approval Step',
            text: err?.response?.data?.msg || 'Kesalahan pada sistem',
            });
        } finally {
            setDisabled(false);
        }
        };

  return (
    <Layout title={'Update Approval Step Purchase'}>
      <Block>
        <div className="px-4">
          <Back goHome={() => navigate('/approval-step-purchase/list-approval-step')} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Update Approval Step Purchase</p>

          <Transition contentVisible={contentVisible}>
            <div className="p-8 bg-white shadow-sm rounded-lg border">
                <form onSubmit={handleSubmit} className="space-y-5">
                {/* approval_step */}
                <div className="md:grid md:grid-cols-2 md:gap-x-4">
                    {/* approval_step */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center">
                        <label className="font-semibold">Approval Step</label>
                        {errors.approval_step && (
                            <span className="text-red-500 text-sm">{errors.approval_step}</span>
                        )}
                        </div>
                        <div
                        className={`bg-white p-2 rounded-md border mt-2 ${
                            errors.approval_step ? 'border-red-500' : 'border-gray-300'
                        }`}
                        >
                        <input
                            type="number"
                            name="approval_step"
                            value={items.approval_step}
                            onChange={handleChange}
                            className="w-full p-2 placeholder:text-gray-400"
                            placeholder="Step (Angka)"
                        />
                        </div>
                    </div>

                    {/* type */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center">
                        <label className="font-semibold">Type Approval</label>
                        {errors.type && (
                            <span className="text-red-500 text-sm">{errors.type}</span>
                        )}
                        </div>
                        <div
                        className={`bg-white p-2 rounded-md border mt-2 ${
                            errors.type ? 'border-red-500' : 'border-gray-300'
                        }`}
                        >
                        <select
                            name="type"
                            value={items.type}
                            onChange={handleChange}
                            className="w-full h-11 px-3 rounded-md bg-transparent focus:outline-none"
                        >
                            <option value="">Pilih Type Approval</option>
                            <option value="PR">PR</option>
                            <option value="PO">PO</option>
                        </select>
                        </div>
                    </div>
                </div>

                {/* user_id (Select) */}
                <div className="mb-5 space-y-2">
                    <div className="flex justify-between items-center">
                    <label className="font-semibold">User</label>
                    {errors.user_id && <span className="text-red-500 text-sm">{errors.user_id}</span>}
                    </div>
                    <SelectPaginate
                    source={'inventUser'}
                    selectValue={items.user}
                    selectName={'User'}
                    itemLabel={['EmpName']}
                    handleSelectChange={user => setItems({...items, user})}
                    required
                    error={!!errors.user}
                    />
                </div>

                {/* note */}
                <div className="mb-4">
                    <div className="flex justify-between items-center">
                    <label className="font-semibold">Note</label>
                    {errors.note && <span className="text-red-500 text-sm">{errors.note}</span>}
                    </div>
                    <div className={`bg-white p-2 rounded-md border mt-2 ${errors.note ? 'border-red-500' : 'border-gray-300'}`}>
                    <textarea
                        name="note"
                        value={items.note}
                        onChange={handleChange}
                        className="w-full min-h-fit p-2 placeholder:text-gray-400"
                        maxLength={225}
                        placeholder="Notes"
                        rows="3"
                    />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                    <button
                    disabled={disabled || isUnchanged}
                    type="submit"
                    className="py-2 px-4 w-full rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-color duration-200 text-white disabled:bg-blue-300"
                    >
                        Update
                    </button>

                    <button
                    type="button"
                    className="py-2 px-4 w-full rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600"
                    onClick={resetValue}
                    >
                    Reset
                    </button>
                </div>
                </form>
            </div>
          </Transition> 
        </div>
      </Block>
    </Layout>
  );
}

export default UpdateApprovalStep;