// store/expense/expenseSlice.ts

import { createSlice } from '@reduxjs/toolkit'
import {
  createExpense,
  deleteExpense,
  Expense,
  fetchExpenseById,
  fetchExpenses,
  updateExpense,
} from '../Thunks/expenseThunks'

interface ExpensePagination {
  count: number
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ExpenseState {
  expenses: Expense[]
  loading: boolean
  submitting: boolean
  selectedExpenseLoading: boolean
  selectedExpense: Expense | null
  error: string | null
  pagination: ExpensePagination
}

const initialState: ExpenseState = {
  expenses: [],
  loading: false,
  submitting: false,
  selectedExpenseLoading: false,
  selectedExpense: null,
  error: null,
  pagination: {
    count: 0,
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
}

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    clearExpenseError(state) {
      state.error = null
    },
    clearSelectedExpense(state) {
      state.selectedExpense = null
    },
  },
  extraReducers: (builder) => {
    builder

      // Create Expense
      .addCase(createExpense.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.submitting = false
        state.expenses.unshift(action.payload)
        state.pagination.total += 1
        state.pagination.count = state.expenses.length
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload || 'Something went wrong'
      })

      // Fetch Expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false
        state.expenses = action.payload.expenses
        state.pagination = {
          count: action.payload.count,
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        }
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Something went wrong'
      })

      // Fetch Expense By Id
      .addCase(fetchExpenseById.pending, (state) => {
        state.selectedExpenseLoading = true
        state.error = null
      })
      .addCase(fetchExpenseById.fulfilled, (state, action) => {
        state.selectedExpenseLoading = false
        state.selectedExpense = action.payload
      })
      .addCase(fetchExpenseById.rejected, (state, action) => {
        state.selectedExpenseLoading = false
        state.error = action.payload || 'Something went wrong'
      })

      // Update Expense
      .addCase(updateExpense.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.submitting = false
        state.expenses = state.expenses.map((expense) =>
          expense._id === action.payload._id ? action.payload : expense
        )
        state.selectedExpense = action.payload
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload || 'Something went wrong'
      })

      // Delete Expense
      .addCase(deleteExpense.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.submitting = false
        state.expenses = state.expenses.filter(
          (expense) => expense._id !== action.payload
        )
        state.pagination.total = Math.max(0, state.pagination.total - 1)
        state.pagination.count = state.expenses.length
        if (state.selectedExpense?._id === action.payload) {
          state.selectedExpense = null
        }
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload || 'Something went wrong'
      })
  },
})

export const { clearExpenseError, clearSelectedExpense } = expenseSlice.actions
export default expenseSlice.reducer
