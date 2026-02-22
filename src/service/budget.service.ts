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
};

export type BudgetPayload = {
  month: number;
  year: number;
  totalBudget: number;
  categoryBudgets: Record<string, number>;
};

export const budgetService = {
  listBudgets: (payload: ListPayload) => api.post("/budget/list", payload),
  createBudget: (payload: BudgetPayload) => api.post("/budget/create", payload),
  updateBudget: (id: string, payload: BudgetPayload) =>
    api.post(`/budget/update/${id}`, payload),
  deleteBudget: (id: string) => api.delete(`/budget/delete/${id}`),
  getBudgetById: (id: string) => api.post("/budget/findbyid", { budgetId: id }),
};
