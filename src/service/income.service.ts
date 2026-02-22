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

export type IncomePayload = {
  description: string;
  source: string;
  amount: number;
  date: string;
  status: "pending" | "received";
  recurring: boolean;
  note?: string;
};

export const incomeService = {
  listIncomes: (payload: ListPayload) => api.post("/income/list", payload),
  createIncome: (payload: IncomePayload) => api.post("/income/create", payload),
  getIncomeById: (id: string) => api.get(`/income/get-income/${id}`),
  updateIncome: (id: string, payload: Partial<IncomePayload>) =>
    api.patch(`/income/update/${id}`, payload),
  deleteIncome: (id: string) => api.delete(`/income/delete/${id}`),
};
