export const DEMO_STORAGE_KEY = 'mi_inventory_demo_store_v2';

export const DEMO_LOGIN = {
  employeeCode: '1001',
  password: 'Demo@12345',
};

export const DEMO_NAVIGATION = [
  'Dashboard',
  'MakeRequest',
  'MakeRequestAdmin',
  'ListMakeRequest',
  'ListPurchaseOrder',
  'PurchaseRequest',
  'PurchaseOrder',
  'LPB',
  'InventStok',
  'InventStokAsset',
  'Barang',
  'Memo',
  'MemoPersonal',
  'JenisMemo',
  'ApprovalStep',
  'ApprovalStepPurchase',
  'ApprovalStepLPB',
  'ApprovalStepMemo',
  'JenisBarang',
  'SumberBarang',
  'Categories',
  'TingkatKebutuhan',
  'Status',
  'User',
  'TypeRequest',
  'Role',
  'Suplier',
  'NavigationGroup',
  'InventMutasi',
  'InventLog',
  'PPN',
  'PaymentType',
  'MataUang',
  'Billing',
  'ExportData',
  'PreviewMR',
  'PreviewPR',
  'PreviewPO',
  'PreviewLPB',
];

const access = (name) => ({
  name,
  create_access: 1,
  read_access: 1,
  update_access: 1,
  delete_access: 1,
});

export const demoNavigationMenu = DEMO_NAVIGATION.map(access);

const now = '2026-05-12T08:00:00.000Z';

export const createDemoSeed = () => {
  const roles = [
    { id: 1, name: 'admin', description: 'Full demo access' },
    { id: 2, name: 'staff', description: 'Requester demo role' },
  ];

  const users = [
    {
      id: 1,
      EmpCode: '1001',
      EmpName: 'Demo Admin',
      email: 'demo.admin@mediaindonesia.test',
      EmpPhone: '08120001001',
      DOB: '1992-02-14',
      role: roles[0],
      role_name: 'admin',
    },
    {
      id: 2,
      EmpCode: '1002',
      EmpName: 'Rani Purchasing',
      email: 'rani.purchasing@mediaindonesia.test',
      EmpPhone: '08120001002',
      DOB: '1994-08-20',
      role: roles[1],
      role_name: 'staff',
    },
  ];

  const categories = [
    { id: 1, name: 'IT Equipment', description: 'Laptop, monitor, and network devices' },
    { id: 2, name: 'Office Supply', description: 'Consumable office goods' },
  ];

  const jenisBarang = [
    { id: 1, name: 'Elektronik', description: 'Electronic office assets' },
    { id: 2, name: 'ATK', description: 'Office stationery' },
  ];

  const sumberBarang = [
    { id: 1, name: 'Pembelian', description: 'Purchased from supplier' },
    { id: 2, name: 'Stok Gudang', description: 'Available warehouse stock' },
  ];

  const tingkatKebutuhan = [
    { id: 1, name: 'Normal', description: 'Standard need' },
    { id: 2, name: 'Urgent', description: 'Priority procurement' },
  ];

  const status = [
    { id: 1, name: 'in-use', description: 'Currently used' },
    { id: 2, name: 'in-service', description: 'Ready in service' },
  ];

  const suppliers = [
    {
      id: 1,
      nama_perusahaan: 'PT Nusantara Teknologi',
      pic: 'Budi Santoso',
      email: 'sales@nusantara-tech.test',
      phone: '021-555-0101',
      alamat: 'Jl. Gatot Subroto No. 12, Jakarta',
    },
    {
      id: 2,
      nama_perusahaan: 'CV Sinar Office Supply',
      pic: 'Maya Putri',
      email: 'order@sinar-office.test',
      phone: '021-555-0102',
      alamat: 'Jl. Palmerah Barat No. 8, Jakarta',
    },
  ];

  const paymentTypes = [
    { id: 1, payment: 'Transfer Bank', description: 'Bank transfer' },
    { id: 2, payment: 'Tempo 30 Hari', description: 'Net 30 payment' },
  ];

  const mataUang = [
    { id: 1, kode: 'IDR', name: 'Rupiah', symbol: 'Rp' },
    { id: 2, kode: 'USD', name: 'US Dollar', symbol: '$' },
  ];

  const ppn = [
    { id: 1, nilai: 11, description: 'PPN default' },
    { id: 2, nilai: 0, description: 'Tanpa PPN' },
  ];

  const typeRequests = [
    { id: 1, name: 'Permintaan Stok Gudang', jenis: 'Stok', description: 'Use existing stock item', is_stok: 'ya' },
    { id: 2, name: 'Pembelian Barang Baru', jenis: 'Pembelian', description: 'Procure new item', is_stok: 'other' },
    { id: 3, name: 'Permintaan Non-Katalog', jenis: 'Manual', description: 'Free text request', is_stok: 'tidak' },
  ];

  const barang = [
    {
      id: 1,
      name: 'Laptop Lenovo ThinkPad E14',
      nama_barang: 'Laptop Lenovo ThinkPad E14',
      namaBarang: 'Laptop Lenovo ThinkPad E14',
      kode_barang: 'BRG-IT-001',
      kodeBarang: 'BRG-IT-001',
      kode_gudang: 'GDG-IT-01',
      kodeGudang: 'GDG-IT-01',
      satuan: 'unit',
      image: '',
      is_asset: 'ya',
      barangIsAsset: 'ya',
      category: categories[0],
      category_barang: categories[0],
      jenis_barang: jenisBarang[0],
      sumber_barang: sumberBarang[0],
      tingkat_kebutuhan: tingkatKebutuhan[1],
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      name: 'Monitor Dell 24 Inch',
      nama_barang: 'Monitor Dell 24 Inch',
      namaBarang: 'Monitor Dell 24 Inch',
      kode_barang: 'BRG-IT-002',
      kodeBarang: 'BRG-IT-002',
      kode_gudang: 'GDG-IT-02',
      kodeGudang: 'GDG-IT-02',
      satuan: 'unit',
      image: '',
      is_asset: 'ya',
      barangIsAsset: 'ya',
      category: categories[0],
      category_barang: categories[0],
      jenis_barang: jenisBarang[0],
      sumber_barang: sumberBarang[0],
      tingkat_kebutuhan: tingkatKebutuhan[0],
      created_at: now,
      updated_at: now,
    },
    {
      id: 3,
      name: 'Kertas A4 80gsm',
      nama_barang: 'Kertas A4 80gsm',
      namaBarang: 'Kertas A4 80gsm',
      kode_barang: 'BRG-ATK-001',
      kodeBarang: 'BRG-ATK-001',
      kode_gudang: 'GDG-ATK-01',
      kodeGudang: 'GDG-ATK-01',
      satuan: 'rim',
      image: '',
      is_asset: 'tidak',
      barangIsAsset: 'tidak',
      category: categories[1],
      category_barang: categories[1],
      jenis_barang: jenisBarang[1],
      sumber_barang: sumberBarang[1],
      tingkat_kebutuhan: tingkatKebutuhan[0],
      created_at: now,
      updated_at: now,
    },
  ];

  const stock = [
    {
      ...barang[2],
      id: 101,
      barang: barang[2],
      invent_barang_id: barang[2].id,
      qty: 120,
      note: 'Ready stock for newsroom teams',
      tanggal_barang_masuk: '2026-05-01',
      status: status[1],
    },
    {
      ...barang[1],
      id: 102,
      barang: barang[1],
      invent_barang_id: barang[1].id,
      qty: 8,
      note: 'Replacement monitor stock',
      tanggal_barang_masuk: '2026-04-18',
      status: status[1],
    },
  ];

  const stockAsset = [
    {
      ...barang[0],
      id: 201,
      barang: barang[0],
      invent_barang_id: barang[0].id,
      qty: 4,
      note: 'Laptop pool for editors',
      tanggal_barang_masuk: '2026-04-28',
      status: status[1],
    },
    {
      ...barang[1],
      id: 202,
      barang: barang[1],
      invent_barang_id: barang[1].id,
      qty: 6,
      note: 'Design desk monitors',
      tanggal_barang_masuk: '2026-04-20',
      status: status[0],
    },
  ];

  const mrOneDetails = [
    { id: 1, invent_barang_id: 1, barang: barang[0], selectedBarang: barang[0], qty: 2 },
    { id: 2, invent_barang_id: 2, barang: barang[1], selectedBarang: barang[1], qty: 2 },
  ];

  const makeRequests = [
    {
      id: 1,
      kode: 'MR-DEMO-0001',
      tanggal: '2026-05-10',
      user: users[0],
      EmpName: users[0].EmpName,
      type_request: typeRequests[1],
      nameTypeRequest: typeRequests[1].name,
      type_name: typeRequests[1].name,
      jenisTypeRequest: typeRequests[1].jenis,
      type_jenis: typeRequests[1].jenis,
      deskripsiTypeRequest: typeRequests[1].description,
      description: typeRequests[1].description,
      details: mrOneDetails,
      is_full_approval: true,
      approval_message: 'Approval sudah selesai',
      canBeUpdated: true,
      can_be_deleted: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      kode: 'MR-DEMO-0002',
      tanggal: '2026-05-11',
      user: users[1],
      EmpName: users[1].EmpName,
      type_request: typeRequests[0],
      nameTypeRequest: typeRequests[0].name,
      type_name: typeRequests[0].name,
      jenisTypeRequest: typeRequests[0].jenis,
      type_jenis: typeRequests[0].jenis,
      deskripsiTypeRequest: typeRequests[0].description,
      description: typeRequests[0].description,
      details: [{ id: 3, invent_barang_id: 3, barang: barang[2], selectedBarang: barang[2], qty: 20 }],
      is_full_approval: false,
      approval_message: 'Approval belum selesai',
      canBeUpdated: true,
      can_be_deleted: true,
      created_at: now,
      updated_at: now,
    },
  ];

  const purchaseRequests = [
    {
      id: 1,
      kode: 'PR-DEMO-0001',
      make_request_id: 1,
      make_request: makeRequests[0],
      tanggal: '2026-05-10',
      note: 'Procurement for editorial laptop refresh',
      user: users[0],
      EmpName: users[0].EmpName,
      details: mrOneDetails.map((detail, index) => ({
        id: index + 1,
        invent_barangs_id: detail.barang.id,
        barang: detail.barang,
        barangs: detail.barang,
        barang_detail: detail.barang,
        requested_qty: detail.qty,
        used_qty: index === 0 ? 2 : 0,
        sisa: index === 0 ? 0 : detail.qty,
      })),
      qty: mrOneDetails.map((detail, index) => ({
        barang_id: detail.barang.id,
        requested_qty: detail.qty,
        used_qty: index === 0 ? 2 : 0,
        sisa: index === 0 ? 0 : detail.qty,
      })),
      purchase_orders: [],
      is_completed: false,
      isApproved: true,
      isRejected: false,
      canBeUpdated: true,
      created_at: now,
      updated_at: now,
    },
  ];

  const purchaseOrders = [
    {
      id: 1,
      kode: 'PO-DEMO-0001',
      purchase_request_id: 1,
      purchase_request: purchaseRequests[0],
      tanggal: '2026-05-11',
      tanggal_penyerahan: '2026-05-20',
      keterangan: 'First batch laptop procurement',
      suplier: suppliers[0],
      supplier: suppliers[0],
      suplier_id: 1,
      nama_perusahaan: suppliers[0].nama_perusahaan,
      payment: { id: paymentTypes[0].id, payment: paymentTypes[0].payment, cara_pembayaran: paymentTypes[0].payment },
      cara_pembayaran: paymentTypes[0].payment,
      payment_type: paymentTypes[0],
      is_ppn: 1,
      nilai_ppn: 11,
      harga: 30000000,
      harga_after_ppn: 33300000,
      lampiran: [],
      details: [
        {
          id: 1,
          invent_barangs_id: 1,
          barang_id: 1,
          barangs: barang[0],
          barang_detail: barang[0],
          qty: 2,
          harga_per_item: 15000000,
          mataUang: mataUang[0],
        },
      ],
      qty: [{ barang_id: 1, requested_qty: 2, used_qty: 1, sisa: 1 }],
      is_completed: false,
      isApproved: true,
      isRejected: false,
      canBeUpdated: true,
      created_at: now,
      updated_at: now,
    },
  ];

  purchaseRequests[0].purchase_orders = purchaseOrders.map((po) => ({
    id: po.id,
    kode: po.kode,
    tanggal: po.tanggal,
    is_completed: po.is_completed,
  }));

  const lpbs = [
    {
      id: 1,
      kode: 'LPB-DEMO-0001',
      purchase_order_id: 1,
      purchase_order: purchaseOrders[0],
      purchase_request: purchaseRequests[0],
      tanggal: '2026-05-12',
      penerima: 'Demo Admin',
      note: 'Partial delivery received',
      keterangan: 'Partial delivery received',
      nama_perusahaan: suppliers[0].nama_perusahaan,
      kodePO: purchaseOrders[0].kode,
      tanggalPO: purchaseOrders[0].tanggal,
      details: [
        {
          id: 1,
          invent_barangs_id: 1,
          barangs: barang[0],
          qty: 1,
          purchase_order_detail_id: 1,
        },
      ],
      qty: [{ barang_id: 1, requested_qty: 1, used_qty: 1, sisa: 0 }],
      bukti: [],
      is_full_approval: false,
      canBeUpdated: true,
      isCompletedPo: false,
      created_at: now,
      updated_at: now,
    },
  ];

  const memos = [
    {
      id: 1,
      name: 'Maintenance Window Gudang IT',
      tanggal: '2026-05-12',
      description: '<p>Inventory demo data is available for QA testing.</p>',
      jenis_memo_id: 1,
      jenis_memo: { id: 1, name: 'Informasi Umum', description: 'General information', is_dynamic: 0 },
      expired: '2026-06-12',
      is_full_approval: true,
      is_dynamic: false,
      is_public: true,
      EmpName: users[0].EmpName,
    },
    {
      id: 2,
      name: 'Reminder Stock Opname',
      tanggal: '2026-05-13',
      description: '<p>Stock opname simulation is ready for review.</p>',
      jenis_memo_id: 2,
      jenis_memo: { id: 2, name: 'Persetujuan Pengadaan', description: 'Procurement memo', is_dynamic: 1 },
      expired: '2026-06-13',
      is_full_approval: false,
      is_dynamic: true,
      is_public: true,
      EmpName: users[1].EmpName,
    },
  ];

  return {
    meta: {
      nextIds: {
        makeRequest: 3,
        purchaseRequest: 2,
        purchaseOrder: 2,
        lpb: 2,
        generic: 1000,
      },
    },
    users,
    roles,
    departments: [
      { id: 1, name: 'Editorial', description: 'Newsroom department' },
      { id: 2, name: 'IT Support', description: 'Technology support department' },
    ],
    divisi: [
      { id: 1, name: 'Newsroom', description: 'Editorial division' },
      { id: 2, name: 'Operations', description: 'Operational division' },
    ],
    categories,
    jenisBarang,
    sumberBarang,
    tingkatKebutuhan,
    status,
    suppliers,
    paymentTypes,
    mataUang,
    ppn,
    typeRequests,
    barang,
    stock,
    stockAsset,
    makeRequests,
    purchaseRequests,
    purchaseOrders,
    lpbs,
    barangHistories: [
      { id: 1, barang_id: 1, kode: purchaseOrders[0].kode, nama_perusahaan: suppliers[0].nama_perusahaan, tanggal: purchaseOrders[0].tanggal, harga_sub_total: 30000000, qty: 2 },
      { id: 2, barang_id: 2, kode: 'PO-DEMO-0002', nama_perusahaan: suppliers[1].nama_perusahaan, tanggal: '2026-04-25', harga_sub_total: 4200000, qty: 2 },
      { id: 3, barang_id: 3, kode: 'LPB-DEMO-STOCK', nama_perusahaan: suppliers[1].nama_perusahaan, tanggal: '2026-05-01', harga_sub_total: 7200000, qty: 120 },
    ],
    stockHistories: [
      {
        id: 1,
        invent_stoks_id: 201,
        invent_status_id: status[1].id,
        status: status[1].name,
        user_id: users[0].id,
        EmpName: users[0].EmpName,
        lokasi: 'Gudang IT',
        note: 'Ready for assignment',
        image: '',
        tanggal: '2026-05-02',
        created_at: now,
      },
      {
        id: 2,
        invent_stoks_id: 202,
        invent_status_id: status[0].id,
        status: status[0].name,
        user_id: users[1].id,
        EmpName: users[1].EmpName,
        lokasi: 'Design Desk',
        note: 'Assigned to design workstation',
        image: '',
        tanggal: '2026-05-04',
        created_at: now,
      },
    ],
    stockMutasi: [
      { id: 1, invent_stoks_id: 101, tanggal: '2026-05-01', stok_awal: 0, stok_change: 120, stok_akhir: 120 },
      { id: 2, invent_stoks_id: 101, tanggal: '2026-05-09', stok_awal: 120, stok_change: 20, stok_akhir: 100 },
      { id: 3, invent_stoks_id: 102, tanggal: '2026-04-18', stok_awal: 0, stok_change: 8, stok_akhir: 8 },
    ],
    billing: [
      {
        id: 1,
        user_id: 1,
        user: users[0],
        EmpName: users[0].EmpName,
        penanggungJawab: 'IT Support',
        tanggal_berlangganan: '2026-05-01',
        tanggal_selesai_berlangganan: '2027-05-01',
        tanggal_pembayaran: '2026-05-05',
        status: 'aktif',
        biaya: 2500000,
        note: 'Demo cloud subscription',
      },
      {
        id: 2,
        user_id: 2,
        user: users[1],
        EmpName: users[1].EmpName,
        penanggungJawab: 'Purchasing',
        tanggal_berlangganan: '2026-04-01',
        tanggal_selesai_berlangganan: '2027-04-01',
        tanggal_pembayaran: '2026-04-05',
        status: 'aktif',
        biaya: 1750000,
        note: 'Demo procurement tool',
      },
    ],
    memos,
    jenisMemo: [
      { id: 1, name: 'Informasi Umum', description: 'General information', is_dynamic: 0 },
      { id: 2, name: 'Persetujuan Pengadaan', description: 'Procurement memo', is_dynamic: 1 },
    ],
    approvalSteps: [
      { id: 1, name: 'MR Manager Approval', user: users[0], type_request: typeRequests[1], step: 1 },
      { id: 2, name: 'MR Finance Approval', user: users[1], type_request: typeRequests[1], step: 2 },
    ],
    approvalStepPurchase: [
      { id: 1, name: 'PR Procurement Approval', user: users[0], step: 1 },
      { id: 2, name: 'PO Finance Approval', user: users[1], step: 2 },
    ],
    approvalStepLPB: [
      { id: 1, name: 'LPB Warehouse Approval', user: users[0], step: 1 },
      { id: 2, name: 'LPB Admin Approval', user: users[1], step: 2 },
    ],
    approvalStepMemo: [
      { id: 1, name: 'Memo Editor Approval', user: users[0], jenis_memo: { id: 1, name: 'Informasi Umum' }, step: 1 },
      { id: 2, name: 'Memo Publisher Approval', user: users[1], jenis_memo: { id: 2, name: 'Persetujuan Pengadaan' }, step: 2 },
    ],
    navigationGroups: [
      { id: 1, name: 'Demo Admin Navigation', role: roles[0], navigation_menu: demoNavigationMenu },
      { id: 2, name: 'Demo Staff Navigation', role: roles[1], navigation_menu: demoNavigationMenu.slice(0, 12) },
    ],
    navigationMenus: demoNavigationMenu.map((item, index) => ({ id: index + 1, ...item })),
    notifications: [
      { id: 1, title: 'Demo mode aktif', message: 'Frontend demo data siap digunakan.', created_at: now, read_at: null },
      { id: 2, title: 'PR menunggu PO', message: 'PR-DEMO-0001 dapat dikonversi ke PO.', created_at: now, read_at: null },
    ],
    logs: [
      { id: 1, action: 'seed', table_name: 'demo', description: 'Demo data initialized', created_at: now },
      { id: 2, action: 'login', table_name: 'auth', description: 'Demo account available', created_at: now },
    ],
    mutasi: [
      { id: 1, kode: 'MTS-DEMO-0001', barang: barang[2], qty: 20, type: 'in', note: 'Demo stock in', created_at: now },
      { id: 2, kode: 'MTS-DEMO-0002', barang: barang[1], qty: 1, type: 'out', note: 'Demo stock out', created_at: now },
    ],
    trash: {
      category: [{ id: 91, name: 'Old Demo Category', description: 'Trash sample' }],
      department: [{ id: 92, name: 'Archived Department', description: 'Trash sample' }],
      divisi: [{ id: 93, name: 'Archived Division', description: 'Trash sample' }],
      makeRequest: [{ id: 94, kode: 'MR-TRASH-0001', tanggal: '2026-04-01', EmpName: users[0].EmpName }],
    },
  };
};
