import React, { useEffect, useMemo, useState } from "react";
import { Eye, Filter, SquarePenIcon, Trash, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import CustomModal from "../../components/CustomModal";
import CustomPagination from "../../components/Pagination";
import { budgetService } from "../../service/budget.service";

type BudgetRecord = {
  _id: string;
  month: number;
  year: number;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentageUsed: number;
  categoryBudgets: Record<string, number>;
};

type BudgetFilters = {
  category: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
};

type BudgetFormState = {
  month: string;
  year: string;
  totalBudget: string;
  category: string;
  categoryAmount: string;
};

const budgetCategories = [
  "food",
  "groceries",
  "transport",
  "fuel",
  "rent",
  "utilities",
  "shopping",
  "entertainment",
  "subscriptions",
  "health",
  "education",
  "travel",
  "insurance",
  "emi",
  "investment",
  "others",
];

const defaultFilters: BudgetFilters = {
  category: "All",
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
};

const getDefaultFormState = (): BudgetFormState => {
  const now = new Date();
  return {
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
    totalBudget: "",
    category: "others",
    categoryAmount: "",
  };
};

const toNumberOrNull = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const formatCategory = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const getMonthYear = (month: number, year: number) =>
  new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return "bg-red-500";
  if (percentage >= 80) return "bg-amber-500";
  return "bg-emerald-500";
};

export default function BudgetsIndex() {
  const [params, setParams] = useSearchParams();
  const rawPage = Number(params.get("page"));
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit = 10;

  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<BudgetFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<BudgetFilters>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [form, setForm] = useState<BudgetFormState>(getDefaultFormState);

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRecord | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const requestPayload = useMemo(
    () => ({
      page,
      limit,
      search: searchQuery.trim(),
      category:
        appliedFilters.category === "All"
          ? ""
          : appliedFilters.category.toLowerCase(),
      min: toNumberOrNull(appliedFilters.minAmount),
      max: toNumberOrNull(appliedFilters.maxAmount),
      startDate: appliedFilters.dateFrom,
      endDate: appliedFilters.dateTo,
      sort: "date_desc" as const,
    }),
    [appliedFilters, limit, page, searchQuery]
  );

  const fetchBudgets = async (payload = requestPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await budgetService.listBudgets(payload);
      const data = response.data?.data || {};
      setBudgets(Array.isArray(data.budgets) ? data.budgets : []);
      setPagination({
        total: Number(data.total || 0),
        totalPages: Number(data.totalPages || 1),
        page: Number(data.page || payload.page),
        limit: Number(data.limit || payload.limit),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch budgets");
      setBudgets([]);
      setPagination({ total: 0, totalPages: 1, page: payload.page, limit: payload.limit });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestPayload]);

  useEffect(() => {
    if (page > pagination.totalPages) {
      setParams({ page: String(Math.max(1, pagination.totalPages)) });
    }
  }, [page, pagination.totalPages, setParams]);

  const goToFirstPage = () => {
    if (page !== 1) setParams({ page: "1" });
  };

  const onPageChange = (nextPage: number) => {
    const bounded = Math.min(Math.max(nextPage, 1), Math.max(1, pagination.totalPages));
    setParams({ page: String(bounded) });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    goToFirstPage();
  };

  const hasActiveFilters =
    appliedFilters.category !== "All" ||
    appliedFilters.dateFrom !== "" ||
    appliedFilters.dateTo !== "" ||
    appliedFilters.minAmount !== "" ||
    appliedFilters.maxAmount !== "";

  const openCreateModal = () => {
    setModalMode("create");
    setEditingBudgetId(null);
    setForm(getDefaultFormState());
    setModalOpen(true);
  };

  const closeBudgetModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setEditingBudgetId(null);
    setForm(getDefaultFormState());
  };

  const buildCategoryBudgets = () => {
    const categoryBudgets: Record<string, number> = {};
    budgetCategories.forEach((category) => {
      categoryBudgets[category] = 0;
    });
    const categoryAmount = Number(form.categoryAmount || 0);
    if (categoryAmount > 0 && budgetCategories.includes(form.category)) {
      categoryBudgets[form.category] = categoryAmount;
    }
    return categoryBudgets;
  };

  const handleSubmitBudget = async (event: React.FormEvent) => {
    event.preventDefault();
    const month = Number(form.month);
    const year = Number(form.year);
    const totalBudget = Number(form.totalBudget);
    const categoryAmount = Number(form.categoryAmount || 0);
    if (month < 1 || month > 12) {
      setError("Month must be between 1 and 12.");
      return;
    }
    if (!Number.isFinite(year) || year < 2000) {
      setError("Enter a valid year.");
      return;
    }
    if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
      setError("Total budget must be greater than 0.");
      return;
    }
    if (categoryAmount > totalBudget) {
      setError("Category amount cannot be greater than total budget.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        month,
        year,
        totalBudget,
        categoryBudgets: buildCategoryBudgets(),
      };
      if (modalMode === "edit" && editingBudgetId) {
        await budgetService.updateBudget(editingBudgetId, payload);
      } else {
        await budgetService.createBudget(payload);
      }
      closeBudgetModal();
      await fetchBudgets();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save budget");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchBudgetById = async (budgetId: string) => {
    const response = await budgetService.getBudgetById(budgetId);
    return response.data?.data?.budget as BudgetRecord;
  };

  const handleView = async (budget: BudgetRecord) => {
    setActiveActionId(budget._id);
    setSelectedLoading(true);
    try {
      const budgetData = await fetchBudgetById(budget._id);
      setSelectedBudget(budgetData || budget);
      setViewOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch budget details");
    } finally {
      setSelectedLoading(false);
      setActiveActionId(null);
    }
  };

  const handleEdit = async (budget: BudgetRecord) => {
    setActiveActionId(budget._id);
    setSelectedLoading(true);
    try {
      const budgetData = await fetchBudgetById(budget._id);
      const categoryEntries = Object.entries(budgetData.categoryBudgets || {});
      const highestCategory =
        categoryEntries.sort((a, b) => Number(b[1]) - Number(a[1]))[0] || null;

      setModalMode("edit");
      setEditingBudgetId(budgetData._id);
      setForm({
        month: String(budgetData.month),
        year: String(budgetData.year),
        totalBudget: String(budgetData.totalBudget),
        category: highestCategory?.[0] || "others",
        categoryAmount: highestCategory?.[1] ? String(highestCategory[1]) : "",
      });
      setModalOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch budget details");
    } finally {
      setSelectedLoading(false);
      setActiveActionId(null);
    }
  };

  const handleDelete = async (budget: BudgetRecord) => {
    const shouldDelete = window.confirm(
      `Delete budget for ${getMonthYear(budget.month, budget.year)}?`
    );
    if (!shouldDelete) return;

    setActiveActionId(budget._id);
    setError(null);
    try {
      await budgetService.deleteBudget(budget._id);
      const nextPage = page > 1 && budgets.length === 1 ? page - 1 : page;
      if (nextPage !== page) {
        setParams({ page: String(nextPage) });
      } else {
        await fetchBudgets({ ...requestPayload, page: nextPage });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete budget");
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900">Budgets</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage monthly budgets with server-side filters and pagination.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              onClick={openCreateModal}
              type="button"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Add budget
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search budgets by month/year..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="block w-full rounded-md border-0 py-2 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  type="button"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterOpen(true)}
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                  Active
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setFilters(defaultFilters);
                  setAppliedFilters(defaultFilters);
                  goToFirstPage();
                }}
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="relative min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      Period
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Budget
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Spent
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Remaining
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Usage
                    </th>
                    <th className="py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm text-gray-500">
                        Loading budgets...
                      </td>
                    </tr>
                  ) : budgets.length ? (
                    budgets.map((budget) => (
                      <tr key={budget._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {getMonthYear(budget.month, budget.year)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatCurrency(budget.totalBudget)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatCurrency(budget.totalSpent)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatCurrency(budget.remaining)}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="w-32">
                            <div className="mb-1 text-xs text-gray-600">
                              {Math.min(100, Number(budget.percentageUsed || 0))}%
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div
                                className={`h-2 rounded-full ${getProgressColor(
                                  Number(budget.percentageUsed || 0)
                                )}`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Number(budget.percentageUsed || 0)
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleView(budget)}
                              disabled={activeActionId === budget._id}
                              className="text-indigo-600 hover:text-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(budget)}
                              disabled={activeActionId === budget._id}
                              className="text-indigo-600 hover:text-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <SquarePenIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(budget)}
                              disabled={activeActionId === budget._id}
                              className="text-red-600 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm text-gray-500">
                        No budgets found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <CustomPagination
          page={Math.min(page, Math.max(1, pagination.totalPages))}
          limit={limit}
          total={pagination.total}
          onPageChange={onPageChange}
        />
      </div>

      <CustomModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Budgets"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="mt-2 block w-full rounded-md border-0 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
            >
              <option value="All">All</option>
              {budgetCategories.map((category) => (
                <option key={category} value={category}>
                  {formatCategory(category)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                }
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Min Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.minAmount}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, minAmount: e.target.value }))
                }
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Max Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.maxAmount}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxAmount: e.target.value }))
                }
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setFilters(defaultFilters);
                setAppliedFilters(defaultFilters);
                setFilterOpen(false);
                goToFirstPage();
              }}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setAppliedFilters(filters);
                setFilterOpen(false);
                goToFirstPage();
              }}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Apply
            </button>
          </div>
        </div>
      </CustomModal>

      <CustomModal
        open={modalOpen}
        onClose={closeBudgetModal}
        title={modalMode === "edit" ? "Edit Budget" : "Add Budget"}
      >
        <form className="space-y-4" onSubmit={handleSubmitBudget}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Month</label>
              <input
                type="number"
                min="1"
                max="12"
                required
                value={form.month}
                onChange={(e) => setForm((prev) => ({ ...prev, month: e.target.value }))}
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Year</label>
              <input
                type="number"
                min="2000"
                required
                value={form.year}
                onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Total Budget</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.totalBudget}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, totalBudget: e.target.value }))
              }
              className="mt-2 block w-full rounded-md border-0 bg-white py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Primary Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              >
                {budgetCategories.map((category) => (
                  <option key={category} value={category}>
                    {formatCategory(category)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Category Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.categoryAmount}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, categoryAmount: e.target.value }))
                }
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeBudgetModal}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Saving..."
                : modalMode === "edit"
                  ? "Save Changes"
                  : "Create Budget"}
            </button>
          </div>
        </form>
      </CustomModal>

      <CustomModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Budget Details"
      >
        {selectedLoading ? (
          <p className="text-sm text-gray-600">Loading details...</p>
        ) : selectedBudget ? (
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Period
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {getMonthYear(selectedBudget.month, selectedBudget.year)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Total Budget
                </p>
                <p className="mt-1">{formatCurrency(selectedBudget.totalBudget)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Total Spent
                </p>
                <p className="mt-1">{formatCurrency(selectedBudget.totalSpent)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Remaining
                </p>
                <p className="mt-1">{formatCurrency(selectedBudget.remaining)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Usage
                </p>
                <p className="mt-1">{selectedBudget.percentageUsed}%</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Category Budgets
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(selectedBudget.categoryBudgets || {})
                  .filter(([, amount]) => Number(amount) > 0)
                  .map(([category, amount]) => (
                    <div
                      key={category}
                      className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700"
                    >
                      {formatCategory(category)}: {formatCurrency(Number(amount))}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Budget details are unavailable.</p>
        )}
      </CustomModal>
    </>
  );
}
