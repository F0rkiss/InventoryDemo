import React, { useEffect, useState } from 'react'
import api from '../../../api/api'
import { useNavigate, useParams } from 'react-router-dom'
import { Block } from 'framework7-react'
import SelectPaginate from '../../component/SelectPaginate'
import { DecryptID } from '../../../helper/EncryptHelper'
import Select from 'react-select'
import Transition from '../../component/Transition'
import { accessOptions, findAccessOption } from '../../../helper/FindOptions'
import Back from '../../component/Back'
import Layout from '../../component/Layout'
import Swal from 'sweetalert2'

function UpdateNavigationGroups() {
  const [items, setItems] = useState({
    role: null,
    navigation_menu: null,
    read_access: null,
    create_access: null,
    update_access: null,
    delete_access: null,
  })

  const [disabled, setDisabled] = useState(false)
  const [decryptedId, setDecryptedId] = useState('')
  const [contentVisible, setContentVisible] = useState(false)
  const [originalItems, setOriginalItems] = useState(null)
  const [isUnchanged, setIsUnchanged] = useState(true)

  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    const decryptedIds = DecryptID(id)
    setDecryptedId(decryptedIds)
    if (!decryptedIds) navigate(-1)
  }, [id])

  useEffect(() => {
    if (decryptedId) fetchItems()
  }, [decryptedId])

  const fetchItems = async () => {
    try {
      const res = await api.get(`inventNavigationGroup-detail/${decryptedId}`)
      const data = res.data.data
      const fetched = {
        role: data.role ? { value: data.role.id, label: data.role.name } : null,
        navigation_menu: data.navigation_menu
          ? { value: data.navigation_menu.id, label: data.navigation_menu.name }
          : null,
        read_access: findAccessOption(data.read_access),
        create_access: findAccessOption(data.create_access),
        update_access: findAccessOption(data.update_access),
        delete_access: findAccessOption(data.delete_access),
      }
      setItems(fetched)
      setOriginalItems(fetched)
      setIsUnchanged(true)
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal memuat data',
        text: 'Silakan coba lagi.',
      })
    } finally {
        setTimeout(() => setContentVisible(true), 50)
    }
  }

  // Disable Update until there is a change
  useEffect(() => {
    if (!originalItems) return
    const changed =
      (items.role?.value ?? null) !== (originalItems.role?.value ?? null) ||
      (items.navigation_menu?.value ?? null) !== (originalItems.navigation_menu?.value ?? null) ||
      (items.read_access?.value ?? null) !== (originalItems.read_access?.value ?? null) ||
      (items.create_access?.value ?? null) !== (originalItems.create_access?.value ?? null) ||
      (items.update_access?.value ?? null) !== (originalItems.update_access?.value ?? null) ||
      (items.delete_access?.value ?? null) !== (originalItems.delete_access?.value ?? null)

    setIsUnchanged(!changed)
  }, [items, originalItems])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (disabled) return
      setDisabled(true)

      if (
        !items.role ||
        !items.navigation_menu ||
        !items.read_access ||
        !items.create_access ||
        !items.update_access ||
        !items.delete_access
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'Data belum lengkap',
          text: 'Semua akses dan pilihan wajib diisi.',
        })
        setDisabled(false)
        return
      }

      await api.put(`inventNavigationGroup-update/${decryptedId}`, {
        role_id: items.role?.value,
        invent_navigation_menus_id: items.navigation_menu?.value,
        read_access: items.read_access?.value,
        create_access: items.create_access?.value,
        update_access: items.update_access?.value,
        delete_access: items.delete_access?.value,
      })

      Swal.fire({
        title: 'Berhasil diubah!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
      navigate('/navigation-groups/list-navigation-groups')
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Tidak dapat mengubah navigations group',
        text: 'Kesalahan dalam sistem',
      })
    } finally {
      setDisabled(false)
    }
  }

  const resetValue = () => {
    if (originalItems) setItems(originalItems)
    else
      setItems({
        role: null,
        navigation_menu: null,
        read_access: null,
        create_access: null,
        update_access: null,
        delete_access: null,
      })
  }

  return (
    <Layout title={'Update Navigation Group'}>
      <Block>
        <div className="px-4">
          <Back goHome={() => navigate('/navigation-groups/list-navigation-groups')} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Update Navigation Group</p>

          <Transition contentVisible={contentVisible}>
            <div className="p-8 bg-white shadow-sm rounded-lg border">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Role</label>
                  <SelectPaginate
                    source={'role'}
                    selectValue={items.role}
                    selectName={'Role'}
                    itemLabel={['name']}
                    handleSelectChange={(role) => setItems({ ...items, role })}
                    required
                  />
                </div>

                <div className="mb-5 space-y-2">
                  <label className="font-semibold">Navigation Menu</label>
                  <SelectPaginate
                    source={'inventNavigationMenu'}
                    selectValue={items.navigation_menu}
                    selectName={'Navigation Menu'}
                    itemLabel={['name']}
                    handleSelectChange={(navigation_menu) => setItems({ ...items, navigation_menu })}
                    required
                  />
                </div>

                {/* Row 1: Read (left) — Update (right) */}
                <div className="md:grid md:grid-cols-2 md:gap-x-4">
                  <div className="mb-5 space-y-2">
                    <label className="font-semibold">Read Access</label>
                    <Select
                      options={accessOptions}
                      value={items.read_access}
                      onChange={(read_access) => setItems({ ...items, read_access })}
                      placeholder="Select Read Access"
                      required
                    />
                  </div>
                  <div className="mb-5 space-y-2">
                    <label className="font-semibold">Update Access</label>
                    <Select
                      options={accessOptions}
                      value={items.update_access}
                      onChange={(update_access) => setItems({ ...items, update_access })}
                      placeholder="Select Update Access"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Create (left) — Delete (right) */}
                <div className="md:grid md:grid-cols-2 md:gap-x-4">
                  <div className="mb-5 space-y-2">
                    <label className="font-semibold">Create Access</label>
                    <Select
                      options={accessOptions}
                      value={items.create_access}
                      onChange={(create_access) => setItems({ ...items, create_access })}
                      placeholder="Select Create Access"
                      required
                    />
                  </div>
                  <div className="mb-5 space-y-2">
                    <label className="font-semibold">Delete Access</label>
                    <Select
                      options={accessOptions}
                      value={items.delete_access}
                      onChange={(delete_access) => setItems({ ...items, delete_access })}
                      placeholder="Select Delete Access"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                  <button
                    disabled={disabled || isUnchanged}
                    type="submit"
                    className="py-2 px-2 rounded-lg font-medium bg-blue-500/85 hover:bg-blue-500 transition-color duration-200 text-white disabled:bg-blue-200"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={resetValue}
                    className="py-2 px-2 rounded-lg font-medium border border-red-200 bg-red-50 hover:bg-red-100 transition-color duration-200 text-red-600"
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
  )
}

export default UpdateNavigationGroups
