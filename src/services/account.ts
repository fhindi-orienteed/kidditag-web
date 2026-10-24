import api from "./api";

const accountService = {
    getAllAccounts: () => api.get("/admin/accounts"),
    getAccountById: (id: number) => api.get(`/admin/accounts/${id}`),
    createAccount: (account: any) => api.post("/admin/accounts", account),
    updateAccount: (id: number, account: any) => api.put(`/admin/accounts/${id}`, account),
    deleteAccount: (id: number) => api.delete(`/admin/accounts/${id}`),
}

export default accountService