import api from "./api";

export const dashboardService = {
  getDashboardOverview: ({ month, year }: { month: number; year: number }) =>
    api.post("/dashboard/overview", { month, year }),
  getCategoryBreakdown: ({ month, year }: { month: number; year: number }) =>
    api.post("/dashboard/category-breakdown", { month, year }),
};
