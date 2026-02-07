/**
 * Lesson & Module Query Hooks
 * 
 * All lesson/module-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import apiClient, { extractData } from '@/api/apiClient';
import { queryKeys, staleTime } from '@/api/queryKeys';
import type { Lesson, LessonMaterial } from '@/api/types';

// ============ Lesson Types ============
export interface WeekModule {
  weekNumber: number;
  lessons: Lesson[];
  isExpanded?: boolean;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

// ============ Query Hooks ============

/**
 * Fetch lessons for a class
 */
export function useLessons(classId: string | undefined, includeUnpublished = false) {
  return useQuery({
    queryKey: queryKeys.lessons.byClass(classId || '', includeUnpublished),
    queryFn: async (): Promise<Lesson[]> => {
      const url = includeUnpublished
        ? `/lessons/class/${classId}?includeUnpublished=true`
        : `/lessons/class/${classId}`;
      const response = await apiClient.get(url);
      return extractData<Lesson[]>(response) || [];
    },
    enabled: !!classId,
    staleTime: staleTime.standard,
  });
}

/**
 * Fetch lesson by ID
 */
export function useLessonById(lessonId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.lessons.byId(lessonId || ''),
    queryFn: async (): Promise<Lesson | null> => {
      const response = await apiClient.get(`/lessons/${lessonId}`);
      return extractData<Lesson>(response);
    },
    enabled: !!lessonId,
    staleTime: staleTime.standard,
  });
}

/**
 * Fetch materials for a lesson
 */
export function useLessonMaterials(lessonId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.lessons.materials(lessonId || ''),
    queryFn: async (): Promise<LessonMaterial[]> => {
      const response = await apiClient.get(`/lessons/${lessonId}/materials`);
      return extractData<LessonMaterial[]>(response) || [];
    },
    enabled: !!lessonId,
    staleTime: staleTime.standard,
  });
}

/**
 * Fetch lesson progress for a class (student view)
 */
export function useLessonProgress(classId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.lessons.progress(classId || ''),
    queryFn: async (): Promise<LessonProgress[]> => {
      const response = await apiClient.get(`/lessons/progress/${classId}`);
      return extractData<LessonProgress[]>(response) || [];
    },
    enabled: !!classId,
    staleTime: staleTime.dynamic,
  });
}

// ============ Derived Helpers ============

/**
 * Group lessons by week number
 */
export function groupLessonsByWeek(lessons: Lesson[]): WeekModule[] {
  const weekMap = new Map<number, Lesson[]>();
  
  lessons.forEach(lesson => {
    const week = lesson.weekNumber || 1;
    if (!weekMap.has(week)) {
      weekMap.set(week, []);
    }
    weekMap.get(week)!.push(lesson);
  });
  
  // Sort by week number
  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([weekNumber, lessons]) => ({
      weekNumber,
      lessons: lessons.sort((a, b) => a.order - b.order),
    }));
}

/**
 * Count completed lessons
 */
export function countCompletedLessons(progress: LessonProgress[]): number {
  return progress.filter(p => p.completed).length;
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionPercentage(
  progress: LessonProgress[], 
  totalLessons: number
): number {
  if (totalLessons === 0) return 0;
  const completed = countCompletedLessons(progress);
  return Math.round((completed / totalLessons) * 100);
}
