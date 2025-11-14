import React, { useState } from 'react';
import { Block } from 'framework7-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Layout from '../component/Layout';
import Back from '../component/Back';
import Swal from 'sweetalert2';
import SelectPaginate from '../component/SelectPaginate';

function CreateApprovalStep() {
    const navigate = useNavigate();

    const [items, setItems] = useState({
        approval_step: '',          
        type: '',  
        user: null,              
        note: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setItems((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
        setErrors((prev) => {
            const n = { ...prev };
            delete n[name];
            return n;
        });
        }
    };

    const resetValue = () => {
        setItems({
        approval_step: '',
        type: '',
        user: null,
        note: '',
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
            type: items.type,
            user_id: items.user.value, 
            note: items.note,
        };

        await api.post('approvalStepPurchase-create', payload);

        Swal.fire({
            title: 'Approval Step Purchase berhasil dibuat!',
            icon: 'success',
            timer: 1800,
            showConfirmButton: false,
        });

        navigate('/approval-step-purchase/list-approval-step');
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
        <Layout title={'Create Approval Step Purchase'}>
        <Block>
            <div className="px-4">
            <Back goHome={() => navigate('/approval-step-purchase/list-approval-step')} />
            <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Create Approval Step Purchase</p>

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

export default CreateApprovalStep;