import { DEMO_LOGIN, demoNavigationMenu } from './demoSeed';
import { getDemoStore, nextDemoId, resetDemoStore, saveDemoStore } from './demoStore';

export const isDemoMode = import.meta.env.VITE_USE_DEMO_DATA === 'true';

const ok = (config, data, status = 200, headers = {}) => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Created',
  headers,
  config,
  request: {},
});

const fail = (config, status, message) => {
  const error = new Error(message);
  error.config = config;
  error.response = ok(config, { message, msg: message }, status);
  throw error;
};

const normalizePath = (config) => {
  const url = new URL(config.url || '/', config.baseURL || 'http://demo.local/api');
  return url.pathname.replace(/^\/api\/?/, '').replace(/^\/+/, '').replace(/\/+$/, '');
};

const safeStringify = (value) => {
  const seen = new WeakSet();
  return JSON.stringify(value, (key, item) => {
    if (typeof item === 'object' && item !== null) {
      if (seen.has(item)) return undefined;
      seen.add(item);
    }
    return item;
  });
};

const searchList = (items, params = {}) => {
  const term = String(params.search || params.q || '').trim().toLowerCase();
  if (!term) return items;
  return items.filter((item) => safeStringify(item).toLowerCase().includes(term));
};

const page = (items, config) => {
  const params = config.params || {};
  const filtered = searchList(items, params);
  return { data: { data: filtered, next_cursor: null } };
};

const byId = (items, id) => items.find((item) => String(item.id) === String(id));

const parseBody = (data) => {
  if (!data) return {};
  if (typeof FormData !== 'undefined' && data instanceof FormData) return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }
  return data;
};

const formValue = (body, key) => {
  if (typeof FormData !== 'undefined' && body instanceof FormData) return body.get(key);
  return body?.[key];
};

const bodyArray = (body, key) => {
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    const values = body.getAll(`${key}[]`);
    for (const [entryKey, value] of body.entries()) {
      if (entryKey === key || (entryKey !== `${key}[]` && entryKey.startsWith(`${key}[`))) values.push(value);
    }
    return values.filter((value) => value !== null && value !== undefined && value !== '');
  }
  const value = body?.[key] || body?.[`${key}[]`];
  return Array.isArray(value) ? value : value === undefined ? [] : [value];
};

const numberValue = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const base64Url = (value) => {
  const json = JSON.stringify(value);
  const encoded = globalThis.btoa(unescape(encodeURIComponent(json)));
  return encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const demoToken = () => {
  const payload = {
    role: 'admin',
    user: 'Demo Admin',
    email: 'demo.admin@mediaindonesia.test',
    navigation_menu: demoNavigationMenu,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };
  return `${base64Url({ alg: 'none', typ: 'JWT' })}.${base64Url(payload)}.demo`;
};

const collectionRoutes = {
  inventBarang: 'barang',
  inventStok: 'stock',
  'inventStok-admin': 'stockAsset',
  'inventStok-detail': 'stock',
  inventJenisBarang: 'jenisBarang',
  inventSumberBarang: 'sumberBarang',
  inventCategories: 'categories',
  tingkatKebutuhanBarang: 'tingkatKebutuhan',
  inventStatus: 'status',
  paymentType: 'paymentTypes',
  mataUang: 'mataUang',
  ppn: 'ppn',
  suplier: 'suppliers',
  role: 'roles',
  inventUser: 'users',
  user: 'users',
  billing: 'billing',
  department: 'departments',
  divisi: 'divisi',
  inventTypeRequest: 'typeRequests',
  jenisMemo: 'jenisMemo',
  inventApprovalStep: 'approvalSteps',
  approvalStepPurchase: 'approvalStepPurchase',
  approvalStepLPB: 'approvalStepLPB',
  approvalStepMemo: 'approvalStepMemo',
  inventNavigationGroup: 'navigationGroups',
  inventNavigationMenu: 'navigationMenus',
};

const aliases = {
  paymentType: 'paymentTypes',
  'list-payment-method': 'paymentTypes',
  'billing-getUser': 'users',
  'inventStok-barang': 'barang',
  'inventStok-detail/admin': 'stockAsset',
  'inventMakeRequest-barangOther': 'barang',
  barang: 'barang',
  'jenis-memo/non-dynamic': 'jenisMemo',
  'jenis-memo/non-dynamicd': 'jenisMemo',
  'inventApprovalStep-filter': 'approvalSteps',
  'approvalStepMemo-filter': 'approvalStepMemo',
};

const collectionFor = (path) => {
  const clean = path.replace(/^\/+/, '');
  if (aliases[clean]) return aliases[clean];

  const first = clean.split('/')[0];
  if (aliases[first]) return aliases[first];
  if (collectionRoutes[first]) return collectionRoutes[first];

  const detailName = first.replace(/-detail$/, '');
  if (collectionRoutes[detailName]) return collectionRoutes[detailName];

  const updateName = first.replace(/-update$/, '');
  if (collectionRoutes[updateName]) return collectionRoutes[updateName];

  const createName = first.replace(/-create$/, '');
  if (collectionRoutes[createName]) return collectionRoutes[createName];

  const deleteName = first.replace(/-delete$/, '');
  if (collectionRoutes[deleteName]) return collectionRoutes[deleteName];

  return null;
};

const routeId = (path) => {
  const parts = path.split('/');
  return parts[parts.length - 1];
};

const makeRequestDetail = (store, id) => {
  const mr = byId(store.makeRequests, id);
  if (!mr) return null;
  const pr = store.purchaseRequests.find((item) => String(item.make_request_id) === String(id));
  const po = pr ? store.purchaseOrders.filter((item) => String(item.purchase_request_id) === String(pr.id)) : [];

  return {
    makeRequest: {
      MR: mr,
      detailsMR: mr.details || [],
    },
    approvalStepHistories: [
      { id: 1, status: mr.is_full_approval ? 'approved' : 'pending', user: store.users[0], note: 'Demo approval step' },
    ],
    approvalStep: store.approvalSteps,
    purchaseRequest: pr
      ? {
          PR: pr,
          detailsPR: pr.details || [],
        }
      : null,
    purchaseOrder: po,
    is_full_approval: mr.is_full_approval ? 'Approval sudah selesai' : 'Approval belum selesai',
    can_be_deleted: mr.can_be_deleted,
  };
};

const prForCreatePo = (store, id) => {
  const pr = byId(store.purchaseRequests, id);
  if (!pr) return null;
  const details = (pr.details || []).map((detail) => {
    const qty = (pr.qty || []).find((row) => String(row.barang_id) === String(detail.barang_detail?.id || detail.barangs?.id));
    return {
      ...detail,
      barang_detail: detail.barang_detail || detail.barangs || detail.barang,
      requested_qty: qty?.requested_qty ?? detail.requested_qty ?? detail.qty ?? 0,
      used_qty: qty?.used_qty ?? detail.used_qty ?? 0,
      sisa: qty?.sisa ?? detail.sisa ?? detail.qty ?? 0,
    };
  });
  return { ...pr, details };
};

const poForLpb = (store, id) => {
  const po = byId(store.purchaseOrders, id);
  if (!po) return null;
  const lpbDetails = store.lpbs
    .filter((lpb) => String(lpb.purchase_order_id) === String(po.id))
    .flatMap((lpb) => lpb.details || []);
  const qty = (po.details || []).map((detail) => {
    const received = lpbDetails
      .filter((lpbDetail) => String(lpbDetail.barangs?.id) === String(detail.barangs?.id))
      .reduce((sum, item) => sum + numberValue(item.qty), 0);
    return {
      barang_id: detail.barangs?.id,
      requested_qty: numberValue(detail.qty),
      used_qty: received,
      sisa: Math.max(numberValue(detail.qty) - received, 0),
    };
  });
  return { ...po, qty };
};

const addLog = (store, action, description) => {
  store.logs.unshift({
    id: nextDemoId(store, 'generic'),
    action,
    table_name: 'demo',
    description,
    created_at: new Date().toISOString(),
  });
};

const createMakeRequest = (store, body) => {
  const id = nextDemoId(store, 'makeRequest');
  const type = byId(store.typeRequests, body.invent_type_request_id) || store.typeRequests[0];
  const qtyValues = body.qty || [];
  const barangValues = body.invent_barang_id || [];
  const noteValues = body.note_barang || [];
  const details = qtyValues.map((qty, index) => {
    const barangRef = barangValues[index];
    const barang = store.barang.find(
      (item) =>
        String(item.id) === String(barangRef) ||
        String(item.kode_barang) === String(barangRef) ||
        String(item.kodeBarang) === String(barangRef)
    );
    return {
      id: nextDemoId(store, 'generic'),
      invent_barang_id: barang?.id || null,
      barang,
      selectedBarang: barang,
      note_barang: noteValues[index] || '',
      qty: numberValue(qty, 1),
    };
  });
  const user = store.users[0];
  const mr = {
    id,
    kode: `MR-DEMO-${String(id).padStart(4, '0')}`,
    tanggal: body.tanggal,
    user,
    EmpName: user.EmpName,
    type_request: type,
    nameTypeRequest: type.name,
    type_name: type.name,
    jenisTypeRequest: type.jenis,
    type_jenis: type.jenis,
    deskripsiTypeRequest: type.description,
    description: type.description,
    details,
    is_full_approval: true,
    approval_message: 'Approval sudah selesai',
    canBeUpdated: true,
    can_be_deleted: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.makeRequests.unshift(mr);
  addLog(store, 'create', `Created ${mr.kode}`);
  return mr;
};

const createPurchaseRequest = (store, makeRequestId, body) => {
  const mr = byId(store.makeRequests, makeRequestId);
  if (!mr) return null;
  const id = nextDemoId(store, 'purchaseRequest');
  const details = (mr.details || []).map((detail) => {
    const barang = detail.barang || detail.selectedBarang;
    return {
      id: nextDemoId(store, 'generic'),
      invent_barangs_id: barang?.id,
      barang,
      barangs: barang,
      barang_detail: barang,
      requested_qty: numberValue(detail.qty, 1),
      used_qty: 0,
      sisa: numberValue(detail.qty, 1),
    };
  });
  const pr = {
    id,
    kode: `PR-DEMO-${String(id).padStart(4, '0')}`,
    make_request_id: mr.id,
    make_request: mr,
    tanggal: body.tanggal || mr.tanggal,
    note: body.note || 'Demo purchase request',
    user: mr.user,
    EmpName: mr.user?.EmpName,
    details,
    qty: details.map((detail) => ({
      barang_id: detail.barang_detail?.id,
      requested_qty: detail.requested_qty,
      used_qty: 0,
      sisa: detail.requested_qty,
    })),
    purchase_orders: [],
    is_completed: false,
    isApproved: true,
    isRejected: false,
    canBeUpdated: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.purchaseRequests.unshift(pr);
  addLog(store, 'create', `Created ${pr.kode} from ${mr.kode}`);
  return pr;
};

const createPurchaseOrder = (store, purchaseRequestId, body) => {
  const pr = byId(store.purchaseRequests, purchaseRequestId);
  if (!pr) return null;
  const id = nextDemoId(store, 'purchaseOrder');
  const barangIds = bodyArray(body, 'invent_barangs_id');
  const qtyValues = bodyArray(body, 'qty');
  const priceValues = bodyArray(body, 'harga_per_item');
  const currencyIds = bodyArray(body, 'invent_mata_uang_id');
  const supplier = byId(store.suppliers, formValue(body, 'invent_suplier_id')) || store.suppliers[0];
  const payment = byId(store.paymentTypes, formValue(body, 'cara_pembayaran')) || store.paymentTypes[0];
  const details = barangIds.map((barangId, index) => {
    const barang = byId(store.barang, barangId) || store.barang[0];
    const currency = byId(store.mataUang, currencyIds[index]) || store.mataUang[0];
    return {
      id: nextDemoId(store, 'generic'),
      invent_barangs_id: barang.id,
      barang_id: barang.id,
      barangs: barang,
      barang_detail: barang,
      qty: numberValue(qtyValues[index], 1),
      harga_per_item: numberValue(priceValues[index], 0),
      mataUang: currency,
    };
  });
  const subtotal = details.reduce((sum, detail) => sum + detail.qty * detail.harga_per_item, 0);
  const ppnValue = numberValue(formValue(body, 'is_ppn')) ? 11 : 0;
  const po = {
    id,
    kode: `PO-DEMO-${String(id).padStart(4, '0')}`,
    purchase_request_id: pr.id,
    purchase_request: pr,
    tanggal: formValue(body, 'tanggal'),
    tanggal_penyerahan: formValue(body, 'tanggal_penyerahan'),
    keterangan: formValue(body, 'keterangan') || 'Demo purchase order',
    suplier: supplier,
    supplier,
    suplier_id: supplier.id,
    nama_perusahaan: supplier.nama_perusahaan,
    payment: { cara_pembayaran: payment.payment },
    cara_pembayaran: payment.payment,
    payment_type: payment,
    is_ppn: ppnValue ? 1 : 0,
    nilai_ppn: ppnValue,
    harga: subtotal,
    harga_after_ppn: subtotal + (subtotal * ppnValue) / 100,
    lampiran: [],
    details,
    qty: details.map((detail) => ({
      barang_id: detail.barangs?.id,
      requested_qty: detail.qty,
      used_qty: 0,
      sisa: detail.qty,
    })),
    is_completed: false,
    isApproved: true,
    isRejected: false,
    canBeUpdated: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.purchaseOrders.unshift(po);
  pr.purchase_orders = [
    ...(pr.purchase_orders || []),
    {
      id: po.id,
      kode: po.kode,
      tanggal: po.tanggal,
      is_completed: po.is_completed,
    },
  ];
  pr.qty = (pr.qty || []).map((row) => {
    const used = details
      .filter((detail) => String(detail.barangs?.id) === String(row.barang_id))
      .reduce((sum, detail) => sum + numberValue(detail.qty), 0);
    return { ...row, used_qty: row.used_qty + used, sisa: Math.max(row.sisa - used, 0) };
  });
  pr.is_completed = pr.qty.every((row) => row.sisa <= 0);
  addLog(store, 'create', `Created ${po.kode} from ${pr.kode}`);
  return po;
};

const createLpb = (store, purchaseOrderId, body) => {
  const po = byId(store.purchaseOrders, purchaseOrderId);
  if (!po) return null;
  const id = nextDemoId(store, 'lpb');
  const barangIds = bodyArray(body, 'invent_barangs_id');
  const qtyValues = bodyArray(body, 'qty');
  const details = barangIds.map((barangId, index) => {
    const barang = byId(store.barang, barangId) || store.barang[0];
    const poDetail = (po.details || []).find((detail) => String(detail.barangs?.id) === String(barang.id));
    return {
      id: nextDemoId(store, 'generic'),
      invent_barangs_id: barang.id,
      barangs: barang,
      qty: numberValue(qtyValues[index], 1),
      purchase_order_detail_id: poDetail?.id,
    };
  });
  const lpb = {
    id,
    kode: `LPB-DEMO-${String(id).padStart(4, '0')}`,
    purchase_order_id: po.id,
    purchase_order: po,
    purchase_request: po.purchase_request,
    tanggal: formValue(body, 'tanggal'),
    penerima: formValue(body, 'penerima'),
    note: formValue(body, 'note'),
    keterangan: formValue(body, 'note'),
    nama_perusahaan: po.nama_perusahaan,
    kodePO: po.kode,
    tanggalPO: po.tanggal,
    details,
    qty: details.map((detail) => ({
      barang_id: detail.barangs?.id,
      requested_qty: detail.qty,
      used_qty: detail.qty,
      sisa: 0,
    })),
    bukti: [],
    is_full_approval: false,
    canBeUpdated: true,
    isCompletedPo: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.lpbs.unshift(lpb);
  const complete = poForLpb(store, po.id).qty.every((row) => row.sisa <= 0);
  po.is_completed = complete;
  po.canBeUpdated = !complete;
  lpb.isCompletedPo = complete;
  addLog(store, 'create', `Created ${lpb.kode} from ${po.kode}`);
  return lpb;
};

const dashboard = (store) => ({
  makerequest: store.makeRequests.length,
  mr_proses: store.makeRequests.filter((item) => !item.is_full_approval).length,
  purchaseRequest: store.purchaseRequests.length,
  purchaseOrder: store.purchaseOrders.length,
  lpb: store.lpbs.length,
  memo: store.memos.length,
  memo_proses: store.memos.filter((item) => !item.is_full_approval).length,
  barang: store.barang.length,
  billing: store.billing.length,
});

const genericCreate = (store, key, body) => {
  const id = nextDemoId(store, 'generic');
  const item = { id, ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  store[key].unshift(item);
  return item;
};

const genericUpdate = (store, key, id, body) => {
  const item = byId(store[key], id);
  if (!item) return null;
  Object.assign(item, body, { updated_at: new Date().toISOString() });
  return item;
};

const genericDelete = (store, key, id) => {
  const before = store[key].length;
  store[key] = store[key].filter((item) => String(item.id) !== String(id));
  return before !== store[key].length;
};

export const demoApiAdapter = async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const path = normalizePath(config);
  const store = getDemoStore();
  const body = parseBody(config.data);

  if (method === 'post' && path === 'login') {
    if (String(body.EmpCode) === DEMO_LOGIN.employeeCode && body.password === DEMO_LOGIN.password) {
      return ok(config, { access_token: demoToken() });
    }
    return fail(config, 401, 'Kode atau Password Anda salah');
  }

  if (method === 'post' && path === 'demo/reset') {
    return ok(config, { data: resetDemoStore(), message: 'Demo data reset' });
  }

  if (path.startsWith('pdf/preview_')) {
    const data = typeof Blob !== 'undefined' ? new Blob(['Demo PDF preview'], { type: 'application/pdf' }) : 'Demo PDF preview';
    return ok(config, data, 200, { 'Content-Type': 'application/pdf' });
  }

  if (method === 'get' && (path === 'dashboardAdmin' || path === 'dashboardUser')) return ok(config, dashboard(store));
  if (method === 'get' && path === 'dashboardMemo') return ok(config, page(store.memos, config));
  if (method === 'get' && path === 'profileMe') return ok(config, { data: store.users[0] });
  if (method === 'get' && path === 'notification') return ok(config, { data: store.notifications, next_cursor: null });
  if (method === 'get' && path === 'inventMutasi') return ok(config, page(store.mutasi, config));
  if (method === 'get' && (path === 'log' || path === 'inventLog')) return ok(config, page(store.logs, config));
  if (method === 'get' && path.startsWith('inventStok-detail/admin/')) {
    return ok(config, { data: byId(store.stockAsset, routeId(path)) || store.stockAsset[0] });
  }

  const memoListPath = ['memo-personal', 'memo-admin', 'memo-information', 'memo-toggle/personal', 'memo-information/search'].includes(path.split('/').slice(0, 2).join('/')) || path === 'memo-admin';
  if (method === 'get' && memoListPath) {
    return ok(config, page(store.memos, config));
  }
  if (method === 'get' && (path.startsWith('memo-detail') || path.startsWith('memo-information/detail'))) {
    const item = byId(store.memos, routeId(path));
    return ok(config, { data: item || store.memos[0] });
  }

  if (method === 'get' && ['inventMakeRequest', 'inventMakeRequest-admin', 'inventMakeRequest-personal-toggle', 'inventMakeRequest-admin-toggle'].includes(path)) {
    let list = store.makeRequests;
    if (config.params?.is_full_approval !== undefined) {
      list = list.filter((item) => Number(item.is_full_approval) === Number(config.params.is_full_approval));
    }
    return ok(config, page(list, config));
  }
  if (
    method === 'get' &&
    (path.startsWith('inventMakeRequest-detail/') ||
      path.startsWith('inventMakeRequest-admin/detail/') ||
      path.startsWith('inventMakeRequest-approval/detail/'))
  ) {
    return ok(config, { data: makeRequestDetail(store, routeId(path)) });
  }
  if (method === 'get' && path.startsWith('inventMakeRequest/')) return ok(config, page(store.makeRequests, { ...config, params: { ...config.params, search: routeId(path) } }));
  if (method === 'post' && path === 'inventMakeRequest-create') {
    const created = createMakeRequest(store, body);
    saveDemoStore(store);
    return ok(config, { data: created, message: 'Material request berhasil dibuat' }, 201);
  }

  if (method === 'get' && path === 'purchaseRequest-makeRequest') {
    const usedMrIds = new Set(store.purchaseRequests.map((item) => String(item.make_request_id)));
    const list = store.makeRequests.filter((item) => item.is_full_approval && !usedMrIds.has(String(item.id)));
    return ok(config, page(list, config));
  }
  if (method === 'get' && path.startsWith('purchaseRequest-makeRequest/detail/')) {
    const mr = byId(store.makeRequests, routeId(path));
    return ok(config, { data: mr });
  }
  if (method === 'post' && path.startsWith('purchaseRequest-create/')) {
    const created = createPurchaseRequest(store, routeId(path), body);
    if (!created) return fail(config, 404, 'Material request tidak ditemukan');
    saveDemoStore(store);
    return ok(config, { data: created, message: 'Purchase request berhasil dibuat' }, 201);
  }
  if (method === 'get' && (path === 'purchaseRequest' || path === 'purchaseRequest-toggle')) {
    let list = store.purchaseRequests;
    if (config.params?.is_completed !== undefined) {
      list = list.filter((item) => Number(item.is_completed) === Number(config.params.is_completed));
    }
    return ok(config, page(list, config));
  }
  if (method === 'get' && path.startsWith('purchaseRequest-detail/')) {
    const pr = byId(store.purchaseRequests, routeId(path));
    return ok(config, { data: pr });
  }

  if (method === 'get' && path === 'purchaseOrder-listPurchaseRequest') {
    const list = store.purchaseRequests.filter((item) => item.isApproved && !item.is_completed);
    return ok(config, page(list, config));
  }
  if (method === 'get' && path.startsWith('purchaseOrder-listPurchaseRequest/detail/')) {
    return ok(config, { data: prForCreatePo(store, routeId(path)) });
  }
  if (method === 'post' && path.startsWith('purchaseOrder-create/')) {
    const created = createPurchaseOrder(store, routeId(path), body);
    if (!created) return fail(config, 404, 'Purchase request tidak ditemukan');
    saveDemoStore(store);
    return ok(config, { data: created, message: 'Purchase order berhasil dibuat' }, 201);
  }
  if (method === 'get' && (path === 'purchaseOrder' || path === 'purchaseOrder-toggle')) {
    let list = store.purchaseOrders;
    if (config.params?.is_completed !== undefined) {
      list = list.filter((item) => Number(item.is_completed) === Number(config.params.is_completed));
    }
    return ok(config, page(list, config));
  }
  if (method === 'get' && path.startsWith('purchaseOrder/')) {
    return ok(config, page(store.purchaseOrders, { ...config, params: { ...config.params, search: routeId(path) } }));
  }
  if (method === 'get' && path.startsWith('purchaseOrder-detail/')) {
    const po = byId(store.purchaseOrders, routeId(path));
    return ok(config, { data: po });
  }

  if (method === 'get' && path === 'laporanPenerimaanBarang-purchaseOrder') {
    const list = store.purchaseOrders.filter((item) => !item.is_completed);
    return ok(config, page(list, config));
  }
  if (method === 'get' && path.startsWith('laporanPenerimaanBarang-purchaseOrder/detail/')) {
    return ok(config, { data: poForLpb(store, routeId(path)) });
  }
  if (method === 'post' && path.startsWith('laporanPenerimaanBarang-create/')) {
    const created = createLpb(store, routeId(path), body);
    if (!created) return fail(config, 404, 'Purchase order tidak ditemukan');
    saveDemoStore(store);
    return ok(config, { data: created, message: 'LPB berhasil dibuat' }, 201);
  }
  if (method === 'get' && path === 'laporanPenerimaanBarang') return ok(config, page(store.lpbs, config));
  if (method === 'get' && path.startsWith('laporanPenerimaanBarang-detail/')) {
    const lpb = byId(store.lpbs, routeId(path));
    return ok(config, { data: lpb });
  }

  if (method === 'get' && path.startsWith('category/trash')) return ok(config, page(store.trash.category, config));
  if (method === 'get' && path.startsWith('categoryTrash')) return ok(config, page(store.trash.category, config));
  if (method === 'get' && path.startsWith('department/trash')) return ok(config, page(store.trash.department, config));
  if (method === 'get' && path.startsWith('departmentTrash')) return ok(config, page(store.trash.department, config));
  if (method === 'get' && path.startsWith('divisi/trash')) return ok(config, page(store.trash.divisi, config));
  if (method === 'get' && path.startsWith('divisiTrash')) return ok(config, page(store.trash.divisi, config));

  if (method === 'get' && (path === 'inventStok-user' || path.startsWith('inventStok-user/'))) {
    return ok(config, { data: searchList(store.stock, { search: path.split('/')[1] || config.params?.search }) });
  }

  const key = collectionFor(path);
  if (key && store[key]) {
    if (method === 'get') {
      const parts = path.split('/');
      const first = parts[0];
      const possibleId = parts.length > 1 ? routeId(path) : null;
      const isDetail = first.endsWith('-detail') || ['paymentType', 'mataUang', 'ppn'].includes(first) && possibleId;
      if (isDetail && possibleId) {
        return ok(config, { data: byId(store[key], possibleId) || store[key][0] });
      }
      if (parts.length > 1 && !first.includes('search') && !Number.isNaN(Number(possibleId))) {
        return ok(config, { data: byId(store[key], possibleId) || store[key][0] });
      }
      return ok(config, page(store[key], config));
    }

    if (method === 'post' && path.endsWith('-create') || method === 'post' && path === 'user' || method === 'post' && path === 'department' || method === 'post' && path === 'divisi') {
      const created = genericCreate(store, key, body);
      saveDemoStore(store);
      return ok(config, { data: created, message: 'Demo data created' }, 201);
    }

    if ((method === 'put' || method === 'post') && path.includes('-update/')) {
      const updated = genericUpdate(store, key, routeId(path), body);
      if (!updated) return fail(config, 404, 'Data tidak ditemukan');
      saveDemoStore(store);
      return ok(config, { data: updated, message: 'Demo data updated' });
    }

    if (method === 'delete' && (path.includes('-delete/') || path.includes('/'))) {
      genericDelete(store, key, routeId(path));
      saveDemoStore(store);
      return ok(config, { message: 'Demo data deleted' });
    }
  }

  return ok(config, { data: { data: [], next_cursor: null }, message: `Demo endpoint not seeded: ${path}` });
};
