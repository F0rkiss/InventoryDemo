import React, { useState } from 'react';
import { Block } from 'framework7-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Layout from '../component/Layout';
import Back from '../component/Back';
import Swal from 'sweetalert2';
import Select from 'react-select';
import SelectPaginate from '../component/SelectPaginate';
import { accessOptions, findAccessOption } from '../../helper/FindOptions';


function CreateApprovalLPB() {
  const navigate = useNavigate();

  const [items, setItems] = useState({
    approval_step: '',          // number (required)
    back_to_approval_step: '',  // number (required)
    user: null,              // SelectPaginate value (required)
    note: '',                   // text (required)
    is_upline: findAccessOption(0),             // "0" or "1" (required)
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (items.approval_step === '' || isNaN(Number(items.approval_step))) {
      e.approval_step = 'Approval step wajib diisi (angka).';
    }
    if (items.back_to_approval_step === '' || isNaN(Number(items.back_to_approval_step))) {
      e.back_to_approval_step = 'Back to approval step wajib diisi (angka).';
    }
    if (!items.user_id) e.user_id = 'User wajib dipilih.';
    if (!items.note?.trim()) e.note = 'Note wajib diisi.';
    if (!items.is_upline || ![0,1].includes(items.is_upline.value)) {
        e.is_upline = 'Pilih Ya atau Tidak.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItems((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };

//   const handleSelectChange = (name, value) => {
//     setItems((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors((prev) => {
//         const n = { ...prev };
//         delete n[name];
//         return n;
//       });
//     }
//   };

  const resetValue = () => {
    setItems({
      approval_step: '',
      back_to_approval_step: '',
      user_id: null,
      note: '',
      is_upline: findAccessOption(0),
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      Swal.fire({
        icon: 'warning',
        title: 'Form Tidak Lengkap',
        text: 'Harap isi semua field yang wajib diisi.',
      });
      return;
    }

    try {
      if (isSubmitting) return;
      setIsSubmitting(true);

      const payload = {
        approval_step: Number(items.approval_step),
        back_to_approval_step: Number(items.back_to_approval_step),
        user_id: items.user.value, 
        note: items.note,
        is_upline: items.is_upline.value,
      };

      await api.post('approvalStepLPB-create', payload);

      Swal.fire({
        title: 'Approval Step LPB berhasil dibuat!',
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
      });

      navigate('/approval-step-lpb/list-approval-step-lpb'); // <-- adjust to your list route
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Membuat Approval Step',
        text: err?.response?.data?.msg || 'Kesalahan pada sistem',
      });
      console.error(err?.response?.data || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title={'Create Approval Step LPB'}>
      <Block>
        <div className="px-4">
          <Back goHome={() => navigate('/approval-step-lpb/list-approval-step-lpb')} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Create Approval Step LPB</p>

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

              {/* user_id (Select) */}
              <div className="mb-5 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold">User</label>
                  {errors.user_id && <span className="text-red-500 text-sm">{errors.user_id}</span>}
                </div>
                <SelectPaginate
                  // TODO: change this to your actual users endpoint used by SelectPaginate
                  source={'inventUser'}
                  selectValue={items.user}
                  selectName={'User'}
                  itemLabel={['EmpName']} // will render "EmpName - Email". Adjust to your API shape.
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
                  disabled={isSubmitting}
                  type="submit"
                  className="py-2 px-4 w-full rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-color duration-200 text-white disabled:bg-blue-300"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
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
        </div>
      </Block>
    </Layout>
  );
}

export default CreateApprovalLPB;
