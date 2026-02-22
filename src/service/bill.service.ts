import api from "./api";

export type ListPayload = {
  page: number;
  limit: number;
  search: string;
  category: string;
  min: number | null;
  max: number | null;
  startDate: string;
  endDate: string;
  sort: "amount_asc" | "amount_desc" | "date_asc" | "date_desc";
  status?: string;
};

export type BillPayload = {
  title: string;
  category: string;
  amount: number;
  dueDate: string;
  frequency: "one-time" | "monthly" | "yearly";
  status: "pending" | "paid";
  autoAddToExpense: boolean;
};

export const billService = {
  listBills: (payload: ListPayload) => api.post("/bills/list", payload),
  createBill: (payload: BillPayload) => api.post("/bills/create", payload),
  getBillById: (id: string) => api.get(`/bills/get-bill/${id}`),
  updateBill: (id: string, payload: Partial<BillPayload>) =>
    api.patch(`/bills/update/${id}`, payload),
  deleteBill: (id: string) => api.delete(`/bills/delete/${id}`),
};
