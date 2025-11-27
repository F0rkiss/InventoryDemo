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

    const [groups, setGroups] = useState([])
    const [roles, setRoles] = useState([])
    const [activeRole, setActiveRole] = useState(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    const [nextCursor, setNextCursor] = useState(null)
    const [loading, setLoading] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)

    const loadingRef = useRef(false);
    const typingTimeoutRef = useRef(null);

    const navigate = useNavigate();
    const { canCreate, canUpdate, canDelete } = useMenuAccess('NavigationGroup')

    // FIX 1 — Extract role lebih aman
    const extractRoleName = (group) => group.role?.name || 'Unknown Role'

    // FIX 2 — agar tab selalu match data
    const recomputeRoles = (list) => {
        const unique = [...new Set(list.map(extractRoleName))];
        setRoles(unique);

        if (!unique.includes(activeRole)) {
            setActiveRole(unique[0] || null);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [searchTerm]);

    // FIX 3 — wrapper API benar
    const unwrap = (response) => {
        const raw = response.data.data;

        if (Array.isArray(raw)) {
            return { data: raw, next_cursor: null };
        }

        return {
            data: raw?.data || [],
            next_cursor: raw?.next_cursor || null
        };
    };

    const fetchItems = async () => {
        if (loadingRef.current) return;

        try {
            loadingRef.current = true;
            setLoading(true);
            setNextCursor(null);

            const url = searchTerm ? `inventNavigationGroup/${searchTerm}` : `inventNavigationGroup`;
            const response = await api.get(url);
            const wrapper = unwrap(response);

            setGroups(wrapper.data);
            recomputeRoles(wrapper.data);
            setNextCursor(wrapper.next_cursor);

        } catch (err) {
            console.error("Fetch error:", err);
            setGroups([]);
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

            const url = searchTerm ? `inventNavigationGroup/${searchTerm}` : `inventNavigationGroup`;
            const response = await api.get(url, { params: { cursor: nextCursor } });

            const wrapper = unwrap(response);

            setGroups(prev => {
                const existing = new Set(prev.map(p => p.id));
                const filtered = wrapper.data.filter(g => !existing.has(g.id));
                const merged = [...prev, ...filtered];
                recomputeRoles(merged);
                return merged;
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

    // FIX 4 — reset groups saat ketik
    const handleSearchChange = (query) => {
        setSearchQuery(query);
        clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            setGroups([]);
            setNextCursor(null);
            setActiveRole(null); // RESET TAB
            setSearchTerm(query);
        }, 700);
    };

    // FIX 5 — flatten menu lebih stabil
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

    const goToDetail = async (id) => navigate(`/navigation-groups/detail-navigation-groups/${await encrypting(id)}`);
    const goToUpdate = async (id) => navigate(`/navigation-groups/update-navigation-groups/${await encrypting(id)}`);

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
