import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

type CustomPaginationProps = {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
}

export default function CustomPagination({
    page,
    limit,
    total,
    onPageChange,
}: CustomPaginationProps) {
    const totalPages = Math.ceil(total / limit)

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            {/* Mobile */}
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                    className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* Desktop */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                    <span className="font-medium">{total}</span> results
                </p>

                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <button
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-gray-300 disabled:opacity-50"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>

                    <span className="inline-flex items-center px-4 py-2 text-sm font-semibold">
                        {page} / {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className="inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-gray-300 disabled:opacity-50"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </nav>
            </div>
        </div>
    )
}
