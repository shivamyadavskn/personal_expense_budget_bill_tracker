import React, { useEffect, useMemo, useState } from "react";
import { Eye, Filter, SquarePenIcon, Trash, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import CustomModal from "../../components/CustomModal";
import CustomPagination from "../../components/Pagination";
import { billService } from "../../service/bill.service";

type BillRecord = {
  _id: string;
  title: string;
  category: string;
  amount: number;
  dueDate: string;
  frequency: "one-time" | "monthly" | "yearly";
  status: "pending" | "paid";
  autoAddToExpense: boolean;
};

type BillFilters = {
  category: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
};

type BillFormState = {
  title: string;
  category: string;
  amount: string;
  dueDate: string;
  frequency: "one-time" | "monthly" | "yearly";
  status: "pending" | "paid";
  autoAddToExpense: boolean;
};

const categories = [
  "rent",
  "utilities",
  "subscriptions",
  "insurance",
  "emi",
  "others",
];

const defaultFilters: BillFilters = {
  category: "All",
  status: "All",
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
};

const getDefaultForm = (): BillFormState => ({
  title: "",
  category: "utilities",
  amount: "",
  dueDate: new Date().toISOString().split("T")[0],
  frequency: "monthly",
  status: "pending",
  autoAddToExpense: true,
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

const getDueText = (dueDate: string, status: string) => {
  if (status === "paid") return "Paid";
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)} day(s) overdue`;
  if (diffDays === 0) return "Due today";
  return `Due in ${diffDays} day(s)`;
};

export default function BillsIndex() {
  const [params, setParams] = useSearchParams();
  const rawPage = Number(params.get("page"));
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit = 10;

  const [bills, setBills] = useState<BillRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<BillFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<BillFilters>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [form, setForm] = useState<BillFormState>(getDefaultForm);
  const [submitting, setSubmitting] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillRecord | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const requestPayload = useMemo(
    () => ({
      page,
      limit,
      search: searchQuery.trim(),
      category: appliedFilters.category === "All" ? "" : appliedFilters.category,
      status: appliedFilters.status === "All" ? "" : appliedFilters.status,
      min: toNumberOrNull(appliedFilters.minAmount),
      max: toNumberOrNull(appliedFilters.maxAmount),
      startDate: appliedFilters.dateFrom,
      endDate: appliedFilters.dateTo,
      sort: "date_desc" as const,
    }),
    [appliedFilters, limit, page, searchQuery]
  );

  const fetchBills = async (payload = requestPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await billService.listBills(payload);
      const data = response.data?.data || {};
      setBills(Array.isArray(data.bills) ? data.bills : []);
      setPagination({
        total: Number(data.total || 0),
        totalPages: Number(data.totalPages || 1),
        page: Number(data.page || payload.page),
        limit: Number(data.limit || payload.limit),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch bills");
      setBills([]);
      setPagination({ total: 0, totalPages: 1, page: payload.page, limit: payload.limit });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
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
    appliedFilters.status !== "All" ||
    appliedFilters.dateFrom !== "" ||
    appliedFilters.dateTo !== "" ||
    appliedFilters.minAmount !== "" ||
    appliedFilters.maxAmount !== "";

  const openCreateModal = () => {
    setModalMode("create");
    setEditingBillId(null);
    setForm(getDefaultForm());
    setModalOpen(true);
  };

  const closeBillModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setEditingBillId(null);
    setForm(getDefaultForm());
  };

  const submitBill = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim()) {
      setError("Bill title is required.");
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Amount must be a non-negative number.");
      return;
    }
    if (!form.dueDate) {
      setError("Due date is required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        amount,
        dueDate: form.dueDate,
        frequency: form.frequency,
        status: form.status,
        autoAddToExpense: form.autoAddToExpense,
      };
      if (modalMode === "edit" && editingBillId) {
        await billService.updateBill(editingBillId, payload);
      } else {
        await billService.createBill(payload);
      }
      closeBillModal();
      await fetchBills();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save bill");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchBillById = async (billId: string) => {
    const response = await billService.getBillById(billId);
    return response.data?.data?.bill as BillRecord;
  };

  const handleView = async (bill: BillRecord) => {
    setActiveActionId(bill._id);
    setSelectedLoading(true);
    try {
      const billData = await fetchBillById(bill._id);
      setSelectedBill(billData || bill);
      setViewOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch bill details");
    } finally {
      setSelectedLoading(false);
      setActiveActionId(null);
    }
  };

  const handleEdit = async (bill: BillRecord) => {
    setActiveActionId(bill._id);
    setSelectedLoading(true);
    try {
      const billData = await fetchBillById(bill._id);
      setModalMode("edit");
      setEditingBillId(billData._id);
      setForm({
        title: billData.title || "",
        category: billData.category || "utilities",
        amount: String(billData.amount ?? ""),
        dueDate: billData.dueDate?.includes("T")
          ? billData.dueDate.split("T")[0]
          : billData.dueDate || "",
        frequency: billData.frequency || "monthly",
        status: billData.status || "pending",
        autoAddToExpense: Boolean(billData.autoAddToExpense),
      });
      setModalOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch bill details");
    } finally {
      setSelectedLoading(false);
      setActiveActionId(null);
    }
  };

  const handleDelete = async (bill: BillRecord) => {
    const shouldDelete = window.confirm(
      `Delete bill "${bill.title}"? This action cannot be undone.`
    );
    if (!shouldDelete) return;

    setActiveActionId(bill._id);
    setError(null);
    try {
      await billService.deleteBill(bill._id);
      const nextPage = page > 1 && bills.length === 1 ? page - 1 : page;
      if (nextPage !== page) {
        setParams({ page: String(nextPage) });
      } else {
        await fetchBills({ ...requestPayload, page: nextPage });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete bill");
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900">Bills</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage bill records with server-side filters and pagination.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              onClick={openCreateModal}
              type="button"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Add bill
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
                placeholder="Search bills..."
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
                      Title
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Category
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Due Date
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
                        Loading bills...
                      </td>
                    </tr>
                  ) : bills.length ? (
                    bills.map((bill) => (
                      <tr key={bill._id}>
                        <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          <p>{bill.title}</p>
                          <p className="text-xs text-gray-500">
                            {getDueText(bill.dueDate, bill.status)}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatLabel(bill.category)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(bill.dueDate)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatCurrency(bill.amount)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              bill.status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {formatLabel(bill.status)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleView(bill)}
                              disabled={activeActionId === bill._id}
                              className="text-indigo-600 hover:text-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(bill)}
                              disabled={activeActionId === bill._id}
                              className="text-indigo-600 hover:text-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <SquarePenIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(bill)}
                              disabled={activeActionId === bill._id}
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
                        No bills found matching your filters.
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
        title="Filter Bills"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Category</label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, category: e.target.value }))
                }
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              >
                <option value="All">All</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {formatLabel(category)}
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
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
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
        onClose={closeBillModal}
        title={modalMode === "edit" ? "Edit Bill" : "Add Bill"}
      >
        <form className="space-y-4" onSubmit={submitBill}>
          <div>
            <label className="block text-sm font-medium text-gray-900">Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="mt-2 block w-full rounded-md border-0 bg-white py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {formatLabel(category)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    frequency: e.target.value as BillFormState["frequency"],
                  }))
                }
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              >
                <option value="one-time">One-time</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
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
              <label className="block text-sm font-medium text-gray-900">Due Date</label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 px-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value as BillFormState["status"],
                  }))
                }
                className="mt-2 block w-full rounded-md border-0 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.autoAddToExpense}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, autoAddToExpense: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                Auto add to expense when paid
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeBillModal}
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
                  : "Create Bill"}
            </button>
          </div>
        </form>
      </CustomModal>

      <CustomModal open={viewOpen} onClose={() => setViewOpen(false)} title="Bill Details">
        {selectedLoading ? (
          <p className="text-sm text-gray-600">Loading details...</p>
        ) : selectedBill ? (
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Title</p>
              <p className="mt-1 font-medium text-gray-900">{selectedBill.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Category
                </p>
                <p className="mt-1">{formatLabel(selectedBill.category)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Frequency
                </p>
                <p className="mt-1">{formatLabel(selectedBill.frequency)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Amount
                </p>
                <p className="mt-1">{formatCurrency(selectedBill.amount)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Due Date
                </p>
                <p className="mt-1">{formatDate(selectedBill.dueDate)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </p>
                <p className="mt-1">{formatLabel(selectedBill.status)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Auto Add Expense
                </p>
                <p className="mt-1">{selectedBill.autoAddToExpense ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Bill details are unavailable.</p>
        )}
      </CustomModal>
    </>
  );
}
