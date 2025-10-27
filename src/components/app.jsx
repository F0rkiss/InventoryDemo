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
const Notifications = lazy(() => import('./informationPage/NotificationsPages'));
const ApprovalMakeRequest = lazy(() => import('./approval-page/approvalMR'));
const ApprovalLPB = lazy(() => import('./approval-page/approvalLPB'));

const BarangList = lazy(() => import('./crud_barang/BarangList.jsx'));
const CreateBarang = lazy(() => import('./crud_barang/CreateBarang.jsx'));
const UpdateBarang = lazy(() => import('./crud_barang/UpdateBarang.jsx'));
const DetailBarang = lazy(() => import('./crud_barang/DetailBarang.jsx'));
// const RestoreBarang = lazy(() => import('./crud_barang/RestoreBarang.jsx'))

const StokList = lazy(() => import('./crud_stok/ListStok.jsx'));
const DetailStok = lazy(() => import('./crud_stok/DetailStok.jsx'));

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

const Mutasi = lazy(() => import('./informationPage/Mutasi.jsx'));
const Log = lazy(() => import('./informationPage/Log.jsx'));

const UserList = lazy(() => import('./crud_user/UserList.jsx'));
const DetailUser = lazy(() => import('./crud_user/DetailUser.jsx'));
const CreateUser = lazy(() => import('./crud_user/CreateUser.jsx'));
const UpdateUser = lazy(() => import('./crud_user/UpdateUser.jsx'));

const RoleList = lazy(() => import('./crud_role/RoleList.jsx'));
const CreateRole = lazy(() => import('./crud_role/CreateRole.jsx'));
const UpdateRole = lazy(() => import('./crud_role/UpdateRole.jsx'));

const StatusList = lazy(() => import('./crud_status/StatusList.jsx'));
const CreateStatus = lazy(() => import('./crud_status/CreateStatus.jsx'));
const UpdateStatus = lazy(() => import('./crud_status/UpdateStatus.jsx'));

const JenisMemoList = lazy(() => import('./crud_jenis_memo/JenisMemoList.jsx'));
const CreateJenisMemo = lazy(() => import('./crud_jenis_memo/CreateJenisMemo.jsx'));
const UpdateJenisMemo = lazy(() => import('./crud_jenis_memo/UpdateJenisMemo.jsx'));

const NavigationGroupList = lazy(() => import('./crud_navigations/crud_navigation_groups/ListNavigationGroups.jsx'));
const CreateNavigationGroup = lazy(() => import('./crud_navigations/crud_navigation_groups/CreateNavigationGroups.jsx'));
const UpdateNavigationGroup = lazy(() => import('./crud_navigations/crud_navigation_groups/UpdateNavigationGroups.jsx'));
const DetailNavigationGroup = lazy(() => import('./crud_navigations/crud_navigation_groups/DetailNavigationGroups.jsx'));

const NavigationMenuList = lazy(() => import('./crud_navigations/crud_navigation_menu/ListNavigationMenu.jsx'));

const ListTypeRequest = lazy(() => import('./crud_type_request/ListTypeRequest.jsx'))
const DetailTypeRequest = lazy(() => import('./crud_type_request/DetailTypeRequest.jsx'))
const UpdateTypeRequest = lazy(() => import('./crud_type_request/UpdateTypeRequest.jsx'))
const CreateTypeRequest = lazy(() => import('./crud_type_request/CreateTypeRequest.jsx'))

const ListApprovalStep = lazy(() => import('./crud_approval_step/ApprovalStepList.jsx'))
const DetailApprovalStep = lazy(() => import('./crud_approval_step/DetailApprovalStep.jsx'))
const UpdateApprovalStep = lazy(() => import('./crud_approval_step/UpdateApprovalStep.jsx'))
const CreateApprovalStep = lazy(() => import('./crud_approval_step/CreateApprovalStep.jsx'))

const ListApprovalStepLPB = lazy(() => import('./crud_approval_step_lpb/ListApprovalStepLPB.jsx'))
const DetailApprovalStepLPB = lazy(() => import('./crud_approval_step_lpb/DetailApprovalStepLPB.jsx'))
const UpdateApprovalStepLPB = lazy(() => import('./crud_approval_step_lpb/UpdateApprovalStepLPB.jsx'))
const CreateApprovalStepLPB = lazy(() => import('./crud_approval_step_lpb/CreateApprovalStepLPB.jsx'))

const ListPurchaseRequest = lazy(() => import('./crud_purchase_request/ListPurchaseRequest.jsx'))
const CreateListPurchaseRequest = lazy(() => import('./crud_purchase_request/CreateListPurchaseRequest.jsx'))
const CreatePurchaseRequest = lazy(() => import('./crud_purchase_request/CreatePurchaseRequest.jsx'))
const DetailPurchaseRequest = lazy(() => import('./crud_purchase_request/DetailPurchaseRequest.jsx'))
const UpdatePurchaseRequest = lazy(() => import('./crud_purchase_request/UpdatePurchaseRequest.jsx'))

const ListPurchaseOrder = lazy(() => import('./crud_purchase_order/ListPurchaseOrder.jsx'))
const UpdatePurchaseOrder = lazy(() => import('./crud_purchase_order/UpdatePurchaseOrder.jsx'))
const DetailPurchaseOrder = lazy(() => import('./crud_purchase_order/DetailPurchaseOrder.jsx'))

const ListPurchaseOrderPR = lazy(() => import('./crud_create_purchase_order/ListPurchaseOrderPR.jsx'))
const DetailPurchaseOrderPR = lazy(() => import('./crud_create_purchase_order/DetailPurchaseOrderPR.jsx'))
const CreatePurchaseOrderPR = lazy(() => import('./crud_create_purchase_order/CreatePurchaseOrderPR.jsx'))

const ListPOtoLPB = lazy(() => import('./crud_lpb/CreateListLPB'))
const CreateLPB = lazy(() => import('./crud_lpb/CreateLPB'))

const ListLPB = lazy(() => import('./crud_lpb/ListLPB'))
const DetailLPB = lazy(() => import('./crud_lpb/DetailLPB.jsx'))
const UpdateLPB = lazy(() => import('./crud_lpb/updateLPB.jsx'))

const ListMakeRequest = lazy(() => import('./crud_make_request/ListMakeRequest.jsx'))
const DetailMakeRequest = lazy(() => import('./crud_make_request/DetailMakeRequest.jsx'))
const UpdateMakeRequest = lazy(() => import('./crud_make_request/UpdateMakeRequest.jsx'))
const CreateMakeRequest = lazy(() => import('./crud_make_request/CreateMakeRequest.jsx'))

const ListMakeRequestAdmin = lazy(() => import('./crud_make_request_admin/ListMakeRequestAdmin.jsx'))
const DetailMakeRequestAdmin = lazy(() => import('./crud_make_request_admin/DetailMakeRequestAdmin.jsx'))

const ListBilling = lazy(() => import('./crud_billing/ListBilling.jsx'))
const CreateBilling = lazy(() => import('./crud_billing/CreateBilling.jsx'))
const UpdateBilling = lazy(() => import('./crud_billing/UpdateBilling.jsx'))
const DetailBilling = lazy(() => import('./crud_billing/DetailBilling.jsx'))

const ListPPN = lazy(() => import('./crud_ppn/ListPPN.jsx'))
const CreatePPN = lazy(() => import('./crud_ppn/CreatePPN.jsx'))
const UpdatePPN = lazy(() => import('./crud_ppn/UpdatePPN.jsx'))

// const TableMR = lazy(() => import('./Table/TableMR/TabelMR.jsx'))
const TableBilling = lazy(() => import('./Table/TableBilling/TableBilling.jsx'))

const Profile = lazy(() => import('./profile/Profile.jsx'));

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

                <Route element={<RequireAuth/>}>
                  <Route path='/dashboard' element={<Dashboard />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                  <Route path='/profile' element={<Profile />} />
                  <Route path='/mutasi' element={<Mutasi />} />
                  <Route path='/log' element={<Log />} />

                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/approvalStepHistory-makeRequest/detail/:id" element={<ApprovalMakeRequest />} />
                  <Route path="/approvalStepHistory-lpb/detail/:id" element={<ApprovalLPB />} />

                  <Route path="/barang/list-barang" element={<BarangList />} />
                  <Route path="/barang/detail-barang/:id" element={<DetailBarang />} />
                  <Route path="/barang/create-barang" element={<CreateBarang />} />
                  <Route path="/barang/update-barang/:id" element={<UpdateBarang />} />

                  <Route path='/stok/list-stok' element={<StokList/>} />
                  <Route path='/stok/detail-stok/:id' element={<DetailStok/>} />

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
                  <Route path='/billing/detail-billing/:id' element={<DetailBilling/>}/>

                  <Route path="/category/list-category" element={<CategoryList />} />
                  <Route path="/category/detail-category/:id" element={<DetailCategory />} />
                  <Route path="/category/update-category/:id" element={<UpdateCategory />} />
                  <Route path="/category/create-category" element={<CreateCategory />} />
                  <Route path="/category/restore-category" element={<RestoreCategory />} />

                  <Route path='/type-request/list-type-request' element={<ListTypeRequest />} />
                  <Route path='/type-request/detail-type-request/:id' element={<DetailTypeRequest />} />
                  <Route path='/type-request/update-type-request/:id' element={<UpdateTypeRequest />} />
                  <Route path='/type-request/create-type-request' element={<CreateTypeRequest />} />

                  <Route path='/approval-step/list-approval-step' element={<ListApprovalStep />} />
                  <Route path='/approval-step/detail-approval-step/:id' element={<DetailApprovalStep />} />
                  <Route path='/approval-step/update-approval-step/:id' element={<UpdateApprovalStep />} />
                  <Route path='/approval-step/create-approval-step' element={<CreateApprovalStep />} />

                  <Route path='/approval-step-lpb/list-approval-step-lpb' element={<ListApprovalStepLPB />} />
                  <Route path='/approval-step-lpb/detail-approval-step-lpb' element={<ListApprovalStepLPB />} />
                  <Route path='/approval-step-lpb/update-approval-step-lpb/:id' element={<UpdateApprovalStepLPB />} />
                  <Route path='/approval-step-lpb/create-approval-step-lpb' element={<CreateApprovalStepLPB />} />
                  
                  <Route path='/purchase-request/list-purchase-request' element={<ListPurchaseRequest />} />
                  <Route path='/purchase-request/detail-purchase-request/:id' element={<DetailPurchaseRequest />} />
                  <Route path='/purchase-request/update-purchase-request/:id' element={<UpdatePurchaseRequest />} />

                  <Route path='/make-purchase-request/list-make-purchase-request' element={<CreateListPurchaseRequest />} />
                  <Route path='/make-purchase-request/create-purchase-request/:id' element={<CreatePurchaseRequest />} />

                  <Route path='/purchase-order/list-purchase-order' element={<ListPurchaseOrder />} />
                  <Route path='/purchase-order/update-purchase-order/:id' element={<UpdatePurchaseOrder/>} />
                  <Route path='/purchase-order/detail-purchase-order/:id' element={<DetailPurchaseOrder />} />

                  <Route path='/purchase-order-pr/list-purchase-order-pr' element={<ListPurchaseOrderPR />} />
                  <Route path='/purchase-order-pr/create-purchase-order-pr/:id' element={<CreatePurchaseOrderPR />} />
                  <Route path='/purchase-order-pr/detail-purchase-order-pr/:id' element={<DetailPurchaseOrderPR />} />

                  <Route path='/lpb/list-create-lpb' element={<ListPOtoLPB />} />
                  <Route path='/lpb/create-lpb/:id' element={<CreateLPB />} />

                  <Route path='/lpb/list-lpb' element={<ListLPB />} />
                  <Route path='/lpb/detail-lpb/:id' element={<DetailLPB />} />
                  <Route path='/lpb/update-lpb/:id' element={<UpdateLPB />} />

                  <Route path='/material-request/list-material-request' element={<ListMakeRequest />} />
                  <Route path='/material-request/detail-material-request/:id' element={<DetailMakeRequest />} />
                  <Route path='/material-request/update-material-request/:id' element={<UpdateMakeRequest />} />
                  <Route path='/material-request/create-material-request' element={<CreateMakeRequest />} />

                  <Route path='/material-request-admin/list-material-request-admin' element={<ListMakeRequestAdmin />} />
                  <Route path='/material-request-admin/detail-material-request-admin/:id' element={<DetailMakeRequestAdmin />} />
                  
                  <Route path='/table-billing' element={<TableBilling/>} />

                  <Route path='/user/list-user' element={<UserList />} />
                  <Route path='/user/detail-user/:id' element={<DetailUser />} />
                  <Route path='/user/update-user/:id' element={<UpdateUser />} />
                  <Route path='/user/create-user' element={<CreateUser />} />

                  <Route path='/role/list-role' element={<RoleList />} />
                  <Route path='/role/update-role/:id' element={<UpdateRole />} />
                  <Route path='/role/create-role' element={<CreateRole />} />

                  <Route path='/status/list-status' element={<StatusList />} />
                  <Route path='/status/update-status/:id' element={<UpdateStatus />} />
                  <Route path='/status/create-status' element={<CreateStatus />} />

                  <Route path='/jenismemo/list-jenismemo' element={<JenisMemoList />} />
                  <Route path='/jenismemo/update-jenismemo/:id' element={<UpdateJenisMemo />} />
                  <Route path='/jenismemo/create-jenismemo' element={<CreateJenisMemo />} />

                  <Route path='/ppn' element={<ListPPN/>} />
                  <Route path='/ppn/create-ppn' element={<CreatePPN/>} />
                  <Route path='/ppn/update-ppn/:id' element={<UpdatePPN/>} />

                  <Route path='/navigation-groups/list-navigation-groups' element={<NavigationGroupList/>}/>
                  <Route path='/navigation-groups/create-navigation-groups' element={<CreateNavigationGroup/>}/>
                  <Route path='/navigation-groups/update-navigation-groups/:id' element={<UpdateNavigationGroup/>}/>
                  <Route path='/navigation-groups/detail-navigation-groups/:id' element={<DetailNavigationGroup/>}/>

                  <Route path='/navigation-menu/list-navigation-menu' element={<NavigationMenuList/>}/>
                  
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
