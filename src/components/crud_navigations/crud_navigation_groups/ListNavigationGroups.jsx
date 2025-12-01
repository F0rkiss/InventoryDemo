import React, { useEffect, useState, useRef, useMemo } from 'react';
import api from '../../../api/api';
import SearchBar from '../../component/SearchBar';
import { Block } from 'framework7-react';
import ScrollPagination from '../../component/ScrollPagination';
import Loader from '../../component/Loader';
import Transition from '../../component/Transition';
import { useNavigate } from 'react-router-dom';
import FlyingButton from '../../component/FlyingButton';
import Swal from 'sweetalert2';
import Layout from '../../component/Layout';
import Tabs from '../../component/Tabs';
import { encrypting } from '../../../helper/EncryptHelper';
import NavigationCards from '../../component/cards/NavigationsCards';
import DataEmpty from '../../component/DataEmpty';
import useMenuAccess from '../../../hooks/useMenuAccess';

function ListNavigationGroup() {

    const [groups, setGroups] = useState([]);
    const [roles, setRoles] = useState([]);
    const [activeRole, setActiveRole] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [nextCursor, setNextCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);

    const loadingRef = useRef(false);
    const typingTimeoutRef = useRef(null);

    const navigate = useNavigate();
    const { canCreate, canUpdate, canDelete } = useMenuAccess('NavigationGroup');

    const extractRoleName = (group) => group.role?.name || 'Unknown Role';

    /** NORMALIZE BACKEND RESULT HERE */
    const normalizeResponse = (data, isSearchMode) => {
        if (!isSearchMode) {
            // mode normal, bentuk sudah sesuai
            return data;
        }

        // MODE SEARCH → backend mengembalikan bentuk flat → ubah ke group
        const grouped = {};

        data.forEach(item => {
            const roleName = item.role_name || 'Unknown';
            
            if (!grouped[roleName]) {
                grouped[roleName] = {
                    role: { name: roleName },
                    menus: []
                };
            }

            grouped[roleName].menus.push({
                id: item.id,
                menu: item.navigation_menu,
                create_access: item.create_access,
                read_access: item.read_access,
                update_access: item.update_access,
                delete_access: item.delete_access
            });
        });

        return Object.values(grouped); 
    };

    const unwrap = (res, isSearch) => {
        const raw = res.data.data;

        // Without search → raw = array
        if (!isSearch) {
            return { data: raw, next_cursor: null };
        }

        // With search → raw = { data: [...], next_cursor? }
        return {
            data: raw.data || [],
            next_cursor: raw.next_cursor || null
        };
    };

    const recomputeRoles = (list) => {
        const unique = [...new Set(list.map(extractRoleName))];
        setRoles(unique);

        // Saat search → langsung pindah ke role pertama
        if (searchTerm) {
            setActiveRole(unique[0] || null);
            return;
        }

        if (!unique.includes(activeRole)) {
            setActiveRole(unique[0] || null);
        }
    };

    const fetchItems = async () => {
        if (loadingRef.current) return;

        try {
            loadingRef.current = true;
            setLoading(true);
            setGroups([]);
            setNextCursor(null);

            const isSearch = !!searchTerm;
            const url = isSearch 
                ? `inventNavigationGroup/${searchTerm}` 
                : 'inventNavigationGroup';

            const response = await api.get(url);
            const wrapper = unwrap(response, isSearch);

            const normalized = normalizeResponse(wrapper.data, isSearch);
            setGroups(normalized);
            recomputeRoles(normalized);
            setNextCursor(wrapper.next_cursor);

        } catch (err) {
            console.error("Fetch error:", err);
            setGroups([]);
            setRoles([]);
            setActiveRole(null);

        } finally {
            loadingRef.current = false;
            setLoading(false);
            setTimeout(() => setContentVisible(true), 80);
        }
    };

    const fetchMoreItems = async () => {
        if (!nextCursor || loadingRef.current) return;

        try {
            loadingRef.current = true;
            setLoading(true);

            const isSearch = !!searchTerm;
            const url = isSearch 
                ? `inventNavigationGroup/${searchTerm}` 
                : 'inventNavigationGroup';

            const res = await api.get(url, {
                params: { cursor: nextCursor }
            });

            const wrapper = unwrap(res, isSearch);
            const normalized = normalizeResponse(wrapper.data, isSearch);

            setGroups(prev => {
                return [...prev, ...normalized];
            });

            setNextCursor(wrapper.next_cursor);

        } catch (err) {
            console.error("Pagination error:", err);
            setNextCursor(null);

        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    };

    const handleSearchChange = (q) => {
        setSearchQuery(q);
        clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            setSearchTerm(q);
        }, 500);
    };

    const flattenedMenus = useMemo(() => {
        const group = groups.find(g => extractRoleName(g) === activeRole);
        return group?.menus?.map(m => ({
            id: m.id,
            role: group.role,
            navigation_menu: { name: m.menu },
            create_access: m.create_access,
            read_access: m.read_access,
            update_access: m.update_access,
            delete_access: m.delete_access
        })) || [];
    }, [groups, activeRole]);

    const deleteItems = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Apakah Anda ingin menghapus navigasi ini?',
                icon: 'question',
                showDenyButton: true,
                confirmButtonText: 'Yes',
            });

            if (result.isConfirmed) {
                await api.delete(`inventNavigationGroup-delete/${id}`);

                setGroups(prev =>
                    prev.map(g =>
                        extractRoleName(g) !== activeRole
                            ? g
                            : { ...g, menus: g.menus.filter(m => m.id !== id) }
                    )
                );

                Swal.fire('Terhapus!', '', 'success');
            }

        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Menghapus',
                text: 'Ada Kesalahan Dalam Sistem'
            });
        }
    };

    const goToDetail = async (id) => 
        navigate(`/navigation-groups/detail-navigation-groups/${await encrypting(id)}`);

    const goToUpdate = async (id) => 
        navigate(`/navigation-groups/update-navigation-groups/${await encrypting(id)}`);

    useEffect(() => {
        setContentVisible(false);
        fetchItems();
    }, [searchTerm]);

    return (
        <Layout title="List Navigations">
            <Block>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2'>
                    <p className='lg:text-3xl text-2xl font-semibold capitalize'>Daftar Navigation Group</p>
                    <SearchBar
                        onChange={handleSearchChange}
                        disable={loading}
                        values={searchQuery}
                    />
                </div>

                <Transition contentVisible={contentVisible}>
                    {roles.length > 0 && (
                        <Tabs items={roles} active={activeRole} onChange={setActiveRole} />
                    )}

                    {flattenedMenus.length > 0 ? (
                        <ScrollPagination
                            rootSelector=".page-content"
                            fetchMoreItems={fetchMoreItems}
                            loading={loading}
                            nextCursor={nextCursor}
                        >
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                                {flattenedMenus.map(item => (
                                    <NavigationCards
                                        key={item.id}
                                        item={item}
                                        goToDetail={goToDetail}
                                        goToUpdate={goToUpdate}
                                        deleteItems={deleteItems}
                                        canDelete={canDelete}
                                        canUpdate={canUpdate}
                                    />
                                ))}
                            </div>
                        </ScrollPagination>
                    ) : (
                        !loading && <DataEmpty />
                    )}
                </Transition>

                {loading && <Loader Class="mt-44" />}
            </Block>

            {canCreate && <FlyingButton goTo="/navigation-groups/create-navigation-groups" />}
        </Layout>
    );
}

export default ListNavigationGroup;
