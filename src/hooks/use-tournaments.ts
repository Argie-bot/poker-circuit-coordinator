/**
 * Custom hook for fetching tournament data from the live API
 */

import { useState, useEffect, useCallback } from 'react';
import { Tournament } from '@/types';

interface TournamentFilters {
  startDate?: string;
  endDate?: string;
  minBuyIn?: number;
  maxBuyIn?: number;
  circuits?: string[];
  states?: string[];
  gameType?: string;
  search?: string;
  limit?: number;
}

interface TournamentMeta {
  total: number;
  lastUpdated: number;
  sources: {
    cardPlayer: { count: number; lastUpdated: number; error?: string };
    wsop: { count: number; lastUpdated: number; error?: string };
    wpt: { count: number; lastUpdated: number; error?: string };
    pokerAtlas: { count: number; lastUpdated: number; error?: string };
  };
  filters: TournamentFilters;
}

interface UseTournamentsReturn {
  tournaments: Tournament[];
  meta: TournamentMeta | null;
  loading: boolean;
  error: string | null;
  refetch: (filters?: TournamentFilters) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTournaments(
  initialFilters: TournamentFilters = {}
): UseTournamentsReturn {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [meta, setMeta] = useState<TournamentMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<TournamentFilters>(initialFilters);

  const buildQueryString = useCallback((filters: TournamentFilters = {}): string => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','));
          }
        } else {
          params.set(key, value.toString());
        }
      }
    });
    
    return params.toString();
  }, []);

  const fetchTournaments = useCallback(async (
    filters: TournamentFilters = {},
    forceRefresh = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        ...currentFilters,
        ...filters,
        ...(forceRefresh && { refresh: 'true' })
      };

      const queryString = buildQueryString(queryParams);
      const url = `/api/tournaments${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching tournaments from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch tournaments');
      }

      const data = await response.json();
      
      // Convert date strings back to Date objects
      const tournamentsWithDates = data.tournaments.map((tournament: any) => ({
        ...tournament,
        startDate: new Date(tournament.startDate),
        endDate: new Date(tournament.endDate),
        registrationDeadline: tournament.registrationDeadline 
          ? new Date(tournament.registrationDeadline) 
          : undefined
      }));

      setTournaments(tournamentsWithDates);
      setMeta(data.meta);
      setCurrentFilters({ ...currentFilters, ...filters });
      
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tournaments');
      setTournaments([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [currentFilters, buildQueryString]);

  const refetch = useCallback((filters: TournamentFilters = {}) => {
    return fetchTournaments(filters, false);
  }, [fetchTournaments]);

  const refresh = useCallback(() => {
    return fetchTournaments(currentFilters, true);
  }, [fetchTournaments, currentFilters]);

  // Initial fetch
  useEffect(() => {
    fetchTournaments(initialFilters);
  }, []); // Only run on mount

  return {
    tournaments,
    meta,
    loading,
    error,
    refetch,
    refresh
  };
}

// Helper hook for month-based filtering (common use case)
export function useTournamentsByMonth(month: number, year: number) {
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  return useTournaments({
    startDate,
    endDate
  });
}

// Helper hook for circuit filtering
export function useTournamentsByCircuit(circuits: string[]) {
  return useTournaments({
    circuits: circuits.length > 0 ? circuits : undefined
  });
}

// Helper hook for upcoming tournaments
export function useUpcomingTournaments(limit = 50) {
  const today = new Date().toISOString().split('T')[0];
  
  return useTournaments({
    startDate: today,
    limit
  });
}