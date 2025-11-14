import React, { useEffect, useState } from 'react';
import { Block } from 'framework7-react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api/api';
import Back from '../component/Back';
import Layout from '../component/Layout';
import { DecryptID } from '../../helper/EncryptHelper';
import SelectPaginate from '../component/SelectPaginate';

function UpdateApprovalStep() {
  const [items, setItems] = useState({
    approval_step: '',
    back_to_approval_step: '',
    user_id: '',
    invent_type_request_id: '',
    is_upline: '',
    isAdminApproved: '',
    note: '',
    user_name: '',
    type_request_name: '',
  });

  const [decryptedId, setDecryptedId] = useState('');
  const [disabled, setDisabled] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const decryptedIds = DecryptID(id);
    setDecryptedId(decryptedIds);
    if (!decryptedIds) {
      navigate(-1);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (decryptedId) {
      fetchItems();
    }
  }, [decryptedId]);

  const fetchItems = async () => {
    try {
      const response = await api.get(`inventApprovalStep-detail/${decryptedId}`);
      const data = response.data.data;
      setItems({
        approval_step: data.approval_step?.toString() || '',
        back_to_approval_step: data.back_to_approval_step?.toString() || '',
        user_id: data.user_id?.toString() || '',
        invent_type_request_id: data.invent_type_request_id?.toString() || '',
        is_upline: data.is_upline === 1 ? 'yes' : 'no',
        isAdminApproved: data.isAdminApproved === 1 ? 'yes' : 'no',
        note: data.note || '',
        user_name: data.user?.EmpName || '',
        type_request_name: data.type_request?.name || '',
      });
    } catch (error) {
      console.error('Error fetching approval step:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;

    try {
      setDisabled(true);
      await api.put(`inventApprovalStep-update/${decryptedId}`, {
        approval_step: parseInt(items.approval_step, 10),
        back_to_approval_step: parseInt(items.back_to_approval_step, 10),
        user_id: parseInt(items.user_id, 10),
        invent_type_request_id: parseInt(items.invent_type_request_id, 10),
        is_upline: items.is_upline === 'yes' ? 1 : 0,
        isAdminApproved: items.isAdminApproved === 'yes' ? 1 : 0,
        note: items.note,
      });

      Swal.fire({
        title: 'Approval Step berhasil diperbarui!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/approval-step/list-approval-step');
    } catch (error) {
      console.error('Submit Error:', error);

      Swal.fire({
        icon: 'error',
        title: 'Gagal Update Approval Step',
        text: error.response?.data?.msg || 'Ada kesalahan dalam sistem',
      });
    } finally {
      setDisabled(false);
    }
  };

  return (
    <Layout title={'Update Approval Step'}>
      <Block>
        <div className="px-4">
          <Back goHome={() => navigate('/approval-step/list-approval-step')} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">
            Update Approval Step
          </p>

          <div className="p-8 bg-white shadow-sm rounded-lg border">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="font-semibold">User</label>
                <SelectPaginate
                  selectValue={
                    items.user_id
                      ? { label: items.user_name, value: items.user_id }
                      : null
                  }
                  source={'inventUser'}
                  selectName={'User'}
                  itemLabel={['EmpName']}
                  handleSelectChange={(selectedUser) =>
                    setItems({
                      ...items,
                      user_id: selectedUser?.value || '',
                      user_name: selectedUser?.label || '',
                    })
                  }
                  required
                />
              </div>

              <div className="md:grid md:grid-cols-2 md:gap-x-4">
                <div className="mb-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold">Approval Step</label>
                    <p className="text-xs text-gray-500">Nomor urutan persetujuan yang menentukan urutan approval.</p>
                  </div>
                  <div className="bg-white p-2 rounded-md border mt-2 border-gray-300">
                    <input
                      type="number"
                      name="approval_step"
                      value={items.approval_step}
                      onChange={(e) =>
                        setItems({ ...items, approval_step: e.target.value })
                      }
                      min="1"
                      max="10"
                      step="1"
                      placeholder="Approval Step Number"
                      className="w-full p-2 placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold">Kembali ke Approval Step</label>
                    <p className="text-xs text-gray-500">Step tujuan ketika permintaan ditolak dan harus diajukan ulang.</p>
                  </div>
                  <div className="bg-white p-2 rounded-md border mt-2 border-gray-300">
                    <input
                      type="number"
                      name="back_to_approval_step"
                      value={items.back_to_approval_step}
                      onChange={(e) =>
                        setItems({ ...items, back_to_approval_step: e.target.value })
                      }
                      min="1"
                      max="10"
                      step="1"
                      placeholder="Back to Approval Step Number"
                      className="w-full p-2 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold">Type Request</label>
                <SelectPaginate
                  selectValue={
                    items.invent_type_request_id
                      ? {
                          label: items.type_request_name,
                          value: items.invent_type_request_id,
                        }
                      : null
                  }
                  source={'inventTypeRequest'}
                  selectName={'Type Request'}
                  itemLabel={['name']}
                  handleSelectChange={(selectedType) =>
                    setItems({
                      ...items,
                      invent_type_request_id: selectedType?.value || '',
                      type_request_name: selectedType?.label || '',
                    })
                  }
                  required
                />
              </div>

              <div className="md:grid md:grid-cols-2 md:gap-x-4">
                <div className="mb-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold">Is Upline</label>
                    <p className="text-xs text-gray-500">
                      Pilih “Yes” jika approver adalah atasan dari departemen user.
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-md border mt-2 border-gray-300">
                    <select
                      name="is_upline"
                      value={items.is_upline}
                      onChange={(e) =>
                        setItems({ ...items, is_upline: e.target.value })
                      }
                      className="w-full p-2 capitalize"
                      required
                    >
                      <option value="">Select Option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold">Is Admin Approved</label>
                    <p className="text-xs text-gray-500">
                      Pilih “Yes” jika approver merupakan admin yang menyiapkan barang setelah approval.
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-md border mt-2 border-gray-300">
                    <select
                      name="isAdminApproved"
                      value={items.isAdminApproved}
                      onChange={(e) =>
                        setItems({ ...items, isAdminApproved: e.target.value })
                      }
                      className="w-full p-2 capitalize"
                      required
                    >
                      <option value="">Select Option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold">Note</label>
                <div className="bg-white p-2 rounded-md border border-gray-300">
                  <textarea
                    name="note"
                    value={items.note}
                    onChange={(e) => setItems({ ...items, note: e.target.value })}
                    maxLength={225}
                    placeholder="Note"
                    rows="3"
                    className="w-full p-2 placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                <button
                  disabled={disabled}
                  type="submit"
                  className="py-2 px-4 w-full rounded-lg font-medium bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white disabled:bg-blue-300"
                >
                  {disabled ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  className="py-2 px-4 w-full rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-colors duration-200 text-red-600"
                  onClick={fetchItems}
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

export default UpdateApprovalStep;