import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDashboardDataThunk } from "../../store/Thunks/dashBoardThunks";

import {
  CheckIcon,
  HandThumbUpIcon,
} from '@heroicons/react/24/outline'
import { UsersIcon } from '@heroicons/react/16/solid'
import DashBoardStats from './DashBoardMainSection/DashBoardStats'
import UpcomingBills from './DashBoardUpcomingBills/DashBoardUpComingBill'
import LatestTransactionsTable from "./RecentTransaction/RecentTransaction";


const statuses = { Completed: 'text-green-500 bg-green-500/10', Error: 'text-rose-500 bg-rose-500/10' }

const eventTypes = {
  applied: { icon: UsersIcon, bgColorClass: 'bg-gray-400' },
  advanced: { icon: HandThumbUpIcon, bgColorClass: 'bg-blue-500' },
  completed: { icon: CheckIcon, bgColorClass: 'bg-green-500' },
}




export default function DashboardContent() {
  const dispatch = useAppDispatch();
  const { overview, loading, error } = useAppSelector((state) => state.dashboard);
  useEffect(() => {
    dispatch(fetchDashboardDataThunk());
  }, [dispatch]);

  if (loading) {
    return <div className="text-center py-12">Loading dashboard data...</div>;
  }

  if (error) {
    console.log("Dashboard Error:", error);
    return (<div className="text-center py-12">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Dashboard Overview
      </h2>
      <pre className="text-left bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
        {JSON.stringify(error, null, 2)}
      </pre>
    </div>
    );
  }



  return (
    <>
      <div>
        <main>
          {/* Top Stats */}
          <DashBoardStats overview={overview} />

          {/* Content */}
          <div className="mt-8 flex flex-col gap-6 lg:flex-row">

            {/* Left: Latest Transactions */}
            <div className="flex-1">
              <LatestTransactionsTable
                recentTransactions={overview?.totalExpenses?.recentTransactions}
              />
            </div>

            {/* Right: Upcoming Bills */}
            <div className="flex-1 border-t border-gray-200 pt-11 lg:border-t-0 lg:pt-0">
              <UpcomingBills timeline={overview?.Bills?.upcomingBills || []} />
            </div>

          </div>
        </main>
      </div>

    </>
  )
}
