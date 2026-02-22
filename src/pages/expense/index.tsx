import React, { useEffect, useMemo, useState } from "react"
import { Eye, Filter, SquarePenIcon, Trash, X } from "lucide-react"
import { useSelector } from "react-redux"
import { useSearchParams } from "react-router-dom"
import CustomModal from "../../components/CustomModal"
import CustomPagination from "../../components/Pagination"
import { useAppDispatch } from "../../store/hooks"
import { clearSelectedExpense } from "../../store/Slice/ExpenseSlice"
import {
    createExpense,
    defaultExpenseListPayload,
    deleteExpense,
    fetchExpenseById,
    fetchExpenses,
    type Expense,
    updateExpense,
} from "../../store/Thunks/expenseThunks"
import { RootState } from "../../store/store"
import AddExpenseModal, { type ExpenseFormData } from "./AddExpenseModal"
import FilterModal from "./FilterModal"

type ExpenseFilters = {
    category: string
    dateFrom: string
    dateTo: string
    minAmount: string
    maxAmount: string
}

const defaultFilters: ExpenseFilters = {
    category: "All",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
}

const toNumberOrNull = (value: string): number | null => {
    const trimmedValue = value.trim()
    if (trimmedValue === "") return null
    const parsedValue = Number(trimmedValue)
    return Number.isFinite(parsedValue) ? parsedValue : null
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(value)

const formatDate = (value: string) => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleDateString()
}

const getExpenseTitle = (expense: Expense) =>
    expense.title || expense.description || "Untitled Expense"

const normalizeDateInput = (value?: string) => {
    if (!value) return ""
    if (value.includes("T")) return value.split("T")[0]
    return value
}

const formatCategory = (value?: string) => {
    if (!value) return "-"
    return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function ExpenseIndex() {
    const dispatch = useAppDispatch()
    const { expenses, loading, error, pagination, selectedExpense, selectedExpenseLoading } =
        useSelector((state: RootState) => state.expense)
    const [params, setParams] = useSearchParams()
    const [open, setOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"create" | "edit">("create")
    const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
    const [submittingForm, setSubmittingForm] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [viewOpen, setViewOpen] = useState(false)
    const [activeActionId, setActiveActionId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState<ExpenseFilters>(defaultFilters)
    const [appliedFilters, setAppliedFilters] = useState<ExpenseFilters>(defaultFilters)
    const rawPage = Number(params.get("page"))
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
    const limit = defaultExpenseListPayload.limit
    const sort = defaultExpenseListPayload.sort

    const requestPayload = useMemo(
        () => ({
            ...defaultExpenseListPayload,
            page,
            limit,
            search: searchQuery.trim(),
            category:
                appliedFilters.category === "All"
                    ? ""
                    : appliedFilters.category.toLowerCase(),
            min: toNumberOrNull(appliedFilters.minAmount),
            max: toNumberOrNull(appliedFilters.maxAmount),
            startDate: appliedFilters.dateFrom || "",
            endDate: appliedFilters.dateTo || "",
            sort,
        }),
        [appliedFilters, limit, page, searchQuery, sort]
    )

    useEffect(() => {
        dispatch(fetchExpenses(requestPayload))
    }, [dispatch, requestPayload])

    useEffect(() => {
        if (pagination.totalPages > 0 && page > pagination.totalPages) {
            setParams({ page: String(pagination.totalPages) })
        }
    }, [page, pagination.totalPages, setParams])

    const onPageChange = (newPage: number) => {
        const boundedPage = Math.min(Math.max(newPage, 1), Math.max(1, pagination.totalPages))
        setParams({ page: String(boundedPage) })
    }

    const goToFirstPage = () => {
        if (page !== 1) {
            setParams({ page: "1" })
        }
    }

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        goToFirstPage()
    }

    const closeAddExpenseModal = () => {
        setOpen(false)
        setModalMode("create")
        setEditingExpenseId(null)
        dispatch(clearSelectedExpense())
    }

    const openCreateExpenseModal = () => {
        setModalMode("create")
        setEditingExpenseId(null)
        dispatch(clearSelectedExpense())
        setOpen(true)
    }

    const handleExpenseSubmit = async (formData: ExpenseFormData) => {
        setSubmittingForm(true)
        try {
            if (modalMode === "edit" && editingExpenseId) {
                await dispatch(updateExpense({ id: editingExpenseId, payload: formData })).unwrap()
            } else {
                await dispatch(createExpense(formData)).unwrap()
            }
            closeAddExpenseModal()
            dispatch(fetchExpenses(requestPayload))
        } finally {
            setSubmittingForm(false)
        }
    }

    const handleFilterChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFilters((prev) => ({ ...prev, [name]: value }))
    }

    const applyFilters = () => {
        setAppliedFilters(filters)
        setFilterOpen(false)
        goToFirstPage()
    }

    const resetFilters = () => {
        setFilters(defaultFilters)
        setAppliedFilters(defaultFilters)
        goToFirstPage()
    }

    const hasActiveFilters =
        appliedFilters.category !== "All" ||
        appliedFilters.dateFrom !== "" ||
        appliedFilters.dateTo !== "" ||
        appliedFilters.minAmount !== "" ||
        appliedFilters.maxAmount !== ""

    const initialEditFormData = useMemo<Partial<ExpenseFormData> | undefined>(() => {
        if (modalMode !== "edit" || !selectedExpense) return undefined
        return {
            title: getExpenseTitle(selectedExpense),
            amount: String(selectedExpense.amount ?? ""),
            category: selectedExpense.category || "",
            date: normalizeDateInput(selectedExpense.date),
            note: selectedExpense.note || "",
        }
    }, [modalMode, selectedExpense])

    const handleViewExpense = async (expense: Expense) => {
        if (!expense._id) return
        setActiveActionId(expense._id)
        try {
            await dispatch(fetchExpenseById(expense._id)).unwrap()
            setViewOpen(true)
        } catch {
            // error state is handled in slice
        } finally {
            setActiveActionId(null)
        }
    }

    const handleEditExpense = async (expense: Expense) => {
        if (!expense._id) return
        setActiveActionId(expense._id)
        try {
            await dispatch(fetchExpenseById(expense._id)).unwrap()
            setModalMode("edit")
            setEditingExpenseId(expense._id)
            setOpen(true)
        } catch {
            // error state is handled in slice
        } finally {
            setActiveActionId(null)
        }
    }

    const closeViewExpenseModal = () => {
        setViewOpen(false)
        dispatch(clearSelectedExpense())
    }

    const handleDeleteExpense = async (expense: Expense) => {
        if (!expense._id) return
        const shouldDelete = window.confirm(
            `Delete "${getExpenseTitle(expense)}"? This action cannot be undone.`
        )
        if (!shouldDelete) return

        setActiveActionId(expense._id)
        try {
            await dispatch(deleteExpense(expense._id)).unwrap()
            const nextPage = page > 1 && expenses.length === 1 ? page - 1 : page
            if (nextPage !== page) {
                setParams({ page: String(nextPage) })
            } else {
                dispatch(fetchExpenses({ ...requestPayload, page: nextPage }))
            }
        } catch {
            // error state is handled in slice
        } finally {
            setActiveActionId(null)
        }
    }

    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-base font-semibold text-gray-900">Expenses</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Review and manage expenses across categories, dates, and amount ranges.
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <button
                            onClick={openCreateExpenseModal}
                            type="button"
                            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Add expense
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
                                placeholder="Search expenses..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="block w-full rounded-md border-0 py-2 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => handleSearchChange("")}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
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
                                onClick={resetFilters}
                                type="button"
                                className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {appliedFilters.category !== "All" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800">
                                Category: {formatCategory(appliedFilters.category)}
                            </span>
                        )}
                        {appliedFilters.dateFrom && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800">
                                From: {appliedFilters.dateFrom}
                            </span>
                        )}
                        {appliedFilters.dateTo && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800">
                                To: {appliedFilters.dateTo}
                            </span>
                        )}
                        {appliedFilters.minAmount && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800">
                                Min: ${appliedFilters.minAmount}
                            </span>
                        )}
                        {appliedFilters.maxAmount && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800">
                                Max: ${appliedFilters.maxAmount}
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="relative min-w-full divide-y divide-gray-300">
                                <thead>
                                    <tr>
                                        <th
                                            scope="col"
                                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                                        >
                                            Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Category
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Date
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                            Amount
                                        </th>
                                        <th scope="col" className="py-3.5 pl-3 pr-4 sm:pr-0">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                                                Loading expenses...
                                            </td>
                                        </tr>
                                    ) : expenses.length > 0 ? (
                                        expenses.map((expense, index) => (
                                            <tr key={expense._id || `${expense.date}-${index}`}>
                                                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                                    <p className="max-w-xs truncate">{getExpenseTitle(expense)}</p>
                                                    {expense.note && (
                                                        <p className="max-w-xs truncate text-xs text-gray-500">
                                                            {expense.note}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                        {formatCategory(expense.category)}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {formatDate(expense.date)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {formatCurrency(Number(expense.amount || 0))}
                                                </td>
                                                <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewExpense(expense)}
                                                            disabled={
                                                                !expense._id ||
                                                                activeActionId === expense._id
                                                            }
                                                            className="text-indigo-600 hover:text-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditExpense(expense)}
                                                            disabled={
                                                                !expense._id ||
                                                                activeActionId === expense._id
                                                            }
                                                            className="text-indigo-600 hover:text-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <SquarePenIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteExpense(expense)}
                                                            disabled={
                                                                !expense._id ||
                                                                activeActionId === expense._id
                                                            }
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
                                            <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                                                No expenses found matching your filters.
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

            <AddExpenseModal
                open={open}
                mode={modalMode}
                initialData={initialEditFormData}
                onClose={closeAddExpenseModal}
                onSubmit={handleExpenseSubmit}
                submitting={submittingForm}
            />

            <FilterModal
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                filters={filters}
                onFilterChange={handleFilterChange}
                onApply={applyFilters}
                onReset={resetFilters}
            />

            <CustomModal
                open={viewOpen}
                onClose={closeViewExpenseModal}
                title="Expense Details"
            >
                {selectedExpenseLoading ? (
                    <p className="text-sm text-gray-600">Loading details...</p>
                ) : selectedExpense ? (
                    <div className="space-y-3 text-sm text-gray-700">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Title</p>
                            <p className="mt-1 font-medium text-gray-900">
                                {getExpenseTitle(selectedExpense)}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Category
                                </p>
                                <p className="mt-1">{formatCategory(selectedExpense.category)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Amount
                                </p>
                                <p className="mt-1">
                                    {formatCurrency(Number(selectedExpense.amount || 0))}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Date</p>
                            <p className="mt-1">{formatDate(selectedExpense.date)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Note</p>
                            <p className="mt-1">{selectedExpense.note || "-"}</p>
                        </div>
                        <div className="pt-3">
                            <button
                                type="button"
                                onClick={closeViewExpenseModal}
                                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-600">Expense details are unavailable.</p>
                )}
            </CustomModal>
        </>
    )
}
