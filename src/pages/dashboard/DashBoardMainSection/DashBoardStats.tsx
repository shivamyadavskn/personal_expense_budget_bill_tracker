type Stat = {
    name: string
    value: number | string
    unit?: string
}

type DashBoardStatsProps = {
    overview?: any | null
}

const getStatColor = (name: string, value: number | string) => {
    if (name === "Remaining Budget" && typeof value === "number") {
        return value < 0 ? "text-red-600" : "text-green-600"
    }
    if (name === "Upcoming Bills") return "text-yellow-600"
    if (name === "Total Expenses") return "text-red-600"
    return "text-gray-900"
}

const DashBoardStats = ({ overview }: DashBoardStatsProps) => {
    if (!overview) return null

    const stats: Stat[] = [
        {
            name: "Total Budget",
            value: overview.totalBudget,
            unit: "₹",
        },
        {
            name: "Total Expenses",
            value: overview.totalExpenses.amount,
            unit: "₹",
        },
        {
            name: "Remaining Budget",
            value: overview.remainingBudget,
            unit: "₹",
        },
        {
            name: "Upcoming Bills",
            value: overview.Bills.upcomingBillcount,
        },
    ]

    return (
        <header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="border-t border-gray-200/50 px-4 py-6 sm:px-6 lg:px-8"
                    >
                        <p className="text-sm font-medium text-gray-500">
                            {stat.name}
                        </p>

                        <p
                            className={`mt-2 text-4xl font-semibold ${getStatColor(
                                stat.name,
                                stat.value
                            )}`}
                        >
                            {stat.unit ? `${stat.unit}${stat.value}` : stat.value}
                        </p>
                    </div>
                ))}
            </div>
        </header>
    )
}

export default DashBoardStats
