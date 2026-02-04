"use client"

import React from "react"

import { useState } from "react"
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PencilSquareIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon,
    DocumentArrowUpIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { ChevronDownIcon } from "@heroicons/react/16/solid"

// Sample expense data for personal finance
const initialExpenses = [
    { id: 1, description: "Weekly Groceries", category: "Food & Groceries", amount: 145.50, date: "2024-01-15", status: "Completed" },
    { id: 2, description: "Dinner with Friends", category: "Dining Out", amount: 89.00, date: "2024-01-14", status: "Completed" },
    { id: 3, description: "Netflix Subscription", category: "Entertainment", amount: 15.99, date: "2024-01-13", status: "Completed" },
    { id: 4, description: "Gas Station Fill-up", category: "Transportation", amount: 65.00, date: "2024-01-12", status: "Completed" },
    { id: 5, description: "New Running Shoes", category: "Shopping", amount: 120.00, date: "2024-01-11", status: "Pending" },
    { id: 6, description: "Coffee Shop", category: "Dining Out", amount: 12.75, date: "2024-01-10", status: "Completed" },
    { id: 7, description: "Gym Membership", category: "Health & Fitness", amount: 49.00, date: "2024-01-09", status: "Completed" },
    { id: 8, description: "Doctor Visit Copay", category: "Healthcare", amount: 30.00, date: "2024-01-08", status: "Completed" },
]

const categories = ["All Categories", "Food & Groceries", "Dining Out", "Entertainment", "Transportation", "Shopping", "Health & Fitness", "Healthcare", "Utilities", "Personal Care"]
const statuses = ["All Status", "Completed", "Pending"]

type Expense = {
    id: number
    description: string
    category: string
    amount: number
    date: string
    status: string
    billFile?: string
}

export default function ExpenseIndex() {
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All Categories")
    const [selectedStatus, setSelectedStatus] = useState("All Status")
    const [currentPage, setCurrentPage] = useState(1)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
    const [formData, setFormData] = useState({
        description: "",
        category: "Food & Groceries",
        amount: "",
        date: "",
        billFile: null as File | null,
    })
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)

    const itemsPerPage = 5

    // Filter expenses
    const filteredExpenses = expenses.filter((expense) => {
        const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "All Categories" || expense.category === selectedCategory
        const matchesStatus = selectedStatus === "All Status" || expense.status === selectedStatus
        return matchesSearch && matchesCategory && matchesStatus
    })

    // Pagination
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage)
    const paginatedExpenses = filteredExpenses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleOpenModal = (expense?: Expense) => {
        if (expense) {
            setEditingExpense(expense)
            setFormData({
                description: expense.description,
                category: expense.category,
                amount: expense.amount.toString(),
                date: expense.date,
                billFile: null,
            })
        } else {
            setEditingExpense(null)
            setFormData({ description: "", category: "Food & Groceries", amount: "", date: "", billFile: null })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingExpense(null)
        setFormData({ description: "", category: "Food & Groceries", amount: "", date: "", billFile: null })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const billFileName = formData.billFile ? formData.billFile.name : undefined
        if (editingExpense) {
            setExpenses(expenses.map((exp) =>
                exp.id === editingExpense.id
                    ? { ...exp, description: formData.description, category: formData.category, amount: parseFloat(formData.amount), date: formData.date, billFile: billFileName || exp.billFile }
                    : exp
            ))
        } else {
            const newExpense: Expense = {
                id: Math.max(...expenses.map((e) => e.id)) + 1,
                description: formData.description,
                category: formData.category,
                amount: parseFloat(formData.amount),
                date: formData.date,
                status: "Pending",
                billFile: billFileName,
            }
            setExpenses([newExpense, ...expenses])
        }
        handleCloseModal()
    }

    const handleDeleteClick = (expense: Expense) => {
        setExpenseToDelete(expense)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        if (expenseToDelete) {
            setExpenses(expenses.filter((exp) => exp.id !== expenseToDelete.id))
        }
        setDeleteDialogOpen(false)
        setExpenseToDelete(null)
    }

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false)
        setExpenseToDelete(null)
    }

    const handleDelete = (expenseId: number) => {
        setExpenses(expenses.filter((exp) => exp.id !== expenseId))
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "Approved":
                return "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
            case "Pending":
                return "bg-amber-50 text-amber-700 ring-amber-600/20"
            case "Rejected":
                return "bg-red-50 text-red-700 ring-red-600/20"
            default:
                return "bg-gray-50 text-gray-700 ring-gray-600/20"
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Expenses</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage and track all your expense records.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                        >
                            <PlusIcon className="size-5" />
                            Add Expense
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
                    <div className="flex items-center gap-2 mb-4">
                        <FunnelIcon className="size-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Filters</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Search */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search expenses..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="block w-full rounded-lg border-0 bg-white py-2.5 pl-10 pr-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="block w-full appearance-none rounded-lg border-0 bg-white py-2.5 pl-3.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="block w-full appearance-none rounded-lg border-0 bg-white py-2.5 pl-3.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                            >
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Expenses Table */}
                <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Description
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Category
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Amount
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Date
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-6">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {paginatedExpenses.length > 0 ? (
                                    paginatedExpenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                                                {expense.description}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {expense.category}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                                ${expense.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {new Date(expense.date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusStyles(expense.status)}`}
                                                >
                                                    {expense.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenModal(expense)}
                                                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                                    >
                                                        <PencilSquareIcon className="size-5" />
                                                        <span className="sr-only">Edit</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteClick(expense)}
                                                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    >
                                                        <TrashIcon className="size-5" />
                                                        <span className="sr-only">Delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <p className="text-sm text-gray-500">No expenses found matching your filters.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredExpenses.length > 0 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
                            <div className="text-sm text-gray-500">
                                Showing{" "}
                                <span className="font-medium text-gray-900">
                                    {(currentPage - 1) * itemsPerPage + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium text-gray-900">
                                    {Math.min(currentPage * itemsPerPage, filteredExpenses.length)}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-gray-900">{filteredExpenses.length}</span> results
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeftIcon className="size-5" />
                                    <span className="sr-only">Previous</span>
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${currentPage === page
                                                    ? "bg-indigo-600 text-white"
                                                    : "text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRightIcon className="size-5" />
                                    <span className="sr-only">Next</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                            onClick={handleCloseModal}
                        />
                        <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editingExpense ? "Edit Expense" : "Add New Expense"}
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="size-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                                        Description
                                    </label>
                                    <input
                                        id="description"
                                        type="text"
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                                        placeholder="Enter expense description"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-900">
                                        Category
                                    </label>
                                    <div className="relative mt-2">
                                        <select
                                            id="category"
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="block w-full appearance-none rounded-lg border-0 bg-white py-2.5 pl-3.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                                        >
                                            {categories.slice(1).map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-900">
                                        Amount ($)
                                    </label>
                                    <input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-900">
                                        Date
                                    </label>
                                    <input
                                        id="date"
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                                    />
                                </div>

                                {/* Optional Bill Upload */}
                                <div>
                                    <label htmlFor="bill" className="block text-sm font-medium text-gray-900">
                                        Upload Bill <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    <div className="mt-2">
                                        <label
                                            htmlFor="bill"
                                            className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
                                        >
                                            <DocumentArrowUpIcon className="size-8 text-gray-400" />
                                            <div className="text-center">
                                                {formData.billFile ? (
                                                    <p className="text-sm font-medium text-indigo-600">{formData.billFile.name}</p>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-medium text-gray-700">
                                                            Click to upload or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            PDF, PNG, JPG up to 10MB
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                id="bill"
                                                type="file"
                                                accept=".pdf,.png,.jpg,.jpeg"
                                                className="sr-only"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] || null
                                                    setFormData({ ...formData, billFile: file })
                                                }}
                                            />
                                        </label>
                                        {formData.billFile && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, billFile: null })}
                                                className="mt-2 text-sm text-red-600 hover:text-red-500 transition-colors"
                                            >
                                                Remove file
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                                    >
                                        {editingExpense ? "Save Changes" : "Add Expense"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Dialog */}
            {deleteDialogOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                            onClick={handleCancelDelete}
                        />
                        <div className="relative w-full max-w-sm transform rounded-2xl bg-white p-6 shadow-xl transition-all text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 mb-4">
                                <ExclamationTriangleIcon className="size-6 text-red-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Delete Expense</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Are you sure you want to delete{" "}
                                <span className="font-medium text-gray-700">{expenseToDelete?.description}</span>?
                                This action cannot be undone.
                            </p>
                            <div className="flex items-center justify-center gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCancelDelete}
                                    className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
