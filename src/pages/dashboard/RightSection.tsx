import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
// Lazy load components
const DashboardContent = lazy(() => import('./DashboardContent'))
const Expenses = lazy(() => import('../expense/index'))
const Budgets = lazy(() => import('../budget/index'))
const Bills = lazy(() => import('../bills/index'))
const Income = lazy(() => import('../income/Income'))
const Settings = lazy(() => import('../settings/Settings'))
const Profile = lazy(() => import("../profile/Profile"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
)

const RightSectionDashBoard = () => {
  return (
    <main className="py-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/dashboard" element={<DashboardContent />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/incomes" element={<Income />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/settings" element={<Settings />} />
            <Route path='/profile' element={<Profile />} />
          </Routes>
        </Suspense>
      </div>
    </main>
  )
}

export default RightSectionDashBoard