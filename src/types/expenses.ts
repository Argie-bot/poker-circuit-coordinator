export type ExpenseCategory = 
  | 'travel'
  | 'accommodation' 
  | 'food'
  | 'transportation'
  | 'tips'
  | 'tournament_fees'
  | 'parking'
  | 'other'

export interface Expense {
  id: string
  vendor: string
  amount: number
  date: string
  category: ExpenseCategory
  description: string
  receiptUrl?: string
  tournament?: string
  location?: string
  isDeductible: boolean
  taxCategory: string
  notes?: string
  cashTip?: boolean // Special flag for cash tips that need special tax handling
  mileage?: number // For auto travel deductions
  attendees?: number // For meals (IRS requires if >$75)
}

export interface Tournament {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  buyIn: number
  result?: {
    placement?: number
    winnings: number
  }
}

export interface PnLData {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  roi: number
  tournamentsPlayed: number
  avgExpensePerTournament: number
  expenseBreakdown: {
    travel: number
    accommodation: number
    food: number
    tips: number
    transportation: number
    tournament_fees: number
    parking: number
    other: number
  }
  monthlyData: Array<{
    month: string
    income: number
    expenses: number
    profit: number
  }>
}

export interface TaxExportData {
  year: number
  totalBusinessExpenses: number
  totalBusinessIncome: number
  expensesByCategory: Record<string, number>
  deductibleExpenses: Expense[]
  nonDeductibleExpenses: Expense[]
  mileageDeduction: number
  totalMiles: number
  mileageRate: number // IRS standard mileage rate
}

export interface ReceiptParsingResult {
  vendor?: string
  amount?: number
  date?: string
  category?: ExpenseCategory
  description?: string
  confidence: number
  rawText: string
}

// Poker-specific expense categories with IRS guidelines
export const EXPENSE_CATEGORIES = {
  travel: {
    label: 'Travel',
    description: 'Airfare, train, bus tickets',
    irs_guidelines: 'Deductible if primarily for business purposes',
    icon: 'Plane'
  },
  accommodation: {
    label: 'Accommodation', 
    description: 'Hotels, Airbnb, lodging',
    irs_guidelines: 'Deductible for business travel',
    icon: 'Hotel'
  },
  food: {
    label: 'Meals & Dining',
    description: 'Restaurant meals, room service',
    irs_guidelines: '50% deductible if business-related',
    icon: 'Utensils'
  },
  transportation: {
    label: 'Transportation',
    description: 'Uber, taxi, rental cars, parking',
    irs_guidelines: 'Deductible for business purposes',
    icon: 'Car'
  },
  tips: {
    label: 'Tips',
    description: 'Dealer tips, service tips',
    irs_guidelines: 'Deductible if reasonable and business-related',
    icon: 'DollarSign'
  },
  tournament_fees: {
    label: 'Tournament Fees',
    description: 'Buy-ins, registration fees',
    irs_guidelines: 'Business expense for professional players',
    icon: 'CreditCard'
  },
  parking: {
    label: 'Parking',
    description: 'Parking fees, valet',
    irs_guidelines: 'Deductible when traveling for business',
    icon: 'MapPin'
  },
  other: {
    label: 'Other',
    description: 'Miscellaneous business expenses',
    irs_guidelines: 'Must be ordinary and necessary',
    icon: 'Receipt'
  }
} as const

// IRS-friendly tax categories
export const TAX_CATEGORIES = {
  'Travel': 'Business travel expenses',
  'Lodging': 'Business lodging expenses', 
  'Meals': 'Business meal expenses (50% deductible)',
  'Transportation': 'Local transportation expenses',
  'Tips': 'Service tips and gratuities',
  'Tournament Entry': 'Tournament entry fees and buy-ins',
  'Parking': 'Parking and related fees',
  'Professional Development': 'Training, coaching, educational materials',
  'Equipment': 'Business equipment and supplies',
  'Other': 'Other ordinary and necessary business expenses'
} as const