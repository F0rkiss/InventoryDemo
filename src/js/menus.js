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
            { key: "TypeRequest", label: "Type Request", path: "/type-request/list-type-request" },
            { key: "PurchaseRequest", label: "Purchase Request", path: "/purchase-request/list-purchase-request" }
        ]
    },
    { key: "JenisMemo", label: "Jenis Memo", icon: "bx bx-note", path: "/jenismemo/list-jenismemo" },
    { key: "Status", label: "Status", icon: "bx bx-checkbox-checked", path: "/status/list-status" },
    { key: "NavigationGroup", label: "Navigation Group", icon: "bx bx-navigation", path: "/navigation-groups/list-navigation-groups" },
    { key: "Role", label: "Role", icon: "bx bx-tag", path: "/role/list-role" },
    { key: "Billing", label: "Billing", icon: "bx bx-spreadsheet", path: "/billing/list-billing" },
    { key: "ApprovalStep", label: "Approval Step", icon: "bx bx-user-check", path: "/approval-step/list-approval-step" },
];

export default menus;