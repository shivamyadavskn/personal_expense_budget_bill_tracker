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

const initialBills = [
    { id: 1, name: "Electricity Bill", category: "Utilities", amount: 125.50, dueDate: "2024-01-25", status: "Unpaid", recurring: true, reminderDays: 3 },
    { id: 2, name: "Internet & WiFi", category: "Utilities", amount: 79.99, dueDate: "2024-01-20", status: "Paid", recurring: true, reminderDays: 5 },
    { id: 3, name: "Rent Payment", category: "Housing", amount: 1500.00, dueDate: "2024-02-01", status: "Unpaid", recurring: true, reminderDays: 7 },
    { id: 4, name: "Water Bill", category: "Utilities", amount: 45.30, dueDate: "2024-01-18", status: "Paid", recurring: true, reminderDays: 3 },
    { id: 5, name: "Mobile Phone", category: "Utilities", amount: 85.00, dueDate: "2024-01-22", status: "Overdue", recurring: true, reminderDays: 3 },
    { id: 6, name: "Car Insurance", category: "Insurance", amount: 180.00, dueDate: "2024-01-30", status: "Unpaid", recurring: true, reminderDays: 7 },
    { id: 7, name: "Netflix", category: "Subscriptions", amount: 15.99, dueDate: "2024-01-15", status: "Paid", recurring: true, reminderDays: 1 },
    { id: 8, name: "Gym Membership", category: "Subscriptions", amount: 49.00, dueDate: "2024-01-28", status: "Unpaid", recurring: true, reminderDays: 3 },
    { id: 9, name: "Health Insurance", category: "Insurance", amount: 350.00, dueDate: "2024-01-31", status: "Unpaid", recurring: true, reminderDays: 7 },
    { id: 10, name: "Credit Card Payment", category: "Loans & Credit", amount: 500.00, dueDate: "2024-01-20", status: "Overdue", recurring: true, reminderDays: 5 },
]

const categories = ["All Categories", "Utilities", "Housing", "Insurance", "Subscriptions", "Loans & Credit", "Other"]
const statuses = ["All Status", "Paid", "Unpaid", "Overdue"]
const vendors = ["All Vendors", "City Power Co.", "ISP", "Landlord", "Insurance Co.", "Netflix", "Gym", "Health Insurance Co."]

type Bill = {
    id: number
    name: string
    category: string
    amount: number
    dueDate: string
    status: string
    recurring: boolean
    reminderDays: number
    attachment?: string
}

export default function BillsIndex() {
    const [bills, setBills] = useState<Bill[]>(initialBills)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All Categories")
    const [selectedStatus, setSelectedStatus] = useState("All Status")
    const [selectedVendor, setSelectedVendor] = useState("All Vendors")
    const [currentPage, setCurrentPage] = useState(1)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBill, setEditingBill] = useState<Bill | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        category: "Utilities",
        amount: "",
        dueDate: "",
        recurring: true,
        reminderDays: "3",
        attachment: null as File | null,
    })
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [billToDelete, setBillToDelete] = useState<Bill | null>(null)

    const itemsPerPage = 5

    const filteredBills = bills.filter((bill) => {
        const matchesSearch = bill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bill.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "All Categories" || bill.category === selectedCategory
        const matchesStatus = selectedStatus === "All Status" || bill.status === selectedStatus
        return matchesSearch && matchesCategory && matchesStatus
    })

    const totalPages = Math.ceil(filteredBills.length / itemsPerPage)
    const paginatedBills = filteredBills.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleOpenModal = (bill?: Bill) => {
        if (bill) {
            setEditingBill(bill)
            setFormData({
                name: bill.name,
                category: bill.category,
                amount: bill.amount.toString(),
                dueDate: bill.dueDate,
                recurring: bill.recurring,
                reminderDays: bill.reminderDays.toString(),
                attachment: null,
            })
        } else {
            setEditingBill(null)
            setFormData({ name: "", category: "Utilities", amount: "", dueDate: "", recurring: true, reminderDays: "3", attachment: null })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingBill(null)
        setFormData({ name: "", category: "Utilities", amount: "", dueDate: "", recurring: true, reminderDays: "3", attachment: null })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const attachmentName = formData.attachment ? formData.attachment.name : undefined
        if (editingBill) {
            setBills(bills.map((bill) =>
                bill.id === editingBill.id
                    ? { ...bill, name: formData.name, category: formData.category, amount: parseFloat(formData.amount), dueDate: formData.dueDate, recurring: formData.recurring, reminderDays: parseInt(formData.reminderDays), attachment: attachmentName || bill.attachment }
                    : bill
            ))
        } else {
            const newBill: Bill = {
                id: Math.max(...bills.map((b) => b.id)) + 1,
                name: formData.name,
                category: formData.category,
                amount: parseFloat(formData.amount),
                dueDate: formData.dueDate,
                status: "Unpaid",
                recurring: formData.recurring,
                reminderDays: parseInt(formData.reminderDays),
                attachment: attachmentName,
            }
            setBills([newBill, ...bills])
        }
        handleCloseModal()
    }

    // Helper function to calculate days until due
    const getDaysUntilDue = (dueDate: string) => {
        const today = new Date()
        const due = new Date(dueDate)
        const diffTime = due.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    // Get reminder status text
    const getReminderStatus = (bill: Bill) => {
        const daysUntilDue = getDaysUntilDue(bill.dueDate)
        if (bill.status === "Paid") return null
        if (daysUntilDue < 0) return { text: `${Math.abs(daysUntilDue)} days overdue`, urgent: true }
        if (daysUntilDue <= bill.reminderDays) return { text: `Due in ${daysUntilDue} days`, urgent: daysUntilDue <= 1 }
        return null
    }

    const handleDeleteClick = (bill: Bill) => {
        setBillToDelete(bill)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        if (billToDelete) {
            setBills(bills.filter((bill) => bill.id !== billToDelete.id))
        }
        setDeleteDialogOpen(false)
        setBillToDelete(null)
    }

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false)
        setBillToDelete(null)
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "Paid":
                return "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
            case "Unpaid":
                return "bg-amber-50 text-amber-700 ring-amber-600/20"
            case "Overdue":
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
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bills</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Track and manage all your bills and payments.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                        >
                            <PlusIcon className="size-5" />
                            Add Bill
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
                                placeholder="Search bills..."
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
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="block w-full appearance-none rounded-lg border-0 bg-gray-50 py-2.5 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
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
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:pl-6">Bill Name</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Amount</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Due Date</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Reminder</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {paginatedBills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                            {bill.name}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{bill.category}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                            ${bill.amount.toFixed(2)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{bill.dueDate}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            {(() => {
                                                const reminder = getReminderStatus(bill)
                                                if (reminder) {
                                                    return (
                                                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${reminder.urgent ? "text-red-600" : "text-amber-600"}`}>
                                                            <span className={`size-2 rounded-full ${reminder.urgent ? "bg-red-500 animate-pulse" : "bg-amber-500"}`}></span>
                                                            {reminder.text}
                                                        </span>
                                                    )
                                                }
                                                return <span className="text-gray-400">{bill.recurring ? `${bill.reminderDays}d before` : "—"}</span>
                                            })()}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusStyles(bill.status)}`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenModal(bill)}
                                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                                                >
                                                    <PencilSquareIcon className="size-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteClick(bill)}
                                                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                >
                                                    <TrashIcon className="size-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedBills.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-sm text-gray-500">
                                            No bills found matching your criteria.
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
                                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredBills.length)}</span> of{" "}
                                    <span className="font-medium">{filteredBills.length}</span> results
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
                                    {editingBill ? "Edit Bill" : "Add New Bill"}
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
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                                        Bill Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                                        placeholder="e.g. Electricity Bill"
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
                                            className="block w-full appearance-none rounded-lg border-0 bg-white px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                                        >
                                            <option value="Utilities">Utilities</option>
                                            <option value="Housing">Housing</option>
                                            <option value="Insurance">Insurance</option>
                                            <option value="Subscriptions">Subscriptions</option>
                                            <option value="Loans & Credit">Loans & Credit</option>
                                            <option value="Other">Other</option>
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
                                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-900">
                                            Due Date
                                        </label>
                                        <input
                                            id="dueDate"
                                            type="date"
                                            required
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="recurring"
                                            type="checkbox"
                                            checked={formData.recurring}
                                            onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                                            className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                        />
                                        <label htmlFor="recurring" className="text-sm font-medium text-gray-900">
                                            Recurring bill
                                        </label>
                                    </div>
                                    <div>
                                        <label htmlFor="reminderDays" className="block text-sm font-medium text-gray-900">
                                            Remind me
                                        </label>
                                        <div className="relative mt-2">
                                            <select
                                                id="reminderDays"
                                                value={formData.reminderDays}
                                                onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value })}
                                                className="block w-full appearance-none rounded-lg border-0 bg-white px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                                            >
                                                <option value="1">1 day before</option>
                                                <option value="3">3 days before</option>
                                                <option value="5">5 days before</option>
                                                <option value="7">7 days before</option>
                                                <option value="14">14 days before</option>
                                            </select>
                                            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Optional Bill Upload */}
                                <div>
                                    <label htmlFor="attachment" className="block text-sm font-medium text-gray-900">
                                        Upload Bill <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    <div className="mt-2">
                                        <label
                                            htmlFor="attachment"
                                            className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
                                        >
                                            <DocumentArrowUpIcon className="size-8 text-gray-400" />
                                            <div className="text-center">
                                                {formData.attachment ? (
                                                    <p className="text-sm font-medium text-indigo-600">{formData.attachment.name}</p>
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
                                                id="attachment"
                                                type="file"
                                                accept=".pdf,.png,.jpg,.jpeg"
                                                className="sr-only"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] || null
                                                    setFormData({ ...formData, attachment: file })
                                                }}
                                            />
                                        </label>
                                        {formData.attachment && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, attachment: null })}
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
                                        {editingBill ? "Save Changes" : "Add Bill"}
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
                            <h2 className="text-lg font-semibold text-gray-900">Delete Bill</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Are you sure you want to delete{" "}
                                <span className="font-medium text-gray-700">{billToDelete?.name}</span>?
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
