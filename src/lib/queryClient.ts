/**
 * Query Client Configuration with Offline Persistence
 * 
 * This configures React Query to persist cached data to localStorage
 * for offline support.
 */

import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Create a query client with appropriate settings for offline support
export function createQueryClientWithPersistence(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 5 minutes before refetching
        staleTime: 5 * 60 * 1000,
        
        // Keep cached data for 24 hours (for offline access)
        gcTime: 24 * 60 * 60 * 1000,
        
        // Don't refetch on window focus to save bandwidth
        refetchOnWindowFocus: false,
        
        // Retry once on failure
        retry: 1,
        
        // For offline support: use cached data while fetching
        networkMode: 'offlineFirst',
      },
      mutations: {
        // Retry failed mutations when back online
        networkMode: 'offlineFirst',
      },
    },
  });

  // Create a persister using localStorage
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: 'lgp-query-cache',
    // Only persist successful queries
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data),
  });

  // Set up persistence
  persistQueryClient({
    queryClient,
    persister,
    // Max age of persisted cache: 24 hours
    maxAge: 24 * 60 * 60 * 1000,
    // Dehydrate options - which queries to persist
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        // Only persist successful queries
        if (query.state.status !== 'success') return false;
        
        // Get the query key as string for checking
        const queryKey = JSON.stringify(query.queryKey);
        
        // Persist important data for offline access
        const persistedQueries = [
          'classes',
          'class-detail',
          'my-enrollments',
          'my-classes',
          'my-attendance',
          'lessons',
          'user-profile',
          'instructor-profile',
          'wards',
        ];
        
        return persistedQueries.some(key => queryKey.includes(key));
      },
    },
  });

  return queryClient;
}

// Export a default query client for simple usage
export const queryClient = createQueryClientWithPersistence();

export default queryClient;
