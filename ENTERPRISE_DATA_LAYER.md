# Enterprise Data Layer Architecture

## Overview

This document describes the enterprise-level React Query architecture implemented for the Lekki Gathering Place frontend. This architecture provides:

- **Complete separation of concerns** - API logic is completely decoupled from UI components
- **Type safety** - Full TypeScript coverage for all API responses
- **Optimistic updates** - Instant UI feedback with automatic rollback on errors
- **Centralized caching** - Single source of truth for stale time and garbage collection
- **Easy testability** - All hooks can be mocked at the import level

## Architecture Structure

```
src/
├── api/
│   ├── index.ts          # Central exports
│   ├── apiClient.ts      # Axios instance with interceptors
│   ├── queryKeys.ts      # Type-safe query key factory
│   └── types.ts          # All TypeScript interfaces
│
└── hooks/
    ├── index.ts          # Central exports
    ├── queries/
    │   ├── index.ts
    │   ├── useAttendanceQueries.ts
    │   ├── useEnrollmentQueries.ts
    │   ├── useUserQueries.ts
    │   ├── useClassQueries.ts
    │   ├── useLessonQueries.ts
    │   └── useGradeQueries.ts
    │
    └── mutations/
        ├── index.ts
        ├── useAttendanceMutations.ts
        ├── useEnrollmentMutations.ts
        ├── useProfileMutations.ts
        └── useGradeMutations.ts
```

## Key Components

### 1. API Client (`src/api/apiClient.ts`)

Centralized Axios instance with:
- Automatic auth header injection
- 401 redirect handling
- Request/response logging (dev mode)
- Helper functions: `extractData()`, `extractPaginatedData()`

```typescript
import apiClient from '@/api/apiClient';

const response = await apiClient.get('/users/profile');
```

### 2. Query Keys Factory (`src/api/queryKeys.ts`)

Type-safe query key management following the factory pattern:

```typescript
import { queryKeys } from '@/api/queryKeys';

// Usage in hooks
queryKeys.attendance.myAttendance()           // ['attendance', 'my-attendance']
queryKeys.enrollments.byClass('class-id')     // ['enrollments', 'class', 'class-id']
queryKeys.users.profile()                     // ['users', 'profile']
```

### 3. TypeScript Types (`src/api/types.ts`)

All API response types in one file:

```typescript
import type { User, Class, Enrollment, AttendanceRecord } from '@/api/types';
```

### 4. Query Hooks (`src/hooks/queries/`)

Data fetching hooks with built-in caching and helper functions:

```typescript
import { 
  useMyAttendance, 
  calculateAttendanceRate,
  isAttendanceMarkedToday 
} from '@/hooks/queries';

function MyComponent() {
  const { data: attendance, isLoading } = useMyAttendance();
  const rate = calculateAttendanceRate(attendance);
}
```

### 5. Mutation Hooks (`src/hooks/mutations/`)

Data modification hooks with optimistic updates and cache invalidation:

```typescript
import { useApproveAttendance } from '@/hooks/mutations';

function AttendanceActions({ attendanceId, classId }) {
  const approveMutation = useApproveAttendance();
  
  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({ attendanceId, classId });
      toast.success('Attendance approved!');
    } catch (error) {
      toast.error('Failed to approve attendance');
    }
  };
}
```

## Stale Time Configuration

Located in `src/api/queryKeys.ts`:

| Category | Duration | Use Case |
|----------|----------|----------|
| `static` | 30 minutes | Rarely changing data (wards, categories) |
| `standard` | 5 minutes | Normal data (classes, profiles) |
| `dynamic` | 2 minutes | Frequently changing data (attendance, enrollments) |
| `realtime` | 30 seconds | Near real-time data (pending approvals) |

## Usage in Components

### Before (Anti-pattern)
```typescript
// ❌ BAD: Inline API calls, no type safety, manual cache management
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

function Dashboard() {
  const queryClient = useQueryClient();
  
  const { data } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/attendance/my-attendance', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    }
  });
  
  // Manual mutation logic in component...
}
```

### After (Enterprise Pattern)
```typescript
// ✅ GOOD: Centralized, type-safe, clean
import { useMyAttendance, calculateAttendanceRate } from '@/hooks/queries';
import { useApproveAttendance } from '@/hooks/mutations';

function Dashboard() {
  const { data: attendance, isLoading } = useMyAttendance();
  const approveMutation = useApproveAttendance();
  
  const rate = calculateAttendanceRate(attendance);
  
  // Component only handles UI logic
}
```

## Adding New Features

### Adding a New Query Hook

1. Add the query key to `src/api/queryKeys.ts`:
```typescript
export const queryKeys = {
  // ... existing keys
  newFeature: {
    all: ['new-feature'] as const,
    byId: (id: string) => [...queryKeys.newFeature.all, id] as const,
  },
};
```

2. Add types to `src/api/types.ts`:
```typescript
export interface NewFeature {
  id: string;
  name: string;
  // ...
}
```

3. Create the hook in `src/hooks/queries/useNewFeatureQueries.ts`:
```typescript
import { useQuery } from '@tanstack/react-query';
import apiClient, { extractData } from '@/api/apiClient';
import { queryKeys, staleTime } from '@/api/queryKeys';
import type { NewFeature } from '@/api/types';

export function useNewFeature(id: string) {
  return useQuery({
    queryKey: queryKeys.newFeature.byId(id),
    queryFn: async (): Promise<NewFeature> => {
      const response = await apiClient.get(`/new-feature/${id}`);
      return extractData<NewFeature>(response);
    },
    enabled: !!id,
    staleTime: staleTime.standard,
  });
}
```

4. Export from `src/hooks/queries/index.ts`:
```typescript
export { useNewFeature } from './useNewFeatureQueries';
```

### Adding a New Mutation Hook

1. Create the hook in `src/hooks/mutations/useNewFeatureMutations.ts`:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { queryKeys } from '@/api/queryKeys';

export function useCreateNewFeature() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateInput) => {
      const response = await apiClient.post('/new-feature', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newFeature.all });
    },
  });
}
```

2. Export from `src/hooks/mutations/index.ts`:
```typescript
export { useCreateNewFeature } from './useNewFeatureMutations';
```

## Benefits

1. **Maintainability**: Changes to API endpoints only need to happen in one place
2. **Type Safety**: Full IntelliSense support and compile-time error checking
3. **Testing**: Easy to mock at hook level for unit tests
4. **Performance**: Automatic deduplication and caching by React Query
5. **Developer Experience**: Clean imports, no boilerplate in components
6. **Consistency**: Uniform patterns across all data operations
