'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera,
  Upload,
  FileImage,
  DollarSign,
  Calendar,
  TrendingUp,
  Download,
  Filter,
  Search,
  Plus,
  BarChart3,
  Receipt,
  MapPin,
  CreditCard,
  Plane,
  Utensils,
  Hotel,
  Car
} from 'lucide-react'
import PhotoUpload from '@/components/expenses/PhotoUpload'
import ExpenseList from '@/components/expenses/ExpenseList'
import PnLDashboard from '@/components/expenses/PnLDashboard'
import TaxExport from '@/components/expenses/TaxExport'
import ExpenseForm from '@/components/expenses/ExpenseForm'
import { Expense, ExpenseCategory, PnLData } from '@/types/expenses'

// Mock data for demo
const mockExpenses: Expense[] = [
  {
    id: '1',
    vendor: 'Southwest Airlines',
    amount: 347.50,
    date: '2024-02-01',
    category: 'travel' as ExpenseCategory,
    description: 'Flight to Las Vegas',
    receiptUrl: '/receipts/southwest-1.jpg',
    tournament: 'WSOP Circuit Main Event',
    isDeductible: true,
    taxCategory: 'Travel',
    location: 'Las Vegas, NV'
  },
  {
    id: '2',
    vendor: 'Paris Las Vegas',
    amount: 189.99,
    date: '2024-02-02',
    category: 'accommodation' as ExpenseCategory,
    description: 'Hotel room (2 nights)',
    receiptUrl: '/receipts/paris-hotel.jpg',
    tournament: 'WSOP Circuit Main Event',
    isDeductible: true,
    taxCategory: 'Lodging',
    location: 'Las Vegas, NV'
  },
  {
    id: '3',
    vendor: 'Uber',
    amount: 25.50,
    date: '2024-02-03',
    category: 'transportation' as ExpenseCategory,
    description: 'Airport to hotel',
    receiptUrl: '/receipts/uber-1.jpg',
    tournament: 'WSOP Circuit Main Event',
    isDeductible: true,
    taxCategory: 'Transportation',
    location: 'Las Vegas, NV'
  },
  {
    id: '4',
    vendor: 'Dealer Tips',
    amount: 150.00,
    date: '2024-02-04',
    category: 'tips' as ExpenseCategory,
    description: 'Tournament dealer tips',
    tournament: 'WSOP Circuit Main Event',
    isDeductible: true,
    taxCategory: 'Tips',
    location: 'Las Vegas, NV'
  }
]

const mockPnL: PnLData = {
  totalIncome: 45750.00,
  totalExpenses: 15780.50, // Updated to match expense breakdown total
  netProfit: 29969.50, // Updated calculation
  roi: 254.8,
  tournamentsPlayed: 23,
  avgExpensePerTournament: 560.46,
  expenseBreakdown: {
    travel: 4250.00,
    accommodation: 3890.00,
    food: 2150.00,
    tips: 1200.00,
    transportation: 800.50,
    tournament_fees: 2500.00,
    parking: 390.00,
    other: 600.00
  },
  monthlyData: [
    { month: 'Jan', income: 8500, expenses: 2100, profit: 6400 },
    { month: 'Feb', income: 12750, expenses: 3450, profit: 9300 },
    { month: 'Mar', income: 15200, expenses: 4200, profit: 11000 },
    { month: 'Apr', income: 9300, expenses: 3140, profit: 6160 }
  ]
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [showUpload, setShowUpload] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedView, setSelectedView] = useState<'list' | 'dashboard' | 'export'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all')

  // AI Receipt Processing Function (placeholder - would integrate with actual AI service)
  const processReceiptPhoto = useCallback(async (photoFile: File) => {
    // This would integrate with an AI service like OpenAI GPT-4 Vision, Google Cloud Vision, etc.
    // For now, return mock data
    const mockProcessedExpense: Partial<Expense> = {
      vendor: 'AI Parsed Vendor',
      amount: Math.random() * 500,
      date: new Date().toISOString().split('T')[0],
      category: 'food' as ExpenseCategory,
      description: 'AI extracted description',
      receiptUrl: URL.createObjectURL(photoFile),
      isDeductible: true,
      taxCategory: 'Meals'
    }
    
    return mockProcessedExpense
  }, [])

  const handlePhotoUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        const processedExpense = await processReceiptPhoto(file)
        const newExpense: Expense = {
          id: Math.random().toString(36).substr(2, 9),
          vendor: processedExpense.vendor || 'Unknown Vendor',
          amount: processedExpense.amount || 0,
          date: processedExpense.date || new Date().toISOString().split('T')[0],
          category: processedExpense.category || 'other',
          description: processedExpense.description || '',
          receiptUrl: processedExpense.receiptUrl || '',
          isDeductible: processedExpense.isDeductible || true,
          taxCategory: processedExpense.taxCategory || 'Other'
        }
        setExpenses(prev => [newExpense, ...prev])
      } catch (error) {
        console.error('Error processing receipt:', error)
      }
    }
    setShowUpload(false)
  }

  const handleManualExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Math.random().toString(36).substr(2, 9)
    }
    setExpenses(prev => [newExpense, ...prev])
    setShowForm(false)
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <h1 className="ml-3 text-2xl font-bold text-gray-900">Expense Tracker</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowForm(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Manual Entry</span>
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Camera className="h-4 w-4" />
              <span>Add Receipt</span>
            </button>
          </div>
        </div>
        {/* View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setSelectedView('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'dashboard'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setSelectedView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'list'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Receipt className="h-4 w-4 inline mr-2" />
              Expenses
            </button>
            <button
              onClick={() => setSelectedView('export')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'export'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Download className="h-4 w-4 inline mr-2" />
              Tax Export
            </button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">${mockPnL.totalExpenses.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-green-600">${mockPnL.netProfit.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROI</p>
                <p className="text-2xl font-bold text-green-600">{mockPnL.roi}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg/Tournament</p>
                <p className="text-2xl font-bold text-gray-900">${mockPnL.avgExpensePerTournament.toFixed(0)}</p>
              </div>
              <Receipt className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {selectedView === 'dashboard' && <PnLDashboard data={mockPnL} />}
          
          {selectedView === 'list' && (
            <div>
              {/* Search and Filter */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | 'all')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Categories</option>
                  <option value="travel">Travel</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="food">Food & Dining</option>
                  <option value="transportation">Transportation</option>
                  <option value="tips">Tips</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <ExpenseList expenses={filteredExpenses} />
            </div>
          )}
          
          {selectedView === 'export' && <TaxExport expenses={expenses} pnlData={mockPnL} />}
        </motion.div>
      </div>

      {/* Photo Upload Modal */}
      {showUpload && (
        <PhotoUpload
          onUpload={handlePhotoUpload}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Manual Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          onSubmit={handleManualExpense}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}