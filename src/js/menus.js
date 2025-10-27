const menus = [
    { key: "Dashboard", label: "Dashboard", icon: "bx bxs-dashboard", path: "/dashboard" },
    {
        key: "MakeRequest" || "MakeRequestAdmin" || "ListMakequest" || "ListPurchaseRequest" || "PurchaseRequest" || "PurchaseOrder" || "TypeRequest",
        label: "Request",
        icon: "bx bx-message-add",
        isAccordion: true,
        children: [
            { key: "MakeRequestAdmin", label: "All Material Request", path: "/material-request-admin/list-material-request-admin" },
            { key: "MakeRequest", label: "Personal Material Request", path: "/material-request/list-material-request" },
            { key: "ListMakeRequest", label: "Create Purchase Request", path: "/make-purchase-request/list-make-purchase-request" },
            { key: "PurchaseRequest", label: "Purchase Request", path: "/purchase-request/list-purchase-request" },
            { key: "ListPurchaseRequest", label: "Create Purchase Order", path: "/purchase-order-pr/list-purchase-order-pr" },
            { key: "PurchaseOrder", label: "Purchase Order", path: "/purchase-order/list-purchase-order" },
            { key: "TypeRequest", label: "Type Request", path: "/type-request/list-type-request" },
        ]
    },
    {
        key: "LPB",
        label: "LPB",
        icon: "bx bx-file",
        isAccordion: true,
        children: [
            { key: "ListPurchaseOrder", label: "Create LPB", path: "/lpb/list-create-lpb" },
            { key: "LPB", label: "LPB", path: "/lpb/list-lpb" },
        ]
    },

    {
        key: "InventStok" || "Barang" || "JenisBarang" || "SumberBarang",
        label: "Barang",
        icon: "bx bx-package",
        isAccordion: true,
        children: [
            { key: "InventStok", label: "List Stok", path: "/stok/list-stok" },
            { key: "Barang", label: "List Barang", path: "/barang/list-barang" },
            { key: "JenisBarang", label: "Jenis Barang", path: "/jenis-barang/list-jenis-barang" },
            { key: "SumberBarang", label: "Sumber Barang", path: "/sumber-barang/list-sumber-barang" },
        ]
    },
    {
        key: "ApprovalStep" || "ApprovalStepLPB",
        label: "Approval Step",
        icon: "bx bx-user-check",
        isAccordion: true,
        children: [
            { key: "ApprovalStep", label: "Approval Step", icon: "bx bx-user-check", path: "/approval-step/list-approval-step" },
            { key: "ApprovalStepLPB", label: "Approval Step LPB", path: "/approval-step-lpb/list-approval-step-lpb" },
        ]
    },
    { key: "User", label: "Data User", icon: "bx bxs-user-badge", path: "/user/list-user" },
    { key: "Categories", label: "Category", icon: "bx bx-category-alt", path: "/category/list-category" },
    { key: "Status", label: "Status", icon: "bx bxs-checkbox-checked", path: "/status/list-status" },
    { key: "Role", label: "Role", icon: "bx bx-tag", path: "/role/list-role" },
    { key: "Billing", label: "Billing", icon: "bx bx-spreadsheet", path: "/billing/list-billing" },
    { key: "NavigationGroup", label: "Navigation Group", icon: "bx bx-navigation", path: "/navigation-groups/list-navigation-groups" },
    {
        key: "InventMutasi" || "InventLog" || "PPN",
        label: "Information",
        icon: "bx bx-info-circle",
        isAccordion: true,
        children: [
            { key: "InventMutasi", label: "Mutasi", path: "/mutasi" },
            { key: "InventLog", label: "Log", path: "/log" },
            { key: "PPN", label: "PPN", path: "/ppn" }
        ]
    },
    { key: "JenisMemo", label: "Jenis Memo", icon: "bx bx-note", path: "/jenismemo/list-jenismemo" },
];

export default menus;