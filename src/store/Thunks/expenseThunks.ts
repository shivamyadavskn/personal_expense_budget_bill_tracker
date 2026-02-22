import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  ExpenseListPayload,
  ExpenseService,
} from '../../service/expense.service'

// store/expense/expenseTypes.ts

export interface Expense {
  _id?: string
  title?: string
  description?: string
  amount: number
  category: string
  date: string
  note?: string
  receipt?: string
}

export interface ExpenseListResponse {
  count: number
  page: number
  limit: number
  total: number
  totalPages: number
  expenses: Expense[]
}

export const defaultExpenseListPayload: ExpenseListPayload = {
  page: 1,
  limit: 10,
  search: '',
  category: '',
  min: null,
  max: null,
  startDate: '',
  endDate: '',
  sort: 'date_desc',
}

export interface CreateExpensePayload {
  title: string
  amount: string
  category: string
  date: string
  note: string
  receipt: File | null
}

export interface UpdateExpensePayload {
  id: string
  payload: CreateExpensePayload
}

const normalizeExpense = (expense: Expense): Expense => ({
  ...expense,
  amount: Number(expense?.amount ?? 0),
  title: expense?.title || expense?.description || '',
})

/**
 * Create Expense
 */
export const createExpense = createAsyncThunk<
  Expense,
  CreateExpensePayload,
  { rejectValue: string }
>(
  'expense/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await ExpenseService.addExpense({
        description: payload.title,
        amount: Number(payload.amount),
        category: payload.category,
        date: payload.date,
        note: payload.note,
      })

      const createdExpense =
        response.data?.data?.expense || response.data?.expense || response.data

      return normalizeExpense(createdExpense)
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create expense'
      )
    }
  }
)


/**
 * Fetch All Expenses
 */
export const fetchExpenses = createAsyncThunk<
  ExpenseListResponse,
  Partial<ExpenseListPayload> | undefined,
  { rejectValue: string }
>(
  'expense/fetchAll',
  async (payload, { rejectWithValue }) => {
    try {
      const requestPayload: ExpenseListPayload = {
        ...defaultExpenseListPayload,
        ...(payload || {}),
      }

      const response = await ExpenseService.getExpenses(requestPayload)
      const responseData = response.data?.data || {}
      const expenseList = Array.isArray(responseData?.expenses)
        ? responseData.expenses
        : []

      return {
        count: Number(responseData?.count ?? expenseList.length),
        page: Number(responseData?.page ?? requestPayload.page),
        limit: Number(responseData?.limit ?? requestPayload.limit),
        total: Number(responseData?.total ?? expenseList.length),
        totalPages: Number(responseData?.totalPages ?? 1),
        expenses: expenseList.map((expense: Expense) => normalizeExpense(expense)),
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch expenses'
      )
    }
  }
)

export const fetchExpenseById = createAsyncThunk<
  Expense,
  string,
  { rejectValue: string }
>('expense/fetchById', async (expenseId, { rejectWithValue }) => {
  try {
    const response = await ExpenseService.getExpenseById(expenseId)
    const expense = response.data?.data?.expense || response.data?.expense
    if (!expense) {
      return rejectWithValue('Expense not found')
    }
    return normalizeExpense(expense)
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch expense'
    )
  }
})

export const updateExpense = createAsyncThunk<
  Expense,
  UpdateExpensePayload,
  { rejectValue: string }
>('expense/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await ExpenseService.updateExpense(id, {
      description: payload.title,
      amount: Number(payload.amount),
      category: payload.category,
      date: payload.date,
      note: payload.note,
    })

    const updatedExpense =
      response.data?.data?.expense ||
      response.data?.data ||
      response.data?.expense ||
      response.data
    return normalizeExpense(updatedExpense)
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to update expense'
    )
  }
})

export const deleteExpense = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('expense/delete', async (expenseId, { rejectWithValue }) => {
  try {
    await ExpenseService.deleteExpense(expenseId)
    return expenseId
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to delete expense'
    )
  }
})
