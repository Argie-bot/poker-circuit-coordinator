'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  X, 
  Save, 
  Calculator,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  DollarSign
} from 'lucide-react'
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES, TAX_CATEGORIES } from '@/types/expenses'

interface ExpenseFormProps {
  expense?: Expense
  onSubmit: (expense: Omit<Expense, 'id'>) => void
  onClose: () => void
}

const expenseSchema = z.object({
  vendor: z.string().min(1, 'Vendor name is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  category: z.enum(['travel', 'accommodation', 'food', 'transportation', 'tips', 'tournament_fees', 'parking', 'other']),
  description: z.string().min(1, 'Description is required'),
  tournament: z.string().optional(),
  location: z.string().optional(),
  isDeductible: z.boolean(),
  taxCategory: z.string().min(1, 'Tax category is required'),
  notes: z.string().optional(),
  cashTip: z.boolean().optional(),
  mileage: z.number().optional(),
  attendees: z.number().optional()
})

type ExpenseFormData = z.infer<typeof expenseSchema>

// Common tournaments for autocomplete
const COMMON_TOURNAMENTS = [
  'WSOP Main Event',
  'WSOP Circuit Main Event',
  'WPT Championship',
  'WPT Main Event',
  'EPT Main Event',
  'Venetian Deep Stack',
  'Aria High Roller',
  'Bellagio Cup',
  'Borgata Poker Open',
  'Commerce Casino Series'
]

// Common locations for poker tournaments
const COMMON_LOCATIONS = [
  'Las Vegas, NV',
  'Atlantic City, NJ',
  'Los Angeles, CA',
  'Chicago, IL',
  'Florida',
  'New York, NY',
  'Phoenix, AZ',
  'Tulsa, OK'
]

export default function ExpenseForm({ expense, onSubmit, onClose }: ExpenseFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [estimatedTaxSavings, setEstimatedTaxSavings] = useState(0)

  const isEditing = !!expense

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense ? {
      vendor: expense.vendor,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      description: expense.description,
      tournament: expense.tournament || '',
      location: expense.location || '',
      isDeductible: expense.isDeductible,
      taxCategory: expense.taxCategory,
      notes: expense.notes || '',
      cashTip: expense.cashTip || false,
      mileage: expense.mileage || undefined,
      attendees: expense.attendees || undefined
    } : {
      vendor: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: 'food' as ExpenseCategory,
      description: '',
      tournament: '',
      location: '',
      isDeductible: true,
      taxCategory: 'Other',
      notes: '',
      cashTip: false
    }
  })

  const watchedAmount = watch('amount')
  const watchedIsDeductible = watch('isDeductible')
  const watchedCategory = watch('category')

  // Update tax category when category changes
  const handleCategoryChange = (category: ExpenseCategory) => {
    setValue('category', category)
    
    // Auto-set tax category based on expense category
    const taxCategoryMap: Record<ExpenseCategory, string> = {
      travel: 'Travel',
      accommodation: 'Lodging', 
      food: 'Meals',
      transportation: 'Transportation',
      tips: 'Tips',
      tournament_fees: 'Tournament Entry',
      parking: 'Parking',
      other: 'Other'
    }
    
    setValue('taxCategory', taxCategoryMap[category])
    
    // Set deductible default based on category
    if (category === 'food') {
      setValue('isDeductible', true) // 50% deductible for meals
    }
  }

  // Calculate estimated tax savings
  const calculateTaxSavings = (amount: number, isDeductible: boolean, category: ExpenseCategory) => {
    if (!isDeductible || amount <= 0) return 0
    
    const taxRate = 0.25 // Assumed 25% tax rate
    let deductiblePercentage = 1.0
    
    // Meals are only 50% deductible
    if (category === 'food') {
      deductiblePercentage = 0.5
    }
    
    return amount * deductiblePercentage * taxRate
  }

  // Update tax savings when relevant fields change
  useState(() => {
    const savings = calculateTaxSavings(watchedAmount, watchedIsDeductible, watchedCategory)
    setEstimatedTaxSavings(savings)
  })

  const onFormSubmit = async (data: ExpenseFormData) => {
    try {
      onSubmit({
        vendor: data.vendor,
        amount: data.amount,
        date: data.date,
        category: data.category,
        description: data.description,
        tournament: data.tournament || undefined,
        location: data.location || undefined,
        isDeductible: data.isDeductible,
        taxCategory: data.taxCategory,
        notes: data.notes || undefined,
        cashTip: data.cashTip || false,
        mileage: data.mileage || undefined,
        attendees: data.attendees || undefined
      })
    } catch (error) {
      console.error('Error submitting expense:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Track your tournament-related expenses for tax deductions
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor/Merchant *
                </label>
                <input
                  type="text"
                  id="vendor"
                  {...register('vendor')}
                  placeholder="e.g., Southwest Airlines, Uber, Starbucks"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.vendor && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.vendor.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    id="amount"
                    {...register('amount', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.amount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Date and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    id="date"
                    {...register('date')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  {...register('category')}
                  onChange={(e) => handleCategoryChange(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {Object.entries(EXPENSE_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <input
                type="text"
                id="description"
                {...register('description')}
                placeholder="Brief description of the expense"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Tournament and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tournament" className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament (Optional)
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="tournament"
                    {...register('tournament')}
                    placeholder="Select or type tournament name"
                    list="tournaments"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <datalist id="tournaments">
                    {COMMON_TOURNAMENTS.map((tournament) => (
                      <option key={tournament} value={tournament} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="location"
                    {...register('location')}
                    placeholder="City, State or venue"
                    list="locations"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <datalist id="locations">
                    {COMMON_LOCATIONS.map((location) => (
                      <option key={location} value={location} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <Calculator className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Tax Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="isDeductible" className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDeductible"
                      {...register('isDeductible')}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Tax Deductible</span>
                  </label>
                </div>

                <div>
                  <label htmlFor="taxCategory" className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Category
                  </label>
                  <select
                    id="taxCategory"
                    {...register('taxCategory')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    {Object.entries(TAX_CATEGORIES).map(([key, description]) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {watchedIsDeductible && estimatedTaxSavings > 0 && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Estimated Tax Savings: ${estimatedTaxSavings.toFixed(2)}
                    </span>
                  </div>
                  {watchedCategory === 'food' && (
                    <p className="text-xs text-green-700 mt-1">
                      * Business meals are 50% deductible
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
              >
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
              </button>

              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-4 space-y-4"
                >
                  {/* Special Fields for Certain Categories */}
                  {watchedCategory === 'food' && (
                    <div>
                      <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Attendees (required if &gt;$75)
                      </label>
                      <input
                        type="number"
                        id="attendees"
                        {...register('attendees', { valueAsNumber: true })}
                        placeholder="Number of people"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  )}

                  {watchedCategory === 'transportation' && (
                    <div>
                      <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">
                        Mileage (for auto travel deduction)
                      </label>
                      <input
                        type="number"
                        id="mileage"
                        {...register('mileage', { valueAsNumber: true })}
                        placeholder="Miles driven"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current IRS rate: $0.655 per mile (2023)
                      </p>
                    </div>
                  )}

                  {watchedCategory === 'tips' && (
                    <div>
                      <label htmlFor="cashTip" className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="cashTip"
                          {...register('cashTip')}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Cash tip (no receipt)</span>
                      </label>
                    </div>
                  )}

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      id="notes"
                      {...register('notes')}
                      rows={3}
                      placeholder="Any additional details or context..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {watchedIsDeductible && (
              <span className="text-green-600">✓ Tax deductible expense</span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onFormSubmit)}
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEditing ? 'Update' : 'Save'} Expense</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}