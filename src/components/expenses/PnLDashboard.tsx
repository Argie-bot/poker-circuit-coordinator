'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Award,
  Filter,
  Download
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { PnLData } from '@/types/expenses'

interface PnLDashboardProps {
  data: PnLData
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16']

export default function PnLDashboard({ data }: PnLDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'month' | 'quarter' | 'year'>('month')
  const [selectedChart, setSelectedChart] = useState<'profit' | 'expenses' | 'roi'>('profit')

  // Prepare expense breakdown for pie chart
  const expenseBreakdownData = Object.entries(data.expenseBreakdown)
    .filter(([_, value]) => value > 0)
    .map(([category, amount]) => ({
      name: category.replace('_', ' ').toUpperCase(),
      value: amount,
      percentage: ((amount / data.totalExpenses) * 100).toFixed(1)
    }))

  // Calculate ROI trend
  const roiData = data.monthlyData.map(month => ({
    ...month,
    roi: month.income > 0 ? ((month.profit / (month.income - month.profit)) * 100).toFixed(1) : 0
  }))

  // Key metrics
  const profitMargin = data.totalIncome > 0 ? ((data.netProfit / data.totalIncome) * 100).toFixed(1) : 0
  const avgMonthlyProfit = data.monthlyData.length > 0 
    ? data.monthlyData.reduce((sum, month) => sum + month.profit, 0) / data.monthlyData.length
    : 0

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Net Profit</p>
              <p className="text-2xl font-bold text-green-900">${data.netProfit.toLocaleString()}</p>
              <p className="text-sm text-green-600">+{profitMargin}% margin</p>
            </div>
            <div className="bg-green-500 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Income</p>
              <p className="text-2xl font-bold text-blue-900">${data.totalIncome.toLocaleString()}</p>
              <p className="text-sm text-blue-600">{data.tournamentsPlayed} tournaments</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Total Expenses</p>
              <p className="text-2xl font-bold text-red-900">${data.totalExpenses.toLocaleString()}</p>
              <p className="text-sm text-red-600">${data.avgExpensePerTournament.toFixed(0)}/tournament</p>
            </div>
            <div className="bg-red-500 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">ROI</p>
              <p className="text-2xl font-bold text-purple-900">{data.roi.toFixed(1)}%</p>
              <p className="text-sm text-purple-600">Above average</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-full">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
          
          <div className="flex space-x-2">
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value as 'profit' | 'expenses' | 'roi')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="profit">Profit Trend</option>
              <option value="expenses">Expense Breakdown</option>
              <option value="roi">ROI Analysis</option>
            </select>
            
            <button className="btn-secondary text-sm flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="h-80">
          {selectedChart === 'profit' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.6}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="Net Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {selectedChart === 'expenses' && (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={expenseBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          )}

          {selectedChart === 'roi' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'ROI']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="roi" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Detailed Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Expense Breakdown Table */}
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h4>
          <div className="space-y-3">
            {expenseBreakdownData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">${item.value.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h4>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Strong Performance</span>
              </div>
              <p className="text-sm text-green-700">
                Your ROI of {data.roi.toFixed(1)}% is above the poker industry average of 15-25%.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Monthly Average</span>
              </div>
              <p className="text-sm text-blue-700">
                Average monthly profit: ${avgMonthlyProfit.toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Expense Ratio</span>
              </div>
              <p className="text-sm text-yellow-700">
                Expenses represent {((data.totalExpenses / data.totalIncome) * 100).toFixed(1)}% of income
              </p>
            </div>

            {/* Tax Optimization Tip */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Tax Optimization</span>
              </div>
              <p className="text-sm text-purple-700">
                You've tracked ${data.totalExpenses.toLocaleString()} in deductible expenses this year.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Monthly Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Income
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.monthlyData.map((month, index) => {
                const monthRoi = month.income > 0 ? ((month.profit / (month.income - month.profit)) * 100) : 0
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {month.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${month.income.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      ${month.expenses.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={month.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${month.profit.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={monthRoi >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {monthRoi.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}