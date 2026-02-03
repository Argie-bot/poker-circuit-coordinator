'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  MapPin, 
  Bell, 
  Settings,
  BarChart3,
  DollarSign,
  Users,
  Calendar,
  Target,
  TrendingUp,
  User
} from 'lucide-react'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Circuit Builder', href: '/circuit-builder', icon: Target },
  { name: 'Expenses', href: '/expenses', icon: DollarSign },
  { name: 'Bankroll', href: '/bankroll', icon: TrendingUp },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Coordination', href: '/coordination', icon: Users }
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="h-12 w-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <MapPin className="h-7 w-7 text-white" />
              </motion.div>
              <div className="ml-4">
                <span className="text-2xl font-black text-gray-900 tracking-tight">
                  Circuit Coordinator
                </span>
                <div className="text-xs text-gray-500 font-medium -mt-1">
                  Professional Poker Tour Management
                </div>
              </div>
            </Link>
          </div>
          
          {/* Enhanced Navigation */}
          <nav className="hidden md:flex space-x-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg'
                      : 'text-gray-600 hover:text-primary-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl -z-10"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Enhanced Right side */}
          <div className="flex items-center space-x-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all duration-200"
            >
              <Bell className="h-6 w-6" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all duration-200"
            >
              <Settings className="h-6 w-6" />
            </motion.button>
            <div className="h-12 w-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <User className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-gray-200 shadow-2xl z-50">
        <div className="flex justify-around items-center h-20 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full px-2 py-2 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  <item.icon className={`h-6 w-6 mb-1 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className={`text-xs font-semibold leading-tight ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeMobileTab"
                      className="absolute bottom-0 h-1 bg-primary-600 rounded-t-full"
                      style={{ width: '60%' }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}