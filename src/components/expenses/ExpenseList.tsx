'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Edit2, 
  Trash2, 
  Eye, 
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  FileText
} from 'lucide-react'
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '@/types/expenses'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit?: (expense: Expense) => void
  onDelete?: (id: string) => void
}

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [sortField, setSortField] = useState<keyof Expense>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const getCategoryIcon = (category: ExpenseCategory) => {
    const iconMap = {
      travel: '✈️',
      accommodation: '🏨',
      food: '🍽️',
      transportation: '🚗',
      tips: '💰',
      tournament_fees: '🎯',
      parking: '🅿️',
      other: '📄'
    }
    return iconMap[category] || '📄'
  }

  const getCategoryColor = (category: ExpenseCategory) => {
    const colorMap = {
      travel: 'bg-blue-100 text-blue-800',
      accommodation: 'bg-purple-100 text-purple-800',
      food: 'bg-green-100 text-green-800',
      transportation: 'bg-yellow-100 text-yellow-800',
      tips: 'bg-pink-100 text-pink-800',
      tournament_fees: 'bg-red-100 text-red-800',
      parking: 'bg-gray-100 text-gray-800',
      other: 'bg-indigo-100 text-indigo-800'
    }
    return colorMap[category] || 'bg-gray-100 text-gray-800'
  }

  const sortedExpenses = [...expenses].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    // Handle different data types
    if (sortField === 'date') {
      aValue = new Date(a.date).getTime()
      bValue = new Date(b.date).getTime()
    } else if (sortField === 'amount') {
      aValue = Number(a.amount)
      bValue = Number(b.amount)
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = (bValue as string).toLowerCase()
    }

    if (aValue == null || bValue == null) {
      return aValue == null ? 1 : -1
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSort = (field: keyof Expense) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const deductibleExpenses = expenses.filter(e => e.isDeductible).reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
            <p className="text-sm text-gray-600">Total Expenses</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Amount</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">${deductibleExpenses.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Tax Deductible</p>
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Expense Details</h3>
            <div className="flex space-x-2">
              <button className="btn-secondary text-sm flex items-center space-x-1">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('vendor')}
                >
                  Vendor {sortField === 'vendor' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('amount')}
                >
                  Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductible
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {sortedExpenses.map((expense, index) => (
                  <motion.tr
                    key={expense.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{expense.vendor}</div>
                        <div className="text-sm text-gray-500">{expense.description}</div>
                        {expense.tournament && (
                          <div className="flex items-center space-x-1 text-xs text-blue-600 mt-1">
                            <CreditCard className="h-3 w-3" />
                            <span>{expense.tournament}</span>
                          </div>
                        )}
                        {expense.location && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{expense.location}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                        <span className="mr-1">{getCategoryIcon(expense.category)}</span>
                        {EXPENSE_CATEGORIES[expense.category]?.label || expense.category}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${expense.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {expense.taxCategory}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.isDeductible ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedExpense(expense)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(expense)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            title="Edit expense"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(expense.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete expense"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {expenses.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by uploading a receipt or adding an expense manually.
            </p>
          </div>
        )}
      </div>

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Expense Details</h3>
              <button
                onClick={() => setSelectedExpense(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {selectedExpense.receiptUrl && (
                <div className="text-center">
                  <img
                    src={selectedExpense.receiptUrl}
                    alt="Receipt"
                    className="max-w-full max-h-64 object-contain mx-auto rounded-lg border"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedExpense.vendor}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="mt-1 text-sm font-semibold text-gray-900">${selectedExpense.amount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedExpense.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(selectedExpense.category)}`}>
                    <span className="mr-1">{getCategoryIcon(selectedExpense.category)}</span>
                    {EXPENSE_CATEGORIES[selectedExpense.category]?.label || selectedExpense.category}
                  </span>
                </div>
              </div>

              {selectedExpense.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedExpense.description}</p>
                </div>
              )}

              {selectedExpense.tournament && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tournament</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedExpense.tournament}</p>
                </div>
              )}

              {selectedExpense.location && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedExpense.location}</p>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tax Deductible</label>
                  <div className="mt-1 flex items-center space-x-1">
                    {selectedExpense.isDeductible ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-900">
                      {selectedExpense.isDeductible ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tax Category</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedExpense.taxCategory}</p>
                </div>
              </div>

              {selectedExpense.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedExpense.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setSelectedExpense(null)}
                className="btn-secondary"
              >
                Close
              </button>
              {onEdit && (
                <button
                  onClick={() => {
                    onEdit(selectedExpense)
                    setSelectedExpense(null)
                  }}
                  className="btn-primary"
                >
                  Edit Expense
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}