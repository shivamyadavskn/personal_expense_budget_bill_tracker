import React, { useEffect, useMemo, useState } from "react";
import { Eye, Filter, SquarePenIcon, Trash, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import CustomModal from "../../components/CustomModal";
import CustomPagination from "../../components/Pagination";
import { incomeService } from "../../service/income.service";

type IncomeRecord = {
  _id: string;
  description: string;
  source: string;
  amount: number;
  date: string;
  status: "pending" | "received";
  recurring: boolean;
  note?: string;
};

type IncomeFilters = {
  source: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
};

type IncomeFormState = {
  description: string;
  source: string;
  amount: string;
  date: string;
  status: "pending" | "received";
  recurring: boolean;
  note: string;
};

const sources = [
  "salary",
  "freelance",
  "rental",
  "investments",
  "side_income",
  "refund",
  "gift",
  "bonus",
  "other",
];

const defaultFilters: IncomeFilters = {
  source: "All",
  status: "All",
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
};

const getDefaultForm = (): IncomeFormState => ({
  description: "",
  source: "salary",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  status: "received",
  recurring: false,
  note: "",
});

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

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
};

const formatLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());

export default function IncomesIndex() {
  const [params, setParams] = useSearchParams();
  const rawPage = Number(params.get("page"));
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit = 10;

  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<IncomeFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<IncomeFilters>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [form, setForm] = useState<IncomeFormState>(getDefaultForm);
  const [submitting, setSubmitting] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<IncomeRecord | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const requestPayload = useMemo(
    () => ({
      page,
      limit,
      search: searchQuery.trim(),
      category: appliedFilters.source === "All" ? "" : appliedFilters.source,
      status: appliedFilters.status === "All" ? "" : appliedFilters.status,
      min: toNumberOrNull(appliedFilters.minAmount),
      max: toNumberOrNull(appliedFilters.maxAmount),
      startDate: appliedFilters.dateFrom,
      endDate: appliedFilters.dateTo,
      sort: "date_desc" as const,
    }),
    [appliedFilters, limit, page, searchQuery]
  );

  const fetchIncomes = async (payload = requestPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await incomeService.listIncomes(payload);
      const data = response.data?.data || {};
      setIncomes(Array.isArray(data.incomes) ? data.incomes : []);
      setPagination({
        total: Number(data.total || 0),
        totalPages: Number(data.totalPages || 1),
        page: Number(data.page || payload.page),
        limit: Number(data.limit || payload.limit),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch incomes");
      setIncomes([]);
      setPagination({ total: 0, totalPages: 1, page: payload.page, limit: payload.limit });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
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
    appliedFilters.source !== "All" ||
    appliedFilters.status !== "All" ||
    appliedFilters.dateFrom !== "" ||
    appliedFilters.dateTo !== "" ||
    appliedFilters.minAmount !== "" ||
    appliedFilters.maxAmount !== "";

  const openCreateModal = () => {
    setModalMode("create");
    setEditingIncomeId(null);
    setForm(getDefaultForm());
    setModalOpen(true);
  };

  const closeIncomeModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setEditingIncomeId(null);
    setForm(getDefaultForm());
  };

  const submitIncome = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Amount must be a non-negative number.");
      return;
    }
    if (!form.date) {
      setError("Date is required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        description: form.description.trim(),
        source: form.source,
        amount,
        date: form.date,
        status: form.status,
        recurring: form.recurring,
        note: form.note.trim(),
      };
      if (modalMode === "edit" && editingIncomeId) {
        await incomeService.updateIncome(editingIncomeId, payload);
      } else {
        await incomeService.createIncome(payload);
      }
      closeIncomeModal();
      await fetchIncomes();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save income");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchIncomeById = async (incomeId: string) => {
    const response = await incomeService.getIncomeById(incomeId);
    return response.data?.data?.income as IncomeRecord;
  };

  const handleView = async (income: IncomeRecord) => {
    setActiveActionId(income._id);
    setSelectedLoading(true);
    try {
      const incomeData = await fetchIncomeById(income._id);
      setSelectedIncome(incomeData || income);
      setViewOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch income details");
    } finally {
      setSelectedLoading(false);
      setActiveActionId(null);
    }
  };

  const handleEdit = async (income: IncomeRecord) => {
    setActiveActionId(income._id);
    setSelectedLoading(true);
    try {
      const incomeData = await fetchIncomeById(income._id);
      setModalMode("edit");
      setEditingIncomeId(incomeData._id);
      setForm({
        description: incomeData.description || "",
        source: incomeData.source || "other",
        amount: String(incomeData.amount ?? ""),
        date: incomeData.date?.includes("T")
          ? incomeData.date.split("T")[0]
          : incomeData.date || "",
        status: incomeData.status || "received",
        recurring: Boolean(incomeData.recurring),
        note: incomeData.note || "",
      });
      setModalOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch income details");
    } finally {
      setSelectedLoading(false);
      setActiveActionId(null);
    }
  };

  const handleDelete = async (income: IncomeRecord) => {
    const shouldDelete = window.confirm(
      `Delete income "${income.description}"? This action cannot be undone.`
    );
    if (!shouldDelete) return;

    setActiveActionId(income._id);
    setError(null);
    try {
      await incomeService.deleteIncome(income._id);
      const nextPage = page > 1 && incomes.length === 1 ? page - 1 : page;
      if (nextPage !== page) {
        setParams({ page: String(nextPage) });
      } else {
        await fetchIncomes({ ...requestPayload, page: nextPage });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete income");
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900">Incomes</h1>
            <p className="mt-2 text-sm text-gray-700">
              Track income records with server-side filters and pagination.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              onClick={openCreateModal}
              type="button"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Add income
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
                placeholder="Search incomes..."
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
                      Description
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Source
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
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
                        Loading incomes...
                      </td>
                    </tr>
                  ) : incomes.length ? (
                    incomes.map((income) => (
                      <tr key={income._id}>
                        <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {income.description}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatLabel(income.source)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(income.date)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-emerald-600">
                          +{formatCurrency(income.amount)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              income.status === "received"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {formatLabel(income.status)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleView(income)}
                              disabled={activeActionId === income._id}
                              className="text-indigo-600 hover:text-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(income)}
                              disabled={activeActionId === income._id}
                              className="text-indigo-600 hover:text-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <SquarePenIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(income)}
                              disabled={activeActionId === income._id}
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
                        No incomes found matching your filters.
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
        title="Filter Incomes"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Source</label>
              <select
                value={filters.source}
                onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value }))}
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              >
                <option value="All">All</option>
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {formatLabel(source)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              >
                <option value="All">All</option>
                <option value="received">Received</option>
                <option value="pending">Pending</option>
              </select>
            </div>
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
        onClose={closeIncomeModal}
        title={modalMode === "edit" ? "Edit Income" : "Add Income"}
      >
        <form className="space-y-4" onSubmit={submitIncome}>
          <div>
            <label className="block text-sm font-medium text-gray-900">Description</label>
            <input
              type="text"
              required
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="mt-2 block w-full rounded-md border-0 bg-white py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              >
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {formatLabel(source)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value as IncomeFormState["status"],
                  }))
                }
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              >
                <option value="received">Received</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="recurring-income"
              type="checkbox"
              checked={form.recurring}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, recurring: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="recurring-income" className="text-sm text-gray-700">
              Recurring income
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Note</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
              rows={3}
              className="mt-2 block w-full rounded-md border-0 bg-white py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeIncomeModal}
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
                  : "Create Income"}
            </button>
          </div>
        </form>
      </CustomModal>

      <CustomModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Income Details"
      >
        {selectedLoading ? (
          <p className="text-sm text-gray-600">Loading details...</p>
        ) : selectedIncome ? (
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Description
              </p>
              <p className="mt-1 font-medium text-gray-900">{selectedIncome.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Source
                </p>
                <p className="mt-1">{formatLabel(selectedIncome.source)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </p>
                <p className="mt-1">{formatLabel(selectedIncome.status)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Amount
                </p>
                <p className="mt-1">{formatCurrency(selectedIncome.amount)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Date
                </p>
                <p className="mt-1">{formatDate(selectedIncome.date)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Note</p>
              <p className="mt-1">{selectedIncome.note || "-"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Income details are unavailable.</p>
        )}
      </CustomModal>
    </>
  );
}
