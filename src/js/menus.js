const menus = [
    { key: "Dashboard", label: "Dashboard", icon: "bx bxs-dashboard", path: "/dashboard" },
    {
        key: "Barang",
        label: "Barang",
        icon: "bx bx-package",
        isAccordion: true,
        children: [
            { key: "Barang", label: "List Barang", path: "/barang/list-barang" },
            { key: "JenisBarang", label: "Jenis Barang", path: "/jenis-barang/list-jenis-barang" },
            { key: "SumberBarang", label: "Sumber Barang", path: "/sumber-barang/list-sumber-barang" },
        ]
    },
    { key: "Categories", label: "Category", icon: "bx bx-category-alt", path: "/category/list-category" },
    { key: "User", label: "Data User", icon: "bx bxs-user-badge", path: "/user/list-user" },
    {
        key: "MakeRequest",
        label: "Request",
        icon: "bx bx-message-add",
        isAccordion: true,
        children: [
            { key: "MakeRequest", label: "Make Request", path: "/make-request/list-make-request" },
            { key: "ListMakeRequest", label: "Create Purchase Request", path: "/make-purchase-request/list-make-purchase-request" },
            { key: "ListPurchaseRequest", label: "Create Purchase Order", path: "/purchase-order-pr/list-purchase-order-pr" },
            { key: "PurchaseRequest", label: "Purchase Request", path: "/purchase-request/list-purchase-request" },
            { key: "PurchaseOrder", label: "Purchase Order", path: "/purchase-order/list-purchase-order" },
            { key: "TypeRequest", label: "Type Request", path: "/type-request/list-type-request" },
        ]
    },
    { key: "JenisMemo", label: "Jenis Memo", icon: "bx bx-note", path: "/jenismemo/list-jenismemo" },
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
    { key: "Status", label: "Status", icon: "bx bxs-checkbox-checked", path: "/status/list-status" },
    { key: "NavigationGroup", label: "Navigation Group", icon: "bx bx-navigation", path: "/navigation-groups/list-navigation-groups" },
    { key: "Role", label: "Role", icon: "bx bx-tag", path: "/role/list-role" },
    { key: "Billing", label: "Billing", icon: "bx bx-spreadsheet", path: "/billing/list-billing" },
    {
        key: "ApprovalStep",
        label: "Approval Step",
        icon: "bx bx-user-check",
        isAccordion: true,
        children: [
            { key: "ApprovalStep", label: "Approval Step", icon: "bx bx-user-check", path: "/approval-step/list-approval-step" },
            { key: "ApprovalStepLPB", label: "Approval Step LPB", path: "/approval-step-lpb/list-approval-step-lpb" },
        ]
    },
    {
        key: "InventMutasi" || "InventLog",
        label: "Information",
        icon: "bx bx-info-circle",
        isAccordion: true,
        children: [
            { key: "InventMutasi", label: "Mutasi", path: "/mutasi" },
            { key: "InventLog", label: "Log", path: "/log" }
        ]
    }
];

export default menus;