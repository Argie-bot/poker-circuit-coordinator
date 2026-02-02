'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  FileText, 
  Calculator,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Filter,
  Printer,
  Mail,
  AlertTriangle,
  Info,
  FileSpreadsheet,
  FileImage,
  Archive
} from 'lucide-react'
import { Expense, PnLData, TaxExportData } from '@/types/expenses'

interface TaxExportProps {
  expenses: Expense[]
  pnlData: PnLData
}

export default function TaxExport({ expenses, pnlData }: TaxExportProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv')
  const [includeReceipts, setIncludeReceipts] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Available years from expenses
  const availableYears = Array.from(
    new Set(expenses.map(expense => new Date(expense.date).getFullYear()))
  ).sort((a, b) => b - a)

  // Filter expenses by year
  const yearlyExpenses = expenses.filter(
    expense => new Date(expense.date).getFullYear() === selectedYear
  )

  // Calculate tax export data
  const taxExportData: TaxExportData = {
    year: selectedYear,
    totalBusinessExpenses: yearlyExpenses.filter(e => e.isDeductible).reduce((sum, e) => sum + e.amount, 0),
    totalBusinessIncome: pnlData.totalIncome,
    expensesByCategory: yearlyExpenses.reduce((acc, expense) => {
      if (expense.isDeductible) {
        acc[expense.taxCategory] = (acc[expense.taxCategory] || 0) + expense.amount
      }
      return acc
    }, {} as Record<string, number>),
    deductibleExpenses: yearlyExpenses.filter(e => e.isDeductible),
    nonDeductibleExpenses: yearlyExpenses.filter(e => !e.isDeductible),
    mileageDeduction: yearlyExpenses
      .filter(e => e.mileage && e.mileage > 0)
      .reduce((sum, e) => sum + (e.mileage! * 0.655), 0), // 2023 IRS rate
    totalMiles: yearlyExpenses
      .filter(e => e.mileage && e.mileage > 0)
      .reduce((sum, e) => sum + e.mileage!, 0),
    mileageRate: 0.655
  }

  // IRS-specific categories and their requirements
  const irsCategories = {
    'Travel': {
      description: 'Airfare, hotels, and transportation for business travel',
      requirements: 'Must be primarily for business purposes',
      deductibility: '100% if business-related'
    },
    'Meals': {
      description: 'Business meals and entertainment',
      requirements: 'Must be ordinary and necessary business expenses',
      deductibility: '50% deductible (2023 rules)'
    },
    'Transportation': {
      description: 'Local transportation, taxis, car rentals',
      requirements: 'Must be for business purposes',
      deductibility: '100% if business-related'
    },
    'Lodging': {
      description: 'Hotel and accommodation expenses',
      requirements: 'Must be away from home for business',
      deductibility: '100% if business-related'
    },
    'Tournament Entry': {
      description: 'Entry fees and buy-ins for professional play',
      requirements: 'Must be for profit-seeking activity',
      deductibility: '100% for professional players'
    }
  }

  const handleExport = async () => {
    setIsGenerating(true)
    try {
      // Simulate export generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (exportFormat === 'csv') {
        downloadCSV()
      } else if (exportFormat === 'pdf') {
        generatePDF()
      } else if (exportFormat === 'excel') {
        downloadExcel()
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadCSV = () => {
    const headers = [
      'Date',
      'Vendor',
      'Description',
      'Category',
      'Tax Category',
      'Amount',
      'Deductible',
      'Tournament',
      'Location',
      'Notes'
    ]

    const rows = taxExportData.deductibleExpenses.map(expense => [
      expense.date,
      expense.vendor,
      expense.description,
      expense.category,
      expense.taxCategory,
      expense.amount.toFixed(2),
      expense.isDeductible ? 'Yes' : 'No',
      expense.tournament || '',
      expense.location || '',
      expense.notes || ''
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `poker-expenses-${selectedYear}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const generatePDF = () => {
    // This would integrate with a PDF library like jsPDF
    alert('PDF export would be implemented here with proper formatting for tax purposes')
  }

  const downloadExcel = () => {
    // This would integrate with a library like xlsx
    alert('Excel export would be implemented here with multiple worksheets')
  }

  const estimatedTaxSavings = taxExportData.totalBusinessExpenses * 0.25 // Assuming 25% tax rate

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Export Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
              Tax Year
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              id="format"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf' | 'excel')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="csv">CSV (Spreadsheet)</option>
              <option value="excel">Excel Workbook</option>
              <option value="pdf">PDF Report</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={isGenerating || taxExportData.deductibleExpenses.length === 0}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeReceipts}
              onChange={(e) => setIncludeReceipts(e.target.checked)}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Include receipt images (PDF only)</span>
          </label>
        </div>
      </motion.div>

      {/* Tax Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Deductible Expenses</p>
              <p className="text-2xl font-bold text-green-900">${taxExportData.totalBusinessExpenses.toLocaleString()}</p>
              <p className="text-sm text-green-600">{taxExportData.deductibleExpenses.length} items</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Non-Deductible</p>
              <p className="text-2xl font-bold text-red-900">
                ${taxExportData.nonDeductibleExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-red-600">{taxExportData.nonDeductibleExpenses.length} items</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Estimated Savings</p>
              <p className="text-2xl font-bold text-blue-900">${estimatedTaxSavings.toLocaleString()}</p>
              <p className="text-sm text-blue-600">@25% tax rate</p>
            </div>
            <Calculator className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Mileage Deduction</p>
              <p className="text-2xl font-bold text-purple-900">${taxExportData.mileageDeduction.toFixed(0)}</p>
              <p className="text-sm text-purple-600">{taxExportData.totalMiles.toLocaleString()} miles</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </motion.div>

      {/* IRS Categories Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4">IRS Category Breakdown</h4>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductibility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Savings*
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(taxExportData.expensesByCategory)
                .filter(([_, amount]) => amount > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const itemCount = taxExportData.deductibleExpenses.filter(e => e.taxCategory === category).length
                  const deductiblePercentage = category === 'Meals' ? 50 : 100
                  const taxSavings = (amount * (deductiblePercentage / 100)) * 0.25
                  
                  return (
                    <tr key={category} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{category}</div>
                          <div className="text-sm text-gray-500">
                            {irsCategories[category as keyof typeof irsCategories]?.description || 'Business expense'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {itemCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          deductiblePercentage === 100 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {deductiblePercentage}% deductible
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${taxSavings.toFixed(0)}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium">Tax Savings Calculation</p>
              <p>* Estimated at 25% tax rate. Actual savings depend on your tax bracket and filing status. Consult a tax professional for advice specific to your situation.</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* IRS Compliance Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
          IRS Compliance & Requirements
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2">Professional Poker Players</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Must report as business income (Schedule C)</li>
                <li>• Subject to self-employment tax</li>
                <li>• Can deduct ordinary & necessary expenses</li>
                <li>• Must maintain detailed records</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h5 className="font-medium text-green-900 mb-2">Record Keeping Requirements</h5>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Keep receipts for all expenses &gt;$75</li>
                <li>• Document business purpose</li>
                <li>• Track mileage with logs</li>
                <li>• Maintain records for 3+ years</li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h5 className="font-medium text-red-900 mb-2">Important Limitations</h5>
            <div className="text-sm text-red-700 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Meals:</strong> Only 50% deductible (as of 2023)
              </div>
              <div>
                <strong>Entertainment:</strong> Generally not deductible
              </div>
              <div>
                <strong>Personal Expenses:</strong> Never deductible
              </div>
              <div>
                <strong>Mixed Use:</strong> Only business portion deductible
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Disclaimer:</strong> This tool provides estimates for informational purposes only. 
              Tax laws are complex and change frequently. Always consult with a qualified tax professional 
              or CPA familiar with professional gambling tax requirements.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-4"
      >
        <button className="btn-secondary flex items-center space-x-2">
          <Printer className="h-4 w-4" />
          <span>Print Summary</span>
        </button>
        
        <button className="btn-secondary flex items-center space-x-2">
          <Mail className="h-4 w-4" />
          <span>Email to CPA</span>
        </button>
        
        <button className="btn-secondary flex items-center space-x-2">
          <Archive className="h-4 w-4" />
          <span>Save Tax Package</span>
        </button>
        
        <button className="btn-secondary flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Generate Receipt Book</span>
        </button>
      </motion.div>
    </div>
  )
}