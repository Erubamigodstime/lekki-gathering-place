import { useState, useMemo } from 'react';
import { Loader2, Check, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    generateClassDates,
    formatAttendanceDate,
    getAttendanceStatus,
    isToday,
    isFutureDate,
    filterDatesByMonth,
    formatMonthYear,
    getCurrentDisplayMonth,
    PROGRAM_START_DATE,
} from '@/utils/attendanceUtils';

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    classId: string;
}

interface ClassInfo {
    id: string;
    name: string;
    schedule?: {
        days?: string[];
    };
}

interface StudentAttendanceCardProps {
    classInfo: ClassInfo;
    attendanceRecords: AttendanceRecord[];
    onMarkAttendance: (classId: string, date: Date) => Promise<void>;
    studentName?: string;
    loading?: boolean;
}

/**
 * A compact attendance card for showing a single student's attendance
 * Shows only the current month (4 dates for 1 class per week)
 * Automatically changes to new month on the 1st of each month
 */
export default function StudentAttendanceCard({
    classInfo,
    attendanceRecords,
    onMarkAttendance,
    studentName,
    loading = false,
}: StudentAttendanceCardProps) {
    const [markingAttendance, setMarkingAttendance] = useState<string | null>(null);

    // Get current month (changes on 1st of each month)
    const currentMonth = useMemo(() => getCurrentDisplayMonth(), []);

    // Generate all class dates from schedule (12 weeks from program start)
    const allClassDates = useMemo(() => {
        const scheduleDays = classInfo.schedule?.days || ['Thursday'];
        return generateClassDates(scheduleDays, PROGRAM_START_DATE, 12);
    }, [classInfo.schedule?.days]);

    // Filter dates to show only the current month (~4 dates for weekly classes)
    const monthDates = useMemo(() => {
        return filterDatesByMonth(allClassDates, currentMonth);
    }, [allClassDates, currentMonth]);

    // Calculate attendance stats
    const stats = useMemo(() => {
        const approvedCount = attendanceRecords.filter(r => r.status === 'APPROVED').length;
        const pendingCount = attendanceRecords.filter(r => r.status === 'PENDING').length;
        const totalPastDates = allClassDates.filter(d => !isFutureDate(d)).length;
        const percentage = totalPastDates > 0 ? Math.round((approvedCount / totalPastDates) * 100) : 0;

        return { approvedCount, pendingCount, totalPastDates, percentage };
    }, [attendanceRecords, allClassDates]);

    // Handle attendance marking
    const handleMarkClick = async (date: Date) => {
        if (!isToday(date)) return;

        const markingKey = date.toISOString();
        setMarkingAttendance(markingKey);

        try {
            await onMarkAttendance(classInfo.id, date);
        } catch (error) {
            console.error('Failed to mark attendance:', error);
        } finally {
            setMarkingAttendance(null);
        }
    };

    // Get attendance status for a date
    const getStatusForDate = (date: Date) => {
        return getAttendanceStatus(date, attendanceRecords);
    };

    // Render attendance circle
    // Render attendance circle - simplified round checkbox design
    const renderAttendanceCircle = (date: Date) => {
        const status = getStatusForDate(date);
        const markingKey = date.toISOString();
        const isMarking = markingAttendance === markingKey;
        const canMark = isToday(date) && !status;
        const future = isFutureDate(date);

        if (isMarking) {
            return (
                <div className="w-8 h-8 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
            );
        }

        if (status === 'APPROVED') {
            return (
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
            );
        }

        if (status === 'PENDING') {
            return (
                <div
                    className="w-8 h-8 rounded-full border-2 border-amber-500 bg-amber-50 flex items-center justify-center"
                    title="Pending approval"
                >
                    <Check className="w-4 h-4 text-amber-600" strokeWidth={3} />
                </div>
            );
        }

        if (status === 'REJECTED') {
            return (
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center" title="Rejected">
                    <XCircle className="w-4 h-4 text-white" />
                </div>
            );
        }

        // Empty circle - clickable if today
        return (
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (canMark) {
                        handleMarkClick(date);
                    }
                }}
                className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                    canMark
                        ? "border-primary hover:bg-primary/10 cursor-pointer"
                        : "border-gray-300 bg-gray-50 cursor-not-allowed",
                    future && "opacity-40"
                )}
                title={canMark ? "Click to mark attendance" : future ? "Future date" : "Past date - cannot mark"}
            >
                {canMark && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                )}
            </button>
        );
    };

    if (loading) {
        return (
            <Card className="shadow-card border-l-4 border-l-primary">
                <CardContent className="py-8 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-card border-l-4 border-l-primary">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{classInfo.name}</CardTitle>
                    <span className="text-sm font-medium text-primary">
                        {stats.percentage}% ({stats.approvedCount}/{stats.totalPastDates})
                    </span>
                </div>
                {studentName && (
                    <p className="text-sm text-muted-foreground">{studentName}</p>
                )}
                {/* Current Month Label */}
                <p className="text-xs text-muted-foreground mt-1">
                    {formatMonthYear(currentMonth)}
                </p>
            </CardHeader>

            <CardContent>
                {/* Current month dates only (4 dates for weekly class) */}
                {monthDates.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                        No classes scheduled for this month
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-2 pb-2">
                        {monthDates.map((date, idx) => {
                            const today = isToday(date);
                            return (
                                <div key={idx} className={cn(
                                    "flex flex-col items-center flex-1 py-2 px-1 rounded-lg",
                                    today && "bg-primary/10 ring-2 ring-primary"
                                )}>
                                    <span className={cn(
                                        "text-xs mb-1 whitespace-nowrap",
                                        today ? "text-primary font-bold" : "text-muted-foreground"
                                    )}>
                                        {formatAttendanceDate(date)}
                                    </span>
                                    {today && (
                                        <span className="text-[10px] text-primary font-semibold mb-1">TODAY</span>
                                    )}
                                    {renderAttendanceCircle(date)}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Stats row */}
                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <span>{stats.pendingCount > 0 ? `${stats.pendingCount} pending approval` : 'All approved'}</span>
                    <span>{monthDates.length} classes this month</span>
                </div>
            </CardContent>
        </Card>
    );
}
