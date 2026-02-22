import api from "./api";

export type ExpenseListPayload = {
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

export const ExpenseService = {
  getExpenses: (payload: ExpenseListPayload) =>
    api.post("/expense/list", payload),
  addExpense: (data: { amount: number; date: string; category: string; description?: string; title?: string; note?: string }) =>
    api.post("/expense/create", data),
  updateExpense: (
    id: string,
    data: { amount: number; date: string; category: string; description?: string; title?: string; note?: string }
  ) => api.post(`/expense/update/${id}`, data),
  deleteExpense: (id: string) => api.delete(`/expense/delete/${id}`),
  getExpenseById: (id: string) => api.post("/expense/findbyid", { expenseId: id }),
}
 
