import React, { Suspense, lazy } from 'react';
import { App } from 'framework7-react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// Login
import Login from '../auth/Login.jsx';
import { AuthProvider } from '../auth/AuthContext.jsx';
import RequireAuth from '../auth/RequireAuth.jsx';

// Store
import store from '../js/store';
import '../css/app.css';
import Loader from './component/Loader.jsx';

// Lazy load components
const BarangList = lazy(() => import('./crud_barang/BarangList.jsx'));
const CreateBarang = lazy(() => import('./crud_barang/CreateBarang.jsx'));
const UpdateBarang = lazy(() => import('./crud_barang/UpdateBarang.jsx'));
const DetailBarang = lazy(() => import('./crud_barang/DetailBarang.jsx'));
const RestoreBarang = lazy(() => import('./crud_barang/RestoreBarang.jsx'))

const ListJenisBarang = lazy(() => import('./crud_jenis_barang/ListJenisBarang.jsx'));
const CreateJenisBarang = lazy(() => import('./crud_jenis_barang/CreateJenisBarang.jsx'));
const UpdateJenisBarang = lazy(() => import('./crud_jenis_barang/UpdateJenisBarang.jsx'));
const DetailJenisBarang = lazy(() => import('./crud_jenis_barang/DetailJenisBarang.jsx'));

const ListSumberBarang = lazy(() => import('./crud_Sumber_barang/ListSumberBarang.jsx'));
const CreateSumberBarang = lazy(() => import('./crud_Sumber_barang/CreateSumberBarang.jsx'));
const UpdateSumberBarang = lazy(() => import('./crud_Sumber_barang/UpdateSumberBarang.jsx'));
const DetailSumberBarang = lazy(() => import('./crud_Sumber_barang/DetailSumberBarang.jsx'));

const CategoryList = lazy(() => import('./crud-category/CategoryList.jsx'));
const DetailCategory = lazy(() => import('./crud-category/DetailCategory.jsx'));
const UpdateCategory = lazy(() => import('./crud-category/UpdateCategory.jsx'));
const CreateCategory = lazy(() => import('./crud-category/CreateCategory.jsx'));
const RestoreCategory = lazy(() => import('./crud-category/RestoreCategory.jsx'))

const Dashboard = lazy(() => import('./dashboard/Dashboard.jsx'));

const ListDivisi = lazy(() => import('./crud_divisi/ListDivisi.jsx'));
const UpdateDivisi = lazy(() => import('./crud_divisi/UpdateDivisi.jsx'));
const CreateDivisi = lazy(() => import('./crud_divisi/CreateDivisi.jsx'));
const RestoreDivisi = lazy(() => import('./crud_divisi/RestoreDivisi.jsx'))

const UserList = lazy(() => import('./crud_user/UserList.jsx'));
const DetailUser = lazy(() => import('./crud_user/DetailUser.jsx'));
const CreateUser = lazy(() => import('./crud_user/CreateUser.jsx'));
const UpdateUser = lazy(() => import('./crud_user/UpdateUser.jsx'));
const RestoreUser = lazy(() => import('./crud_user/RestoreUser.jsx'));

const RoleList = lazy(() => import('./crud_role/RoleList.jsx'));
const DetailRole = lazy(() => import('./crud_role/DetailRole.jsx'));
const CreateRole = lazy(() => import('./crud_role/CreateRole.jsx'));
const UpdateRole = lazy(() => import('./crud_role/UpdateRole.jsx'));
const RestoreRole = lazy(() => import('./crud_role/RestoreRole.jsx'));

const NavigationGroupList = lazy(() => import('./crud_navigations/crud_navigation_groups/ListNavigationGroups.jsx'));
const CreateNavigationGroup = lazy(() => import('./crud_navigations/crud_navigation_groups/CreateNavigationGroups.jsx'));
const UpdateNavigationGroup = lazy(() => import('./crud_navigations/crud_navigation_groups/UpdateNavigationGroups.jsx'));
const DetailNavigationGroup = lazy(() => import('./crud_navigations/crud_navigation_groups/DetailNavigationGroups.jsx'));

const NavigationMenuList = lazy(() => import('./crud_navigations/crud_navigation_menu/ListNavigationMenu.jsx'));

const ListDepartment = lazy(() => import('./crud_department/ListDepartment.jsx'));
const UpdateDepartment = lazy(() => import('./crud_department/UpdateDepartment.jsx'));
const CreateDepartment = lazy(() => import('./crud_department/CreateDepartment.jsx'));
const RestoreDepartment = lazy(() => import('./crud_department/RestoreDepartment.jsx'))

// const MrList = lazy(() => import('./crud-mr/MrList.jsx'));
// const DoneMR = lazy(() => import('./crud-mr/DoneMR.jsx'));
// const CreateMR = lazy(() => import('./crud-mr/CreateMR.jsx'));
// const UpdateMR = lazy(() => import('./crud-mr/UpdateMR.jsx'))
// const PersonalMR = lazy(() => import('./crud-mr/PersonalMR.jsx'))
// const RestoreMR = lazy(() => import('./crud-mr/RestoreMR.jsx'))
// const MRHistory = lazy(() => import('./crud-mr/MRHistory.jsx'))
// const DetailMR = lazy(() => import('./crud-mr/DetailMR.jsx'))

const ListTypeRequest = lazy(() => import('./crud_type_request/ListTypeRequest.jsx'))
const DetailTypeRequest = lazy(() => import('./crud_type_request/DetailTypeRequest.jsx'))
const UpdateTypeRequest = lazy(() => import('./crud_type_request/UpdateTypeRequest.jsx'))
const CreateTypeRequest = lazy(() => import('./crud_type_request/CreateTypeRequest.jsx'))

const ListMakeRequest = lazy(() => import('./crud_make_request/ListMakeRequest.jsx'))
const DetailMakeRequest = lazy(() => import('./crud_make_request/DetailMakeRequest.jsx'))
const UpdateMakeRequest = lazy(() => import('./crud_make_request/UpdateMakeRequest.jsx'))
const CreateMakeRequest = lazy(() => import('./crud_make_request/CreateMakeRequest.jsx'))

const ListBilling = lazy(() => import('./crud_billing/ListBilling.jsx'))
const CreateBilling = lazy(() => import('./crud_billing/CreateBilling.jsx'))
const UpdateBilling = lazy(() => import('./crud_billing/UpdateBilling.jsx'))
const RestoreBilling = lazy(() => import('./crud_billing/RestoreBilling.jsx'))
const DetailBilling = lazy(() => import('./crud_billing/DetailBilling.jsx'))

// const TableMR = lazy(() => import('./Table/TableMR/TabelMR.jsx'))
const TableBilling = lazy(() => import('./Table/TableBilling/TableBilling.jsx'))

const EditProfile = lazy(() => import('./profile/EditProfile.jsx'));

// User
const DashboardUser = lazy(() => import('./user/dashboard/DashboardUser.jsx'));
const BarangUser = lazy(() => import('./user/barang/UserBarang.jsx'))



const MyApp = () => {
  const f7params = {
    name: 'INVENTORY',
    theme: 'auto',
    store: store,
  };

  return (
    <React.StrictMode>
      <AuthProvider>
        <App {...f7params}>
          <Router>
            <Suspense fallback={<div className='h-screen flex items-center justify-center'><Loader/></div>}>
              <Routes>
                {/* Public Routes */}
                <Route path='/login' element={<Login />} />
                <Route path="/barang/detail-barang/:id" element={<DetailBarang />} />

                {/* Auth Routes */}
                <Route element={<RequireAuth allowedRoles={['admin', 'user']}/>}>
                  {/* <Route path='/make-request/create-make-request/:barang_id?' element={<CreateMR/>}/>  
                  <Route path="/make-request/personal-make-request" element={<PersonalMR />} />   */}
                  <Route path='/edit-profile' element={<EditProfile />} />
                  {/* <Route path='/make-request/update-make-request-personal/:id' element={<UpdateMR/>}/> */}
                </Route>

                {/* Admin Routes */}
                <Route element={<RequireAuth allowedRoles={['admin']} />}>
                  <Route path="*" element={<Navigate to="/dashboard-admin" replace />} />
                  <Route path="/login" element={<Navigate to="/dashboard-admin" replace />} />

                  <Route path="/barang/list-barang" element={<BarangList />} />
                  <Route path="/barang/create-barang" element={<CreateBarang />} />
                  <Route path="/barang/update-barang/:id" element={<UpdateBarang />} />
                  <Route path='/barang/restore-barang' element={<RestoreBarang/>}/>

                  <Route path='/jenis-barang/list-jenis-barang' element={<ListJenisBarang/>} />
                  <Route path='/jenis-barang/create-jenis-barang' element={<CreateJenisBarang/>} />
                  <Route path='/jenis-barang/update-jenis-barang/:id' element={<UpdateJenisBarang/>} />
                  <Route path='/jenis-barang/detail-jenis-barang/:id' element={<DetailJenisBarang/>} />

                  <Route path='/sumber-barang/list-sumber-barang' element={<ListSumberBarang/>} />
                  <Route path='/sumber-barang/create-sumber-barang' element={<CreateSumberBarang/>} />
                  <Route path='/sumber-barang/update-sumber-barang/:id' element={<UpdateSumberBarang/>} />
                  <Route path='/sumber-barang/detail-sumber-barang/:id' element={<DetailSumberBarang/>} />
                  
                  <Route path='/billing/list-billing' element={<ListBilling/>}/>
                  <Route path='/billing/create-billing' element={<CreateBilling/>} />
                  <Route path='/billing/update-billing/:id' element={<UpdateBilling/>} />
                  <Route path='/billing/restore-billing' element={<RestoreBilling/>}/>
                  <Route path='/billing/detail-billing/:id' element={<DetailBilling/>}/>

                  <Route path="/category/list-category" element={<CategoryList />} />
                  <Route path="/category/detail-category/:id" element={<DetailCategory />} />
                  <Route path="/category/update-category/:id" element={<UpdateCategory />} />
                  <Route path="/category/create-category" element={<CreateCategory />} />
                  <Route path="/category/restore-category" element={<RestoreCategory />} />

                  <Route path='/dashboard-admin' element={<Dashboard />} />

                  <Route path='/divisi/list-divisi' element={<ListDivisi />} />
                  <Route path='/divisi/update-divisi/:id' element={<UpdateDivisi />} />
                  <Route path='/divisi/create-divisi' element={<CreateDivisi />} />
                  <Route path='/divisi/restore-divisi' element={<RestoreDivisi />} />
                  
                  <Route path='/department/list-department' element={<ListDepartment />} />
                  <Route path='/department/update-department/:id' element={<UpdateDepartment />} />
                  <Route path='/department/create-department' element={<CreateDepartment />} />
                  <Route path='/department/restore-department' element={<RestoreDepartment/>} />

                  {/* Make Request  */}
                  {/* <Route path='/make-request/list-make-request' element={<MrList />} />
                  <Route path='/make-request/done-make-request/:id' element={<DoneMR />} />
                  <Route path='/make-request/restore-make-request/' element={<RestoreMR/>} />
                  <Route path='/make-request/history/:id' element={<MRHistory/>} />
                  <Route path='/make-request/detail-make-request/:id' element={<DetailMR/>} /> */}

                  <Route path='/type-request/list-type-request' element={<ListTypeRequest />} />
                  <Route path='/type-request/detail-type-request/:id' element={<DetailTypeRequest />} />
                  <Route path='/type-request/update-type-request/:id' element={<UpdateTypeRequest />} />
                  <Route path='/type-request/create-type-request' element={<CreateTypeRequest />} />

                  <Route path='/make-request/list-make-request' element={<ListMakeRequest />} />
                  <Route path='/make-request/detail-make-request/:id' element={<DetailMakeRequest />} />
                  <Route path='/make-request/update-make-request/:id' element={<UpdateMakeRequest />} />
                  <Route path='/make-request/create-make-request' element={<CreateMakeRequest />} />

                  {/* <Route path='/table-mr' element={<TableMR/>} /> */}
                  <Route path='/table-billing' element={<TableBilling/>} />

                  <Route path='/user/list-user' element={<UserList />} />
                  <Route path='/user/detail-user/:id' element={<DetailUser />} />
                  <Route path='/user/update-user/:id' element={<UpdateUser />} />
                  <Route path='/user/create-user' element={<CreateUser />} />
                  <Route path='/user/restore-user' element={<RestoreUser />} />

                  <Route path='/role/list-role' element={<RoleList />} />
                  <Route path='/role/detail-role/:id' element={<DetailRole />} />
                  <Route path='/role/update-role/:id' element={<UpdateRole />} />
                  <Route path='/role/create-role' element={<CreateRole />} />
                  <Route path='/role/restore-role' element={<RestoreRole />} />

                  <Route path='/navigation-groups/list-navigation-groups' element={<NavigationGroupList/>}/>
                  <Route path='/navigation-groups/create-navigation-groups' element={<CreateNavigationGroup/>}/>
                  <Route path='/navigation-groups/update-navigation-groups/:id' element={<UpdateNavigationGroup/>}/>
                  <Route path='/navigation-groups/detail-navigation-groups/:id' element={<DetailNavigationGroup/>}/>

                  <Route path='/navigation-menu/list-navigation-menu' element={<NavigationMenuList/>}/>
                  
                </Route>

                {/* User Routes */}
                <Route element={<RequireAuth allowedRoles={['user']} />}>
                  <Route path='/dashboard-user' element={<DashboardUser />} />
                  {/* <Route path="*" element={<Navigate to="/dashboard-user" replace />} /> */}
                  <Route path='/barang-anda' element={<BarangUser/>}></Route>
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </App>
      </AuthProvider>
    </React.StrictMode>
  );
};

export default MyApp;
