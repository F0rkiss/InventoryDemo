import React, { useEffect, useState } from 'react'
import api from '../../../api/api'
import { useNavigate } from 'react-router-dom'
import { Block } from 'framework7-react'
import { accessOptions } from '../../../helper/FindOptions'
import SelectPaginate from '../../component/SelectPaginate'
import Select from 'react-select'
import Back from '../../component/Back'
import Layout from '../../component/Layout'
import Swal from 'sweetalert2'
import Transition from '../../component/Transition'

function CreateNavigationGroups() {
  const navigate = useNavigate()

  const [items, setItems] = useState({
    role: null,
    navigation_menu: null,
    read_access: null,
    create_access: null,
    update_access: null,
    delete_access: null,
  })

  const [disabled, setDisabled] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setContentVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

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

      await api.post('inventNavigationGroup-create', {
        role_id: items.role?.value,
        invent_navigation_menus_id: items.navigation_menu?.value,
        read_access: items.read_access?.value,
        create_access: items.create_access?.value,
        update_access: items.update_access?.value,
        delete_access: items.delete_access?.value,
      })

      Swal.fire({
        title: 'Navigations Group berhasil dibuat!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
      navigate('/navigation-groups/list-navigation-groups')
      resetValue()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Tidak dapat membuat navigations group',
        text: 'Kesalahan dalam sistem',
      })
    } finally {
      setDisabled(false)
    }
  }

  const resetValue = () =>
    setItems({
      role: null,
      navigation_menu: null,
      read_access: null,
      create_access: null,
      update_access: null,
      delete_access: null,
    })

  return (
    <Layout title={'Create Navigation Group'}>
      <Block>
        <div className="px-4">
          <Back goHome={() => navigate('/navigation-groups/list-navigation-groups')} />
          <p className="lg:text-3xl text-2xl font-semibold capitalize my-4">Create Navigation Group</p>

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
                      placeholder="Pilih Akses Read"
                      onChange={(read_access) => setItems({ ...items, read_access })}
                      required
                    />
                  </div>
                  <div className="mb-5 space-y-2">
                    <label className="font-semibold">Update Access</label>
                    <Select
                      options={accessOptions}
                      value={items.update_access}
                      placeholder="Pilih Akses Update"
                      onChange={(update_access) => setItems({ ...items, update_access })}
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
                      placeholder="Pilih Akses Create"
                      onChange={(create_access) => setItems({ ...items, create_access })}
                      required
                    />
                  </div>
                  <div className="mb-5 space-y-2">
                    <label className="font-semibold">Delete Access</label>
                    <Select
                      options={accessOptions}
                      value={items.delete_access}
                      placeholder="Pilih Akses Delete"
                      onChange={(delete_access) => setItems({ ...items, delete_access })}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-self-center mt-10 max-w-full w-[25rem] space-y-2 text-center">
                  <button
                    disabled={disabled}
                    type="submit"
                    className="py-2 px-2 rounded-lg font-medium bg-blue-500/85 hover:bg-blue-500 transition-color duration-200 text-white disabled:bg-blue-200"
                  >
                    Create
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

export default CreateNavigationGroups
