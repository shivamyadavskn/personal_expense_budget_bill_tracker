import React, { useEffect, useState } from "react"
import { PhotoIcon } from "@heroicons/react/24/solid"
import { ChevronDownIcon } from "@heroicons/react/16/solid"
import CustomModal from "../../components/CustomModal"

interface AddExpenseModalProps {
    open: boolean
    mode?: "create" | "edit"
    initialData?: Partial<ExpenseFormData>
    onClose: () => void
    onSubmit: (formData: ExpenseFormData) => Promise<void> | void
    submitting?: boolean
}

export interface ExpenseFormData {
    title: string
    amount: string
    category: string
    date: string
    note: string
    receipt: File | null
}

const categories = [
    "Food",
    "Transport",
    "Entertainment",
    "Shopping",
    "Utilities",
    "Healthcare",
    "Education",
    "Other",
].map((item) => item.toLowerCase())

const getTodayString = () => new Date().toISOString().split("T")[0]

const normalizeDateInput = (value?: string) => {
    if (!value) return getTodayString()
    if (value.includes("T")) return value.split("T")[0]
    return value
}

const getDefaultForm = (): ExpenseFormData => ({
    title: "",
    amount: "",
    category: categories[0],
    date: getTodayString(),
    note: "",
    receipt: null,
})

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function AddExpenseModal({
    open,
    mode = "create",
    initialData,
    onClose,
    onSubmit,
    submitting = false,
}: AddExpenseModalProps) {
    const [form, setForm] = useState<ExpenseFormData>(getDefaultForm)
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        if (!open) return
        setForm({
            title: initialData?.title || "",
            amount: initialData?.amount || "",
            category: initialData?.category || categories[0],
            date: normalizeDateInput(initialData?.date),
            note: initialData?.note || "",
            receipt: null,
        })
        setErrorMessage("")
    }, [initialData, open])

    const resetForm = () => {
        setForm(getDefaultForm())
        setErrorMessage("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage("")

        if (!form.title.trim()) {
            setErrorMessage("Expense title is required.")
            return
        }

        const amount = Number(form.amount)
        if (!Number.isFinite(amount) || amount <= 0) {
            setErrorMessage("Amount must be greater than 0.")
            return
        }

        if (form.date > getTodayString()) {
            setErrorMessage("Date cannot be in the future.")
            return
        }

        try {
            await onSubmit({
                ...form,
                title: form.title.trim(),
                note: form.note.trim(),
            })
            resetForm()
        } catch {
            setErrorMessage("Unable to save expense. Please try again.")
        }
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextFile = e.target.files?.[0] || null
        if (!nextFile) {
            setForm((prev) => ({ ...prev, receipt: null }))
            return
        }

        if (nextFile.size > MAX_FILE_SIZE) {
            setErrorMessage("File must be 10MB or smaller.")
            return
        }

        setErrorMessage("")
        setForm((prev) => ({ ...prev, receipt: nextFile }))
    }

    const handleClose = () => {
        if (submitting) return
        resetForm()
        onClose()
    }

    return (
        <CustomModal
            open={open}
            onClose={handleClose}
            title={mode === "edit" ? "Edit Expense" : "Add Expense"}
        >
            <form onSubmit={handleSubmit} className="m-6">
                <div className="space-y-8">
                    <div className="border-b border-gray-900/10 pb-8">
                        <h2 className="text-base/7 font-semibold text-gray-900">
                            Expense Information
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Fill in the details of your expense.
                        </p>

                        {errorMessage && (
                            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {errorMessage}
                            </div>
                        )}

                        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                            <div>
                                <label htmlFor="title" className="block text-sm/6 font-medium text-gray-900">
                                    Expense Title <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="title"
                                        name="title"
                                        type="text"
                                        value={form.title}
                                        onChange={handleChange}
                                        required
                                        disabled={submitting}
                                        placeholder="e.g., Grocery shopping"
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm/6 font-medium text-gray-900">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2 grid grid-cols-1">
                                    <select
                                        id="category"
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        required
                                        disabled={submitting}
                                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm/6"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon
                                        aria-hidden="true"
                                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="amount" className="block text-sm/6 font-medium text-gray-900">
                                    Amount <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <div className="flex rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                        <div className="pointer-events-none flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            value={form.amount}
                                            onChange={handleChange}
                                            required
                                            disabled={submitting}
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            className="block w-full border-0 bg-transparent py-1.5 pl-1 pr-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 disabled:cursor-not-allowed sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="date" className="block text-sm/6 font-medium text-gray-900">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="date"
                                        name="date"
                                        type="date"
                                        value={form.date}
                                        onChange={handleChange}
                                        required
                                        disabled={submitting}
                                        max={getTodayString()}
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="note" className="block text-sm/6 font-medium text-gray-900">
                                    Note
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        id="note"
                                        name="note"
                                        value={form.note}
                                        onChange={handleChange}
                                        rows={3}
                                        disabled={submitting}
                                        placeholder="Add any additional details..."
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="file-upload" className="block text-sm/6 font-medium text-gray-900">
                                    Upload Receipt
                                </label>
                                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                                    <div className="text-center">
                                        <PhotoIcon aria-hidden="true" className="mx-auto size-12 text-gray-300" />
                                        <div className="mt-4 flex text-sm/6 text-gray-600">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-600 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600 hover:text-indigo-500"
                                            >
                                                <span>Upload a file</span>
                                                <input
                                                    id="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={handleFileChange}
                                                    accept="image/*,.pdf"
                                                    disabled={submitting}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs/5 text-gray-600">PNG, JPG, PDF up to 10MB</p>
                                        {form.receipt && (
                                            <div className="mt-3 flex items-center justify-center gap-2">
                                                <p className="text-sm font-medium text-indigo-600">
                                                    Selected: {form.receipt.name}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setForm((prev) => ({ ...prev, receipt: null }))
                                                    }
                                                    className="text-xs font-medium text-red-600 hover:text-red-500"
                                                    disabled={submitting}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="text-sm/6 font-semibold text-gray-900 hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting
                            ? "Saving..."
                            : mode === "edit"
                              ? "Save Changes"
                              : "Save Expense"}
                    </button>
                </div>
            </form>
        </CustomModal>
    )
}
