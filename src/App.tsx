import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/authentication/Login";
import Register from "./pages/authentication/Register";
import ResetPassword from "./pages/authentication/ResetPassword";

import Dashboard from "./pages/Dashboard";
import ExpenseIndex from "./pages/expense";
import BillIndex from "./pages/bills";
import BudgetIndex from "./pages/budget";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <ExpenseIndex />
            </ProtectedRoute>
          }
        />

        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <BudgetIndex />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bills"
          element={
            <ProtectedRoute>
              <BillIndex />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
