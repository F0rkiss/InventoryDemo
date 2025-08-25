import api from "../api/api";

const ENDPOINTS = {
  detailAdmin: (id) => `/inventMakeRequest-admin/detail/${id}`,
  detailUser: (id) => `/inventMakeRequest-detail/${id}`,
  delete: (id) => `/inventMakeRequest-delete/${id}`,
  searchBarang: (term) => `/inventBarang?search=${encodeURIComponent(term)}`,
  create: "/inventMakeRequest",
};

export const purchaseRequestService = {
  getDetails: (id, isAdmin) =>
    api.get(isAdmin ? ENDPOINTS.detailAdmin(id) : ENDPOINTS.detailUser(id)),

  delete: (id) => api.delete(ENDPOINTS.delete(id)),

  searchBarang: (term) => api.get(ENDPOINTS.searchBarang(term)),

  create: (data) => api.post(ENDPOINTS.create, data),
};
