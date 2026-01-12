import React, { useState, useEffect } from 'react';
import { Block } from 'framework7-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
import Back from '../component/Back';
import Swal from 'sweetalert2';
import Select from 'react-select';
import Transition from '../component/Transition'
import SelectPaginate from '../component/SelectPaginate';
import { accessOptions, findAccessOption } from '../../helper/FindOptions';


function UpdateApprovalMemo() {
    const { id } = useParams();
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
    }, [id])

    useEffect(() => {
        if (decryptedId) {
            fetchItems()
        }
    }, [decryptedId])

  const navigate = useNavigate();

  const [items, setItems] = useState({
    approval_step: '',          // number (required)
    back_to_approval_step: '',  // number (required)
    user: null,
    jenis_memo: null,              // SelectPaginate value (required)
    note: '',                   // text (required)
    is_upline: findAccessOption(0),             // "0" or "1" (required)
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async () => {
     try {
        const response = await api.get(`approvalStepMemo-detail/${decryptedId}`);
        const data = response.data.data;
        const fetchedItems = {
            approval_step: data.approval_step,          // number (required)
            back_to_approval_step: data.back_to_approval_step,  // number (required)
            user: data.user ? { value: data.user?.id, label: data.user?.EmpName } : '',  
            jenis_memo: data.jenis_memo ? { value: data.jenis_memo?.id, label: data.jenis_memo?.name } : '',
            note: data.note,        
            is_upline: findAccessOption(data.is_upline),    
        };
        setItems(fetchedItems);
        setOriginalItems(fetchedItems);
    } catch (error) {

    } finally { 
        setTimeout(() => setContentVisible(true), 50)
    }
  }

    useEffect(() => {
        if (!originalItems) return;

        const cur = {
            approval_step: String(items.approval_step ?? ''),
            back_to_approval_step: String(items.back_to_approval_step ?? ''),
            user_id: items.user?.value ?? null,
            jenis_memo_id: items.jenis_memo?.value ?? null,
            note: (items.note ?? '').trim(),
            is_upline: items.is_upline?.value ?? null,
        };
        const orig = {
            approval_step: String(originalItems.approval_step ?? ''),
            back_to_approval_step: String(originalItems.back_to_approval_step ?? ''),
            user_id: originalItems.user?.value ?? null,
            jenis_memo_id: originalItems.jenis_memo?.value ?? null,
            note: (originalItems.note ?? '').trim(),
            is_upline: originalItems.is_upline?.value ?? null,
        };

        const changed = Object.keys(cur).some(k => cur[k] !== orig[k]);
        setIsUnchanged(!changed);
    }, [items, originalItems]);


    const validate = () => {
        const e = {};

        if (items.approval_step === '' || isNaN(Number(items.approval_step))) {
            e.approval_step = 'Approval step wajib diisi.';
        }
        if (items.back_to_approval_step === '' || isNaN(Number(items.back_to_approval_step))) {
            e.back_to_approval_step = 'Back to approval step wajib diisi.';
        }
        if (!items.user) e.user = 'User wajib dipilih.';
        if (!items.jenis_memo) e.jenis_memo = 'Jenis Memo wajib dipilih.';
        if (!items.note?.trim()) e.note = 'Note wajib diisi.';
        if (!items.is_upline || ![0, 1].includes(items.is_upline.value)) {
            e.is_upline = 'Pilih Ya atau Tidak.';
        }

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
    setItems({
      approval_step: '',
      back_to_approval_step: '',
      user: null,
      jenis_memo: null,
      note: '',
      is_upline: findAccessOption(0),
    });
    setErrors({});
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
            back_to_approval_step: Number(items.back_to_approval_step),
            user_id: items.user.value,
            jenis_memo_id: items.jenis_memo.value,
            note: items.note,
            is_upline: items.is_upline.value,
            };

            await api.put(`approvalStepMemo-update/${decryptedId}`, payload);

            Swal.fire({
            title: 'Approval Step Memo berhasil diubah!',
            icon: 'success',
            timer: 1800,
            showConfirmButton: false,
            });

            navigate('/approval-step-memo/list-approval-step-memo');
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
    <Layout title={'Update Approval Step Memo'}>
      <Block>
        <div className="px-4">
          <Back goHome={() => navigate('/approval-step-memo/list-approval-step-memo')} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Update Approval Step Memo</p>

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

                    {/* back_to_approval_step */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center">
                        <label className="font-semibold">Kembali ke Approval Step</label>
                        {errors.back_to_approval_step && (
                            <span className="text-red-500 text-sm">{errors.back_to_approval_step}</span>
                        )}
                        </div>
                        <div
                        className={`bg-white p-2 rounded-md border mt-2 ${
                            errors.back_to_approval_step ? 'border-red-500' : 'border-gray-300'
                        }`}
                        >
                        <input
                            type="number"
                            name="back_to_approval_step"
                            value={items.back_to_approval_step}
                            onChange={handleChange}
                            className="w-full p-2 placeholder:text-gray-400"
                            placeholder="Step (Angka)"
                        />
                        </div>
                    </div>
                </div>

                <div className="mb-5 space-y-2">
                    <div className="flex justify-between items-center">
                    <label className="font-semibold">User</label>
                    {errors.user_id && <span className="text-red-500 text-sm">{errors.user_id}</span>}
                    </div>
                    <SelectPaginate
                    source={'inventUser'}
                    selectValue={items.user}
                    selectName={'User'}
                    itemLabel={['EmpName']} // will render "EmpName - Email". Adjust to your API shape.
                    handleSelectChange={user => setItems({...items, user})}
                    required
                    error={!!errors.user}
                    />
                </div>

                <div className="mb-5 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold">Jenis Memo</label>
                  {errors.jenis_memo && <span className="text-red-500 text-sm">{errors.jenis_memo}</span>}
                </div>
                <SelectPaginate
                  source={'jenis-memo/non-dynamicd'}
                  selectValue={items.jenis_memo}
                  selectName={'Jenis Memo'}
                  itemLabel={['name']}
                  handleSelectChange={jenis_memo => setItems({...items, jenis_memo})}
                  required
                  error={!!errors.jenis_memo}
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
                        placeholder="lorem ipsum dolor sit amet"
                        rows="3"
                    />
                    </div>
                </div>

                {/* is_upline (0/1) */}
                <div className="mb-2">
                    <div className="flex justify-between items-center">
                        <label className="font-semibold">Atasan</label>
                        {errors.is_upline && <span className="text-red-500 text-sm">{errors.is_upline}</span>}
                    </div>

                    <div className={`mt-2 ${errors.is_upline ? 'border-red-500' : 'border-gray-300'}`}>
                        <Select
                        name="is_upline"
                        className="w-full"
                        options={accessOptions}
                        value={items.is_upline}
                        onChange={is_upline => setItems({ ...items, is_upline })}
                        >
                        {/* <option value="" disabled>Pilih status</option>
                        {accessOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))} */}
                        </Select>
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

export default UpdateApprovalMemo;
