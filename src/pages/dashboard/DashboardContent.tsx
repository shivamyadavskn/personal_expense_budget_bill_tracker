import React from 'react'

const DashboardContent = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Dashboard Overview
      </h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Balance Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Balance
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                    $0.00
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Income
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
                    $0.00
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Expenses
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-red-600 dark:text-red-400">
                    $0.00
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Transactions
        </h2>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No transactions yet
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardContent