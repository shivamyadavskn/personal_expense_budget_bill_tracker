import React from 'react'
import CustomModal from '../../components/CustomModal'
import { ChevronDownIcon } from '@heroicons/react/16/solid'

export interface FilterState {
    category: string
    dateFrom: string
    dateTo: string
    minAmount: string
    maxAmount: string
}

interface FilterModalProps {
    open: boolean
    onClose: () => void
    filters: FilterState
    onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
    onApply: () => void
    onReset: () => void
}

const categories = ['All', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Other']

export default function FilterModal({
    open,
    onClose,
    filters,
    onFilterChange,
    onApply,
    onReset
}: FilterModalProps) {
    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title="Filter Expenses"
        >
            <div className="space-y-6">
                {/* Category Filter */}
                <div>
                    <label htmlFor="filter-category" className="block text-sm font-medium text-gray-900">
                        Category
                    </label>
                    <div className="mt-2 grid grid-cols-1">
                        <select
                            id="filter-category"
                            name="category"
                            value={filters.category}
                            onChange={onFilterChange}
                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon
                            aria-hidden="true"
                            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                    </div>
                </div>

                {/* Date Range Filter */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-900">
                            Date From
                        </label>
                        <div className="mt-2">
                            <input
                                type="date"
                                id="dateFrom"
                                name="dateFrom"
                                value={filters.dateFrom}
                                onChange={onFilterChange}
                                className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="dateTo" className="block text-sm font-medium text-gray-900">
                            Date To
                        </label>
                        <div className="mt-2">
                            <input
                                type="date"
                                id="dateTo"
                                name="dateTo"
                                value={filters.dateTo}
                                onChange={onFilterChange}
                                className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Amount Range Filter */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="minAmount" className="block text-sm font-medium text-gray-900">
                            Min Amount ($)
                        </label>
                        <div className="mt-2">
                            <div className="flex rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                <div className="flex items-center pl-3 pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    id="minAmount"
                                    name="minAmount"
                                    value={filters.minAmount}
                                    onChange={onFilterChange}
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="block w-full border-0 bg-transparent py-2 pl-1 pr-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-900">
                            Max Amount ($)
                        </label>
                        <div className="mt-2">
                            <div className="flex rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                <div className="flex items-center pl-3 pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    id="maxAmount"
                                    name="maxAmount"
                                    value={filters.maxAmount}
                                    onChange={onFilterChange}
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="block w-full border-0 bg-transparent py-2 pl-1 pr-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-end gap-x-4 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onReset}
                        className="text-sm font-semibold text-gray-900 hover:text-gray-700"
                    >
                        Reset All
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onApply}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </CustomModal>
    )
}