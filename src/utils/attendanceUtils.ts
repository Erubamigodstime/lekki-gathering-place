import { addWeeks, format, startOfWeek, isSameDay, isAfter, isBefore, parseISO, startOfDay } from 'date-fns';

// Program start date - January 8th, 2026 (updated for current term)
// Use explicit year/month/day to avoid UTC timezone issues
export const PROGRAM_START_DATE = new Date(2026, 0, 8); // January 8, 2026 in local time
export const TOTAL_WEEKS = 12;

// Day name to number mapping (0 = Sunday, 1 = Monday, etc.)
const DAY_NAME_TO_NUMBER: Record<string, number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
};

/**
 * Get the day of week number from a day name
 */
export function getDayOfWeekNumber(dayName: string): number {
    return DAY_NAME_TO_NUMBER[dayName] ?? 0;
}

/**
 * Generate all class dates for a given schedule
 * @param scheduleDays - Array of day names (e.g., ['Thursday', 'Friday'])
 * @param startDate - Program start date
 * @param weeks - Number of weeks
 * @returns Array of Date objects for each class day
 */
export function generateClassDates(
    scheduleDays: string[],
    startDate: Date = PROGRAM_START_DATE,
    weeks: number = TOTAL_WEEKS
): Date[] {
    const dates: Date[] = [];

    scheduleDays.forEach(dayName => {
        const targetDayNumber = getDayOfWeekNumber(dayName);

        // Find the first occurrence of this day on or after start date
        // Create date at local midnight to avoid timezone issues
        let currentDate = startOfDay(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
        const startDayNumber = currentDate.getDay();

        // Calculate days until the target day
        let daysUntilTarget = targetDayNumber - startDayNumber;
        if (daysUntilTarget < 0) {
            daysUntilTarget += 7;
        }

        currentDate.setDate(currentDate.getDate() + daysUntilTarget);

        // Generate dates for each week
        for (let week = 0; week < weeks; week++) {
            const classDate = startOfDay(addWeeks(currentDate, week));
            dates.push(classDate);
        }
    });

    // Sort dates chronologically
    return dates.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Format a date for display in the attendance calendar
 * @param date - Date to format
 * @returns Formatted string like "11 Jan"
 */
export function formatAttendanceDate(date: Date): string {
    return format(date, 'd MMM');
}

/**
 * Get the attendance status for a specific date
 * @param date - The date to check
 * @param attendanceRecords - Array of attendance records
 * @returns 'APPROVED' | 'PENDING' | 'REJECTED' | null
 */
export function getAttendanceStatus(
    date: Date,
    attendanceRecords: Array<{ date: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' }>
): 'PENDING' | 'APPROVED' | 'REJECTED' | null {
    const record = attendanceRecords.find(r => {
        const recordDate = typeof r.date === 'string' ? parseISO(r.date) : r.date;
        return isSameDay(recordDate, date);
    });

    return record?.status ?? null;
}

/**
 * Check if a date is in the past (before today)
 */
export function isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(date, today);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
    const today = startOfDay(new Date());
    const checkDate = startOfDay(date);
    return isSameDay(checkDate, today);
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: Date): boolean {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return isAfter(date, today);
}

/**
 * Calculate attendance percentage
 * @param approvedCount - Number of approved attendance records
 * @param totalClasses - Total number of class sessions
 * @returns Percentage (0-100)
 */
export function calculateAttendancePercentage(
    approvedCount: number,
    totalClasses: number
): number {
    if (totalClasses === 0) return 0;
    return Math.round((approvedCount / totalClasses) * 100);
}

/**
 * Get visible dates for pagination (5 dates at a time)
 */
export function getVisibleDates(
    allDates: Date[],
    startIndex: number,
    count: number = 5
): Date[] {
    return allDates.slice(startIndex, startIndex + count);
}

/**
 * Get the display month based on current date
 * Changes to next month on the 1st of each month
 */
export function getCurrentDisplayMonth(): Date {
    const today = new Date();
    // Return the 1st of current month
    return new Date(today.getFullYear(), today.getMonth(), 1);
}

/**
 * Filter dates to only include those in a specific month
 */
export function filterDatesByMonth(dates: Date[], month: Date): Date[] {
    return dates.filter(date => {
        return date.getFullYear() === month.getFullYear() && 
               date.getMonth() === month.getMonth();
    });
}

/**
 * Format month for display (e.g., "January 2026")
 */
export function formatMonthYear(date: Date): string {
    return format(date, 'MMMM yyyy');
}

/**
 * Get the next month from a given date
 */
export function getNextMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

/**
 * Get the previous month from a given date
 */
export function getPrevMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

/**
 * Check if a date is in the current display month (changes on 1st)
 */
export function isCurrentMonth(date: Date): boolean {
    const currentMonth = getCurrentDisplayMonth();
    return date.getFullYear() === currentMonth.getFullYear() && 
           date.getMonth() === currentMonth.getMonth();
}
