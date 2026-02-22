import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid"

type CustomPaginationProps = {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
}

const buildPageItems = (currentPage: number, totalPages: number) => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const items: Array<number | "..."> = [1]
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    if (start > 2) {
        items.push("...")
    }

    for (let i = start; i <= end; i += 1) {
        items.push(i)
    }

    if (end < totalPages - 1) {
        items.push("...")
    }

    items.push(totalPages)
    return items
}

export default function CustomPagination({
    page,
    limit,
    total,
    onPageChange,
}: CustomPaginationProps) {
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const safePage = Math.min(Math.max(page, 1), totalPages)

    if (totalPages <= 1) return null

    const startResult = (safePage - 1) * limit + 1
    const endResult = Math.min(safePage * limit, total)
    const pageItems = buildPageItems(safePage, totalPages)

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    disabled={safePage === 1}
                    onClick={() => onPageChange(safePage - 1)}
                    className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    disabled={safePage === totalPages}
                    onClick={() => onPageChange(safePage + 1)}
                    className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startResult}</span> to{" "}
                    <span className="font-medium">{endResult}</span> of{" "}
                    <span className="font-medium">{total}</span> results
                </p>

                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                        disabled={safePage === 1}
                        onClick={() => onPageChange(safePage - 1)}
                        className="inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>

                    {pageItems.map((item, index) =>
                        item === "..." ? (
                            <span
                                key={`ellipsis-${index}`}
                                className="inline-flex items-center px-3 py-2 text-sm text-gray-500 ring-1 ring-gray-300"
                            >
                                ...
                            </span>
                        ) : (
                            <button
                                key={item}
                                onClick={() => onPageChange(item)}
                                className={`inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-gray-300 ${
                                    item === safePage
                                        ? "z-10 bg-indigo-600 text-white"
                                        : "text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                {item}
                            </button>
                        )
                    )}

                    <button
                        disabled={safePage === totalPages}
                        onClick={() => onPageChange(safePage + 1)}
                        className="inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </nav>
            </div>
        </div>
    )
}
