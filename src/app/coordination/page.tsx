'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  MapPin,
  Calendar,
  DollarSign,
  MessageCircle,
  UserPlus,
  UserMinus,
  Hotel,
  Car,
  Plane,
  Calculator,
  Star,
  Clock,
  Shield,
  CheckCircle
} from 'lucide-react'
import { Tournament, GroupCoordination, CostSplit } from '@/types'
import { getUpcomingTournaments, mockTournaments } from '@/data/tournaments'

// Mock data for group coordination
const mockCoordinations: (GroupCoordination & { 
  tournament: Tournament,
  organizerName: string,
  participantNames: string[]
})[] = [
  {
    id: 'group-1',
    itineraryId: 'itinerary-1',
    organizer: 'player-2',
    organizerName: 'Mike Rodriguez',
    participants: ['player-1', 'player-2', 'player-3'],
    participantNames: ['Alex Chen', 'Mike Rodriguez', 'Sarah Kim'],
    tournament: mockTournaments[0],
    sharedAccommodations: [{
      hotel: {
        id: 'orleans-hotel',
        name: 'Orleans Hotel & Casino',
        address: {
          street: '4500 W Tropicana Ave',
          city: 'Las Vegas',
          state: 'Nevada',
          country: 'USA',
          postalCode: '89103'
        },
        distanceFromVenue: 0,
        priceRange: '$$',
        rating: 3.8,
        amenities: ['Pool', 'Casino', 'Multiple Restaurants'],
        avgNightlyRate: 89,
        groupRateAvailable: true
      },
      checkIn: new Date('2024-02-13'),
      checkOut: new Date('2024-02-19'),
      roomType: 'Two Queen Beds',
      nightlyRate: 67, // Group rate
      totalCost: 402, // 6 nights at group rate
      isGroupBooking: true,
      roommates: ['Alex Chen', 'Mike Rodriguez']
    }],
    sharedTransportation: [],
    costSplit: [
      { playerId: 'player-1', category: 'accommodation', amount: 134, paid: true },
      { playerId: 'player-2', category: 'accommodation', amount: 134, paid: true },
      { playerId: 'player-3', category: 'accommodation', amount: 134, paid: false }
    ],
    status: 'confirmed'
  }
]

const mockRequests = [
  {
    id: 'req-1',
    tournament: mockTournaments[1] || mockTournaments[0],
    requester: 'Jennifer Liu',
    requesterId: 'player-4',
    type: 'roommate',
    message: 'Looking for 1-2 roommates for WPT Bay 101. Non-smoker, clean, experienced tournament player.',
    preferences: ['Non-smoking', 'Quiet hours after 11pm', 'Split costs evenly'],
    budget: 150,
    posted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    responses: 3
  },
  {
    id: 'req-2', 
    tournament: mockTournaments[2] || mockTournaments[0],
    requester: 'David Park',
    requesterId: 'player-5',
    type: 'ride-share',
    message: 'Driving from Chicago to MSPT Hammond, have 2 seats available. Splitting gas.',
    preferences: ['Departure March 1st morning', 'Return March 4th evening'],
    budget: 50,
    posted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    responses: 1
  },
  {
    id: 'req-3',
    tournament: mockTournaments[0],
    requester: 'Lisa Chen',
    requesterId: 'player-6', 
    type: 'group-booking',
    message: 'Organizing group hotel booking for Orleans WSOP Circuit. Need 3 more players for group rate.',
    preferences: ['Group rate: $67/night vs $89 regular', 'Feb 13-19 dates'],
    budget: 400,
    posted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    responses: 5
  }
]

export default function CoordinationPage() {
  const [activeTab, setActiveTab] = useState<'my-groups' | 'find-groups' | 'create'>('my-groups')
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [coordinationType, setCoordinationType] = useState<'roommate' | 'ride-share' | 'group-booking'>('roommate')

  const upcomingTournaments = mockTournaments

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Group Coordination</h1>
              <p className="text-gray-600 mt-1">Find roommates, share rides, and coordinate group bookings</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              {[
                { id: 'my-groups', label: 'My Groups', icon: Users },
                { id: 'find-groups', label: 'Find Groups', icon: UserPlus },
                { id: 'create', label: 'Create Request', icon: MessageCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* My Groups Tab */}
        {activeTab === 'my-groups' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {mockCoordinations.length === 0 ? (
              <div className="card text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Yet</h3>
                <p className="text-gray-500 mb-6">Join or create your first group coordination.</p>
                <button
                  onClick={() => setActiveTab('find-groups')}
                  className="btn-primary"
                >
                  Find Groups
                </button>
              </div>
            ) : (
              mockCoordinations.map((coordination) => (
                <motion.div
                  key={coordination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{coordination.tournament.name}</h3>
                      <p className="text-sm text-gray-500">
                        {coordination.tournament.venue.address.city}, {coordination.tournament.venue.address.state} • 
                        {coordination.tournament.startDate.toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      coordination.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      coordination.status === 'organizing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {coordination.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Participants */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Participants ({coordination.participantNames.length})
                      </h4>
                      <div className="space-y-2">
                        {coordination.participantNames.map((name, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                            <span className="text-sm text-gray-700">{name}</span>
                            {name === coordination.organizerName && (
                              <Star className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Accommodation */}
                    {coordination.sharedAccommodations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Hotel className="h-4 w-4 mr-1" />
                          Accommodation
                        </h4>
                        <div className="space-y-2">
                          {coordination.sharedAccommodations.map((acc, index) => (
                            <div key={index} className="text-sm">
                              <p className="font-medium">{acc.hotel.name}</p>
                              <p className="text-gray-600">{acc.roomType}</p>
                              <p className="text-gray-600">
                                ${acc.nightlyRate}/night • {Math.ceil((acc.checkOut.getTime() - acc.checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights
                              </p>
                              {acc.isGroupBooking && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-700 mt-1">
                                  Group Rate
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cost Split */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Calculator className="h-4 w-4 mr-1" />
                        Cost Split
                      </h4>
                      <div className="space-y-2">
                        {coordination.costSplit.map((split, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{split.category}</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">${split.amount}</span>
                              {split.paid ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <Clock className="h-3 w-3 text-yellow-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Organized by {coordination.organizerName}
                    </span>
                    <div className="flex space-x-2">
                      <button className="btn-secondary">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </button>
                      <button className="btn-primary">
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Find Groups Tab */}
        {activeTab === 'find-groups' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Filter Requests</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Tournament</label>
                  <select className="input">
                    <option>All Tournaments</option>
                    {upcomingTournaments.slice(0, 5).map(t => (
                      <option key={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Type</label>
                  <select className="input">
                    <option>All Types</option>
                    <option>Roommate</option>
                    <option>Ride Share</option>
                    <option>Group Booking</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Budget Range</label>
                  <select className="input">
                    <option>Any Budget</option>
                    <option>Under $100</option>
                    <option>$100 - $200</option>
                    <option>$200+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Requests */}
            <div className="space-y-4">
              {mockRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{request.tournament.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.type === 'roommate' ? 'bg-blue-100 text-blue-700' :
                          request.type === 'ride-share' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {request.type.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {request.tournament.venue.address.city}, {request.tournament.venue.address.state} • 
                        {request.tournament.startDate.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-700">{request.message}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${request.budget}</p>
                      <p className="text-xs text-gray-500">budget</p>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Preferences:</h5>
                    <div className="flex flex-wrap gap-2">
                      {request.preferences.map((pref, prefIndex) => (
                        <span key={prefIndex} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>By {request.requester}</span>
                      <span>•</span>
                      <span>{Math.ceil((Date.now() - request.posted.getTime()) / (1000 * 60 * 60 * 24))} days ago</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {request.responses} responses
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="btn-secondary">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </button>
                      <button className="btn-primary">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Join
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Create Request Tab */}
        {activeTab === 'create' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-6">Create Coordination Request</h3>
              
              <form className="space-y-6">
                {/* Tournament Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Tournament</label>
                  <select 
                    className="input"
                    onChange={(e) => {
                      const tournament = upcomingTournaments.find(t => t.id === e.target.value)
                      setSelectedTournament(tournament || null)
                    }}
                  >
                    <option value="">Select a tournament...</option>
                    {upcomingTournaments.slice(0, 8).map(tournament => (
                      <option key={tournament.id} value={tournament.id}>
                        {tournament.name} - {tournament.venue.address.city}, {tournament.venue.address.state} 
                        ({tournament.startDate.toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Coordination Type</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'roommate', label: 'Roommate', icon: Hotel, description: 'Share hotel room and costs' },
                      { value: 'ride-share', label: 'Ride Share', icon: Car, description: 'Share transportation costs' },
                      { value: 'group-booking', label: 'Group Booking', icon: Users, description: 'Coordinate group rates' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setCoordinationType(type.value as any)}
                        className={`p-4 border-2 rounded-lg text-left transition-colors ${
                          coordinationType === type.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <type.icon className={`h-6 w-6 mb-2 ${
                          coordinationType === type.value ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <h4 className="font-medium text-gray-900">{type.label}</h4>
                        <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Budget (per person)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        className="input pl-10"
                        placeholder="150"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Looking for</label>
                    <select className="input">
                      <option>1 person</option>
                      <option>2 people</option>
                      <option>3+ people</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Message</label>
                  <textarea
                    className="input h-24"
                    placeholder="Describe what you're looking for, your preferences, and any other relevant details..."
                  />
                </div>

                {/* Preferences */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Preferences (optional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Non-smoking', 'Quiet hours', 'Split costs evenly', 'Experienced player',
                      'Clean and tidy', 'Early arrival', 'Flexible checkout', 'Group activities'
                    ].map((pref) => (
                      <label key={pref} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm text-gray-700">{pref}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button type="button" className="btn-secondary">
                    Save Draft
                  </button>
                  <button type="submit" className="btn-primary">
                    <Shield className="h-4 w-4 mr-2" />
                    Post Request
                  </button>
                </div>
              </form>
            </div>

            {/* Preview */}
            {selectedTournament && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedTournament.name}</h4>
                      <p className="text-sm text-gray-500">
                        {selectedTournament.venue.address.city}, {selectedTournament.venue.address.state} • 
                        {selectedTournament.startDate.toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      coordinationType === 'roommate' ? 'bg-blue-100 text-blue-700' :
                      coordinationType === 'ride-share' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {coordinationType.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">Your message will appear here...</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}