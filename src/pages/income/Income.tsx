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

const initialIncomes = [
  { id: 1, description: "Monthly Salary", source: "Salary", amount: 5200.00, date: "2024-01-01", status: "Received", recurring: true },
  { id: 2, description: "Freelance Web Design", source: "Salary", amount: 1500.00, date: "2024-01-15", status: "Received", recurring: false },
  { id: 3, description: "Rental Property Income", source: "Rental", amount: 1200.00, date: "2024-01-05", status: "Received", recurring: true },
  { id: 4, description: "Stock Dividends", source: "Investments", amount: 325.00, date: "2024-01-10", status: "Received", recurring: true },
  { id: 5, description: "Sold Furniture Online", source: "Side Income", amount: 250.00, date: "2024-01-12", status: "Received", recurring: false },
  { id: 6, description: "Tax Refund", source: "Refund", amount: 2100.00, date: "2024-01-20", status: "Pending", recurring: false },
  { id: 7, description: "Birthday Gift Money", source: "Gift", amount: 150.00, date: "2024-01-18", status: "Received", recurring: false },
  { id: 8, description: "Interest on Savings", source: "Investments", amount: 45.00, date: "2024-01-31", status: "Pending", recurring: true },
  { id: 9, description: "Tutoring Sessions", source: "Side Income", amount: 400.00, date: "2024-01-22", status: "Pending", recurring: false },
  { id: 10, description: "Cashback Rewards", source: "Refund", amount: 85.00, date: "2024-01-25", status: "Received", recurring: false },
]

const sources = ["All Sources", "Salary", "Freelance", "Rental", "Investments", "Side Income", "Refund", "Gift", "Bonus"]
const statuses = ["All Status", "Received", "Pending"]

type Income = {
  id: number
  description: string
  source: string
  amount: number
  date: string
  status: string
  recurring: boolean
  receipt?: string
}

export default function IncomesIndex() {
  const [incomes, setIncomes] = useState<Income[]>(initialIncomes)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSource, setSelectedSource] = useState("All Sources")
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [formData, setFormData] = useState({
    description: "",
    source: "Salary",
    amount: "",
    date: "",
    recurring: false,
    receipt: null as File | null,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null)

  const itemsPerPage = 5

  const filteredIncomes = incomes.filter((income) => {
    const matchesSearch = income.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSource = selectedSource === "All Sources" || income.source === selectedSource
    const matchesStatus = selectedStatus === "All Status" || income.status === selectedStatus
    return matchesSearch && matchesSource && matchesStatus
  })

  const totalPages = Math.ceil(filteredIncomes.length / itemsPerPage)
  const paginatedIncomes = filteredIncomes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleOpenModal = (income?: Income) => {
    if (income) {
      setEditingIncome(income)
      setFormData({
        description: income.description,
        source: income.source,
        amount: income.amount.toString(),
        date: income.date,
        recurring: income.recurring,
        receipt: null,
      })
    } else {
      setEditingIncome(null)
      setFormData({ description: "", source: "Salary", amount: "", date: "", recurring: false, receipt: null })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingIncome(null)
    setFormData({ description: "", source: "Salary", amount: "", date: "", recurring: false, receipt: null })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const receiptName = formData.receipt ? formData.receipt.name : undefined
    if (editingIncome) {
      setIncomes(incomes.map((income) =>
        income.id === editingIncome.id
          ? { ...income, description: formData.description, source: formData.source, amount: parseFloat(formData.amount), date: formData.date, recurring: formData.recurring, receipt: receiptName || income.receipt }
          : income
      ))
    } else {
      const newIncome: Income = {
        id: Math.max(...incomes.map((i) => i.id)) + 1,
        description: formData.description,
        source: formData.source,
        amount: parseFloat(formData.amount),
        date: formData.date,
        status: "Pending",
        recurring: formData.recurring,
        receipt: receiptName,
      }
      setIncomes([newIncome, ...incomes])
    }
    handleCloseModal()
  }

  const handleDeleteClick = (income: Income) => {
    setIncomeToDelete(income)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (incomeToDelete) {
      setIncomes(incomes.filter((income) => income.id !== incomeToDelete.id))
    }
    setDeleteDialogOpen(false)
    setIncomeToDelete(null)
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setIncomeToDelete(null)
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Received":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      case "Pending":
        return "bg-amber-50 text-amber-700 ring-amber-600/20"
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
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Incomes</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track and manage all your income sources.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            >
              <PlusIcon className="size-5" />
              Add Income
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
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search incomes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="block w-full rounded-lg border-0 bg-gray-50 py-2.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
              />
            </div>
            <div className="relative">
              <select
                value={selectedSource}
                onChange={(e) => {
                  setSelectedSource(e.target.value)
                  setCurrentPage(1)
                }}
                className="block w-full appearance-none rounded-lg border-0 bg-gray-50 py-2.5 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
              >
                {sources.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value)
                  setCurrentPage(1)
                }}
                className="block w-full appearance-none rounded-lg border-0 bg-gray-50 py-2.5 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:pl-6">Description</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Source</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Amount</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Recurring</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedIncomes.map((income) => (
                  <tr key={income.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {income.description}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{income.source}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-emerald-600">
                      +${income.amount.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{income.date}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {income.recurring ? "Yes" : "No"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusStyles(income.status)}`}>
                        {income.status}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(income)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                        >
                          <PencilSquareIcon className="size-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(income)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="size-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedIncomes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-gray-500">
                      No incomes found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredIncomes.length)}</span> of{" "}
                  <span className="font-medium">{filteredIncomes.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="size-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === currentPage
                          ? "z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="size-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" onClick={handleCloseModal} />
            <div className="relative w-full max-w-lg transform rounded-2xl bg-white p-6 shadow-xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingIncome ? "Edit Income" : "Add New Income"}
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
                    placeholder="e.g. Client Project Payment"
                  />
                </div>

                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-gray-900">
                    Source
                  </label>
                  <div className="relative mt-2">
                    <select
                      id="source"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="block w-full appearance-none rounded-lg border-0 bg-white px-3.5 py-2.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                    >
                      {sources.filter(s => s !== "All Sources").map((source) => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-900">
                      Amount
                    </label>
                    <input
                      id="amount"
                      type="number"
                      required
                      step="0.01"
                      min="0"
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
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="recurring"
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                    className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="recurring" className="text-sm font-medium text-gray-900">
                    Recurring income
                  </label>
                </div>

                {/* Optional Receipt Upload */}
                <div>
                  <label htmlFor="receipt" className="block text-sm font-medium text-gray-900">
                    Upload Receipt <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="mt-2">
                    <label
                      htmlFor="receipt"
                      className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
                    >
                      <DocumentArrowUpIcon className="size-8 text-gray-400" />
                      <div className="text-center">
                        {formData.receipt ? (
                          <p className="text-sm font-medium text-indigo-600">{formData.receipt.name}</p>
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
                        id="receipt"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setFormData({ ...formData, receipt: file })
                        }}
                      />
                    </label>
                    {formData.receipt && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, receipt: null })}
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
                    className="rounded-lg bg-transparent px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                  >
                    {editingIncome ? "Save Changes" : "Add Income"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" onClick={handleCancelDelete} />
            <div className="relative w-full max-w-sm transform rounded-2xl bg-white p-6 shadow-xl transition-all text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <ExclamationTriangleIcon className="size-6 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Delete Income</h2>
              <p className="mt-2 text-sm text-gray-500">
                Are you sure you want to delete{" "}
                <span className="font-medium text-gray-700">{incomeToDelete?.description}</span>?
                This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="rounded-lg bg-transparent px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors"
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
