type Expense = {
  _id: string
  amount: number
  category: string
  description: string
  date: string
}

type Props = {
  recentTransactions?: Expense[]
}

export default function LatestTransactionsTable({
  recentTransactions = [],
}: Props) {
  return (
    <div className="border-t border-gray-200 pt-11">
      <h2 className="px-4 text-base font-semibold text-gray-900 sm:px-6 lg:px-8">
        Latest Transactions
      </h2>

      <table className="mt-6 w-full whitespace-nowrap text-left">
        <colgroup>
          <col className="w-full sm:w-6/12" />
          <col className="sm:w-2/12" />
          <col className="sm:w-2/12" />
          <col className="sm:w-2/12" />
        </colgroup>

        <thead className="border-b border-gray-200 text-sm text-gray-900">
          <tr>
            <th className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8">
              Description
            </th>
            <th className="hidden py-2 pr-8 font-semibold sm:table-cell">
              Category
            </th>
            <th className="py-2 pr-8 text-right font-semibold sm:text-left">
              Amount
            </th>
            <th className="hidden py-2 pr-4 text-right font-semibold sm:table-cell">
              Date
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {recentTransactions?.map(tx => (
            <tr key={tx._id}>
              {/* Description */}
              <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                <div className="text-sm font-medium text-gray-900">
                  {tx.description}
                </div>
              </td>

              {/* Category */}
              <td className="hidden py-4 pr-8 text-sm text-gray-500 sm:table-cell">
                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-300">
                  {tx.category}
                </span>
              </td>

              {/* Amount */}
              <td className="py-4 pr-8 text-sm font-medium text-right sm:text-left">
                <span className="text-gray-900">
                  ₹{tx.amount.toLocaleString("en-IN")}
                </span>
              </td>

              {/* Date */}
              <td className="hidden py-4 pr-4 text-right text-sm text-gray-500 sm:table-cell">
                {new Date(tx.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}

          {recentTransactions.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="py-6 text-center text-sm text-gray-500"
              >
                No recent transactions
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
